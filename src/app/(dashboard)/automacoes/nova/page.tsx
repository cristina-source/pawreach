"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Zap } from "lucide-react"
import Link from "next/link"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useToast } from "@/components/ui/toast"

const GATILHOS = [
  { value: "NOVO_CONTACTO", label: "Novo contacto adicionado" },
  { value: "LEAD_QUENTE", label: "Lead marcado como Quente" },
  { value: "CONVERTIDO_CLIENTE", label: "Lead convertido a Cliente" },
  { value: "SEM_INTERACAO_30D", label: "Sem interação há 30 dias" },
  { value: "MANUAL", label: "Início manual" },
]

const DELAYS = [
  { value: "0", label: "Imediatamente" },
  { value: "1440", label: "1 dia depois" },
  { value: "4320", label: "3 dias depois" },
  { value: "10080", label: "7 dias depois" },
  { value: "20160", label: "14 dias depois" },
  { value: "43200", label: "30 dias depois" },
]

export default function NovaAutomacaoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    gatilho: "NOVO_CONTACTO",
    delay: "0",
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.nome.trim()) {
      setError("O nome é obrigatório.")
      return
    }
    setLoading(true)
    try {
      const nos = [
        { tipo: "GATILHO", config: { evento: form.gatilho } },
        { tipo: "ESPERA", config: { minutos: Number(form.delay) } },
        { tipo: "ENVIAR_EMAIL", config: {} },
      ]
      const res = await fetch("/api/automacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: form.nome, descricao: form.descricao, nos }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Erro ao criar automação.")
      }
      const result = await res.json()
      const id = result.data?.id ?? result.id
      toast("Automação criada com sucesso.")
      router.push(`/automacoes/${id}`)
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

  return (
    <div style={{ maxWidth: "600px", width: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <Breadcrumb
          items={[
            { label: "Automações", href: "/automacoes" },
            { label: "Nova automação" },
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
          Nova automação
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--app-text-muted)" }}>
          Configura uma sequência automática de emails
        </p>
        </div>

      <form onSubmit={handleSubmit}>
        {/* Detalhes */}
        <div
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            marginBottom: "16px",
          }}
        >
          <p style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--app-text-dim)", margin: "0 0 16px" }}>
            Detalhes
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label htmlFor="auto-nome" style={labelStyle}>
                Nome <span style={{ color: "var(--app-orange)" }}>*</span>
              </label>
              <input
                id="auto-nome"
                style={inputStyle}
                placeholder="Ex: Boas-vindas a novos leads"
                value={form.nome}
                onChange={(e) => set("nome", e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="auto-descricao" style={labelStyle}>Descrição</label>
              <textarea
                id="auto-descricao"
                style={{ ...inputStyle, minHeight: "72px", resize: "vertical", fontFamily: "inherit" }}
                placeholder="Descreve o objectivo desta automação"
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Fluxo */}
        <div
          style={{
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <p style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--app-text-dim)", margin: "0 0 16px" }}>
            Fluxo básico
          </p>

          {/* Step 1 — Trigger */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--app-orange-muted)",
                border: "1px solid rgba(249,115,22,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "24px",
              }}
            >
              <Zap size={14} color="var(--app-orange)" />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="auto-gatilho" style={labelStyle}>Gatilho — quando começa?</label>
              <select
                id="auto-gatilho"
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.gatilho}
                onChange={(e) => set("gatilho", e.target.value)}
              >
                {GATILHOS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Connector */}
          <div style={{ marginLeft: "15px", width: "2px", height: "24px", background: "var(--app-border)", marginBottom: "0" }} />

          {/* Step 2 — Delay */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px", marginTop: "0" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--app-blue-muted)",
                border: "1px solid rgba(59,130,246,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "24px",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--app-blue)" }}>⏱</span>
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="auto-delay" style={labelStyle}>Aguardar — quando enviar o email?</label>
              <select
                id="auto-delay"
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.delay}
                onChange={(e) => set("delay", e.target.value)}
              >
                {DELAYS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Connector */}
          <div style={{ marginLeft: "15px", width: "2px", height: "24px", background: "var(--app-border)" }} />

          {/* Step 3 — Email */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--app-emerald-muted)",
                border: "1px solid rgba(16,185,129,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "13px" }}>✉</span>
            </div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--app-text-muted)" }}>
              Enviar email — conteúdo configurável após criar
            </p>
          </div>
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
            href="/automacoes"
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
            {loading ? "A criar..." : "Criar automação"}
          </button>
        </div>
      </form>
    </div>
  )
}
