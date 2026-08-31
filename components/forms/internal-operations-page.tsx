"use client";

import { useEffect, useState } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";

type PipelineStage =
  | "incoming"
  | "qualified"
  | "proposal_sent"
  | "won"
  | "lost"
  | "archived";

type AuthMode = "master_key" | "admin_session";
type ViewMode = "leads" | "clients" | "projects";

type LeadListItem = {
  publicId: string;
  name: string;
  email: string;
  companyName: string | null;
  source: string | null;
  serviceInterest: string | null;
  status: string;
  pipelineStage: PipelineStage;
  lastContactAt: string | null;
  createdAt: string;
  converted: boolean;
  clientPublicId: string | null;
  projectPublicId: string | null;
};

type LeadDetails = {
  ok: true;
  lead: {
    publicId: string;
    name: string;
    email: string;
    phone: string | null;
    companyName: string | null;
    source: string | null;
    serviceInterest: string | null;
    status: string;
    pipelineStage: PipelineStage;
    assignedAdminUserId: number | null;
    converted: boolean;
    lastContactAt: string | null;
    qualificationNotes: string | null;
    createdAt: string;
    updatedAt: string;
  };
  client: {
    publicId: string;
    companyName: string | null;
    status: string;
  } | null;
  project: {
    publicId: string;
    name: string;
    projectType: string;
    status: string;
  } | null;
  briefing: {
    publicId: string;
    title: string;
    status: string;
  } | null;
};

type ClientListItem = {
  publicId: string;
  companyName: string;
  tradeName: string | null;
  segment: string | null;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  primaryContactPhone: string | null;
  projectLabel: string | null;
  status: string;
  isTest: boolean;
  projectCount: number;
  lastProjectAt: string | null;
  createdAt: string;
};

type ClientDetails = {
  ok: true;
  client: {
    publicId: string;
    companyName: string;
    tradeName: string | null;
    segment: string | null;
    primaryContactName: string | null;
    primaryContactEmail: string | null;
    primaryContactPhone: string | null;
    projectLabel: string | null;
    status: string;
    isTest: boolean;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  };
  contacts: Array<{
    publicId: string;
    name: string;
    email: string | null;
    phone: string | null;
    roleLabel: string | null;
    isPrimary: boolean;
    notes: string | null;
  }>;
  projects: Array<{
    publicId: string;
    name: string;
    projectType: string;
    status: string;
    startedAt: string | null;
    updatedAt: string;
    sourceLeadPublicId: string | null;
    sourceLeadSource: string | null;
    briefingPublicId: string | null;
    briefingStatus: string | null;
    isTest: boolean;
  }>;
};

type ProjectListItem = {
  publicId: string;
  name: string;
  projectType: string;
  status: string;
  startedAt: string | null;
  updatedAt: string;
  clientPublicId: string;
  clientCompanyName: string;
  sourceLeadPublicId: string | null;
  sourceLeadSource: string | null;
  briefingPublicId: string | null;
  briefingStatus: string | null;
  isTest: boolean;
};

type ProjectDetails = {
  ok: true;
  project: {
    publicId: string;
    name: string;
    projectType: string;
    status: string;
    summary: string | null;
    startedAt: string | null;
    targetLaunchAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  client: {
    publicId: string;
    companyName: string;
    primaryContactName: string | null;
    primaryContactEmail: string | null;
    primaryContactPhone: string | null;
  };
  sourceLead: {
    publicId: string;
    source: string | null;
    isTest: boolean;
  } | null;
  briefing: {
    publicId: string;
    title: string;
    status: string;
    lastSentAt: string | null;
  } | null;
  canCleanupTest: boolean;
  briefingTemplate: {
    publicId: string;
    slug: string;
    name: string;
    version: number;
    steps: Array<{
      key: string;
      title: string;
      position: number;
      fields: Array<{
        key: string;
        label: string;
        type: string;
        options: Array<{ value: string; label: string }> | null;
        position: number;
      }>;
    }>;
  } | null;
  briefingResponse: {
    publicId: string;
    answers: Record<string, string | string[]>;
    submittedAt: string | null;
  } | null;
};

type ConfigState = {
  apiBaseUrl: string;
  authMode: AuthMode;
  adminKey: string;
  adminEmail: string;
  sessionToken: string;
  sessionUserName: string;
  sessionUserEmail: string;
  pipelineFilter: PipelineStage | "all";
  projectStatusFilter: "all" | "active" | "on_hold" | "completed" | "archived";
  briefingStatusFilter: "all" | "draft" | "sent" | "submitted" | "reviewed" | "archived";
  onlyTestFilter: boolean;
  listLimit: string;
};

type ManualLeadFormState = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  serviceInterest: string;
  message: string;
  qualificationNotes: string;
  pipelineStage: Exclude<PipelineStage, "won">;
  isTestLead: boolean;
};

type BootstrapAdminFormState = {
  name: string;
  email: string;
  password: string;
};

type PasswordChangeFormState = {
  email: string;
  currentPassword: string;
  newPassword: string;
};

type StatusTone = "idle" | "success" | "error";
type SidebarSectionKey = "access" | "newLead" | "queue";

const STORAGE_KEY = "modo_internal_ops_v2";
const INITIAL_CONFIG: ConfigState = {
  apiBaseUrl: "https://sejamododigital.com.br",
  authMode: "master_key",
  adminKey: "",
  adminEmail: "",
  sessionToken: "",
  sessionUserName: "",
  sessionUserEmail: "",
  pipelineFilter: "all",
  projectStatusFilter: "all",
  briefingStatusFilter: "all",
  onlyTestFilter: false,
  listLimit: "20",
};

const INITIAL_MANUAL_LEAD_FORM: ManualLeadFormState = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  serviceInterest: "institutional_site",
  message: "",
  qualificationNotes: "",
  pipelineStage: "incoming",
  isTestLead: false,
};

const INITIAL_BOOTSTRAP_ADMIN_FORM: BootstrapAdminFormState = {
  name: "",
  email: "",
  password: "",
};

const INITIAL_PASSWORD_CHANGE_FORM: PasswordChangeFormState = {
  email: "",
  currentPassword: "",
  newPassword: "",
};

const PIPELINE_FILTER_OPTIONS: ReadonlyArray<{ value: ConfigState["pipelineFilter"]; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "incoming", label: "Incoming" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal sent" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "archived", label: "Archived" },
];

const LEAD_STAGE_OPTIONS: ReadonlyArray<{ value: Exclude<PipelineStage, "won">; label: string }> = [
  { value: "incoming", label: "Incoming" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal sent" },
  { value: "lost", label: "Lost" },
  { value: "archived", label: "Archived" },
];

const PROJECT_TYPE_OPTIONS = [
  { value: "institutional_site", label: "Institutional site" },
  { value: "landing_page", label: "Landing page" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "catalog", label: "Catalog" },
  { value: "link_in_bio", label: "Link in bio" },
  { value: "website_redesign", label: "Website redesign" },
  { value: "other", label: "Other" },
] as const;

const PROJECT_STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
] as const;

const BRIEFING_STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "submitted", label: "Submitted" },
  { value: "reviewed", label: "Reviewed" },
  { value: "archived", label: "Archived" },
] as const;

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function buildInternalUrl(apiBaseUrl: string, path: string) {
  return `${apiBaseUrl.replace(/\/$/, "")}${path}`;
}

function normalizeWhatsappLink(phone: string | null | undefined) {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/\D+/g, "");
  if (!digits) {
    return null;
  }

  const normalized = digits.startsWith("55") ? digits : digits.length >= 10 && digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${normalized}`;
}

function formatBriefingAnswer(
  value: string | string[] | undefined,
  options: Array<{ value: string; label: string }> | null | undefined,
) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "—";
    }

    const labels = value.map((item) => options?.find((option) => option.value === item)?.label || item);
    return labels.join(", ");
  }

  if (!value) {
    return "—";
  }

  return options?.find((option) => option.value === value)?.label || value;
}

function mapFieldValidationMessage(field: string | undefined, fallback = "Revise os campos e tente novamente.") {
  const messages: Record<string, string> = {
    name: "Preencha um nome válido.",
    email: "Preencha um e-mail válido.",
    password: "A senha precisa ter pelo menos 8 caracteres.",
    newPassword: "A nova senha precisa ter pelo menos 8 caracteres.",
    currentPassword: "Informe a senha atual corretamente.",
    companyName: "Preencha um nome de empresa válido.",
    pipelineStage: "Escolha um estágio válido.",
    projectId: "Selecione um projeto válido.",
    serviceInterest: "Escolha um tipo de interesse válido.",
    qualificationNotes: "As notas ficaram longas demais.",
  };

  return field ? (messages[field] ?? `Revise o campo ${field}.`) : fallback;
}

export function InternalOperationsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("leads");
  const [config, setConfig] = useState<ConfigState>(INITIAL_CONFIG);
  const [loginPassword, setLoginPassword] = useState("");
  const [bootstrapAdmin, setBootstrapAdmin] = useState<BootstrapAdminFormState>(INITIAL_BOOTSTRAP_ADMIN_FORM);
  const [passwordChange, setPasswordChange] = useState<PasswordChangeFormState>(INITIAL_PASSWORD_CHANGE_FORM);
  const [manualLead, setManualLead] = useState<ManualLeadFormState>(INITIAL_MANUAL_LEAD_FORM);
  const [items, setItems] = useState<LeadListItem[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [details, setDetails] = useState<LeadDetails | null>(null);
  const [clientItems, setClientItems] = useState<ClientListItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null);
  const [projectItems, setProjectItems] = useState<ProjectListItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [qualificationNotes, setQualificationNotes] = useState("");
  const [updateStage, setUpdateStage] = useState<Exclude<PipelineStage, "won">>("qualified");
  const [projectType, setProjectType] = useState("institutional_site");
  const [updateProjectStatus, setUpdateProjectStatus] = useState<"active" | "on_hold" | "completed" | "archived">("active");
  const [updateBriefingStatus, setUpdateBriefingStatus] = useState<"draft" | "sent" | "submitted" | "reviewed" | "archived">("draft");
  const [isConfigReady, setIsConfigReady] = useState(false);
  const [listState, setListState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [listFeedback, setListFeedback] = useState("");
  const [detailState, setDetailState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [detailFeedback, setDetailFeedback] = useState("");
  const [clientListState, setClientListState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [clientListFeedback, setClientListFeedback] = useState("");
  const [clientDetailState, setClientDetailState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [clientDetailFeedback, setClientDetailFeedback] = useState("");
  const [projectListState, setProjectListState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [projectListFeedback, setProjectListFeedback] = useState("");
  const [projectDetailState, setProjectDetailState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [projectDetailFeedback, setProjectDetailFeedback] = useState("");
  const [generatedBriefingLink, setGeneratedBriefingLink] = useState("");
  const [authFeedback, setAuthFeedback] = useState<{ tone: StatusTone; message: string }>({ tone: "idle", message: "" });
  const [manualLeadFeedback, setManualLeadFeedback] = useState<{ tone: StatusTone; message: string }>({ tone: "idle", message: "" });
  const [passwordFeedback, setPasswordFeedback] = useState<{ tone: StatusTone; message: string }>({ tone: "idle", message: "" });
  const [actionFeedback, setActionFeedback] = useState<{ tone: StatusTone; message: string }>({ tone: "idle", message: "" });
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<SidebarSectionKey, boolean>>({
    access: false,
    newLead: true,
    queue: false,
  });
  const isConnected =
    config.authMode === "master_key"
      ? config.adminKey.trim() !== ""
      : config.sessionToken.trim() !== "";

  function toggleSection(section: SidebarSectionKey) {
    setCollapsedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ConfigState>;
        setConfig((current) => ({
          ...current,
          ...parsed,
        }));
      }
    } catch {
      // ignore invalid state
    } finally {
      setIsConfigReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isConfigReady) {
      return;
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config, isConfigReady]);

  useEffect(() => {
    if (!details) {
      setQualificationNotes("");
      return;
    }

    setQualificationNotes(details.lead.qualificationNotes ?? "");
    if (details.lead.pipelineStage !== "won") {
      setUpdateStage(details.lead.pipelineStage as Exclude<PipelineStage, "won">);
    }
  }, [details]);

  useEffect(() => {
    if (!projectDetails) {
      return;
    }

    setUpdateProjectStatus(projectDetails.project.status as "active" | "on_hold" | "completed" | "archived");
    setUpdateBriefingStatus((projectDetails.briefing?.status || "draft") as "draft" | "sent" | "submitted" | "reviewed" | "archived");
  }, [projectDetails]);

  async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    if (init?.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (config.authMode === "master_key" && config.adminKey.trim() !== "") {
      headers.set("X-MODO-ADMIN-KEY", config.adminKey);
    }

    if (config.authMode === "admin_session" && config.sessionToken.trim() !== "") {
      headers.set("Authorization", `Bearer ${config.sessionToken}`);
    }

    const response = await fetch(buildInternalUrl(config.apiBaseUrl, path), {
      ...init,
      headers,
      cache: "no-store",
    });

    const text = await response.text();
    const payload = (() => {
      try {
        return JSON.parse(text) as T & { error?: string; field?: string };
      } catch {
        return null;
      }
    })();

    if (!response.ok || !payload) {
      if (payload && typeof payload === "object" && "error" in payload && payload.error) {
        if (payload.error === "validation_error") {
          throw new Error(mapFieldValidationMessage(payload.field));
        }

        throw new Error(String(payload.error));
      }

      throw new Error(`http_${response.status}`);
    }

    return payload;
  }

  async function loadLeads() {
    if (!isConnected) {
      setListState("error");
      setListFeedback("Abra a sessão antes de consultar.");
      return;
    }

    setListState("loading");
    setListFeedback("");
    setActionFeedback({ tone: "idle", message: "" });

    try {
      const params = new URLSearchParams();
      params.set("limit", config.listLimit || "20");
      if (config.pipelineFilter !== "all") {
        params.set("pipelineStage", config.pipelineFilter);
      }
      if (config.onlyTestFilter) {
        params.set("onlyTest", "true");
      }

      const payload = await requestJson<{ ok: true; items: LeadListItem[] }>(
        `/api/v1/internal/list-leads.php?${params.toString()}`,
      );

      setItems(payload.items);
      setListState("ready");
      setListFeedback(payload.items.length === 0 ? "Nenhum lead encontrado com esse filtro." : "");

      if (payload.items.length > 0 && !payload.items.some((item) => item.publicId === selectedLeadId)) {
        setSelectedLeadId(payload.items[0].publicId);
      }
    } catch (error) {
      setListState("error");
      setListFeedback(error instanceof Error ? error.message : "Não foi possível listar os leads.");
    }
  }

  async function loadClients() {
    if (!isConnected) {
      setClientListState("error");
      setClientListFeedback("Abra a sessão antes de consultar.");
      return;
    }

    setClientListState("loading");
    setClientListFeedback("");

    try {
      const params = new URLSearchParams();
      params.set("limit", config.listLimit || "20");
      if (config.onlyTestFilter) {
        params.set("onlyTest", "true");
      }

      const payload = await requestJson<{ ok: true; items: ClientListItem[] }>(
        `/api/v1/internal/list-clients.php?${params.toString()}`,
      );

      setClientItems(payload.items);
      setClientListState("ready");
      setClientListFeedback(payload.items.length === 0 ? "Nenhum cliente encontrado." : "");

      if (payload.items.length > 0 && !payload.items.some((item) => item.publicId === selectedClientId)) {
        setSelectedClientId(payload.items[0].publicId);
      }
    } catch (error) {
      setClientListState("error");
      setClientListFeedback(error instanceof Error ? error.message : "Não foi possível listar os clientes.");
    }
  }

  async function loadProjects() {
    if (!isConnected) {
      setProjectListState("error");
      setProjectListFeedback("Abra a sessão antes de consultar.");
      return;
    }

    setProjectListState("loading");
    setProjectListFeedback("");

    try {
      const params = new URLSearchParams();
      params.set("limit", config.listLimit || "20");
      if (config.projectStatusFilter !== "all") {
        params.set("projectStatus", config.projectStatusFilter);
      }
      if (config.briefingStatusFilter !== "all") {
        params.set("briefingStatus", config.briefingStatusFilter);
      }
      if (config.onlyTestFilter) {
        params.set("onlyTest", "true");
      }

      const payload = await requestJson<{ ok: true; items: ProjectListItem[] }>(
        `/api/v1/internal/list-projects.php?${params.toString()}`,
      );

      setProjectItems(payload.items);
      setProjectListState("ready");
      setProjectListFeedback(payload.items.length === 0 ? "Nenhum projeto encontrado com esse filtro." : "");

      if (payload.items.length > 0 && !payload.items.some((item) => item.publicId === selectedProjectId)) {
        setSelectedProjectId(payload.items[0].publicId);
      }
    } catch (error) {
      setProjectListState("error");
      setProjectListFeedback(error instanceof Error ? error.message : "Não foi possível listar os projetos.");
    }
  }

  async function loadDetails(leadId: string) {
    if (!leadId) {
      return;
    }

    setDetailState("loading");
    setDetailFeedback("");

    try {
      const payload = await requestJson<LeadDetails>(
        `/api/v1/internal/lead-details.php?leadId=${encodeURIComponent(leadId)}`,
      );
      setDetails(payload);
      setDetailState("ready");
    } catch (error) {
      setDetails(null);
      setDetailState("error");
      setDetailFeedback(error instanceof Error ? error.message : "Não foi possível carregar o detalhe do lead.");
    }
  }

  async function loadClientDetails(clientId: string) {
    if (!clientId) {
      return;
    }

    setClientDetailState("loading");
    setClientDetailFeedback("");

    try {
      const payload = await requestJson<ClientDetails>(
        `/api/v1/internal/client-details.php?clientId=${encodeURIComponent(clientId)}`,
      );
      setClientDetails(payload);
      setClientDetailState("ready");
    } catch (error) {
      setClientDetails(null);
      setClientDetailState("error");
      setClientDetailFeedback(error instanceof Error ? error.message : "Não foi possível carregar o detalhe do cliente.");
    }
  }

  async function loadProjectDetails(projectId: string) {
    if (!projectId) {
      return;
    }

    setProjectDetailState("loading");
    setProjectDetailFeedback("");

    try {
      const payload = await requestJson<ProjectDetails>(
        `/api/v1/internal/project-details.php?projectId=${encodeURIComponent(projectId)}`,
      );
      setProjectDetails(payload);
      setProjectDetailState("ready");
    } catch (error) {
      setProjectDetails(null);
      setGeneratedBriefingLink("");
      setProjectDetailState("error");
      setProjectDetailFeedback(error instanceof Error ? error.message : "Não foi possível carregar o detalhe do projeto.");
    }
  }

  async function handleSendBriefingInvite() {
    if (!projectDetails) return;

    setIsSubmittingAction(true);
    setActionFeedback({ tone: "idle", message: "" });

    try {
      const payload = await requestJson<{
        ok: true;
        inviteId: string;
        invitePath: string;
      }>("/api/v1/internal/send-briefing-invite.php", {
        method: "POST",
        body: JSON.stringify({
          projectId: projectDetails.project.publicId,
        }),
      });

      const inviteUrl = `${config.apiBaseUrl.replace(/\/$/, "")}${payload.invitePath}`;
      setGeneratedBriefingLink(inviteUrl);
      setActionFeedback({ tone: "success", message: "Link de briefing gerado. Agora você pode copiar e enviar ao cliente." });
      await loadProjects();
      await loadProjectDetails(projectDetails.project.publicId);
    } catch (error) {
      setActionFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível gerar o link de briefing.",
      });
    } finally {
      setIsSubmittingAction(false);
    }
  }

  async function handleCopyBriefingLink() {
    if (!generatedBriefingLink) {
      setActionFeedback({ tone: "error", message: "Gere um link antes de copiar." });
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedBriefingLink);
      setActionFeedback({ tone: "success", message: "Link copiado." });
    } catch {
      setActionFeedback({ tone: "error", message: "Não foi possível copiar automaticamente. Copie o link manualmente." });
    }
  }

  async function handleCopyText(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      setActionFeedback({ tone: "success", message: successMessage });
    } catch {
      setActionFeedback({ tone: "error", message: "Não foi possível copiar automaticamente." });
    }
  }

  async function handleUpdateProjectGovernance() {
    if (!projectDetails) return;

    setIsSubmittingAction(true);
    setActionFeedback({ tone: "idle", message: "" });

    try {
      await requestJson("/api/v1/internal/update-project-governance.php", {
        method: "POST",
        body: JSON.stringify({
          projectId: projectDetails.project.publicId,
          projectStatus: updateProjectStatus,
          briefingStatus: projectDetails.briefing ? updateBriefingStatus : undefined,
        }),
      });

      setActionFeedback({ tone: "success", message: "Governança do projeto atualizada." });
      await loadProjects();
      await loadProjectDetails(projectDetails.project.publicId);
    } catch (error) {
      setActionFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível atualizar a governança do projeto.",
      });
    } finally {
      setIsSubmittingAction(false);
    }
  }

  useEffect(() => {
    if (viewMode !== "leads") {
      return;
    }

    if (!selectedLeadId || !isConnected) {
      return;
    }

    loadDetails(selectedLeadId);
  }, [selectedLeadId, isConnected, config.apiBaseUrl, config.authMode, config.sessionToken, config.adminKey, viewMode]);

  useEffect(() => {
    if (viewMode !== "clients") {
      return;
    }

    if (!selectedClientId || !isConnected) {
      return;
    }

    loadClientDetails(selectedClientId);
  }, [selectedClientId, isConnected, config.apiBaseUrl, config.authMode, config.sessionToken, config.adminKey, viewMode]);

  useEffect(() => {
    if (viewMode !== "projects") {
      return;
    }

    if (!selectedProjectId || !isConnected) {
      return;
    }

    setGeneratedBriefingLink("");
    loadProjectDetails(selectedProjectId);
  }, [selectedProjectId, isConnected, config.apiBaseUrl, config.authMode, config.sessionToken, config.adminKey, viewMode]);

  async function handleOpenMasterSession() {
    setAuthFeedback({ tone: "idle", message: "" });
    if (!config.adminKey.trim()) {
      setAuthFeedback({ tone: "error", message: "Informe a chave interna." });
      return;
    }

    if (viewMode === "clients") {
      await loadClients();
    } else if (viewMode === "projects") {
      await loadProjects();
    } else {
      await loadLeads();
    }
    setAuthFeedback({ tone: "success", message: "Sessão por chave mestre aberta." });
  }

  async function handleAdminLogin() {
    setAuthFeedback({ tone: "idle", message: "" });
    if (!config.adminEmail.trim() || !loginPassword.trim()) {
      setAuthFeedback({ tone: "error", message: "Informe e-mail e senha." });
      return;
    }

    setIsAuthenticating(true);

    try {
      const payload = await requestJson<{
        ok: true;
        token: string;
        user: { email: string; name: string };
      }>("/api/v1/internal/auth-login.php", {
        method: "POST",
        body: JSON.stringify({
          email: config.adminEmail,
          password: loginPassword,
        }),
      });

      setConfig((current) => ({
        ...current,
        sessionToken: payload.token,
        sessionUserEmail: payload.user.email,
        sessionUserName: payload.user.name,
      }));
      setLoginPassword("");
      setAuthFeedback({ tone: "success", message: `Sessão admin aberta para ${payload.user.name}.` });
      if (viewMode === "clients") {
        await loadClients();
      } else if (viewMode === "projects") {
        await loadProjects();
      } else {
        await loadLeads();
      }
    } catch (error) {
      setAuthFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível entrar.",
      });
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function handleBootstrapAdmin() {
    setAuthFeedback({ tone: "idle", message: "" });
    if (!config.adminKey.trim()) {
      setAuthFeedback({ tone: "error", message: "A criação de admin exige a chave mestre." });
      return;
    }

    setIsAuthenticating(true);
    try {
      await requestJson("/api/v1/internal/create-admin-user.php", {
        method: "POST",
        headers: {
          "X-MODO-ADMIN-KEY": config.adminKey,
        },
        body: JSON.stringify(bootstrapAdmin),
      });

      setBootstrapAdmin(INITIAL_BOOTSTRAP_ADMIN_FORM);
      setAuthFeedback({ tone: "success", message: "Admin criado com sucesso." });
    } catch (error) {
      setAuthFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível criar o admin.",
      });
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function handleChangePassword() {
    setPasswordFeedback({ tone: "idle", message: "" });
    setIsAuthenticating(true);

    try {
      const payload =
        config.authMode === "master_key"
          ? {
              email: passwordChange.email,
              newPassword: passwordChange.newPassword,
            }
          : {
              currentPassword: passwordChange.currentPassword,
              newPassword: passwordChange.newPassword,
            };

      await requestJson("/api/v1/internal/change-password.php", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setPasswordChange(INITIAL_PASSWORD_CHANGE_FORM);
      setPasswordFeedback({
        tone: "success",
        message: config.authMode === "master_key" ? "Senha redefinida com sucesso." : "Senha alterada com sucesso.",
      });
    } catch (error) {
      setPasswordFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível alterar a senha.",
      });
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function handleLogout() {
    try {
      if (config.authMode === "admin_session" && config.sessionToken) {
        await requestJson("/api/v1/internal/auth-logout.php", {
          method: "POST",
        });
      }
    } catch {
      // ignore logout failure locally
    } finally {
      setConfig((current) => ({
        ...current,
        adminKey: current.authMode === "master_key" ? "" : current.adminKey,
        sessionToken: "",
        sessionUserName: "",
        sessionUserEmail: "",
      }));
      setItems([]);
      setDetails(null);
      setSelectedLeadId("");
      setClientItems([]);
      setClientDetails(null);
      setSelectedClientId("");
      setProjectItems([]);
      setProjectDetails(null);
      setSelectedProjectId("");
      setListState("idle");
      setDetailState("idle");
      setClientListState("idle");
      setClientDetailState("idle");
      setProjectListState("idle");
      setProjectDetailState("idle");
      setListFeedback("");
      setDetailFeedback("");
      setClientListFeedback("");
      setClientDetailFeedback("");
      setProjectListFeedback("");
      setProjectDetailFeedback("");
      setActionFeedback({ tone: "idle", message: "" });
      setAuthFeedback({ tone: "idle", message: "" });
    }
  }

  async function handleCreateLead() {
    if (!isConnected) {
      setManualLeadFeedback({ tone: "error", message: "Abra a sessão antes de criar leads." });
      return;
    }

    setIsCreatingLead(true);
    setManualLeadFeedback({ tone: "idle", message: "" });

    try {
      const payload = await requestJson<{ ok: true; leadId: string }>("/api/v1/internal/create-lead.php", {
        method: "POST",
        body: JSON.stringify(manualLead),
      });

      setManualLead(INITIAL_MANUAL_LEAD_FORM);
      setManualLeadFeedback({ tone: "success", message: "Lead criado com sucesso." });
      await loadLeads();
      setSelectedLeadId(payload.leadId);
    } catch (error) {
      setManualLeadFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível criar o lead.",
      });
    } finally {
      setIsCreatingLead(false);
    }
  }

  async function handleUpdateLead() {
    if (!details) return;
    setIsSubmittingAction(true);
    setActionFeedback({ tone: "idle", message: "" });

    try {
      await requestJson("/api/v1/internal/update-lead-stage.php", {
        method: "POST",
        body: JSON.stringify({
          leadId: details.lead.publicId,
          pipelineStage: updateStage,
          qualificationNotes,
          markContacted: true,
        }),
      });
      setActionFeedback({ tone: "success", message: "Lead atualizado." });
      await loadLeads();
      await loadDetails(details.lead.publicId);
    } catch (error) {
      setActionFeedback({ tone: "error", message: error instanceof Error ? error.message : "Não foi possível atualizar o lead." });
    } finally {
      setIsSubmittingAction(false);
    }
  }

  async function handleConvertLead() {
    if (!details) return;
    setIsSubmittingAction(true);
    setActionFeedback({ tone: "idle", message: "" });
    try {
      await requestJson("/api/v1/internal/convert-lead.php", {
        method: "POST",
        body: JSON.stringify({
          leadId: details.lead.publicId,
          projectType,
          createBriefing: true,
          qualificationNotes,
        }),
      });
      setActionFeedback({ tone: "success", message: "Lead convertido em cliente e projeto." });
      await loadLeads();
      await loadDetails(details.lead.publicId);
    } catch (error) {
      setActionFeedback({ tone: "error", message: error instanceof Error ? error.message : "Não foi possível converter o lead." });
    } finally {
      setIsSubmittingAction(false);
    }
  }

  async function handleArchiveLead() {
    if (!details) return;
    setIsSubmittingAction(true);
    setActionFeedback({ tone: "idle", message: "" });
    try {
      await requestJson("/api/v1/internal/update-lead-stage.php", {
        method: "POST",
        body: JSON.stringify({
          leadId: details.lead.publicId,
          pipelineStage: "archived",
          qualificationNotes,
        }),
      });
      setActionFeedback({ tone: "success", message: "Lead arquivado." });
      await loadLeads();
      await loadDetails(details.lead.publicId);
    } catch (error) {
      setActionFeedback({ tone: "error", message: error instanceof Error ? error.message : "Não foi possível arquivar o lead." });
    } finally {
      setIsSubmittingAction(false);
    }
  }

  async function handleCleanupTestLead() {
    if (!details) return;
    if (!window.confirm("Esse lead de teste e tudo o que nasceu dele serão removidos. Continuar?")) {
      return;
    }

    setIsSubmittingAction(true);
    setActionFeedback({ tone: "idle", message: "" });
    try {
      await requestJson("/api/v1/internal/cleanup-test-lead.php", {
        method: "POST",
        body: JSON.stringify({ leadId: details.lead.publicId }),
      });
      setActionFeedback({ tone: "success", message: "Lead de teste limpo." });
      setDetails(null);
      setSelectedLeadId("");
      await loadLeads();
    } catch (error) {
      setActionFeedback({ tone: "error", message: error instanceof Error ? error.message : "Não foi possível limpar o lead de teste." });
    } finally {
      setIsSubmittingAction(false);
    }
  }

  async function handleCleanupProjectTest() {
    if (!projectDetails?.sourceLead?.publicId || !projectDetails.canCleanupTest) return;
    if (!window.confirm("Esse projeto nasceu de um lead de teste. A limpeza remove lead, cliente, projeto, briefing e submissões relacionadas. Continuar?")) {
      return;
    }

    setIsSubmittingAction(true);
    setActionFeedback({ tone: "idle", message: "" });
    try {
      await requestJson("/api/v1/internal/cleanup-test-lead.php", {
        method: "POST",
        body: JSON.stringify({ leadId: projectDetails.sourceLead.publicId }),
      });
      setActionFeedback({ tone: "success", message: "Cadeia de teste removida." });
      setProjectDetails(null);
      setSelectedProjectId("");
      await loadProjects();
    } catch (error) {
      setActionFeedback({ tone: "error", message: error instanceof Error ? error.message : "Não foi possível limpar a cadeia de teste." });
    } finally {
      setIsSubmittingAction(false);
    }
  }

  const canConvert = details ? !details.lead.converted && !["lost", "archived"].includes(details.lead.pipelineStage) : false;
  const canUpdateLead = details ? !details.lead.converted : false;
  const isTestLead = details?.lead.source === "internal_e2e_test";
  const briefingContactName = projectDetails?.client.primaryContactName?.trim() || "equipe";
  const briefingEmail = projectDetails?.client.primaryContactEmail?.trim() || "";
  const briefingWhatsapp = normalizeWhatsappLink(projectDetails?.client.primaryContactPhone);
  const briefingEmailSubject = projectDetails ? `Briefing do projeto - ${projectDetails.project.name}` : "";
  const briefingMessage = generatedBriefingLink
    ? `Olá, ${briefingContactName}. Aqui está o link do briefing do projeto ${projectDetails?.project.name || ""}:\n\n${generatedBriefingLink}\n\nQuando puder, preencha o que já estiver claro. O restante a gente organiza junto.`
    : "";
  const briefingMailto = generatedBriefingLink && briefingEmail
    ? `mailto:${encodeURIComponent(briefingEmail)}?subject=${encodeURIComponent(briefingEmailSubject)}&body=${encodeURIComponent(briefingMessage)}`
    : null;
  const briefingWhatsappShare = generatedBriefingLink && briefingWhatsapp
    ? `${briefingWhatsapp}?text=${encodeURIComponent(briefingMessage)}`
    : null;

  return (
    <main id="conteudo" className="ops-page">
      <section className="ops-hero">
        <div className="container ops-hero__content">
          <Eyebrow>Operação interna</Eyebrow>
          <h1>Painel mínimo para operar leads sem terminal.</h1>
          <p>Agora com dois modos de acesso: chave mestre para bootstrap e login admin para operação recorrente.</p>
        </div>
      </section>

      <section className="section ops-shell">
        <div className="container container--ultra ops-shell__grid">
          <aside className="ops-sidebar">
            <div className="ops-card">
              <div className="ops-card__header">
                <h2 className="ops-card__title">Visão</h2>
              </div>
              <div className="ops-segmented ops-segmented--triple">
                <button
                  type="button"
                  className={`ops-segmented__item ${viewMode === "leads" ? "ops-segmented__item--active" : ""}`}
                  onClick={() => setViewMode("leads")}
                >
                  Leads
                </button>
                <button
                  type="button"
                  className={`ops-segmented__item ${viewMode === "clients" ? "ops-segmented__item--active" : ""}`}
                  onClick={() => setViewMode("clients")}
                >
                  Clientes
                </button>
                <button
                  type="button"
                  className={`ops-segmented__item ${viewMode === "projects" ? "ops-segmented__item--active" : ""}`}
                  onClick={() => setViewMode("projects")}
                >
                  Projetos
                </button>
              </div>
            </div>

            <div className="ops-card">
              <div className="ops-card__header">
                <h2 className="ops-card__title">Acesso</h2>
                <div className="ops-card__header-actions">
                  <span className={`ops-chip ops-chip--${isConnected ? "success" : "neutral"}`}>
                    {isConnected ? "Sessão aberta" : "Sessão fechada"}
                  </span>
                  <button
                    type="button"
                    className={`ops-toggle ${collapsedSections.access ? "ops-toggle--collapsed" : ""}`}
                    aria-label={collapsedSections.access ? "Expandir acesso" : "Recolher acesso"}
                    aria-expanded={!collapsedSections.access}
                    onClick={() => toggleSection("access")}
                  >
                    <Icon name="arrow" width={14} height={14} />
                  </button>
                </div>
              </div>

              {!collapsedSections.access ? (
                <>
                  <div className="ops-segmented ops-segmented--dual">
                    <button
                      type="button"
                      className={`ops-segmented__item ${config.authMode === "master_key" ? "ops-segmented__item--active" : ""}`}
                      onClick={() => setConfig((current) => ({ ...current, authMode: "master_key" }))}
                    >
                      Chave mestre
                    </button>
                    <button
                      type="button"
                      className={`ops-segmented__item ${config.authMode === "admin_session" ? "ops-segmented__item--active" : ""}`}
                      onClick={() => setConfig((current) => ({ ...current, authMode: "admin_session" }))}
                    >
                      Login admin
                    </button>
                  </div>

                  <label className="ops-field">
                    <span>Base da API</span>
                    <input
                      type="url"
                      value={config.apiBaseUrl}
                      onChange={(event) => setConfig((current) => ({ ...current, apiBaseUrl: event.target.value }))}
                    />
                  </label>

                  {config.authMode === "master_key" ? (
                    <>
                      <label className="ops-field">
                        <span>Chave interna</span>
                        <input
                          type="password"
                          autoComplete="current-password"
                          value={config.adminKey}
                          onChange={(event) => setConfig((current) => ({ ...current, adminKey: event.target.value }))}
                        />
                      </label>

                      <form
                        className="ops-auth-actions"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleOpenMasterSession();
                        }}
                      >
                        <button className="button button--primary ops-button" type="submit">
                          <span>Abrir sessão por chave</span>
                        </button>
                        {isConnected ? (
                          <button className="button button--text ops-button" type="button" onClick={handleLogout}>
                            <span>Encerrar sessão</span>
                          </button>
                        ) : null}
                      </form>

                      <div className="ops-subsection">
                        <h3 className="ops-subsection__title">Bootstrap de admin</h3>
                        <p>Use a chave mestre para criar o primeiro usuário ou novos admins.</p>
                        <form
                          className="ops-form-grid"
                          onSubmit={(event) => {
                            event.preventDefault();
                            handleBootstrapAdmin();
                          }}
                        >
                          <label className="ops-field">
                            <span>Nome</span>
                            <input
                              type="text"
                              autoComplete="name"
                              value={bootstrapAdmin.name}
                              onChange={(event) => setBootstrapAdmin((current) => ({ ...current, name: event.target.value }))}
                            />
                          </label>
                          <label className="ops-field">
                            <span>E-mail</span>
                            <input
                              type="email"
                              autoComplete="username"
                              value={bootstrapAdmin.email}
                              onChange={(event) => setBootstrapAdmin((current) => ({ ...current, email: event.target.value }))}
                            />
                          </label>
                          <label className="ops-field ops-form-grid__full">
                            <span>Senha</span>
                            <input
                              type="password"
                              autoComplete="new-password"
                              value={bootstrapAdmin.password}
                              onChange={(event) => setBootstrapAdmin((current) => ({ ...current, password: event.target.value }))}
                            />
                          </label>
                          <button className="button button--secondary ops-button ops-form-grid__full" type="submit" disabled={isAuthenticating}>
                            <span>{isAuthenticating ? "Criando..." : "Criar admin"}</span>
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <>
                      <form
                        className="ops-form-grid"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleAdminLogin();
                        }}
                      >
                        <label className="ops-field ops-form-grid__full">
                          <span>E-mail admin</span>
                          <input
                            type="email"
                            autoComplete="username"
                            value={config.adminEmail}
                            onChange={(event) => setConfig((current) => ({ ...current, adminEmail: event.target.value }))}
                          />
                        </label>
                        <label className="ops-field ops-form-grid__full">
                          <span>Senha</span>
                          <input
                            type="password"
                            autoComplete="current-password"
                            value={loginPassword}
                            onChange={(event) => setLoginPassword(event.target.value)}
                          />
                        </label>
                        <button className="button button--primary ops-button ops-form-grid__full" type="submit" disabled={isAuthenticating}>
                          <span>{isAuthenticating ? "Entrando..." : "Entrar"}</span>
                        </button>
                        {isConnected ? (
                          <button className="button button--text ops-button ops-form-grid__full" type="button" onClick={handleLogout}>
                            <span>Encerrar sessão</span>
                          </button>
                        ) : null}
                      </form>
                      {config.sessionUserName ? (
                        <p className="ops-session-note">Sessão ativa para {config.sessionUserName} ({config.sessionUserEmail}).</p>
                      ) : null}
                    </>
                  )}

                  {authFeedback.message ? (
                    <p className={`ops-feedback ops-feedback--${authFeedback.tone}`}>{authFeedback.message}</p>
                  ) : null}

                  <div className="ops-subsection">
                    <h3 className="ops-subsection__title">Alterar senha</h3>
                    <p>
                      {config.authMode === "master_key"
                        ? "Com a chave mestre, você redefine a senha de qualquer admin por e-mail."
                        : "Com sessão admin, você altera a própria senha."}
                    </p>
                    <form
                      className="ops-form-grid"
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleChangePassword();
                      }}
                    >
                      {config.authMode === "master_key" ? (
                        <label className="ops-field ops-form-grid__full">
                          <span>E-mail do admin</span>
                          <input
                            type="email"
                            autoComplete="username"
                            value={passwordChange.email}
                            onChange={(event) => setPasswordChange((current) => ({ ...current, email: event.target.value }))}
                          />
                        </label>
                      ) : (
                        <label className="ops-field ops-form-grid__full">
                          <span>Senha atual</span>
                          <input
                            type="password"
                            autoComplete="current-password"
                            value={passwordChange.currentPassword}
                            onChange={(event) => setPasswordChange((current) => ({ ...current, currentPassword: event.target.value }))}
                          />
                        </label>
                      )}
                      <label className="ops-field ops-form-grid__full">
                        <span>Nova senha</span>
                        <input
                          type="password"
                          autoComplete="new-password"
                          value={passwordChange.newPassword}
                          onChange={(event) => setPasswordChange((current) => ({ ...current, newPassword: event.target.value }))}
                        />
                      </label>
                      <button className="button button--secondary ops-button ops-form-grid__full" type="submit" disabled={isAuthenticating}>
                        <span>{isAuthenticating ? "Salvando..." : "Alterar senha"}</span>
                      </button>
                    </form>
                    {passwordFeedback.message ? (
                      <p className={`ops-feedback ops-feedback--${passwordFeedback.tone}`}>{passwordFeedback.message}</p>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>

            {viewMode === "leads" ? (
            <div className="ops-card">
              <div className="ops-card__header">
                <h2 className="ops-card__title">Novo lead</h2>
                <button
                  type="button"
                  className={`ops-toggle ${collapsedSections.newLead ? "ops-toggle--collapsed" : ""}`}
                  aria-label={collapsedSections.newLead ? "Expandir novo lead" : "Recolher novo lead"}
                  aria-expanded={!collapsedSections.newLead}
                  onClick={() => toggleSection("newLead")}
                >
                  <Icon name="arrow" width={14} height={14} />
                </button>
              </div>

              {!collapsedSections.newLead ? (
                <>
                  <p>Criação manual para operação interna, sem depender do formulário público.</p>

                  <div className="ops-form-grid">
                    <label className="ops-field">
                      <span>Nome</span>
                        <input
                          type="text"
                          autoComplete="name"
                          value={manualLead.name}
                          onChange={(event) => setManualLead((current) => ({ ...current, name: event.target.value }))}
                        />
                    </label>
                    <label className="ops-field">
                      <span>E-mail</span>
                        <input
                          type="email"
                          autoComplete="email"
                          value={manualLead.email}
                          onChange={(event) => setManualLead((current) => ({ ...current, email: event.target.value }))}
                        />
                    </label>
                    <label className="ops-field">
                      <span>Telefone</span>
                        <input
                          type="text"
                          autoComplete="tel"
                          value={manualLead.phone}
                          onChange={(event) => setManualLead((current) => ({ ...current, phone: event.target.value }))}
                        />
                    </label>
                    <label className="ops-field">
                      <span>Empresa</span>
                        <input
                          type="text"
                          autoComplete="organization"
                          value={manualLead.companyName}
                          onChange={(event) => setManualLead((current) => ({ ...current, companyName: event.target.value }))}
                        />
                    </label>
                    <label className="ops-field">
                      <span>Interesse</span>
                      <select
                        value={manualLead.serviceInterest}
                        onChange={(event) => setManualLead((current) => ({ ...current, serviceInterest: event.target.value }))}
                      >
                        {PROJECT_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="ops-field">
                      <span>Estágio inicial</span>
                      <select
                        value={manualLead.pipelineStage}
                        onChange={(event) => setManualLead((current) => ({ ...current, pipelineStage: event.target.value as ManualLeadFormState["pipelineStage"] }))}
                      >
                        {LEAD_STAGE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="ops-field ops-form-grid__full">
                      <span>Mensagem</span>
                      <textarea
                        rows={4}
                        value={manualLead.message}
                        onChange={(event) => setManualLead((current) => ({ ...current, message: event.target.value }))}
                      />
                    </label>
                    <label className="ops-field ops-form-grid__full">
                      <span>Notas internas</span>
                      <textarea
                        rows={4}
                        value={manualLead.qualificationNotes}
                        onChange={(event) => setManualLead((current) => ({ ...current, qualificationNotes: event.target.value }))}
                      />
                    </label>
                    <label className="ops-checkbox ops-form-grid__full">
                      <input
                        type="checkbox"
                        checked={manualLead.isTestLead}
                        onChange={(event) => setManualLead((current) => ({ ...current, isTestLead: event.target.checked }))}
                      />
                      <span>Criar como lead de teste limpável pelo painel</span>
                    </label>
                  </div>

                  <button className="button button--primary ops-button" type="button" onClick={handleCreateLead} disabled={isCreatingLead}>
                    <span>{isCreatingLead ? "Criando..." : "Criar lead manual"}</span>
                  </button>

                  {manualLeadFeedback.message ? (
                    <p className={`ops-feedback ops-feedback--${manualLeadFeedback.tone}`}>{manualLeadFeedback.message}</p>
                  ) : null}
                </>
              ) : null}
            </div>
            ) : null}

            <div className="ops-card">
              <div className="ops-card__header">
                <h2 className="ops-card__title">
                  {viewMode === "clients" ? "Clientes" : viewMode === "projects" ? "Projetos" : "Fila"}
                </h2>
                <div className="ops-card__header-actions">
                  <span className={`ops-chip ops-chip--${isConnected ? "success" : "neutral"}`}>
                    {isConnected ? "Sessão aberta" : "Sessão fechada"}
                  </span>
                  <button
                    type="button"
                    className={`ops-toggle ${collapsedSections.queue ? "ops-toggle--collapsed" : ""}`}
                    aria-label={collapsedSections.queue ? "Expandir fila" : "Recolher fila"}
                    aria-expanded={!collapsedSections.queue}
                    onClick={() => toggleSection("queue")}
                  >
                    <Icon name="arrow" width={14} height={14} />
                  </button>
                </div>
              </div>

              {!collapsedSections.queue ? (
                <>
                  <div className="ops-filter-grid">
                    {viewMode === "leads" ? (
                      <>
                        <label className="ops-field">
                          <span>Estágio</span>
                          <select
                            value={config.pipelineFilter}
                            onChange={(event) => setConfig((current) => ({ ...current, pipelineFilter: event.target.value as ConfigState["pipelineFilter"] }))}
                          >
                            {PIPELINE_FILTER_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="ops-checkbox">
                          <input
                            type="checkbox"
                            checked={config.onlyTestFilter}
                            onChange={(event) => setConfig((current) => ({ ...current, onlyTestFilter: event.target.checked }))}
                          />
                          <span>Somente testes</span>
                        </label>
                      </>
                    ) : viewMode === "clients" ? (
                      <>
                        <div className="ops-static-group">
                          <span className="micro-label">Clientes convertidos</span>
                          <p>Visão operacional de clientes e projetos já abertos.</p>
                        </div>
                        <label className="ops-checkbox">
                          <input
                            type="checkbox"
                            checked={config.onlyTestFilter}
                            onChange={(event) => setConfig((current) => ({ ...current, onlyTestFilter: event.target.checked }))}
                          />
                          <span>Somente testes</span>
                        </label>
                      </>
                    ) : (
                      <>
                        <label className="ops-field">
                          <span>Status do projeto</span>
                          <select
                            value={config.projectStatusFilter}
                            onChange={(event) => setConfig((current) => ({ ...current, projectStatusFilter: event.target.value as ConfigState["projectStatusFilter"] }))}
                          >
                            {PROJECT_STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="ops-field">
                          <span>Status do briefing</span>
                          <select
                            value={config.briefingStatusFilter}
                            onChange={(event) => setConfig((current) => ({ ...current, briefingStatusFilter: event.target.value as ConfigState["briefingStatusFilter"] }))}
                          >
                            {BRIEFING_STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="ops-checkbox">
                          <input
                            type="checkbox"
                            checked={config.onlyTestFilter}
                            onChange={(event) => setConfig((current) => ({ ...current, onlyTestFilter: event.target.checked }))}
                          />
                          <span>Somente testes</span>
                        </label>
                      </>
                    )}
                    <label className="ops-field ops-field--small">
                      <span>Limite</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={config.listLimit}
                        onChange={(event) => setConfig((current) => ({ ...current, listLimit: event.target.value }))}
                      />
                    </label>
                  </div>

                  <button className="button button--primary ops-button" type="button" onClick={viewMode === "clients" ? loadClients : viewMode === "projects" ? loadProjects : loadLeads} disabled={!isConnected}>
                    <span>
                      {viewMode === "clients"
                        ? clientListState === "loading" ? "Carregando..." : "Listar clientes"
                        : viewMode === "projects"
                          ? projectListState === "loading" ? "Carregando..." : "Listar projetos"
                        : listState === "loading" ? "Carregando..." : "Listar leads"}
                    </span>
                  </button>

                  {viewMode === "clients"
                    ? clientListFeedback ? <p className={`ops-feedback ops-feedback--${clientListState === "error" ? "error" : "muted"}`}>{clientListFeedback}</p> : null
                    : viewMode === "projects"
                      ? projectListFeedback ? <p className={`ops-feedback ops-feedback--${projectListState === "error" ? "error" : "muted"}`}>{projectListFeedback}</p> : null
                    : listFeedback ? <p className={`ops-feedback ops-feedback--${listState === "error" ? "error" : "muted"}`}>{listFeedback}</p> : null}

                  <div className="ops-list">
                    {viewMode === "clients"
                      ? clientItems.length === 0 ? <p className="ops-feedback ops-feedback--muted">Nenhum cliente encontrado com os filtros atuais.</p> : clientItems.map((item) => (
                        <button
                          key={item.publicId}
                          className={`ops-list__item ${selectedClientId === item.publicId ? "ops-list__item--active" : ""}`}
                          type="button"
                          onClick={() => setSelectedClientId(item.publicId)}
                        >
                          <strong>{item.companyName}</strong>
                          <span>{item.projectCount} projeto(s)</span>
                          <small title={item.primaryContactEmail || item.status}>{item.primaryContactEmail || item.status}</small>
                          {item.isTest ? <em className="ops-list__tag">teste</em> : null}
                        </button>
                      ))
                      : viewMode === "projects"
                        ? projectItems.length === 0 ? <p className="ops-feedback ops-feedback--muted">Nenhum projeto encontrado com os filtros atuais.</p> : projectItems.map((item) => (
                          <button
                            key={item.publicId}
                            className={`ops-list__item ${selectedProjectId === item.publicId ? "ops-list__item--active" : ""}`}
                            type="button"
                          onClick={() => setSelectedProjectId(item.publicId)}
                        >
                          <strong>{item.name}</strong>
                          <span>{item.projectType}</span>
                          <small title={item.clientCompanyName}>{item.clientCompanyName}</small>
                          {item.isTest ? <em className="ops-list__tag">teste</em> : null}
                        </button>
                        ))
                      : items.length === 0 ? <p className="ops-feedback ops-feedback--muted">Nenhum lead encontrado com os filtros atuais.</p> : items.map((item) => (
                        <button
                          key={item.publicId}
                          className={`ops-list__item ${selectedLeadId === item.publicId ? "ops-list__item--active" : ""}`}
                          type="button"
                          onClick={() => setSelectedLeadId(item.publicId)}
                        >
                          <strong>{item.companyName || item.name}</strong>
                          <span>{item.pipelineStage}</span>
                          <small title={item.source || "site"}>{item.source || "site"}</small>
                          {item.source === "internal_e2e_test" ? <em className="ops-list__tag">teste</em> : null}
                        </button>
                      ))}
                  </div>
                </>
              ) : null}
            </div>
          </aside>

          <div className="ops-panel">
            <div className="ops-card">
              <h2 className="ops-card__title">Detalhe</h2>
              {!isConnected ? <p>Abra a sessão para listar e operar {viewMode === "clients" ? "os clientes" : viewMode === "projects" ? "os projetos" : "os leads"}.</p> : null}
              {isConnected && viewMode === "leads" && !selectedLeadId ? <p>Liste os leads e selecione um item.</p> : null}
              {isConnected && viewMode === "clients" && !selectedClientId ? <p>Liste os clientes e selecione um item.</p> : null}
              {isConnected && viewMode === "projects" && !selectedProjectId ? <p>Liste os projetos e selecione um item.</p> : null}
              {viewMode === "leads" && detailState === "loading" ? <p>Carregando detalhe...</p> : null}
              {viewMode === "leads" && detailState === "error" ? <p className="ops-feedback ops-feedback--error">{detailFeedback}</p> : null}
              {viewMode === "clients" && clientDetailState === "loading" ? <p>Carregando detalhe...</p> : null}
              {viewMode === "clients" && clientDetailState === "error" ? <p className="ops-feedback ops-feedback--error">{clientDetailFeedback}</p> : null}
              {viewMode === "projects" && projectDetailState === "loading" ? <p>Carregando detalhe...</p> : null}
              {viewMode === "projects" && projectDetailState === "error" ? <p className="ops-feedback ops-feedback--error">{projectDetailFeedback}</p> : null}

              {viewMode === "leads" && details ? (
                <div className="ops-detail">
                  <div className="ops-detail__header">
                    <div>
                      <span className="micro-label">Lead</span>
                      <h3>{details.lead.companyName || details.lead.name}</h3>
                    </div>
                    <span className={`ops-chip ops-chip--${details.lead.converted ? "success" : "neutral"}`}>
                      {details.lead.pipelineStage}
                    </span>
                  </div>

                  <dl className="ops-meta">
                    <div>
                      <dt>Public ID</dt>
                      <dd>{details.lead.publicId}</dd>
                    </div>
                    <div>
                      <dt>Fonte</dt>
                      <dd>{details.lead.source || "site"}</dd>
                    </div>
                    <div>
                      <dt>E-mail</dt>
                      <dd>{details.lead.email}</dd>
                    </div>
                    <div>
                      <dt>Último contato</dt>
                      <dd>{formatDate(details.lead.lastContactAt)}</dd>
                    </div>
                  </dl>

                  <label className="ops-field">
                    <span>Notas de qualificação</span>
                    <textarea rows={5} value={qualificationNotes} onChange={(event) => setQualificationNotes(event.target.value)} />
                  </label>

                  <div className="ops-inline-fields">
                    <label className="ops-field">
                      <span>Atualizar estágio</span>
                      {details.lead.converted ? (
                        <div className="ops-static-value">{details.lead.pipelineStage}</div>
                      ) : (
                        <select value={updateStage} onChange={(event) => setUpdateStage(event.target.value as Exclude<PipelineStage, "won">)}>
                          {LEAD_STAGE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </label>

                    <label className="ops-field">
                      <span>Tipo do projeto</span>
                      <select value={projectType} onChange={(event) => setProjectType(event.target.value)}>
                        {PROJECT_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="ops-actions">
                    <button className="button button--secondary ops-button" type="button" onClick={handleUpdateLead} disabled={isSubmittingAction || !canUpdateLead}>
                      <span>{isSubmittingAction ? "Salvando..." : "Salvar qualificação"}</span>
                    </button>
                    <button className="button button--primary ops-button" type="button" onClick={handleConvertLead} disabled={isSubmittingAction || !canConvert}>
                      <span>{isSubmittingAction ? "Convertendo..." : "Converter lead"}</span>
                    </button>
                    <button className="button button--text ops-button" type="button" onClick={handleArchiveLead} disabled={isSubmittingAction || !canUpdateLead}>
                      <span>Arquivar</span>
                    </button>
                    {isTestLead ? (
                      <button className="button button--text ops-button ops-button--danger" type="button" onClick={handleCleanupTestLead} disabled={isSubmittingAction}>
                        <span>Limpar teste</span>
                      </button>
                    ) : null}
                  </div>

                  {actionFeedback.message ? (
                    <p className={`ops-feedback ops-feedback--${actionFeedback.tone}`}>{actionFeedback.message}</p>
                  ) : null}

                  <div className="ops-grid">
                    <div className="ops-subcard">
                      <span className="micro-label">Cliente</span>
                      <strong>{details.client?.companyName || "Ainda não existe"}</strong>
                      <small>{details.client?.publicId || "—"}</small>
                    </div>
                    <div className="ops-subcard">
                      <span className="micro-label">Projeto</span>
                      <strong>{details.project?.name || "Ainda não existe"}</strong>
                      <small>{details.project?.publicId || "—"}</small>
                    </div>
                    <div className="ops-subcard">
                      <span className="micro-label">Briefing</span>
                      <strong>{details.briefing?.title || "Ainda não existe"}</strong>
                      <small>{details.briefing?.publicId || "—"}</small>
                    </div>
                  </div>
                </div>
              ) : null}

              {viewMode === "clients" && clientDetails ? (
                <div className="ops-detail">
                  <div className="ops-detail__header">
                    <div>
                      <span className="micro-label">Cliente</span>
                      <h3>{clientDetails.client.companyName}</h3>
                    </div>
                    <div className="ops-detail__header-actions">
                      <span className="ops-chip ops-chip--success">{clientDetails.client.status}</span>
                      {clientDetails.client.isTest ? <span className="ops-chip ops-chip--warning">teste</span> : null}
                    </div>
                  </div>

                  <dl className="ops-meta">
                    <div>
                      <dt>Public ID</dt>
                      <dd>{clientDetails.client.publicId}</dd>
                    </div>
                    <div>
                      <dt>Segmento</dt>
                      <dd>{clientDetails.client.segment || "—"}</dd>
                    </div>
                    <div>
                      <dt>Contato principal</dt>
                      <dd>{clientDetails.client.primaryContactName || "—"}</dd>
                    </div>
                    <div>
                      <dt>E-mail principal</dt>
                      <dd>{clientDetails.client.primaryContactEmail || "—"}</dd>
                    </div>
                    <div>
                      <dt>Telefone</dt>
                      <dd>{clientDetails.client.primaryContactPhone || "—"}</dd>
                    </div>
                    <div>
                      <dt>Criado em</dt>
                      <dd>{formatDate(clientDetails.client.createdAt)}</dd>
                    </div>
                  </dl>

                  <div className="ops-grid ops-grid--two">
                    <div className="ops-subcard">
                      <span className="micro-label">Projeto base</span>
                      <strong>{clientDetails.client.projectLabel || "Ainda não definido"}</strong>
                      <small>{clientDetails.client.tradeName || "—"}</small>
                    </div>
                    <div className="ops-subcard">
                      <span className="micro-label">Contatos</span>
                      <strong>{clientDetails.contacts.length}</strong>
                      <small>{clientDetails.contacts.some((item) => item.isPrimary) ? "Com contato principal" : "Sem contato principal marcado"}</small>
                    </div>
                  </div>

                  <div className="ops-subsection">
                    <h3 className="ops-subsection__title">Projetos</h3>
                    {clientDetails.projects.length === 0 ? (
                      <p>Nenhum projeto encontrado para este cliente.</p>
                    ) : (
                      <div className="ops-list ops-list--embedded">
                        {clientDetails.projects.map((project) => (
                          <div key={project.publicId} className="ops-list__item">
                            <strong>{project.name}</strong>
                            <span>{project.projectType}</span>
                            <small>
                              {project.briefingPublicId
                                ? `Briefing ${project.briefingStatus || "vinculado"}`
                                : "Sem briefing vinculado"}
                            </small>
                            {project.isTest ? <em className="ops-list__tag">teste</em> : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {viewMode === "projects" && projectDetails ? (
                <div className="ops-detail">
                  <div className="ops-detail__header">
                    <div>
                      <span className="micro-label">Projeto</span>
                      <h3>{projectDetails.project.name}</h3>
                    </div>
                    <div className="ops-detail__header-actions">
                      <span className="ops-chip ops-chip--success">{projectDetails.project.status}</span>
                      {projectDetails.sourceLead?.isTest ? <span className="ops-chip ops-chip--warning">teste</span> : null}
                    </div>
                  </div>

                  <dl className="ops-meta">
                    <div>
                      <dt>Public ID</dt>
                      <dd>{projectDetails.project.publicId}</dd>
                    </div>
                    <div>
                      <dt>Tipo</dt>
                      <dd>{projectDetails.project.projectType}</dd>
                    </div>
                    <div>
                      <dt>Cliente</dt>
                      <dd>{projectDetails.client.companyName}</dd>
                    </div>
                    <div>
                      <dt>Lead de origem</dt>
                      <dd>{projectDetails.sourceLead?.publicId || "—"}{projectDetails.sourceLead?.source ? ` · ${projectDetails.sourceLead.source}` : ""}</dd>
                    </div>
                    <div>
                      <dt>Início</dt>
                      <dd>{formatDate(projectDetails.project.startedAt)}</dd>
                    </div>
                    <div>
                      <dt>Target launch</dt>
                      <dd>{formatDate(projectDetails.project.targetLaunchAt)}</dd>
                    </div>
                  </dl>

                  <div className="ops-grid ops-grid--two">
                    <div className="ops-subcard">
                      <span className="micro-label">Contato principal</span>
                      <strong>{projectDetails.client.primaryContactName || "Ainda não definido"}</strong>
                      <small>{projectDetails.client.primaryContactEmail || projectDetails.client.primaryContactPhone || "—"}</small>
                    </div>
                    <div className="ops-subcard">
                      <span className="micro-label">Briefing</span>
                      <strong>{projectDetails.briefing?.title || "Ainda não existe"}</strong>
                      <small>
                        {projectDetails.briefing?.status || "Sem briefing vinculado"}
                        {projectDetails.briefing?.lastSentAt ? ` · enviado em ${formatDate(projectDetails.briefing.lastSentAt)}` : ""}
                      </small>
                    </div>
                  </div>

                  <div className="ops-inline-fields">
                    <label className="ops-field">
                      <span>Status do projeto</span>
                      <select value={updateProjectStatus} onChange={(event) => setUpdateProjectStatus(event.target.value as typeof updateProjectStatus)}>
                        {PROJECT_STATUS_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    {projectDetails.briefing ? (
                      <label className="ops-field">
                        <span>Status do briefing</span>
                        <select value={updateBriefingStatus} onChange={(event) => setUpdateBriefingStatus(event.target.value as typeof updateBriefingStatus)}>
                          {BRIEFING_STATUS_OPTIONS.filter((option) => option.value !== "all").map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                  </div>

                  <div className="ops-actions">
                    <button className="button button--secondary ops-button" type="button" onClick={handleUpdateProjectGovernance} disabled={isSubmittingAction}>
                      <span>{isSubmittingAction ? "Salvando..." : "Salvar governança"}</span>
                    </button>
                    <button className="button button--primary ops-button" type="button" onClick={handleSendBriefingInvite} disabled={isSubmittingAction || !projectDetails.briefing}>
                      <span>{isSubmittingAction ? "Gerando..." : generatedBriefingLink ? "Gerar novo link de briefing" : "Gerar link de briefing"}</span>
                    </button>
                    <button className="button button--secondary ops-button" type="button" onClick={handleCopyBriefingLink} disabled={!generatedBriefingLink}>
                      <span>Copiar link</span>
                    </button>
                    {projectDetails.canCleanupTest ? (
                      <button className="button button--text ops-button ops-button--danger" type="button" onClick={handleCleanupProjectTest} disabled={isSubmittingAction}>
                        <span>Limpar cadeia de teste</span>
                      </button>
                    ) : null}
                  </div>

                  {actionFeedback.message ? (
                    <p className={`ops-feedback ops-feedback--${actionFeedback.tone}`}>{actionFeedback.message}</p>
                  ) : null}

                  {generatedBriefingLink ? (
                    <>
                      <label className="ops-field">
                        <span>Link pronto para enviar</span>
                        <input type="text" value={generatedBriefingLink} readOnly />
                      </label>

                      <div className="ops-grid ops-grid--two">
                        <div className="ops-subcard">
                          <span className="micro-label">Envio por e-mail</span>
                          <strong>{briefingEmail || "Sem e-mail principal no cliente"}</strong>
                          <small>{briefingEmailSubject || "—"}</small>
                        </div>
                        <div className="ops-subcard">
                          <span className="micro-label">Envio por WhatsApp</span>
                          <strong>{projectDetails?.client.primaryContactPhone || "Sem telefone principal no cliente"}</strong>
                          <small>{briefingWhatsapp ? "Link pronto para abrir no WhatsApp" : "Cadastre um telefone válido para abrir o envio"}</small>
                        </div>
                      </div>

                      <label className="ops-field">
                        <span>Mensagem pronta</span>
                        <textarea rows={6} value={briefingMessage} readOnly />
                      </label>

                      <div className="ops-actions">
                        <button className="button button--secondary ops-button" type="button" onClick={() => handleCopyText(briefingMessage, "Mensagem copiada.")} disabled={!briefingMessage}>
                          <span>Copiar mensagem</span>
                        </button>
                        <button className="button button--secondary ops-button" type="button" onClick={() => handleCopyText(briefingEmailSubject, "Assunto copiado.")} disabled={!briefingEmailSubject}>
                          <span>Copiar assunto</span>
                        </button>
                        <a className={`button button--primary ops-button ${briefingMailto ? "" : "ops-button--disabled"}`} href={briefingMailto || undefined} target="_blank" rel="noreferrer">
                          <span>Abrir e-mail</span>
                        </a>
                        <a className={`button button--secondary ops-button ${briefingWhatsappShare ? "" : "ops-button--disabled"}`} href={briefingWhatsappShare || undefined} target="_blank" rel="noreferrer">
                          <span>Abrir WhatsApp</span>
                        </a>
                      </div>
                    </>
                  ) : null}

                  <div className="ops-subsection">
                    <h3 className="ops-subsection__title">Resposta do briefing</h3>
                    {projectDetails.briefingResponse && projectDetails.briefingTemplate ? (
                      <div className="ops-briefing-response">
                        <p className="ops-briefing-response__meta">
                          Recebido em {formatDate(projectDetails.briefingResponse.submittedAt)}
                        </p>

                        {projectDetails.briefingTemplate.steps.map((step) => {
                          const visibleAnswers = step.fields.filter((field) => {
                            const answer = projectDetails.briefingResponse?.answers?.[field.key];
                            return Array.isArray(answer) ? answer.length > 0 : Boolean(answer);
                          });

                          if (visibleAnswers.length === 0) {
                            return null;
                          }

                          return (
                            <div key={step.key} className="ops-subcard">
                              <span className="micro-label">{step.title}</span>
                              <dl className="ops-briefing-response__list">
                                {visibleAnswers.map((field) => (
                                  <div key={field.key}>
                                    <dt>{field.label}</dt>
                                    <dd>{formatBriefingAnswer(projectDetails.briefingResponse?.answers?.[field.key], field.options)}</dd>
                                  </div>
                                ))}
                              </dl>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p>A resposta ainda não chegou. Quando o cliente enviar, ela aparece aqui.</p>
                    )}
                  </div>

                  <label className="ops-field">
                    <span>Resumo</span>
                    <div className="ops-static-value ops-static-value--multiline">
                      {projectDetails.project.summary || "Sem resumo operacional ainda."}
                    </div>
                  </label>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
