"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import Link from "next/link"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useToast } from "@/components/ui/toast"

const TIPOS_NEGOCIO = [
  { value: "PET_SHOP", label: "Pet shop" },
  { value: "GROOMING", label: "Tosquia / Banho" },
  { value: "CLINICA_VET", label: "Clínica veterinária" },
  { value: "HOTEL_PETS", label: "Hotel de animais" },
  { value: "ADESTRADOR", label: "Adestrador" },
  { value: "PET_SITTER", label: "Pet sitter" },
  { value: "LOJA_ONLINE", label: "Loja online" },
  { value: "OUTROS", label: "Outros" },
]

const ESTADOS_LEAD = [
  { value: "FRIO", label: "Frio" },
  { value: "MORNO", label: "Morno" },
  { value: "QUENTE", label: "Quente" },
  { value: "CLIENTE", label: "Cliente" },
]

export default function NovoContactoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipoNegocio: "PET_SHOP",
    estadoLead: "FRIO",
    cidade: "",
    notas: "",
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.nome.trim() || !form.email.trim()) {
      setError("Nome e email são obrigatórios.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/contactos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Erro ao criar contacto.")
      }
      const result = await res.json()
      const id = result.data?.id ?? result.id
      toast("Contacto criado com sucesso.")
      router.push(`/contactos/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    background: "var(--app-surface-2)",
    border: "1.5px solid var(--app-border)",
    borderRadius: "var(--radius-md)",
    color: "var(--app-text)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color var(--t-fast)",
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--app-text-muted)",
    marginBottom: "6px",
  }

  return (
    <div style={{ maxWidth: "640px", width: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <Breadcrumb
          items={[
            { label: "Contactos", href: "/contactos" },
            { label: "Novo contacto" },
          ]}
        />
        <h1
          style={{
            fontFamily: "var(--font-syne), Syne, sans-serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--app-text)",
            margin: "12px 0 0",
            letterSpacing: "-0.02em",
          }}
        >
          Novo contacto
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--app-text-muted)" }}>
          Adiciona um contacto manualmente
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Secção: Informação básica */}
        <div
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--app-text-dim)",
              margin: "0 0 16px",
            }}
          >
            Informação básica
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "12px" }}>
            <div>
              <label htmlFor="novo-nome" style={labelStyle}>
                Nome <span style={{ color: "var(--app-orange)" }}>*</span>
              </label>
              <input
                id="novo-nome"
                style={inputStyle}
                placeholder="Ex: Loja PetMundo"
                value={form.nome}
                onChange={(e) => set("nome", e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="novo-email" style={labelStyle}>
                Email <span style={{ color: "var(--app-orange)" }}>*</span>
              </label>
              <input
                id="novo-email"
                style={inputStyle}
                type="email"
                placeholder="Ex: geral@petmundo.pt"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="novo-telefone" style={labelStyle}>Telefone</label>
              <input
                id="novo-telefone"
                style={inputStyle}
                placeholder="+351 900 000 000"
                value={form.telefone}
                onChange={(e) => set("telefone", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="novo-cidade" style={labelStyle}>Cidade</label>
              <input
                id="novo-cidade"
                style={inputStyle}
                placeholder="Ex: Lisboa"
                value={form.cidade}
                onChange={(e) => set("cidade", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Secção: Classificação */}
        <div
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--app-text-dim)",
              margin: "0 0 16px",
            }}
          >
            Classificação
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "12px" }}>
            <div>
              <label htmlFor="novo-tipo" style={labelStyle}>Tipo de negócio</label>
              <select
                id="novo-tipo"
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.tipoNegocio}
                onChange={(e) => set("tipoNegocio", e.target.value)}
              >
                {TIPOS_NEGOCIO.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="novo-estado" style={labelStyle}>Estado do lead</label>
              <select
                id="novo-estado"
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.estadoLead}
                onChange={(e) => set("estadoLead", e.target.value)}
              >
                {ESTADOS_LEAD.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Secção: Notas */}
        <div
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--app-text-dim)",
              margin: "0 0 16px",
            }}
          >
            Notas internas
          </p>
          <label htmlFor="novo-notas" style={{ ...labelStyle, display: "none" }}>Notas internas</label>
          <textarea
            id="novo-notas"
            style={{
              ...inputStyle,
              minHeight: "96px",
              resize: "vertical",
              fontFamily: "inherit",
            }}
            placeholder="Notas sobre este contacto (visíveis só para ti)"
            value={form.notas}
            onChange={(e) => set("notas", e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "var(--app-red-muted)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "var(--radius-md)",
              color: "var(--app-red)",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Link
            href="/contactos"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--app-text-muted)",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              background: loading ? "var(--app-text-dim)" : "var(--app-orange)",
              border: "none",
              borderRadius: "var(--radius-md)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background var(--t-fast)",
            }}
          >
            <Save size={14} />
            {loading ? "A guardar..." : "Guardar contacto"}
          </button>
        </div>
      </form>
    </div>
  )
}
