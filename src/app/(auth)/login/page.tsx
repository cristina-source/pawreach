"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Mail, ArrowRight, CheckCircle2, BarChart3, Zap, Users } from "lucide-react"

const benefits = [
  {
    icon: Users,
    title: "Base de contactos organizada",
    desc: "Importa, segmenta e filtra os teus leads pet em segundos.",
  },
  {
    icon: Zap,
    title: "Automações que vendem por ti",
    desc: "Sequências drip configuradas para converter grooming, clínicas e pet shops.",
  },
  {
    icon: BarChart3,
    title: "Copy IA especializada em pet",
    desc: "Gera emails persuasivos com contexto real do mercado pet em PT.",
  },
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      })
      if (res?.error) {
        setError("Email não autorizado. Contacta o administrador.")
      } else {
        setSent(true)
      }
    } catch {
      setError("Ocorreu um erro. Tenta novamente.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>

      {/* ── LEFT: Branding & Value Prop ── */}
      <div
        style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 56px",
          maxWidth: "560px",
        }}
        className="hidden lg:flex"
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #F97316 0%, #F59E0B 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
            }}
          >
            🐾
          </div>
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "26px",
              fontWeight: 800,
              color: "var(--app-text)",
              letterSpacing: "-0.5px",
            }}
          >
            Paw<span style={{ color: "var(--app-orange)" }}>Reach</span>
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "38px",
            fontWeight: 800,
            color: "var(--app-text)",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            marginBottom: "16px",
          }}
        >
          Email marketing<br />
          <span className="gradient-text">feito para o mercado pet.</span>
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "var(--app-text-muted)",
            lineHeight: 1.6,
            marginBottom: "40px",
            maxWidth: "400px",
          }}
        >
          A plataforma que a Cristina usa para vender a PetBiz a pet shops,
          grooming, clínicas veterinárias e hotéis para animais.
        </p>

        {/* Benefits */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "48px" }}>
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  background: "var(--app-orange-muted)",
                  border: "1px solid rgba(249,115,22,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={16} color="var(--app-orange)" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--app-text)" }}>
                  {title}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--app-text-muted)" }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div
          style={{
            padding: "16px 20px",
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
            borderRadius: "var(--radius-lg)",
            borderLeft: "3px solid var(--app-orange)",
          }}
        >
          <p style={{ margin: 0, fontSize: "13px", color: "var(--app-text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>
            "Com a PawReach consigo enviar sequências de emails automáticas para
            os meus leads e focar-me no que importa — fechar negócio."
          </p>
          <p style={{ margin: "8px 0 0", fontSize: "12px", fontWeight: 600, color: "var(--app-orange)" }}>
            — Cristina Pena, fundadora PetBiz
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div
        className="hidden lg:block"
        style={{
          width: "1px",
          background: "var(--app-border)",
          margin: "40px 0",
        }}
      />

      {/* ── RIGHT: Login Form ── */}
      <div
        style={{
          flex: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Mobile logo */}
          <div
            className="flex lg:hidden"
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "32px",
            }}
          >
            <span style={{ fontSize: "28px" }}>🐾</span>
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "24px",
                fontWeight: 800,
                color: "var(--app-orange)",
                letterSpacing: "-0.5px",
              }}
            >
              PawReach
            </span>
          </div>

          {/* Card */}
          <div
            style={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              borderRadius: "var(--radius-xl)",
              padding: "36px 32px",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {sent ? (
              /* Success state */
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "var(--app-emerald-muted)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <CheckCircle2 size={24} color="var(--app-emerald)" />
                </div>
                <h3
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "var(--app-text)",
                    margin: "0 0 8px",
                  }}
                >
                  Verifica o teu email
                </h3>
                <p style={{ color: "var(--app-text-muted)", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                  Enviámos um link de acesso para{" "}
                  <strong style={{ color: "var(--app-text)" }}>{email}</strong>.
                  Clica no link para entrar.
                </p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "28px" }}>
                  <h2
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "var(--app-text)",
                      margin: "0 0 6px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Bem-vinda de volta
                  </h2>
                  <p style={{ color: "var(--app-text-muted)", fontSize: "14px", margin: 0 }}>
                    Entra com Google ou com um link de acesso
                  </p>
                </div>

                {/* Google */}
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    padding: "11px 16px",
                    background: "var(--app-surface-2)",
                    border: "1px solid var(--app-border-strong)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--app-text)",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "background var(--t-fast), border-color var(--t-fast)",
                    marginBottom: "20px",
                    opacity: loading ? 0.6 : 1,
                  }}
                  onMouseEnter={e => !loading && ((e.currentTarget as HTMLButtonElement).style.background = "var(--app-elevated)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "var(--app-surface-2)")}
                >
                  <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Continuar com Google
                </button>

                {/* Divider */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ flex: 1, height: "1px", background: "var(--app-border)" }} />
                  <span style={{ color: "var(--app-text-dim)", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    ou
                  </span>
                  <div style={{ flex: 1, height: "1px", background: "var(--app-border)" }} />
                </div>

                {/* Magic link form */}
                <form onSubmit={handleMagicLink}>
                  <label
                    htmlFor="email"
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--app-text-muted)",
                      marginBottom: "6px",
                    }}
                  >
                    Email
                  </label>
                  <div style={{ position: "relative", marginBottom: error ? "8px" : "16px" }}>
                    <Mail
                      size={15}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--app-text-dim)",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nome@empresa.pt"
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px 10px 36px",
                        background: "var(--app-bg)",
                        border: "1.5px solid var(--app-border)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--app-text)",
                        fontSize: "14px",
                        outline: "none",
                        transition: "border-color var(--t-fast), box-shadow var(--t-fast)",
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = "var(--app-orange)"
                        e.currentTarget.style.boxShadow = "0 0 0 3px var(--app-orange-muted)"
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = "var(--app-border)"
                        e.currentTarget.style.boxShadow = "none"
                      }}
                    />
                  </div>

                  {error && (
                    <p style={{ color: "var(--app-red)", fontSize: "13px", margin: "0 0 12px" }}>
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "11px 16px",
                      background: loading || !email ? "var(--app-surface-2)" : "var(--app-orange)",
                      color: loading || !email ? "var(--app-text-dim)" : "white",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: loading || !email ? "not-allowed" : "pointer",
                      transition: "background var(--t-fast), box-shadow var(--t-fast)",
                      boxShadow: loading || !email ? "none" : "var(--shadow-orange)",
                    }}
                  >
                    {loading ? "A enviar..." : (
                      <>
                        Enviar link de acesso
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          <p
            style={{
              textAlign: "center",
              color: "var(--app-text-dim)",
              fontSize: "12px",
              marginTop: "20px",
            }}
          >
            Acesso restrito a utilizadores autorizados.
          </p>
        </div>
      </div>
    </div>
  )
}
