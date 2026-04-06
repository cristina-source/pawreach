import { getSession as auth } from "@/lib/get-session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { DeleteTemplateButton } from "@/components/templates/delete-template-button"
import Link from "next/link"
import { Star, FileText, Wand2, Copy } from "lucide-react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"

interface Props {
  searchParams: Promise<{ tipo?: string; tom?: string }>
}

export default async function TemplatesPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const params = await searchParams
  const userId = session.user.id

  const templates = await prisma.aiTemplate.findMany({
    where: {
      userId,
      deletedAt: null,
      ...(params.tipo ? { tipo: params.tipo } : {}),
      ...(params.tom ? { tom: params.tom } : {}),
    },
    orderBy: { geradoEm: "desc" },
  })

  const tipos = [...new Set(templates.map((t) => t.tipo))].sort()
  const tons = [...new Set(templates.map((t) => t.tom))].sort()

  const selectStyle = {
    background: "var(--app-surface-2)",
    border: "1px solid var(--app-border)",
    color: "var(--app-text)",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "14px",
    outline: "none",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Syne, sans-serif", color: "var(--app-text)" }}
          >
            Templates
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--app-text-muted)" }}>
            {templates.length} template{templates.length !== 1 ? "s" : ""} guardado{templates.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/ia-copy"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
          style={{ background: "#F97316", color: "#fff" }}
        >
          <Wand2 size={15} />
          Gerar com IA
        </Link>
      </div>

      {/* Filters */}
      {(tipos.length > 0 || tons.length > 0) && (
        <div className="flex flex-wrap items-center gap-3">
          <form method="GET" className="flex items-center gap-3 flex-wrap">
            {tipos.length > 0 && (
              <select name="tipo" defaultValue={params.tipo ?? ""} style={selectStyle} onChange={(e) => {
                e.currentTarget.form?.requestSubmit()
              }}>
                <option value="">Todos os tipos</option>
                {tipos.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
            {tons.length > 0 && (
              <select name="tom" defaultValue={params.tom ?? ""} style={selectStyle} onChange={(e) => {
                e.currentTarget.form?.requestSubmit()
              }}>
                <option value="">Todos os tons</option>
                {tons.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </form>
        </div>
      )}

      {/* Grid */}
      {templates.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title="Sem templates"
          description="Ainda não tens templates. Gera o primeiro com o assistente IA."
          action={{ label: "Gerar com IA", href: "/ia-copy" }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className="flex flex-col template-card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3
                    className="font-semibold text-sm"
                    style={{ color: "var(--app-text)", fontFamily: "Syne, sans-serif" }}
                  >
                    {t.nome}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)" }}>
                    {t.tipo}
                  </p>
                </div>
                {t.rating !== null && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < (t.rating ?? 0) ? "#F59E0B" : "none"}
                        style={{ color: i < (t.rating ?? 0) ? "#F59E0B" : "var(--app-text-muted)" }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <p className="text-xs flex-1 mb-3 line-clamp-2" style={{ color: "var(--app-text-muted)" }}>
                {t.assunto}
              </p>

              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: "var(--app-surface-2)", color: "var(--app-text-muted)" }}
                >
                  {t.tom}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: "var(--app-surface-2)", color: "var(--app-text-muted)" }}
                >
                  {t.objetivo}
                </span>
              </div>

              <div
                className="flex items-center justify-between pt-3 border-t"
                style={{ borderColor: "var(--app-border)" }}
              >
                <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                  {format(t.geradoEm, "dd/MM/yyyy", { locale: pt })}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/templates/${t.id}/editar`}
                    className="text-xs hover:underline"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    Editar
                  </Link>
                  <form
                    action={async () => {
                      "use server"
                      const { auth: getAuth } = await import("@/lib/auth")
                      const { prisma: db } = await import("@/lib/prisma")
                      const { revalidatePath: rev } = await import("next/cache")
                      const sess = await getAuth()
                      if (!sess?.user) return
                      const original = await db.aiTemplate.findFirst({
                        where: { id: t.id, userId: sess.user.id, deletedAt: null },
                      })
                      if (!original) return
                      await db.aiTemplate.create({
                        data: {
                          userId: sess.user.id,
                          nome: `${original.nome} (cópia)`,
                          tipo: original.tipo,
                          tom: original.tom,
                          objetivo: original.objetivo,
                          assunto: original.assunto,
                          preheader: original.preheader,
                          corpo: original.corpo,
                          cta: original.cta,
                          ps: original.ps,
                        },
                      })
                      rev("/templates")
                    }}
                  >
                    <button
                      type="submit"
                      className="text-xs hover:underline"
                      title="Duplicar template"
                      style={{ color: "var(--app-text-muted)", display: "inline-flex", alignItems: "center", gap: "3px", background: "none", border: "none", cursor: "pointer" }}
                    >
                      <Copy size={11} />
                      Duplicar
                    </button>
                  </form>
                  <Link
                    href={`/campanhas/nova?templateId=${t.id}`}
                    className="text-xs hover:underline"
                    style={{ color: "#F97316" }}
                  >
                    Usar
                  </Link>
                  <DeleteTemplateButton templateId={t.id} templateName={t.nome} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
