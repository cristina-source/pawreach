import { getSession as auth } from "@/lib/get-session"
import { redirect } from "next/navigation"
import { ImportCsv } from "@/components/contactos/import-csv"
import { Card } from "@/components/ui/card"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Info } from "lucide-react"

export default async function ImportarContactosPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Breadcrumb
          items={[
            { label: "Contactos", href: "/contactos" },
            { label: "Importar" },
          ]}
        />
        <h1
          className="text-2xl font-bold mt-3"
          style={{ fontFamily: "Syne, sans-serif", color: "var(--app-text)" }}
        >
          Importar contactos
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>
          Carrega até 500 contactos de uma vez via ficheiro CSV.
        </p>
      </div>

      {/* Format instructions */}
      <Card>
        <div className="flex gap-3">
          <Info size={16} className="shrink-0 mt-0.5" style={{ color: "#3B82F6" }} />
          <div className="space-y-2">
            <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>
              Formato esperado do CSV
            </p>
            <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
              O ficheiro deve ter cabeçalhos na primeira linha. As colunas obrigatórias são:{" "}
              <code className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--app-surface-2)", color: "var(--app-text)" }}>
                nome
              </code>
              ,{" "}
              <code className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--app-surface-2)", color: "var(--app-text)" }}>
                email
              </code>
              ,{" "}
              <code className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--app-surface-2)", color: "var(--app-text)" }}>
                tipoNegocio
              </code>
              .
            </p>
            <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
              Valores válidos para{" "}
              <code className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--app-surface-2)", color: "var(--app-text)" }}>
                tipoNegocio
              </code>
              :{" "}
              <span style={{ color: "var(--app-text)" }}>
                PET_SHOP, GROOMING, CLINICA_VET, HOTEL_PETS, ADESTRADOR, PET_SITTER, LOJA_ONLINE, OUTROS
              </span>
            </p>
            <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
              Colunas opcionais: telefone, cidade, regiao, estadoLead (FRIO, MORNO, QUENTE, CLIENTE), fonteContato, notas
            </p>
          </div>
        </div>
      </Card>

      {/* Import component */}
      <ImportCsv />
    </div>
  )
}
