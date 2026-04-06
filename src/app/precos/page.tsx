import { getSession as auth } from "@/lib/get-session"
import { Check } from "lucide-react"
import Link from "next/link"
import { CheckoutButton } from "@/components/precos/checkout-button"

const PLANS = [
  {
    id: "FREE",
    name: "Gratuito",
    price: "€0",
    period: "para sempre",
    description: "Para começar a explorar a plataforma.",
    color: "var(--app-text-dim)",
    features: [
      "Até 100 contactos",
      "500 emails/mês",
      "1 campanha activa",
      "Dashboard analytics",
    ],
    cta: "Começar grátis",
    ctaHref: "/dashboard",
    highlighted: false,
  },
  {
    id: "SOLO",
    name: "Solo",
    price: "€29",
    period: "/mês",
    description: "Para profissionais do sector pet em crescimento.",
    color: "var(--app-orange)",
    features: [
      "Até 2.000 contactos",
      "10.000 emails/mês",
      "Campanhas ilimitadas",
      "50 gerações IA/mês",
      "Automações básicas",
      "Suporte por email",
    ],
    cta: "Começar Solo",
    ctaHref: "/dashboard",
    highlighted: true,
  },
  {
    id: "GROWTH",
    name: "Growth",
    price: "€79",
    period: "/mês",
    description: "Para negócios pet com múltiplos canais e equipa.",
    color: "var(--app-amber)",
    features: [
      "Até 10.000 contactos",
      "Emails ilimitados",
      "Gerações IA ilimitadas",
      "Automações avançadas",
      "Relatórios detalhados",
      "Suporte prioritário",
      "Domínio personalizado",
    ],
    cta: "Começar Growth",
    ctaHref: "/dashboard",
    highlighted: false,
  },
]

export default async function PrecosPage() {
  const session = await auth()

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--app-bg)",
        padding: "80px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "64px", maxWidth: "560px" }}>
        <Link
          href={session?.user ? "/dashboard" : "/"}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "40px" }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "9px",
              background: "linear-gradient(135deg, #F97316 0%, #F59E0B 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "17px",
              boxShadow: "0 2px 8px rgba(249,115,22,0.3)",
            }}
          >
            🐾
          </div>
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "20px",
              fontWeight: 800,
              color: "var(--app-text)",
              letterSpacing: "-0.4px",
            }}
          >
            Paw<span style={{ color: "var(--app-orange)" }}>Reach</span>
          </span>
        </Link>

        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "42px",
            fontWeight: 800,
            color: "var(--app-text)",
            margin: "0 0 16px",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}
        >
          Preços simples,<br />sem surpresas
        </h1>
        <p style={{ fontSize: "16px", color: "var(--app-text-muted)", margin: 0, lineHeight: 1.6 }}>
          Email marketing feito para o mercado pet. Começa grátis e escala quando precisares.
        </p>
      </div>

      {/* Plans grid */}
      <div className="precos-grid">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="precos-card"
            style={{
              background: "var(--app-surface)",
              border: plan.highlighted ? `2px solid var(--app-orange)` : "1px solid var(--app-border)",
              borderRadius: "var(--radius-xl)",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              boxShadow: plan.highlighted ? "var(--shadow-orange)" : "none",
            }}
          >
            {plan.highlighted && (
              <div
                style={{
                  position: "absolute",
                  top: "-13px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--app-orange)",
                  color: "white",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 12px",
                  borderRadius: "99px",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Mais popular
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: plan.color,
                }}
              >
                {plan.name}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "8px" }}>
                <span
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: "40px",
                    fontWeight: 800,
                    color: "var(--app-text)",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {plan.price}
                </span>
                <span style={{ fontSize: "14px", color: "var(--app-text-muted)" }}>{plan.period}</span>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--app-text-muted)", lineHeight: 1.5 }}>
                {plan.description}
              </p>
            </div>

            <ul style={{ listStyle: "none", margin: "0 0 32px", padding: 0, display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              {plan.features.map((feature) => (
                <li key={feature} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: `rgba(${plan.id === "SOLO" ? "249,115,22" : plan.id === "GROWTH" ? "245,158,11" : "100,116,139"},0.15)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    <Check size={11} color={plan.color} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: "13.5px", color: "var(--app-text-muted)", lineHeight: 1.4 }}>{feature}</span>
                </li>
              ))}
            </ul>

            {plan.id === "FREE" ? (
              <Link
                href="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "11px 20px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  background: "var(--app-surface-2)",
                  color: "var(--app-text)",
                  border: "1px solid var(--app-border)",
                  transition: "opacity var(--t-fast)",
                }}
              >
                {plan.cta}
              </Link>
            ) : (
              <CheckoutButton
                plan={plan.id as "SOLO" | "GROWTH"}
                label={plan.cta}
                highlighted={plan.highlighted}
              />
            )}
          </div>
        ))}
      </div>

      {/* FAQ / note */}
      <p style={{ marginTop: "48px", fontSize: "13px", color: "var(--app-text-dim)", textAlign: "center" }}>
        Todos os planos incluem SSL, backups diários e conformidade com o RGPD.
        Cancela quando quiseres, sem penalizações.
      </p>
    </div>
  )
}
