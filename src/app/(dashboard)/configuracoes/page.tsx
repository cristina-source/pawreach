"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Mail, Shield, BarChart2, ExternalLink } from "lucide-react"

const PLAN_LABELS: Record<string, string> = {
  FREE: "Gratuito",
  SOLO: "Solo",
  GROWTH: "Growth",
}

const PLAN_LIMITS: Record<string, { contactos: number | string; emailsMes: number | string; geracoesIa: number | string }> = {
  FREE: { contactos: 100, emailsMes: 500, geracoesIa: 0 },
  SOLO: { contactos: 2000, emailsMes: 10000, geracoesIa: 50 },
  GROWTH: { contactos: 10000, emailsMes: "Ilimitado", geracoesIa: "Ilimitado" },
}

const NAV_SECTIONS = [
  { id: "conta", label: "Conta", icon: User },
  { id: "remetente", label: "Remetente", icon: Mail },
  { id: "plano", label: "Plano", icon: BarChart2 },
  { id: "rgpd", label: "RGPD", icon: Shield },
]

export default function ConfiguracoesPage() {
  const [activeSection, setActiveSection] = useState("conta")

  const [profile, setProfile] = useState<{
    name: string
    email: string
    image: string | null
    plan: string
    aiGenerationsUsed: number
    contactCount: number
    emailsThisMonth: number
  } | null>(null)

  const [senderName, setSenderName] = useState("")
  const [replyTo, setReplyTo] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/configuracoes")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProfile(d.data)
          setSenderName(d.data.senderName ?? "")
          setReplyTo(d.data.replyTo ?? "")
        }
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await fetch("/api/configuracoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderName, replyTo }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    background: "var(--app-surface-2)",
    border: "1px solid var(--app-border)",
    color: "var(--app-text)",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  }

  const plan = profile?.plan ?? "FREE"
  const limits = PLAN_LIMITS[plan]

  function limitePercent(atual: number, limite: number | string): number {
    if (typeof limite === "string" || limite === 0) return 0
    return Math.min(Math.round((atual / limite) * 100), 100)
  }

  return (
    <div style={{ maxWidth: "900px", width: "100%" }}>
      <h1
        style={{
          fontFamily: "var(--font-syne), Syne, sans-serif",
          fontSize: "22px",
          fontWeight: 700,
          color: "var(--app-text)",
          margin: "0 0 24px",
          letterSpacing: "-0.02em",
        }}
      >
        Configurações
      </h1>

      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

        {/* ── Lateral nav ── */}
        <nav
          style={{
            width: "180px",
            flexShrink: 0,
            position: "sticky",
            top: "24px",
          }}
        >
          {NAV_SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "13.5px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--app-orange)" : "var(--app-text-muted)",
                  background: isActive ? "var(--app-orange-muted)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background var(--t-fast), color var(--t-fast)",
                  marginBottom: "2px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--app-surface-2)"
                    e.currentTarget.style.color = "var(--app-text)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.color = "var(--app-text-muted)"
                  }
                }}
              >
                <Icon size={14} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* ── Content ── */}
        <div style={{ flex: 1, minWidth: 0 }} className="fade-in-up">

          {/* Conta */}
          {activeSection === "conta" && (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <User size={16} style={{ color: "var(--app-orange)" }} />
                <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--app-text)", fontFamily: "var(--font-syne), Syne, sans-serif" }}>
                  Conta
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {profile?.image && (
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profile.image} alt="Avatar" style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover" }} />
                  </div>
                )}
                <div>
                  <label htmlFor="cfg-nome" style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--app-text-muted)", marginBottom: "6px" }}>
                    Nome
                  </label>
                  <input
                    id="cfg-nome"
                    type="text"
                    value={profile?.name ?? ""}
                    readOnly
                    style={{ ...inputStyle, opacity: 0.7, cursor: "not-allowed" }}
                  />
                </div>
                <div>
                  <label htmlFor="cfg-email" style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--app-text-muted)", marginBottom: "6px" }}>
                    Email (não editável)
                  </label>
                  <input
                    id="cfg-email"
                    type="email"
                    value={profile?.email ?? ""}
                    readOnly
                    style={{ ...inputStyle, opacity: 0.7, cursor: "not-allowed" }}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Remetente */}
          {activeSection === "remetente" && (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Mail size={16} style={{ color: "var(--app-orange)" }} />
                <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--app-text)", fontFamily: "var(--font-syne), Syne, sans-serif" }}>
                  Remetente
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label htmlFor="cfg-sender-name" style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--app-text-muted)", marginBottom: "6px" }}>
                    Nome do remetente
                  </label>
                  <input
                    id="cfg-sender-name"
                    type="text"
                    placeholder="Ex: PawReach"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="cfg-reply-to" style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--app-text-muted)", marginBottom: "6px" }}>
                    Email de reply-to
                  </label>
                  <input
                    id="cfg-reply-to"
                    type="email"
                    placeholder="respostas@meudominio.pt"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
                    Guardar
                  </Button>
                  {saved && (
                    <span style={{ fontSize: "13px", color: "var(--app-emerald)" }}>
                      Guardado com sucesso
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Plano */}
          {activeSection === "plano" && (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <BarChart2 size={16} style={{ color: "var(--app-orange)" }} />
                <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--app-text)", fontFamily: "var(--font-syne), Syne, sans-serif" }}>
                  Plano actual
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--app-orange)", fontFamily: "var(--font-syne), Syne, sans-serif" }}>
                    {PLAN_LABELS[plan] ?? plan}
                  </span>
                  {plan !== "GROWTH" && (
                    <a
                      href="/precos"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--app-orange)",
                        textDecoration: "none",
                        padding: "6px 12px",
                        background: "var(--app-orange-muted)",
                        border: "1px solid rgba(249,115,22,0.2)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      Fazer upgrade
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {[
                  { label: "Contactos", atual: profile?.contactCount ?? 0, limite: limits.contactos },
                  { label: "Emails este mês", atual: profile?.emailsThisMonth ?? 0, limite: limits.emailsMes },
                  { label: "Gerações IA", atual: profile?.aiGenerationsUsed ?? 0, limite: limits.geracoesIa },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: "var(--app-text-muted)" }}>{item.label}</span>
                      <span style={{ fontSize: "12px", color: "var(--app-text)" }}>
                        {item.atual.toLocaleString("pt-PT")} /{" "}
                        {typeof item.limite === "string"
                          ? item.limite
                          : item.limite === 0
                          ? "não incluído"
                          : item.limite.toLocaleString("pt-PT")}
                      </span>
                    </div>
                    {typeof item.limite === "number" && item.limite > 0 && (
                      <div style={{ width: "100%", height: "6px", borderRadius: "99px", overflow: "hidden", background: "var(--app-surface-2)" }}>
                        <div
                          style={{
                            height: "100%",
                            borderRadius: "99px",
                            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                            width: `${limitePercent(item.atual, item.limite)}%`,
                            background: limitePercent(item.atual, item.limite) > 85
                              ? "var(--app-red)"
                              : limitePercent(item.atual, item.limite) > 60
                              ? "var(--app-amber)"
                              : "var(--app-orange)",
                            boxShadow: limitePercent(item.atual, item.limite) > 85 ? "0 0 8px rgba(239,68,68,0.3)" : "none",
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* RGPD */}
          {activeSection === "rgpd" && (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Shield size={16} style={{ color: "var(--app-orange)" }} />
                <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--app-text)", fontFamily: "var(--font-syne), Syne, sans-serif" }}>
                  RGPD / Privacidade
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, color: "var(--app-text-muted)" }}>
                  A PawReach trata os dados dos teus contactos em conformidade com o RGPD. Os dados são
                  armazenados em servidores seguros na União Europeia e utilizados exclusivamente para as
                  funcionalidades da plataforma.
                </p>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, color: "var(--app-text-muted)" }}>
                  Como responsável pelo tratamento dos dados dos teus contactos, garante que obtiveste o
                  consentimento adequado antes de adicionar contactos à plataforma.
                </p>
                <a
                  href="/politica-privacidade"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--app-orange)", textDecoration: "none" }}
                >
                  Política de privacidade
                  <ExternalLink size={13} />
                </a>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}
