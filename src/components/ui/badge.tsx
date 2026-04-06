import { clsx } from "clsx"

interface BadgeProps {
  children: React.ReactNode
  variant?: "default" | "orange" | "emerald" | "amber" | "blue" | "purple" | "red" | "slate"
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-[#334155] text-[#94A3B8]",
    orange: "bg-orange-500/20 text-orange-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/20 text-amber-400",
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
    red: "bg-red-500/20 text-red-400",
    slate: "bg-slate-500/20 text-slate-400",
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// TipoNegocio badge
const TIPO_NEGOCIO_VARIANTS: Record<string, BadgeProps["variant"]> = {
  PET_SHOP: "blue",
  GROOMING: "purple",
  CLINICA_VET: "red",
  HOTEL_PETS: "emerald",
  ADESTRADOR: "amber",
  PET_SITTER: "orange",
  LOJA_ONLINE: "slate",
  OUTROS: "default",
}

const TIPO_NEGOCIO_LABELS: Record<string, string> = {
  PET_SHOP: "Pet Shop",
  GROOMING: "Grooming",
  CLINICA_VET: "Clínica Vet.",
  HOTEL_PETS: "Hotel Pets",
  ADESTRADOR: "Adestrador",
  PET_SITTER: "Pet Sitter",
  LOJA_ONLINE: "Loja Online",
  OUTROS: "Outros",
}

export function TipoNegocioBadge({ tipo }: { tipo: string }) {
  return (
    <Badge variant={TIPO_NEGOCIO_VARIANTS[tipo] ?? "default"}>
      {TIPO_NEGOCIO_LABELS[tipo] ?? tipo}
    </Badge>
  )
}

// EstadoLead badge
const ESTADO_LEAD_VARIANTS: Record<string, BadgeProps["variant"]> = {
  FRIO: "slate",
  MORNO: "amber",
  QUENTE: "orange",
  CLIENTE: "emerald",
}

const ESTADO_LEAD_LABELS: Record<string, string> = {
  FRIO: "Frio",
  MORNO: "Morno",
  QUENTE: "Quente",
  CLIENTE: "Cliente",
}

export function EstadoLeadBadge({ estado }: { estado: string }) {
  return (
    <Badge variant={ESTADO_LEAD_VARIANTS[estado] ?? "default"}>
      {ESTADO_LEAD_LABELS[estado] ?? estado}
    </Badge>
  )
}

// Campaign status badge
const CAMPAIGN_STATUS_VARIANTS: Record<string, BadgeProps["variant"]> = {
  RASCUNHO: "slate",
  AGENDADA: "amber",
  A_ENVIAR: "blue",
  ENVIADA: "emerald",
  CANCELADA: "red",
}

const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  RASCUNHO: "Rascunho",
  AGENDADA: "Agendada",
  A_ENVIAR: "A Enviar",
  ENVIADA: "Enviada",
  CANCELADA: "Cancelada",
}

export function CampaignStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={CAMPAIGN_STATUS_VARIANTS[status] ?? "default"}>
      {CAMPAIGN_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

// Automation status badge
const AUTOMATION_STATUS_VARIANTS: Record<string, BadgeProps["variant"]> = {
  ATIVA: "emerald",
  INATIVA: "slate",
  RASCUNHO: "amber",
}

const AUTOMATION_STATUS_LABELS: Record<string, string> = {
  ATIVA: "Ativa",
  INATIVA: "Inativa",
  RASCUNHO: "Rascunho",
}

export function AutomationStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={AUTOMATION_STATUS_VARIANTS[status] ?? "default"}>
      {AUTOMATION_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
