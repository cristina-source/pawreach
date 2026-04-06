import { getSession as auth } from "@/lib/get-session"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CampaignStatusBadge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { DashboardChart } from "@/components/campanhas/campaign-stats"

interface Props {
  params: Promise<{ id: string }>
}

export default async function CampanhaDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params

  const campanha = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: {
      stats: true,
      emailLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { contact: { select: { nome: true, email: true } } },
      },
    },
  })

  if (!campanha) notFound()

  const stats = campanha.stats
  const enviados = stats?.totalEnviados ?? 0
  const abertos = stats?.totalAbertos ?? 0
  const cliques = stats?.totalCliques ?? 0
  const bounces = stats?.totalBounces ?? 0
  const unsubs = stats?.totalUnsubs ?? 0

  const openRate = enviados > 0 ? Math.round((abertos / enviados) * 100) : 0
  const clickRate = enviados > 0 ? Math.round((cliques / enviados) * 100) : 0

  // Build mock chart data — group email logs by day
  const chartMap: Record<string, { enviados: number; abertos: number }> = {}
  for (const log of campanha.emailLogs) {
    const key = format(log.createdAt, "dd/MM", { locale: pt })
    if (!chartMap[key]) chartMap[key] = { enviados: 0, abertos: 0 }
    chartMap[key].enviados++
    if (log.aberto) chartMap[key].abertos++
  }
  const chartData = Object.entries(chartMap).map(([date, v]) => ({
    date,
    enviados: v.enviados,
    abertos: v.abertos,
  }))

  const EMAIL_STATUS_LABELS: Record<string, string> = {
    ENVIADO: "Enviado",
    ENTREGUE: "Entregue",
    ABERTO: "Aberto",
    CLICADO: "Clicado",
    BOUNCE: "Bounce",
    SPAM: "Spam",
    FALHOU: "Falhou",
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: "Campanhas", href: "/campanhas" },
        { label: campanha.nome },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Syne, sans-serif", color: "var(--app-text)" }}
          >
            {campanha.nome}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <CampaignStatusBadge status={campanha.status} />
            {campanha.enviadoEm && (
              <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                Enviada em {format(campanha.enviadoEm, "dd MMM yyyy HH:mm", { locale: pt })}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {campanha.status === "RASCUNHO" && (
            <Link
              href={`/campanhas/${campanha.id}/editar`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border"
              style={{
                background: "var(--app-surface)",
                borderColor: "var(--app-border)",
                color: "var(--app-text)",
              }}
            >
              Editar
            </Link>
          )}
          <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
            Assunto: <span style={{ color: "var(--app-text)" }}>{campanha.assunto}</span>
          </p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: "Enviados", value: enviados.toLocaleString("pt-PT"), color: "#3B82F6", sub: "" },
          { label: "Abertos", value: abertos.toLocaleString("pt-PT"), color: "#10B981", sub: `${openRate}%` },
          { label: "Cliques", value: cliques.toLocaleString("pt-PT"), color: "#F97316", sub: `${clickRate}%` },
          { label: "Bounces", value: bounces.toLocaleString("pt-PT"), color: "#EF4444", sub: "" },
          { label: "Unsubs", value: unsubs.toLocaleString("pt-PT"), color: "#8B5CF6", sub: "" },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl p-4"
            style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}
          >
            <p className="text-2xl font-bold" style={{ color: m.color, fontFamily: "Syne, sans-serif" }}>
              {m.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)" }}>
              {m.label}
              {m.sub && (
                <span className="ml-1 font-medium" style={{ color: m.color }}>
                  ({m.sub})
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <DashboardChart data={chartData} />
      )}

      {/* Recipients list */}
      <Card>
        <h2
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--app-text)", fontFamily: "Syne, sans-serif" }}
        >
          Últimos destinatários
        </h2>
        {campanha.emailLogs.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
            Nenhum email enviado nesta campanha.
          </p>
        ) : (
          <div className="space-y-0">
            {campanha.emailLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: "var(--app-border)" }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>
                    {log.contact.nome}
                  </p>
                  <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                    {log.contact.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: log.aberto ? "rgba(16,185,129,0.12)" : "var(--app-surface-2)",
                      color: log.aberto ? "#10B981" : "var(--app-text-muted)",
                    }}
                  >
                    {EMAIL_STATUS_LABELS[log.status] ?? log.status}
                  </span>
                  <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                    {format(log.createdAt, "dd/MM HH:mm", { locale: pt })}
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
