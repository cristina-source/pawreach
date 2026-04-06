import { getSession as auth } from "@/lib/get-session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EmptyState } from "@/components/ui/empty-state"
import { CampanhasTable } from "@/components/campanhas/campanhas-table"
import Link from "next/link"
import { Send } from "lucide-react"

export default async function CampanhasPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = session.user.id

  const [campanhas, statsGlobal] = await Promise.all([
    prisma.campaign.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { stats: true },
      take: 100,
    }),
    prisma.campaignStats.aggregate({
      where: { campaign: { userId, deletedAt: null } },
      _sum: { totalEnviados: true, totalAbertos: true, totalCliques: true },
    }),
  ])

  const totalEnviados = statsGlobal._sum.totalEnviados ?? 0
  const totalAbertos = statsGlobal._sum.totalAbertos ?? 0
  const totalCliques = statsGlobal._sum.totalCliques ?? 0
  const openRateMedio = totalEnviados > 0 ? Math.round((totalAbertos / totalEnviados) * 100) : 0
  const clickRateMedio = totalEnviados > 0 ? Math.round((totalCliques / totalEnviados) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Syne, sans-serif", color: "var(--app-text)" }}
          >
            Campanhas
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--app-text-muted)" }}>
            {campanhas.length} campanha{campanhas.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/campanhas/nova"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
          style={{ background: "#F97316", color: "#fff" }}
        >
          <Send size={15} />
          Nova campanha
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Enviados (total)", value: totalEnviados.toLocaleString("pt-PT"), color: "#3B82F6" },
          { label: "Open rate médio", value: `${openRateMedio}%`, color: "#10B981" },
          { label: "Click rate médio", value: `${clickRateMedio}%`, color: "#F97316" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-5 card-hover"
            style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: stat.color, fontFamily: "Syne, sans-serif" }}
            >
              {stat.value}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--app-text-muted)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      {campanhas.length === 0 ? (
        <EmptyState
          icon={<Send size={32} />}
          title="Sem campanhas"
          description="Cria a tua primeira campanha de email para começar a enviar mensagens aos teus contactos."
          action={{ label: "Nova campanha", href: "/campanhas/nova" }}
          secondaryAction={{ label: "Gerar email com IA", href: "/ia-copy" }}
        />
      ) : (
        <CampanhasTable
          campanhas={campanhas.map((c) => {
            const enviados = c.stats?.totalEnviados ?? 0
            const abertos = c.stats?.totalAbertos ?? 0
            const cliques = c.stats?.totalCliques ?? 0
            return {
              id: c.id,
              nome: c.nome,
              status: c.status,
              enviados,
              openRate: enviados > 0 ? Math.round((abertos / enviados) * 100) : 0,
              clickRate: enviados > 0 ? Math.round((cliques / enviados) * 100) : 0,
              enviadoEm: c.enviadoEm?.toISOString() ?? null,
              agendadoPara: c.agendadoPara?.toISOString() ?? null,
            }
          })}
        />
      )}
    </div>
  )
}
