import { getSession as auth } from "@/lib/get-session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EmptyState } from "@/components/ui/empty-state"
import { ContactFilters } from "@/components/contactos/contact-filters"
import { ContactosTable } from "@/components/contactos/contactos-table"
import Link from "next/link"
import { Users, Flame, Snowflake, UserCheck } from "lucide-react"
import { Suspense } from "react"

interface Props {
  searchParams: Promise<{ search?: string; tipo?: string; estado?: string; page?: string }>
}

export default async function ContactosPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const params = await searchParams
  const page = Number(params.page ?? 1)
  const take = 50
  const skip = (page - 1) * take
  const userId = session.user.id

  const where = {
    userId,
    deletedAt: null,
    ...(params.tipo ? { tipoNegocio: params.tipo as never } : {}),
    ...(params.estado ? { estadoLead: params.estado as never } : {}),
    ...(params.search
      ? {
          OR: [
            { nome: { contains: params.search, mode: "insensitive" as never } },
            { email: { contains: params.search, mode: "insensitive" as never } },
          ],
        }
      : {}),
  }

  const [contactos, total, statsRaw] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.contact.count({ where }),
    prisma.contact.groupBy({
      by: ["estadoLead"],
      where: { userId, deletedAt: null },
      _count: true,
    }),
  ])

  const statsByEstado = Object.fromEntries(
    statsRaw.map((s) => [s.estadoLead, s._count])
  )
  const totalContactos = statsRaw.reduce((sum, s) => sum + s._count, 0)
  const totalPages = Math.ceil(total / take)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Syne, sans-serif", color: "var(--app-text)" }}
          >
            Contactos
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--app-text-muted)" }}>
            {total} contacto{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/contactos/importar"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
            style={{
              background: "var(--app-surface)",
              borderColor: "var(--app-border)",
              color: "var(--app-text)",
            }}
          >
            Importar CSV
          </Link>
          <Link
            href="/contactos/novo"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ background: "#F97316", color: "#fff" }}
          >
            Novo contacto
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="contactos-stat-grid">
        {[
          { label: "Total", value: totalContactos, icon: <Users size={16} />, color: "#3B82F6" },
          { label: "Leads quentes", value: statsByEstado["QUENTE"] ?? 0, icon: <Flame size={16} />, color: "#F97316" },
          { label: "Leads frios", value: statsByEstado["FRIO"] ?? 0, icon: <Snowflake size={16} />, color: "#64748B" },
          { label: "Clientes", value: statsByEstado["CLIENTE"] ?? 0, icon: <UserCheck size={16} />, color: "#10B981" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4 flex items-center gap-3 card-hover"
            style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}
          >
            <div
              className="p-2 rounded-lg"
              style={{ background: `${stat.color}1a`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: stat.color, fontFamily: "Syne, sans-serif" }}>
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Suspense>
        <ContactFilters />
      </Suspense>

      {/* Table */}
      {contactos.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="Sem contactos"
          description="Adiciona o teu primeiro contacto manualmente ou importa uma lista via CSV."
          action={{ label: "Novo contacto", href: "/contactos/novo" }}
          secondaryAction={{ label: "Importar CSV", href: "/contactos/importar" }}
        />
      ) : (
        <>
          <ContactosTable
            contactos={contactos.map((c) => ({
              id: c.id,
              nome: c.nome,
              email: c.email,
              tipoNegocio: c.tipoNegocio,
              cidade: c.cidade,
              estadoLead: c.estadoLead,
              createdAt: c.createdAt.toISOString(),
            }))}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/contactos?page=${page - 1}${params.search ? `&search=${params.search}` : ""}${params.tipo ? `&tipo=${params.tipo}` : ""}${params.estado ? `&estado=${params.estado}` : ""}`}
                    className="px-3 py-1.5 text-sm rounded-lg border transition-colors"
                    style={{
                      background: "var(--app-surface)",
                      borderColor: "var(--app-border)",
                      color: "var(--app-text)",
                    }}
                  >
                    Anterior
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/contactos?page=${page + 1}${params.search ? `&search=${params.search}` : ""}${params.tipo ? `&tipo=${params.tipo}` : ""}${params.estado ? `&estado=${params.estado}` : ""}`}
                    className="px-3 py-1.5 text-sm rounded-lg border transition-colors"
                    style={{
                      background: "var(--app-surface)",
                      borderColor: "var(--app-border)",
                      color: "var(--app-text)",
                    }}
                  >
                    Próxima
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
