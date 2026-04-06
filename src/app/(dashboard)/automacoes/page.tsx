import { getSession as auth } from "@/lib/get-session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AutomationStatusBadge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import Link from "next/link"
import { Zap, Users, Plus } from "lucide-react"
import { AutomationTemplatesModal } from "@/components/automacoes/automation-canvas"

export default async function AutomacoesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = session.user.id

  const automacoes = await prisma.automation.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: { where: { status: "ATIVA" } } } },
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Syne, sans-serif", color: "var(--app-text)" }}
          >
            Automações
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--app-text-muted)" }}>
            {automacoes.length === 1 ? "1 automação" : `${automacoes.length} automações`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AutomationTemplatesModal />
          <Link
            href="/automacoes/nova"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
            style={{ background: "#F97316", color: "#fff" }}
          >
            <Plus size={15} />
            Nova automação
          </Link>
        </div>
      </div>

      {/* Cards */}
      {automacoes.length === 0 ? (
        <EmptyState
          icon={<Zap size={28} />}
          title="Sem automações"
          description="Cria sequências de emails automáticas para nutrir os teus leads."
          action={{ label: "Nova automação", href: "/automacoes/nova" }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {automacoes.map((auto) => {
            const nos = Array.isArray(auto.nos) ? auto.nos : []
            return (
              <Link key={auto.id} href={`/automacoes/${auto.id}`}>
                <Card className="hover:border-orange-500/40 transition-colors cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="p-2.5 rounded-lg"
                      style={{ background: "rgba(249,115,22,0.1)", color: "#F97316" }}
                    >
                      <Zap size={18} />
                    </div>
                    <AutomationStatusBadge status={auto.status} />
                  </div>
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: "var(--app-text)", fontFamily: "Syne, sans-serif" }}
                  >
                    {auto.nome}
                  </h3>
                  {auto.descricao && (
                    <p className="text-xs mb-3" style={{ color: "var(--app-text-muted)" }}>
                      {auto.descricao}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t" style={{ borderColor: "var(--app-border)" }}>
                    <div className="flex items-center gap-1.5">
                      <Users size={13} style={{ color: "var(--app-text-muted)" }} />
                      <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                        {auto._count.enrollments} inscritos
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                      · {nos.length} nó{nos.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
