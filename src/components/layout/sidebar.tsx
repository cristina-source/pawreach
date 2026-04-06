"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Mail,
  Zap,
  Sparkles,
  FileText,
  Settings,
  X,
} from "lucide-react"
import { clsx } from "clsx"

const navGroups = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/contactos", label: "Contactos", icon: Users },
      { href: "/campanhas", label: "Campanhas", icon: Mail },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { href: "/automacoes", label: "Automações", icon: Zap },
      { href: "/ia-copy", label: "IA Copy", icon: Sparkles, badge: "IA" },
      { href: "/templates", label: "Templates", icon: FileText },
    ],
  },
  {
    label: "Conta",
    items: [
      { href: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
]

interface SidebarProps {
  userName?: string | null
  userEmail?: string | null
  userImage?: string | null
  plan?: string
  contactCount?: number
  campaignCount?: number
  isOpen?: boolean
  onClose?: () => void
}

const planColors: Record<string, string> = {
  FREE:   "var(--app-text-dim)",
  SOLO:   "var(--app-emerald)",
  GROWTH: "var(--app-amber)",
}
const planLabels: Record<string, string> = {
  FREE:   "Gratuito",
  SOLO:   "Solo",
  GROWTH: "Growth",
}

export function Sidebar({ userName, userEmail, userImage, plan = "FREE", contactCount, campaignCount, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  const sidebarContent = (
    <aside
      style={{
        width: "232px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--app-surface)",
        borderRight: "1px solid var(--app-border)",
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "20px 16px 18px",
          borderBottom: "1px solid var(--app-border)",
        }}
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
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(249,115,22,0.3)",
          }}
        >
          🐾
        </div>
        <div>
          <span
            style={{
              fontFamily: "var(--font-syne), Syne, sans-serif",
              fontSize: "18px",
              fontWeight: 800,
              color: "var(--app-text)",
              letterSpacing: "-0.4px",
              display: "block",
              lineHeight: 1,
            }}
          >
            Paw<span style={{ color: "var(--app-orange)" }}>Reach</span>
          </span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 8px 12px" }}>
        {navGroups.map((group, groupIdx) => (
          <div
            key={group.label}
            style={{
              marginBottom: "4px",
              paddingTop: groupIdx > 0 ? "8px" : "0",
              marginTop: groupIdx > 0 ? "4px" : "0",
              borderTop: groupIdx > 0 ? "1px solid var(--app-border)" : "none",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--app-text-dim)",
                padding: "6px 10px 4px",
                margin: 0,
              }}
            >
              {group.label}
            </p>
            {group.items.map(({ href, label, icon: Icon, badge }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/")
              const count =
                href === "/contactos" ? contactCount :
                href === "/campanhas" ? campaignCount :
                undefined
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  aria-label={label}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--app-orange)" : "var(--app-text-muted)",
                    background: isActive ? "var(--app-orange-muted)" : "transparent",
                    textDecoration: "none",
                    transition: "background var(--t-fast), color var(--t-fast)",
                    marginBottom: "1px",
                    position: "relative",
                  }}
                  className={clsx(!isActive && "sidebar-link")}
                >
                  <Icon
                    size={15}
                    style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}
                  />
                  <span style={{ flex: 1 }}>{label}</span>
                  {count !== undefined && count > 0 && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: "99px",
                        background: isActive ? "rgba(249,115,22,0.2)" : "var(--app-surface-2)",
                        color: isActive ? "var(--app-orange)" : "var(--app-text-dim)",
                        border: `1px solid ${isActive ? "rgba(249,115,22,0.2)" : "var(--app-border)"}`,
                        minWidth: "20px",
                        textAlign: "center",
                      }}
                    >
                      {count > 999 ? "999+" : count}
                    </span>
                  )}
                  {badge && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "99px",
                        background: isActive ? "rgba(249,115,22,0.2)" : "var(--app-orange-muted)",
                        color: "var(--app-orange)",
                        letterSpacing: "0.02em",
                        border: "1px solid rgba(249,115,22,0.2)",
                      }}
                    >
                      <span
                        className="ia-pulse-dot"
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: "var(--app-orange)",
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      {badge}
                    </span>
                  )}
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        left: "-8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "3px",
                        height: "18px",
                        borderRadius: "0 3px 3px 0",
                        background: "var(--app-orange)",
                      }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── User ── */}
      <div
        style={{
          padding: "10px 8px",
          borderTop: "1px solid var(--app-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 10px",
            borderRadius: "var(--radius-md)",
            background: "transparent",
          }}
        >
          {userImage ? (
            <img
              src={userImage}
              alt={userName ?? ""}
              style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #F97316 0%, #F59E0B 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
              }}
            >
              {(userName?.[0] ?? userEmail?.[0] ?? "U").toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--app-text)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userName ?? userEmail ?? "Utilizador"}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                fontWeight: 500,
                color: planColors[plan] ?? "var(--app-text-dim)",
              }}
            >
              Plano {planLabels[plan] ?? plan}
            </p>
          </div>
        </div>
        <p
          style={{
            margin: "6px 10px 0",
            fontSize: "10px",
            color: "var(--app-text-dim)",
          }}
        >
          PawReach v0.1.0
        </p>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop: sempre visível */}
      <div className="sidebar-desktop">
        {sidebarContent}
      </div>

      {/* Mobile: overlay + sidebar slide-in */}
      {isOpen && (
        <>
          <div
            className="sidebar-overlay lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="sidebar-mobile lg:hidden">
            <div style={{ position: "relative" }}>
              {/* Botão fechar */}
              <button
                onClick={onClose}
                aria-label="Fechar menu"
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "-40px",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--app-surface)",
                  border: "1px solid var(--app-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--app-text-muted)",
                  zIndex: 51,
                }}
              >
                <X size={14} />
              </button>
              {sidebarContent}
            </div>
          </div>
        </>
      )}
    </>
  )
}
