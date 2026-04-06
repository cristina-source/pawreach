"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Save } from "lucide-react"
import Link from "next/link"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useToast } from "@/components/ui/toast"

export default function EditarTemplatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams<{ id: string }>()
  const id = params.id

  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome: "",
    tipo: "",
    tom: "",
    objetivo: "",
    assunto: "",
    preheader: "",
    corpo: "",
    cta: "",
    ps: "",
  })

  useEffect(() => {
    fetch(`/api/templates/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const t = d.data
          setForm({
            nome: t.nome ?? "",
            tipo: t.tipo ?? "",
            tom: t.tom ?? "",
            objetivo: t.objetivo ?? "",
            assunto: t.assunto ?? "",
            preheader: t.preheader ?? "",
            corpo: t.corpo ?? "",
            cta: t.cta ?? "",
            ps: t.ps ?? "",
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

    if (!form.nome.trim() || !form.assunto.trim() || !form.corpo.trim()) {
      setError("Nome, assunto e corpo são obrigatórios.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          tipo: form.tipo,
          tom: form.tom,
          objetivo: form.objetivo,
          assunto: form.assunto,
          preheader: form.preheader || null,
          corpo: form.corpo,
          cta: form.cta || null,
          ps: form.ps || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Erro ao actualizar template.")
      }
      toast("Template guardado com sucesso.")
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
        <div style={{ marginBottom: "28px" }}>
          <div className="skeleton" style={{ width: "200px", height: "14px", marginBottom: "12px" }} />
          <div className="skeleton" style={{ width: "220px", height: "24px" }} />
        </div>
        <div style={sectionStyle}>
          <div className="skeleton" style={{ width: "80px", height: "12px", marginBottom: "16px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="skeleton" style={{ width: "90px", height: "13px", marginBottom: "6px" }} />
                <div className="skeleton" style={{ width: "100%", height: "38px" }} />
              </div>
            ))}
          </div>
        </div>
        <div style={sectionStyle}>
          <div className="skeleton" style={{ width: "120px", height: "12px", marginBottom: "16px" }} />
          <div className="skeleton" style={{ width: "100%", height: "38px", marginBottom: "12px" }} />
          <div className="skeleton" style={{ width: "100%", height: "38px", marginBottom: "12px" }} />
          <div className="skeleton" style={{ width: "100%", height: "200px" }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "760px", width: "100%" }}>
      {/* Breadcrumb + Header */}
      <div style={{ marginBottom: "28px" }}>
        <Breadcrumb
          items={[
            { label: "Templates", href: "/templates" },
            { label: form.nome || "Template" },
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
          Editar template
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Metadata */}
        <div style={sectionStyle}>
          <p style={sectionTitle}>Detalhes</p>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "12px" }}>
            <div>
              <label htmlFor="tpl-nome" style={labelStyle}>
                Nome <span style={{ color: "var(--app-orange)" }}>*</span>
              </label>
              <input
                id="tpl-nome"
                style={inputStyle}
                value={form.nome}
                onChange={(e) => set("nome", e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="tpl-tipo" style={labelStyle}>Tipo</label>
              <input
                id="tpl-tipo"
                style={inputStyle}
                value={form.tipo}
                onChange={(e) => set("tipo", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="tpl-tom" style={labelStyle}>Tom</label>
              <input
                id="tpl-tom"
                style={inputStyle}
                value={form.tom}
                onChange={(e) => set("tom", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="tpl-objetivo" style={labelStyle}>Objectivo</label>
              <input
                id="tpl-objetivo"
                style={inputStyle}
                value={form.objetivo}
                onChange={(e) => set("objetivo", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Email content */}
        <div style={sectionStyle}>
          <p style={sectionTitle}>Conteúdo do email</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label htmlFor="tpl-assunto" style={labelStyle}>
                Assunto <span style={{ color: "var(--app-orange)" }}>*</span>
              </label>
              <input
                id="tpl-assunto"
                style={inputStyle}
                value={form.assunto}
                onChange={(e) => set("assunto", e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="tpl-preheader" style={labelStyle}>Preheader</label>
              <input
                id="tpl-preheader"
                style={inputStyle}
                placeholder="Texto de pré-visualização na caixa de entrada"
                value={form.preheader}
                onChange={(e) => set("preheader", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="tpl-corpo" style={labelStyle}>
                Corpo do email <span style={{ color: "var(--app-orange)" }}>*</span>
              </label>
              <textarea
                id="tpl-corpo"
                style={{ ...inputStyle, minHeight: "240px", resize: "vertical", lineHeight: "1.6" }}
                value={form.corpo}
                onChange={(e) => set("corpo", e.target.value)}
                required
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "12px" }}>
              <div>
                <label htmlFor="tpl-cta" style={labelStyle}>CTA (call-to-action)</label>
                <input
                  id="tpl-cta"
                  style={inputStyle}
                  placeholder="Ex: Agendar consulta"
                  value={form.cta}
                  onChange={(e) => set("cta", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="tpl-ps" style={labelStyle}>P.S.</label>
                <input
                  id="tpl-ps"
                  style={inputStyle}
                  placeholder="Nota final opcional"
                  value={form.ps}
                  onChange={(e) => set("ps", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "var(--radius-md)",
              color: "#EF4444",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Link
            href="/templates"
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
