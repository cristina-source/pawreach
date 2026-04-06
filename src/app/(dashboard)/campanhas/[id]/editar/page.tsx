"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Save } from "lucide-react"
import Link from "next/link"
import { CampaignEditor } from "@/components/campanhas/campaign-editor"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useToast } from "@/components/ui/toast"

export default function EditarCampanhaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams<{ id: string }>()
  const id = params.id

  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("")
  const [form, setForm] = useState({
    nome: "",
    assunto: "",
    preheader: "",
    conteudoHtml: "",
  })

  useEffect(() => {
    fetch(`/api/campanhas/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const c = d.data
          setStatus(c.status)
          setForm({
            nome: c.nome ?? "",
            assunto: c.assunto ?? "",
            preheader: c.preheader ?? "",
            conteudoHtml: c.conteudoHtml ?? "",
          })
        }
      })
      .finally(() => setFetching(false))
  }, [id])

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.nome.trim() || !form.assunto.trim() || !form.conteudoHtml.trim()) {
      setError("Nome, assunto e conteúdo são obrigatórios.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/campanhas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Erro ao actualizar campanha.")
      }
      toast("Campanha actualizada com sucesso.")
      router.push(`/campanhas/${id}`)
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
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--app-text-muted)",
    marginBottom: "6px",
  }

  const sectionStyle: React.CSSProperties = {
    background: "var(--app-surface)",
    border: "1px solid var(--app-border)",
    borderRadius: "var(--radius-lg)",
    padding: "20px",
    marginBottom: "16px",
  }

  const sectionTitle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--app-text-dim)",
    margin: "0 0 16px",
  }

  if (fetching) {
    return (
      <div style={{ maxWidth: "760px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <div className="skeleton" style={{ width: "32px", height: "32px", borderRadius: "var(--radius-md)" }} />
          <div>
            <div className="skeleton" style={{ width: "180px", height: "22px", marginBottom: "6px" }} />
            <div className="skeleton" style={{ width: "120px", height: "14px" }} />
          </div>
        </div>
        <div style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)", borderRadius: "var(--radius-lg)", padding: "20px", marginBottom: "16px" }}>
          <div className="skeleton" style={{ width: "60px", height: "12px", marginBottom: "16px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <div className="skeleton" style={{ width: "90px", height: "13px", marginBottom: "6px" }} />
              <div className="skeleton" style={{ width: "100%", height: "38px" }} />
            </div>
            <div>
              <div className="skeleton" style={{ width: "110px", height: "13px", marginBottom: "6px" }} />
              <div className="skeleton" style={{ width: "100%", height: "38px" }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div className="skeleton" style={{ width: "160px", height: "13px", marginBottom: "6px" }} />
              <div className="skeleton" style={{ width: "100%", height: "38px" }} />
            </div>
          </div>
        </div>
        <div style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
          <div className="skeleton" style={{ width: "120px", height: "12px", marginBottom: "16px" }} />
          <div className="skeleton" style={{ width: "100%", height: "200px" }} />
        </div>
      </div>
    )
  }

  if (status && status !== "RASCUNHO") {
    return (
      <div style={{ maxWidth: "640px" }}>
        <div style={{ marginBottom: "24px" }}>
          <Breadcrumb
            items={[
              { label: "Campanhas", href: "/campanhas" },
              { label: form.nome || "Campanha", href: `/campanhas/${id}` },
              { label: "Editar" },
            ]}
          />
        </div>
        <div
          style={{
            padding: "16px 20px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "var(--radius-md)",
            color: "#EF4444",
            fontSize: "14px",
          }}
        >
          Só é possível editar campanhas em rascunho. Esta campanha já foi enviada ou está agendada.
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "760px", width: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <Breadcrumb
          items={[
            { label: "Campanhas", href: "/campanhas" },
            { label: form.nome || "Campanha", href: `/campanhas/${id}` },
            { label: "Editar" },
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
          Editar campanha
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Detalhes */}
        <div style={sectionStyle}>
          <p style={sectionTitle}>Detalhes</p>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "12px" }}>
            <div>
              <label htmlFor="edit-camp-nome" style={labelStyle}>
                Nome interno <span style={{ color: "var(--app-orange)" }}>*</span>
              </label>
              <input
                id="edit-camp-nome"
                style={inputStyle}
                value={form.nome}
                onChange={(e) => set("nome", e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="edit-camp-assunto" style={labelStyle}>
                Assunto do email <span style={{ color: "var(--app-orange)" }}>*</span>
              </label>
              <input
                id="edit-camp-assunto"
                style={inputStyle}
                value={form.assunto}
                onChange={(e) => set("assunto", e.target.value)}
                required
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="edit-camp-preheader" style={labelStyle}>Preheader (texto de pré-visualização)</label>
              <input
                id="edit-camp-preheader"
                style={inputStyle}
                placeholder="Texto que aparece após o assunto na caixa de entrada"
                value={form.preheader}
                onChange={(e) => set("preheader", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div style={sectionStyle}>
          <p style={sectionTitle}>Conteúdo do email</p>
          <CampaignEditor
            value={form.conteudoHtml}
            onChange={(html) => set("conteudoHtml", html)}
            assunto={form.assunto}
          />
        </div>

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

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Link
            href={`/campanhas/${id}`}
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
            }}
          >
            <Save size={14} />
            {loading ? "A guardar..." : "Guardar alterações"}
          </button>
        </div>
      </form>
    </div>
  )
}
