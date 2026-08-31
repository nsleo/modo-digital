"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";
import { siteConfig } from "@/content/site";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type SubmitState = "idle" | "submitting" | "success" | "error";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  serviceInterest: string;
  message: string;
  privacyAccepted: boolean;
  marketingOptIn: boolean;
};

type PublicLeadFormProps = {
  formSlug?: string;
  entryPoint?: string;
};

const TURNSTILE_SCRIPT_ID = "modo-turnstile-script";
const LEADS_API_ENDPOINT = "/api/v1/leads/index.php";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const SERVICE_OPTIONS = [
  "Site institucional",
  "Landing page",
  "E-commerce",
  "Hospedagem e e-mail",
  "Gestão contínua",
  "Ainda estou entendendo",
] as const;

const INITIAL_VALUES: FormValues = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  serviceInterest: SERVICE_OPTIONS[0],
  message: "",
  privacyAccepted: false,
  marketingOptIn: false,
};

const FORM_UNAVAILABLE_MESSAGE =
  "O formulário desta página está temporariamente indisponível nesta publicação. Para seguir agora, fale com a Modo Digital pelo WhatsApp.";

function buildUtmPayload() {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const utm = {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    term: params.get("utm_term"),
    content: params.get("utm_content"),
  };

  return Object.values(utm).some(Boolean) ? utm : null;
}

function buildOriginSource(entryPoint: string) {
  if (typeof window === "undefined") {
    return entryPoint;
  }

  return `${window.location.hostname}:${entryPoint}`;
}

export function PublicLeadForm({
  formSlug = "home-diagnostico-inicial",
  entryPoint = "home_final_cta",
}: PublicLeadFormProps) {
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const companyId = useId();
  const serviceId = useId();
  const messageId = useId();
  const privacyId = useId();
  const marketingId = useId();

  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const [scriptReady, setScriptReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);

  const formUnavailable = TURNSTILE_SITE_KEY === "";

  useEffect(() => {
    if (
      formUnavailable
      || !scriptReady
      || !turnstileContainerRef.current
      || !window.turnstile
      || widgetIdRef.current
    ) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "dark",
      callback: (token: string) => {
        setTurnstileToken(token);
        setFeedbackMessage("");
      },
      "expired-callback": () => {
        setTurnstileToken("");
      },
      "error-callback": () => {
        setTurnstileToken("");
        setSubmitState("error");
        setFeedbackMessage("A verificação de segurança falhou. Recarrega a página e tenta de novo.");
      },
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [formUnavailable, scriptReady]);

  function updateValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formUnavailable) {
      setSubmitState("error");
      setFeedbackMessage(FORM_UNAVAILABLE_MESSAGE);
      return;
    }

    if (!turnstileToken) {
      setSubmitState("error");
      setFeedbackMessage("Confirma a verificação de segurança antes de enviar.");
      return;
    }

    setSubmitState("submitting");
    setFeedbackMessage("");

    try {
      const response = await fetch(LEADS_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          email: values.email.trim().toLowerCase(),
          formSlug,
          source: buildOriginSource(entryPoint),
          utm: buildUtmPayload(),
          answers: {
            entryPoint,
          },
          turnstileToken,
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      const rawText = await response.text();
      const payload = (() => {
        try {
          return JSON.parse(rawText) as { error?: string; ok?: boolean };
        } catch {
          return null;
        }
      })();

      if (!response.ok || !payload?.ok) {
        const messageByError = {
          verification_failed: "A validação de segurança não foi aceita. Tenta novamente.",
          rate_limit_exceeded: "Recebemos muitas tentativas seguidas. Aguarda alguns minutos.",
          validation_error: "Revisa os campos e tenta novamente.",
          service_unavailable: "O formulário está indisponível no momento.",
          verification_unavailable: "A proteção do formulário ainda não está pronta neste ambiente.",
          internal_error: "Houve uma falha no envio. Tenta novamente em instantes.",
        } as const;

        const errorKey = payload?.error as keyof typeof messageByError | undefined;
        throw new Error(
          errorKey
            ? messageByError[errorKey]
            : response.status >= 500
              ? "A API recebeu o envio, mas devolveu um erro interno."
              : "A API não respondeu no formato esperado.",
        );
      }

      setValues(INITIAL_VALUES);
      setTurnstileToken("");
      setSubmitState("success");
      setFeedbackMessage("Recebido. A próxima etapa é nossa: vamos analisar e retornar o contato.");

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    } catch (error) {
      setSubmitState("error");
      setFeedbackMessage(
        error instanceof Error ? error.message : "Não foi possível enviar agora.",
      );
    }
  }

  return (
    <>
      {!formUnavailable ? (
        <Script
          id={TURNSTILE_SCRIPT_ID}
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setScriptReady(true)}
        />
      ) : null}

      <form className="lead-form" onSubmit={handleSubmit} noValidate>
        <div className="lead-form__grid">
          <div className="lead-form__field">
            <label htmlFor={nameId}>Nome</label>
            <input
              id={nameId}
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              required
            />
          </div>

          <div className="lead-form__field">
            <label htmlFor={emailId}>E-mail</label>
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => updateValue("email", event.target.value)}
              required
            />
          </div>

          <div className="lead-form__field">
            <label htmlFor={phoneId}>WhatsApp</label>
            <input
              id={phoneId}
              name="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(event) => updateValue("phone", event.target.value)}
              placeholder="(51) 99999-9999"
            />
          </div>

          <div className="lead-form__field">
            <label htmlFor={companyId}>Empresa</label>
            <input
              id={companyId}
              name="companyName"
              type="text"
              autoComplete="organization"
              value={values.companyName}
              onChange={(event) => updateValue("companyName", event.target.value)}
            />
          </div>

          <div className="lead-form__field lead-form__field--full">
            <label htmlFor={serviceId}>O que mais faz sentido hoje?</label>
            <select
              id={serviceId}
              name="serviceInterest"
              value={values.serviceInterest}
              onChange={(event) => updateValue("serviceInterest", event.target.value)}
            >
              {SERVICE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="lead-form__field lead-form__field--full">
            <label htmlFor={messageId}>Contexto</label>
            <textarea
              id={messageId}
              name="message"
              rows={5}
              value={values.message}
              onChange={(event) => updateValue("message", event.target.value)}
              placeholder="Explica em poucas linhas o momento da empresa, a estrutura atual ou o que precisa organizar."
            />
          </div>
        </div>

        <div className="lead-form__checks">
          <label className="lead-form__check" htmlFor={privacyId}>
            <input
              id={privacyId}
              name="privacyAccepted"
              type="checkbox"
              checked={values.privacyAccepted}
              onChange={(event) => updateValue("privacyAccepted", event.target.checked)}
              required
            />
            <span>
              Concordo em enviar meus dados para retorno comercial da Modo Digital.
            </span>
          </label>

          <label className="lead-form__check" htmlFor={marketingId}>
            <input
              id={marketingId}
              name="marketingOptIn"
              type="checkbox"
              checked={values.marketingOptIn}
              onChange={(event) => updateValue("marketingOptIn", event.target.checked)}
            />
            <span>Posso receber atualizações e conteúdos futuros da Modo Digital.</span>
          </label>
        </div>

        <div className="lead-form__footer">
          <div className="lead-form__trust">
            <div ref={turnstileContainerRef} className="lead-form__turnstile" />
            {formUnavailable ? (
              <p className="lead-form__hint">
                O formulário desta página está temporariamente indisponível nesta publicação.
                Use o WhatsApp abaixo para seguir agora.
              </p>
            ) : (
              <p className="lead-form__hint">
                Proteção ativa via Cloudflare Turnstile antes do envio.
              </p>
            )}
          </div>

          <div className="lead-form__actions">
            <button
              className="button button--primary"
              type="submit"
              disabled={submitState === "submitting" || formUnavailable}
            >
              <span>
                {submitState === "submitting" ? "Enviando..." : "Enviar diagnóstico inicial"}
              </span>
            </button>

            <a
              className="button button--secondary"
              href={siteConfig.whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              <span>Prefiro falar no WhatsApp</span>
            </a>
          </div>
        </div>

        {feedbackMessage ? (
          <p
            className={`lead-form__status lead-form__status--${submitState}`}
            role={submitState === "error" ? "alert" : "status"}
          >
            {feedbackMessage}
          </p>
        ) : null}
      </form>
    </>
  );
}
