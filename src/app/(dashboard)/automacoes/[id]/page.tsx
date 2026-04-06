import { getSession as auth } from "@/lib/get-session"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AutomationStatusBadge } from "@/components/ui/badge"
import { AutomationCanvas } from "@/components/automacoes/automation-canvas"
import { Users, CheckCircle2 } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AutomacaoDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params

  const automacao = await prisma.automation.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: {
      enrollments: {
        select: { status: true },
      },
    },
  })

  if (!automacao) notFound()

  const totalInscritos = automacao.enrollments.length
  const totalConcluidos = automacao.enrollments.filter((e) => e.status === "CONCLUIDA").length
  const taxaConclusao =
    totalInscritos > 0 ? Math.round((totalConcluidos / totalInscritos) * 100) : 0

  const nos = Array.isArray(automacao.nos)
    ? (automacao.nos as Array<{ tipo: string; titulo: string; subtitulo?: string }>)
    : []

  return (
    <div className="space-y-6 max-w-3xl">
      <Breadcrumb items={[
        { label: "Automações", href: "/automacoes" },
        { label: automacao.nome },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Syne, sans-serif", color: "var(--app-text)" }}
          >
            {automacao.nome}
          </h1>
          {automacao.descricao && (
            <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>
              {automacao.descricao}
            </p>
          )}
          <div className="mt-2">
            <AutomationStatusBadge status={automacao.status} />
          </div>
        </div>
        <form
          action={async () => {
            "use server"
            const { auth: getAuth } = await import("@/lib/auth")
            const { prisma: db } = await import("@/lib/prisma")
            const sess = await getAuth()
            if (!sess?.user) return
            const auto = await db.automation.findFirst({
              where: { id, userId: sess.user.id },
              select: { status: true },
            })
            if (!auto) return
            await db.automation.update({
              where: { id },
              data: { status: auto.status === "ATIVA" ? "INATIVA" : "ATIVA" },
            })
          }}
        >
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
            style={{
              background: automacao.status === "ATIVA" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
              borderColor: automacao.status === "ATIVA" ? "#EF4444" : "#10B981",
              color: automacao.status === "ATIVA" ? "#EF4444" : "#10B981",
            }}
          >
            {automacao.status === "ATIVA" ? "Desactivar" : "Activar"}
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}
        >
          <div
            className="p-2 rounded-lg"
            style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
          >
            <Users size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: "#3B82F6", fontFamily: "Syne, sans-serif" }}>
              {totalInscritos}
            </p>
            <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
              Contactos inscritos
            </p>
          </div>
        </div>
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}
        >
          <div
            className="p-2 rounded-lg"
            style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}
          >
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: "#10B981", fontFamily: "Syne, sans-serif" }}>
              {taxaConclusao}%
            </p>
            <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
              Taxa de conclusão
            </p>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <AutomationCanvas nos={nos} automacaoId={id} />
    </div>
  )
}
