import { getSession as auth } from "@/lib/get-session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { StatCard } from "@/components/ui/card"
import { Users, Mail, TrendingUp, Send, Plus, Upload, Sparkles, ArrowRight } from "lucide-react"
import { DashboardChart } from "@/components/campanhas/campaign-stats"
import { format, subDays } from "date-fns"
import { pt } from "date-fns/locale"
import Link from "next/link"

function getGreeting(hour: number): string {
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = session.user.id
  const now = new Date()
  const hour = now.getHours()
  const greeting = getGreeting(hour)
  const firstName = session.user.name?.split(" ")[0] ?? session.user.email?.split("@")[0] ?? "Olá"
  const dataFormatada = format(now, "EEEE, d 'de' MMMM", { locale: pt })
  const dataCapitalizada = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)

  const [totalContactos, emailsMes, campanhasAtivas, emailLogs, leadsQuentes, totalCampanhas] =
    await Promise.all([
      prisma.contact.count({ where: { userId, deletedAt: null } }),
      prisma.emailLog.count({
        where: {
          userId,
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        },
      }),
      prisma.campaign.count({
        where: { userId, deletedAt: null, status: { in: ["AGENDADA", "A_ENVIAR"] } },
      }),
      prisma.emailLog.findMany({
        where: { userId, createdAt: { gte: subDays(now, 30) } },
        select: { createdAt: true, aberto: true, clicado: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.contact.count({ where: { userId, deletedAt: null, estadoLead: "QUENTE" } }),
      prisma.campaign.count({ where: { userId, deletedAt: null } }),
    ])

  const emailsAbertos = await prisma.emailLog.count({
    where: {
      userId,
      aberto: true,
      createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
    },
  })
  const taxaAbertura = emailsMes > 0 ? Math.round((emailsAbertos / emailsMes) * 100) : 0

  const chartData: { date: string; enviados: number; abertos: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const date = subDays(now, i)
    const dateStr = format(date, "dd/MM", { locale: pt })
    const dayLogs = emailLogs.filter((log) => format(log.createdAt, "dd/MM") === dateStr)
    chartData.push({
      date: dateStr,
      enviados: dayLogs.length,
      abertos: dayLogs.filter((l) => l.aberto).length,
    })
  }

  const quickActions = [
    {
      href: "/campanhas/nova",
      icon: Plus,
      label: "Nova campanha",
      desc: "Cria e envia uma campanha",
      color: "var(--app-orange)",
      colorBorder: "rgba(249,115,22,0.2)",
      colorMuted: "var(--app-orange-muted)",
    },
    {
      href: "/contactos/importar",
      icon: Upload,
      label: "Importar contactos",
      desc: "Carrega uma lista CSV",
      color: "var(--app-blue)",
      colorBorder: "rgba(59,130,246,0.2)",
      colorMuted: "var(--app-blue-muted)",
    },
    {
      href: "/ia-copy",
      icon: Sparkles,
      label: "Gerar email IA",
      desc: "Copy persuasivo em segundos",
      color: "var(--app-amber)",
      colorBorder: "rgba(245,158,11,0.2)",
      colorMuted: "var(--app-amber-muted)",
    },
  ]

  return (
    <div style={{ maxWidth: "1100px", width: "100%" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: "28px" }} className="stagger-1">
        <h1
          style={{
            fontFamily: "var(--font-syne), Syne, sans-serif",
            fontSize: "26px",
            fontWeight: 700,
            color: "var(--app-text)",
            margin: "0 0 4px",
            letterSpacing: "-0.03em",
          }}
        >
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ margin: 0, fontSize: "14px", color: "var(--app-text-muted)" }}>
          {dataCapitalizada} · {totalContactos} contactos · {totalCampanhas} campanhas
        </p>
      </div>

      {/* ── Quick Actions ── */}
      <div className="dashboard-quick-grid stagger-2">
        {quickActions.map(({ href, icon: Icon, label, desc, color, colorBorder, colorMuted }) => (
          <Link
            key={href}
            href={href}
            className="quick-action-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              borderRadius: "var(--radius-lg)",
              textDecoration: "none",
              transition: "border-color var(--t-fast), box-shadow var(--t-fast), transform var(--t-fast)",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9px",
                background: colorMuted,
                border: `1px solid ${colorBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={16} color={color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 600, color: "var(--app-text)" }}>
                {label}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--app-text-muted)" }}>
                {desc}
              </p>
            </div>
            <ArrowRight size={14} color="var(--app-text-dim)" />
          </Link>
        ))}
      </div>

      {/* ── Onboarding checklist (conta vazia) ── */}
      {totalContactos === 0 && totalCampanhas === 0 && (
        <div
          style={{
            marginBottom: "24px",
            padding: "20px 24px",
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <p style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: 600, color: "var(--app-text)", fontFamily: "var(--font-syne), Syne, sans-serif" }}>
            Primeiros passos
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { step: 1, label: "Importa os teus contactos", desc: "Carrega um ficheiro CSV com a tua lista", href: "/contactos/importar", done: false },
              { step: 2, label: "Cria a primeira campanha", desc: "Escreve e agenda um email para os teus contactos", href: "/campanhas/nova", done: false },
              { step: 3, label: "Configura o remetente", desc: "Define o nome e email de envio", href: "/configuracoes", done: false },
            ].map((item) => (
              <Link
                key={item.step}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  background: "var(--app-surface-2)",
                  border: "1px solid var(--app-border)",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  transition: "border-color var(--t-fast)",
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "var(--app-orange-muted)",
                    border: "1.5px solid rgba(249,115,22,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--app-orange)",
                  }}
                >
                  {item.step}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--app-text)" }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--app-text-muted)" }}>{item.desc}</p>
                </div>
                <ArrowRight size={13} color="var(--app-text-dim)" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="dashboard-stat-grid">
        <StatCard
          title="Total Contactos"
          value={totalContactos}
          subtitle={totalContactos === 0 ? "Adiciona o primeiro" : "no teu CRM"}
          icon={<Users size={18} />}
          color="blue"
          index={0}
        />
        <StatCard
          title="Emails Este Mês"
          value={emailsMes.toLocaleString("pt-PT")}
          subtitle={emailsMes === 0 ? "nenhum enviado ainda" : "enviados este mês"}
          icon={<Mail size={18} />}
          color="emerald"
          index={1}
        />
        <StatCard
          title="Taxa de Abertura"
          value={`${taxaAbertura}%`}
          subtitle={emailsMes === 0 ? "sem dados este mês" : "média deste mês"}
          icon={<TrendingUp size={18} />}
          color="amber"
          index={2}
        />
        <StatCard
          title="Campanhas Activas"
          value={campanhasAtivas}
          subtitle={campanhasAtivas === 0 ? "nenhuma em curso" : "agendadas ou a enviar"}
          icon={<Send size={18} />}
          color="orange"
          index={3}
        />
      </div>

      {/* ── Chart ── */}
      <div className="stagger-5">
        <DashboardChart data={chartData} />
      </div>

      {/* ── Leads quentes ── */}
      {leadsQuentes > 0 && (
        <div
          style={{
            marginTop: "16px",
            padding: "14px 20px",
            background: "var(--app-surface)",
            border: "1px solid var(--app-border)",
            borderLeft: "3px solid var(--app-emerald)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--app-emerald)",
                boxShadow: "0 0 0 3px var(--app-emerald-muted)",
                flexShrink: 0,
              }}
            />
            <p style={{ margin: 0, fontSize: "14px", color: "var(--app-text)" }}>
              <strong>{leadsQuentes}</strong>{" "}
              <span style={{ color: "var(--app-text-muted)" }}>
                {leadsQuentes === 1 ? "lead quente" : "leads quentes"} — prontos para converter
              </span>
            </p>
          </div>
          <Link
            href="/contactos?estado=QUENTE"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--app-orange)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Ver contactos <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </div>
  )
}
