"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eyebrow } from "@/components/ui/eyebrow";

type InvitePayload = {
  publicId: string;
  title: string;
  introMessage: string | null;
  companyName: string;
  contactName: string | null;
  contactEmail: string | null;
  projectLabel: string | null;
  status: string;
  completedAt: string | null;
};

type FieldOption = {
  value: string;
  label: string;
};

type VisibilityRule = {
  show_if?: Array<{
    field: string;
    operator: "equals" | "in";
    value: string | string[];
  }>;
} | null;

type TemplateField = {
  id: number;
  key: string;
  label: string;
  helpText: string | null;
  type: "text" | "textarea" | "email" | "url" | "single_select" | "multi_select" | "file";
  required: boolean;
  options: FieldOption[];
  visibilityRules: VisibilityRule;
  placeholder: string | null;
  position: number;
};

type TemplateStep = {
  key: string;
  title: string;
  description: string | null;
  position: number;
  fields: TemplateField[];
};

type BriefingTemplate = {
  publicId: string;
  slug: string;
  name: string;
  version: number;
  projectType: string | null;
  description: string | null;
  steps: TemplateStep[];
};

type BriefingValues = Record<string, string | string[]>;

type ExistingResponse = {
  publicId?: string;
  payload?: BriefingValues;
  submittedAt?: string | null;
} | null;

type ValidationErrors = Record<string, string>;

type VisibleStep = TemplateStep & {
  fields: TemplateField[];
};

type LoadState = "loading" | "ready" | "invalid" | "error";
type SubmitState = "idle" | "submitting" | "success" | "error";

const INITIAL_VALUES: BriefingValues = {};

function mergeValues(existing: ExistingResponse): BriefingValues {
  if (!existing?.payload) {
    return INITIAL_VALUES;
  }

  const normalized: BriefingValues = {};

  Object.entries(existing.payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      normalized[key] = value.filter((item): item is string => typeof item === "string");
      return;
    }

    if (typeof value === "string") {
      normalized[key] = value;
    }
  });

  return normalized;
}

function buildInitialValues(template: BriefingTemplate | null, existing: ExistingResponse): BriefingValues {
  const merged = mergeValues(existing);
  if (!template) {
    return merged;
  }

  const output: BriefingValues = {};

  template.steps.forEach((step) => {
    step.fields.forEach((field) => {
      const value = merged[field.key];
      output[field.key] = field.type === "multi_select" ? (Array.isArray(value) ? value : []) : typeof value === "string" ? value : "";
    });
  });

  return output;
}

function isVisible(rules: VisibilityRule, values: BriefingValues) {
  if (!rules?.show_if?.length) {
    return true;
  }

  return rules.show_if.every((rule) => {
    const answer = values[rule.field];

    if (rule.operator === "equals") {
      return answer === rule.value;
    }

    if (rule.operator === "in" && Array.isArray(rule.value)) {
      if (Array.isArray(answer)) {
        return answer.some((item) => rule.value.includes(item));
      }

      return typeof answer === "string" ? rule.value.includes(answer) : false;
    }

    return true;
  });
}

function buildVisibleSteps(template: BriefingTemplate | null, values: BriefingValues): VisibleStep[] {
  if (!template) {
    return [];
  }

  return template.steps
    .map((step) => ({
      ...step,
      fields: step.fields.filter((field) => isVisible(field.visibilityRules, values)),
    }))
    .filter((step) => step.fields.length > 0);
}

function isFieldEmpty(field: TemplateField, value: string | string[] | undefined) {
  if (field.type === "multi_select") {
    return !Array.isArray(value) || value.length === 0;
  }

  return typeof value !== "string" || value.trim() === "";
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validateStepFields(fields: TemplateField[], values: BriefingValues): ValidationErrors {
  const errors: ValidationErrors = {};

  fields.forEach((field) => {
    const rawValue = values[field.key];
    const empty = isFieldEmpty(field, rawValue);
    const stringValue = typeof rawValue === "string" ? rawValue.trim() : "";

    if (field.required && empty) {
      errors[field.key] = "Preenche esse campo para continuar.";
      return;
    }

    if (empty) {
      return;
    }

    if (stringValue.length > 5000) {
      errors[field.key] = "Essa resposta passou do limite permitido.";
      return;
    }

    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
      errors[field.key] = "Informa um e-mail válido.";
      return;
    }

    if (field.type === "url" && !isValidUrl(stringValue)) {
      errors[field.key] = "Informa uma URL completa, começando com http:// ou https://.";
    }
  });

  return errors;
}

function estimateCompletionMinutes(questionCount: number) {
  return Math.max(4, Math.ceil(questionCount / 5));
}

export function PrivateBriefingPage() {
  const searchParams = useSearchParams();
  const inviteId = searchParams.get("invite")?.trim() ?? "";
  const token = searchParams.get("token")?.trim() ?? "";
  const hasInviteParams = inviteId !== "" && token !== "";

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [invite, setInvite] = useState<InvitePayload | null>(null);
  const [template, setTemplate] = useState<BriefingTemplate | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [values, setValues] = useState<BriefingValues>(INITIAL_VALUES);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  const inviteUrl = useMemo(() => {
    const params = new URLSearchParams({ invite: inviteId, token });
    return `/api/v1/briefing/invite.php?${params.toString()}`;
  }, [inviteId, token]);

  const visibleSteps = useMemo(() => buildVisibleSteps(template, values), [template, values]);
  const boundedStepIndex = visibleSteps.length === 0 ? 0 : Math.min(currentStepIndex, visibleSteps.length - 1);
  const currentStep = visibleSteps[boundedStepIndex] ?? null;
  const totalQuestions = useMemo(() => visibleSteps.reduce((count, step) => count + step.fields.length, 0), [visibleSteps]);
  const completedQuestions = useMemo(
    () => visibleSteps.slice(0, boundedStepIndex).reduce((count, step) => count + step.fields.length, 0),
    [boundedStepIndex, visibleSteps],
  );
  const estimatedMinutes = estimateCompletionMinutes(totalQuestions);
  const remainingMinutes = estimateCompletionMinutes(Math.max(totalQuestions - completedQuestions, 1));
  const progressPercent = visibleSteps.length > 0 ? ((boundedStepIndex + 1) / visibleSteps.length) * 100 : 0;

  useEffect(() => {
    if (!hasInviteParams) {
      return;
    }

    let cancelled = false;

    async function loadInvite() {
      setLoadState("loading");
      setFeedbackMessage("");
      setFieldErrors({});
      setCurrentStepIndex(0);

      try {
        const response = await fetch(inviteUrl, { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as
          | {
              ok?: boolean;
              error?: string;
              invite?: InvitePayload;
              template?: BriefingTemplate | null;
              response?: ExistingResponse;
            }
          | null;

        if (cancelled) {
          return;
        }

        if (!response.ok || !payload?.ok || !payload.invite) {
          const error = payload?.error;
          setLoadState(error === "invite_not_found" || error === "invite_expired" || error === "invite_revoked" ? "invalid" : "error");
          setFeedbackMessage(error === "invite_expired" ? "Esse link de briefing expirou." : error === "invite_revoked" ? "Esse link de briefing foi revogado." : "Não foi possível carregar o briefing agora.");
          return;
        }

        setInvite(payload.invite);
        setTemplate(payload.template ?? null);
        setValues(buildInitialValues(payload.template ?? null, payload.response ?? null));
        setLoadState("ready");
      } catch {
        if (!cancelled) {
          setLoadState("error");
          setFeedbackMessage("Não foi possível carregar o briefing agora.");
        }
      }
    }

    loadInvite();

    return () => {
      cancelled = true;
    };
  }, [hasInviteParams, inviteUrl]);

  function clearFieldError(fieldKey: string) {
    setFieldErrors((current) => {
      if (!(fieldKey in current)) {
        return current;
      }

      const next = { ...current };
      delete next[fieldKey];
      return next;
    });
  }

  function updateValue(key: string, value: string | string[]) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
    clearFieldError(key);
  }

  function toggleMultiSelectValue(fieldKey: string, optionValue: string) {
    setValues((current) => {
      const items = Array.isArray(current[fieldKey]) ? current[fieldKey] : [];
      const nextItems = items.includes(optionValue) ? items.filter((item) => item !== optionValue) : [...items, optionValue];

      return {
        ...current,
        [fieldKey]: nextItems,
      };
    });
    clearFieldError(fieldKey);
  }

  function focusField(fieldKey: string) {
    if (typeof document === "undefined") {
      return;
    }

    requestAnimationFrame(() => {
      const fieldContainer = document.querySelector<HTMLElement>(`[data-field-key="${fieldKey}"]`);
      const control = fieldContainer?.querySelector<HTMLElement>("input, textarea, select, button");
      control?.focus();
      fieldContainer?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function applyStepErrors(errors: ValidationErrors) {
    setFieldErrors((current) => ({
      ...current,
      ...errors,
    }));

    const firstField = Object.keys(errors)[0];
    if (firstField) {
      focusField(firstField);
    }
  }

  function validateCurrentStep() {
    if (!currentStep) {
      return true;
    }

    const errors = validateStepFields(currentStep.fields, values);
    if (Object.keys(errors).length === 0) {
      return true;
    }

    applyStepErrors(errors);
    setSubmitState("error");
    setFeedbackMessage("Corrige os campos destacados para continuar.");
    return false;
  }

  function goToStep(stepIndex: number) {
    setCurrentStepIndex(stepIndex);
    setFeedbackMessage("");
  }

  function handleNextStep() {
    if (!validateCurrentStep()) {
      return;
    }

    if (boundedStepIndex < visibleSteps.length - 1) {
      goToStep(boundedStepIndex + 1);
    }
  }

  function handlePreviousStep() {
    if (boundedStepIndex > 0) {
      goToStep(boundedStepIndex - 1);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!invite || !currentStep) {
      return;
    }

    if (!validateCurrentStep()) {
      return;
    }

    setSubmitState("submitting");
    setFeedbackMessage("");

    try {
      const response = await fetch("/api/v1/briefing/submit.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteId: invite.publicId,
          token,
          answers: values,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; fields?: string[]; errors?: ValidationErrors }
        | null;

      if (!response.ok || !payload?.ok) {
        if (payload?.error === "validation_error") {
          const nextErrors = payload.errors ?? {};
          const firstInvalidField = payload.fields?.[0] ?? Object.keys(nextErrors)[0];

          if (firstInvalidField) {
            const invalidStepIndex = visibleSteps.findIndex((step) => step.fields.some((field) => field.key === firstInvalidField));
            if (invalidStepIndex >= 0) {
              setCurrentStepIndex(invalidStepIndex);
            }
          }

          if (Object.keys(nextErrors).length > 0) {
            applyStepErrors(nextErrors);
          } else if (firstInvalidField) {
            applyStepErrors({ [firstInvalidField]: "Revisa esse campo antes de enviar." });
          }

          throw new Error("Corrige os campos destacados antes de enviar.");
        }

        throw new Error("Não foi possível salvar o briefing agora.");
      }

      setSubmitState("success");
      setFieldErrors({});
      setFeedbackMessage("Briefing enviado com sucesso. Se precisarmos complementar algo, voltamos contigo.");
    } catch (error) {
      setSubmitState("error");
      setFeedbackMessage(error instanceof Error ? error.message : "Não foi possível salvar o briefing agora.");
    }
  }

  return (
    <main id="conteudo" className="briefing-page">
      <section className="briefing-hero">
        <div className="container briefing-hero__content">
          <Eyebrow>Briefing privado</Eyebrow>
        </div>
      </section>

      <section className="section briefing-shell">
        <div className="container briefing-shell__grid">
          <div className="briefing-panel">
            {loadState === "loading" ? <p>Carregando briefing...</p> : null}

            {!hasInviteParams || loadState === "invalid" ? (
              <div className="briefing-empty">
                <h2>Link inválido ou expirado.</h2>
                <p>Confere com a Modo Digital qual é o link correto antes de seguir.</p>
              </div>
            ) : null}

            {loadState === "error" ? (
              <div className="briefing-empty">
                <h2>Não foi possível abrir o briefing.</h2>
                <p>{feedbackMessage || "Tenta novamente em alguns minutos."}</p>
              </div>
            ) : null}

            {loadState === "ready" && invite && currentStep ? (
              <form className="briefing-form" onSubmit={handleSubmit} noValidate>
                <div className="briefing-card briefing-card--project">
                  <div className="briefing-card__header">
                    <div>
                      <span className="micro-label">Projeto</span>
                      <h2>{invite.title}</h2>
                    </div>
                    <div className="briefing-summary">
                      <span>{visibleSteps.length} etapas</span>
                      <span>~ {estimatedMinutes} min</span>
                    </div>
                  </div>
                  <p>{invite.introMessage || "Responde o que já estiver claro hoje. O restante a gente organiza junto."}</p>
                  <dl className="briefing-meta">
                    <div>
                      <dt>Empresa</dt>
                      <dd>{invite.companyName}</dd>
                    </div>
                    <div>
                      <dt>Contato</dt>
                      <dd>{invite.contactName || "Não informado"}</dd>
                    </div>
                    <div>
                      <dt>E-mail</dt>
                      <dd>{invite.contactEmail || "Não informado"}</dd>
                    </div>
                    <div>
                      <dt>Projeto</dt>
                      <dd>{invite.projectLabel || "Estrutura digital"}</dd>
                    </div>
                  </dl>
                </div>

                <div className="briefing-card briefing-progress">
                  <div className="briefing-progress__header">
                    <div>
                      <span className="micro-label">Progresso</span>
                      <h3>Etapa {boundedStepIndex + 1} de {visibleSteps.length}</h3>
                    </div>
                    <div className="briefing-progress__meta">
                      <span>{totalQuestions} perguntas no total</span>
                      <span>restam ~ {remainingMinutes} min</span>
                    </div>
                  </div>
                  <div className="briefing-progress__bar" aria-hidden="true">
                    <span style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="briefing-progress__hint">Uma pergunta por vez, com validação antes de avançar. Campos obrigatórios aparecem com *.</p>
                </div>

                <div className={`briefing-card briefing-step ${currentStep.fields.some((field) => field.key === "credit_and_portfolio_permissions") ? "briefing-card--authorization" : ""}`}>
                  <div className="briefing-step__header">
                    <div>
                      <span className="micro-label">Etapa atual</span>
                      <h3>{currentStep.title}</h3>
                    </div>
                    <span className="briefing-step__counter">{completedQuestions + 1} a {completedQuestions + currentStep.fields.length}</span>
                  </div>

                  {currentStep.description ? <p>{currentStep.description}</p> : null}

                  {feedbackMessage ? (
                    <p className={`briefing-form__status briefing-form__status--${submitState}`} aria-live="polite">
                      {feedbackMessage}
                    </p>
                  ) : null}

                  <div className="briefing-step__fields">
                    {currentStep.fields.map((field) => {
                      const fieldValue = values[field.key];
                      const fieldError = fieldErrors[field.key];
                      const isAuthorizationField = field.key === "credit_and_portfolio_permissions";
                      const fieldLabel = `${field.label}${field.required ? " *" : " · opcional"}`;

                      if (field.type === "textarea" || field.type === "file") {
                        return (
                          <label
                            key={field.key}
                            className={`briefing-form__field briefing-form__field--stacked ${fieldError ? "briefing-form__field--error" : ""}`}
                            data-field-key={field.key}
                          >
                            <span>{fieldLabel}</span>
                            {field.helpText ? <small>{field.helpText}</small> : null}
                            <textarea
                              rows={field.type === "file" ? 3 : 4}
                              value={typeof fieldValue === "string" ? fieldValue : ""}
                              onChange={(event) => updateValue(field.key, event.target.value)}
                              placeholder={field.type === "file" ? "Cole links do Drive, WeTransfer ou descreva os arquivos disponíveis." : field.placeholder ?? ""}
                              aria-invalid={fieldError ? "true" : "false"}
                            />
                            {fieldError ? <em className="briefing-form__error">{fieldError}</em> : null}
                          </label>
                        );
                      }

                      if (field.type === "single_select") {
                        return (
                          <label
                            key={field.key}
                            className={`briefing-form__field briefing-form__field--stacked ${fieldError ? "briefing-form__field--error" : ""}`}
                            data-field-key={field.key}
                          >
                            <span>{fieldLabel}</span>
                            {field.helpText ? <small>{field.helpText}</small> : null}
                            <select
                              value={typeof fieldValue === "string" ? fieldValue : ""}
                              onChange={(event) => updateValue(field.key, event.target.value)}
                              aria-invalid={fieldError ? "true" : "false"}
                            >
                              <option value="">Selecione</option>
                              {field.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {fieldError ? <em className="briefing-form__error">{fieldError}</em> : null}
                          </label>
                        );
                      }

                      if (field.type === "multi_select") {
                        const selected = Array.isArray(fieldValue) ? fieldValue : [];

                        return (
                          <fieldset
                            key={field.key}
                            className={`briefing-form__field briefing-form__field--stacked ${isAuthorizationField ? "briefing-form__field--authorization" : ""} ${fieldError ? "briefing-form__field--error" : ""}`}
                            data-field-key={field.key}
                          >
                            <span>{fieldLabel}</span>
                            {field.helpText ? <small>{field.helpText}</small> : null}
                            <div className={`briefing-form__checks ${isAuthorizationField ? "briefing-form__checks--authorization" : ""}`}>
                              {field.options.map((option) => (
                                <label key={option.value} className={`briefing-form__check ${isAuthorizationField ? "briefing-form__check--authorization" : ""}`}>
                                  <input type="checkbox" checked={selected.includes(option.value)} onChange={() => toggleMultiSelectValue(field.key, option.value)} />
                                  <span>{option.label}</span>
                                </label>
                              ))}
                            </div>
                            {fieldError ? <em className="briefing-form__error">{fieldError}</em> : null}
                          </fieldset>
                        );
                      }

                      return (
                        <label
                          key={field.key}
                          className={`briefing-form__field briefing-form__field--stacked ${fieldError ? "briefing-form__field--error" : ""}`}
                          data-field-key={field.key}
                        >
                          <span>{fieldLabel}</span>
                          {field.helpText ? <small>{field.helpText}</small> : null}
                          <input
                            type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
                            value={typeof fieldValue === "string" ? fieldValue : ""}
                            onChange={(event) => updateValue(field.key, event.target.value)}
                            placeholder={field.placeholder ?? ""}
                            aria-invalid={fieldError ? "true" : "false"}
                          />
                          {fieldError ? <em className="briefing-form__error">{fieldError}</em> : null}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="briefing-form__footer">
                  <button className="button button--secondary" type="button" onClick={handlePreviousStep} disabled={boundedStepIndex === 0 || submitState === "submitting"}>
                    <span>Etapa anterior</span>
                  </button>

                  {boundedStepIndex < visibleSteps.length - 1 ? (
                    <button className="button button--primary" type="button" onClick={handleNextStep} disabled={submitState === "submitting"}>
                      <span>Próxima etapa</span>
                    </button>
                  ) : (
                    <button className="button button--primary" type="submit" disabled={submitState === "submitting"}>
                      <span>{submitState === "submitting" ? "Enviando briefing..." : "Enviar briefing"}</span>
                    </button>
                  )}
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
