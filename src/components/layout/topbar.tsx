"use client"

import { useState, useRef, useEffect } from "react"
import { signOut } from "next-auth/react"
import { LogOut, User, ChevronDown, Menu, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface TopbarProps {
  title: string
  userName?: string | null
  userEmail?: string | null
  userImage?: string | null
  onMenuClick?: () => void
  onSearchClick?: () => void
}

export function Topbar({ title, userName, userEmail, userImage, onMenuClick, onSearchClick }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header
      className="flex items-center justify-between px-5 py-3"
      style={{
        borderBottom: "1px solid var(--app-border)",
        background: "var(--app-surface)",
        minHeight: "56px",
      }}
    >
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3">
        {/* Hamburger — só visível em mobile */}
        <button
          className="topbar-hamburger p-2 rounded-lg transition-colors"
          title="Abrir menu"
          aria-label="Abrir menu de navegação"
          onClick={onMenuClick}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--app-text-muted)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--app-surface-2)"
            ;(e.currentTarget as HTMLButtonElement).style.color = "var(--app-text)"
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent"
            ;(e.currentTarget as HTMLButtonElement).style.color = "var(--app-text-muted)"
          }}
        >
          <Menu size={18} />
        </button>

        <h1
          className="text-base font-bold"
          style={{
            fontFamily: "Syne, sans-serif",
            color: "var(--app-text)",
            margin: 0,
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Right: ⌘K + user menu */}
      <div className="flex items-center gap-2">

        {/* ⌘K search hint */}
        <button
          title="Pesquisar (⌘K)"
          aria-label="Pesquisar"
          onClick={onSearchClick}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
          style={{
            background: "var(--app-surface-2)",
            border: "1px solid var(--app-border)",
            color: "var(--app-text-dim)",
            fontSize: "12px",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--app-border-strong)"
            ;(e.currentTarget as HTMLButtonElement).style.color = "var(--app-text-muted)"
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--app-border)"
            ;(e.currentTarget as HTMLButtonElement).style.color = "var(--app-text-dim)"
          }}
        >
          <span style={{ letterSpacing: "0.02em" }}>Pesquisar</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "2px",
              padding: "1px 5px",
              background: "var(--app-elevated)",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--app-text-dim)",
              border: "1px solid var(--app-border-strong)",
            }}
          >
            ⌘K
          </span>
        </button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors"
            title={`${userName ?? userEmail} — Abrir menu do utilizador`}
            aria-label="Menu do utilizador"
            aria-expanded={menuOpen}
            style={{
              background: menuOpen ? "var(--app-surface-2)" : "transparent",
              border: "1px solid transparent",
              color: "var(--app-text)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              if (!menuOpen) {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--app-surface-2)"
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = "var(--app-border)"
              }
            }}
            onMouseLeave={(e) => {
              if (!menuOpen) {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent"
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = "transparent"
              }
            }}
          >
            {userImage ? (
              <img
                src={userImage}
                alt={userName ?? "Utilizador"}
                className="w-7 h-7 rounded-full object-cover"
                style={{ border: "2px solid var(--app-border-strong)" }}
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ background: "var(--app-orange)", color: "white" }}
              >
                {(userName?.[0] ?? userEmail?.[0] ?? "U").toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium hidden sm:block" style={{ color: "var(--app-text)" }}>
              {userName ?? userEmail?.split("@")[0]}
            </span>
            <ChevronDown
              size={13}
              style={{
                color: "var(--app-text-muted)",
                transition: "transform 150ms",
                transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-56 rounded-xl shadow-xl z-50 py-1"
              style={{
                background: "var(--app-surface)",
                border: "1px solid var(--app-border-strong)",
                boxShadow: "var(--shadow-lg)",
                animation: "fadeInUp 150ms ease both",
              }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid var(--app-border)" }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--app-text)", margin: 0 }}>
                  {userName ?? "Utilizador"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)", margin: 0 }}>
                  {userEmail}
                </p>
              </div>

              <div style={{ padding: "4px 0" }}>
                <a
                  href="/configuracoes"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                  style={{
                    color: "var(--app-text-muted)",
                    textDecoration: "none",
                    display: "flex",
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background = "var(--app-surface-2)"
                    ;(e.currentTarget as HTMLAnchorElement).style.color = "var(--app-text)"
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLAnchorElement).style.background = "transparent"
                    ;(e.currentTarget as HTMLAnchorElement).style.color = "var(--app-text-muted)"
                  }}
                >
                  <Settings size={14} />
                  Configurações
                </a>

                <button
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: "var(--app-red)", background: "transparent", border: "none", cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = "transparent"
                  }}
                  onClick={() => {
                    setMenuOpen(false)
                    signOut({ callbackUrl: "/login" })
                  }}
                >
                  <LogOut size={14} />
                  Terminar sessão
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
