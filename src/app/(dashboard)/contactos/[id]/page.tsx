import { getSession as auth } from "@/lib/get-session"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TipoNegocioBadge, EstadoLeadBadge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Mail, Phone, MapPin, Tag, FileText } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { DeleteContactButton } from "@/components/contactos/delete-contact-button"
import { format } from "date-fns"
import { pt } from "date-fns/locale"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ContactoDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params

  const contacto = await prisma.contact.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: {
      emailLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { campaign: { select: { nome: true } } },
      },
    },
  })

  if (!contacto) notFound()

  const EMAIL_STATUS_LABELS: Record<string, string> = {
    ENVIADO: "Enviado",
    ENTREGUE: "Entregue",
    ABERTO: "Aberto",
    CLICADO: "Clicado",
    BOUNCE: "Bounce",
    SPAM: "Spam",
    FALHOU: "Falhou",
  }

  const EMAIL_STATUS_COLORS: Record<string, string> = {
    ENVIADO: "#64748B",
    ENTREGUE: "#3B82F6",
    ABERTO: "#10B981",
    CLICADO: "#F97316",
    BOUNCE: "#EF4444",
    SPAM: "#EF4444",
    FALHOU: "#EF4444",
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Breadcrumb items={[
        { label: "Contactos", href: "/contactos" },
        { label: contacto.nome },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Syne, sans-serif", color: "var(--app-text)" }}
          >
            {contacto.nome}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <TipoNegocioBadge tipo={contacto.tipoNegocio} />
            <EstadoLeadBadge estado={contacto.estadoLead} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/contactos/${contacto.id}/editar`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border"
            style={{
              background: "var(--app-surface)",
              borderColor: "var(--app-border)",
              color: "var(--app-text)",
            }}
          >
            Editar
          </Link>
          <DeleteContactButton contactId={contacto.id} contactName={contacto.nome} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informação geral */}
        <Card>
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--app-text)", fontFamily: "Syne, sans-serif" }}
          >
            Informação Geral
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={15} style={{ color: "var(--app-text-muted)" }} />
              <span className="text-sm" style={{ color: "var(--app-text)" }}>
                {contacto.email}
              </span>
            </div>
            {contacto.telefone && (
              <div className="flex items-center gap-3">
                <Phone size={15} style={{ color: "var(--app-text-muted)" }} />
                <span className="text-sm" style={{ color: "var(--app-text)" }}>
                  {contacto.telefone}
                </span>
              </div>
            )}
            {(contacto.cidade || contacto.regiao) && (
              <div className="flex items-center gap-3">
                <MapPin size={15} style={{ color: "var(--app-text-muted)" }} />
                <span className="text-sm" style={{ color: "var(--app-text)" }}>
                  {[contacto.cidade, contacto.regiao].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
            {contacto.fonteContato && (
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                  Fonte:
                </span>
                <span className="text-sm" style={{ color: "var(--app-text)" }}>
                  {contacto.fonteContato}
                </span>
              </div>
            )}
            <div className="pt-2 border-t" style={{ borderColor: "var(--app-border)" }}>
              <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                Criado em {format(contacto.createdAt, "dd MMMM yyyy", { locale: pt })}
              </p>
            </div>
          </div>
        </Card>

        {/* Tags e notas */}
        <Card>
          <div className="space-y-4">
            {contacto.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={14} style={{ color: "var(--app-text-muted)" }} />
                  <h3 className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>
                    Tags
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {contacto.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: "var(--app-surface-2)", color: "var(--app-text-muted)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {contacto.notas && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={14} style={{ color: "var(--app-text-muted)" }} />
                  <h3 className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>
                    Notas
                  </h3>
                </div>
                <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
                  {contacto.notas}
                </p>
              </div>
            )}
            {contacto.tags.length === 0 && !contacto.notas && (
              <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
                Sem tags ou notas.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Histórico de emails */}
      <Card>
        <h2
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--app-text)", fontFamily: "Syne, sans-serif" }}
        >
          Histórico de emails
        </h2>
        {contacto.emailLogs.length === 0 ? (
          <div style={{ padding: "24px 0", textAlign: "center" }}>
            <p className="text-sm font-medium" style={{ color: "var(--app-text-muted)", marginBottom: "6px" }}>
              Nenhum email enviado ainda
            </p>
            <p className="text-xs" style={{ color: "var(--app-text-dim)" }}>
              Cria uma campanha para começar a comunicar com este contacto.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {contacto.emailLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: "var(--app-border)" }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>
                    {log.assunto}
                  </p>
                  {log.campaign && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)" }}>
                      Campanha: {log.campaign.nome}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-medium"
                    style={{ color: EMAIL_STATUS_COLORS[log.status] ?? "#64748B" }}
                  >
                    {EMAIL_STATUS_LABELS[log.status] ?? log.status}
                  </span>
                  <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                    {format(log.createdAt, "dd/MM/yyyy", { locale: pt })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
