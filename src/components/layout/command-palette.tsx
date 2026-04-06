"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard, Users, Mail, Zap, Sparkles,
  FileText, Settings, Upload, Plus, Search, ArrowRight,
} from "lucide-react"

const commands = [
  { group: "Navegação", items: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, shortcut: "G D" },
    { label: "Contactos", href: "/contactos", icon: Users, shortcut: "G C" },
    { label: "Campanhas", href: "/campanhas", icon: Mail, shortcut: "G M" },
    { label: "Automações", href: "/automacoes", icon: Zap, shortcut: "G A" },
    { label: "IA Copy", href: "/ia-copy", icon: Sparkles, shortcut: "G I" },
    { label: "Templates", href: "/templates", icon: FileText, shortcut: "G T" },
    { label: "Configurações", href: "/configuracoes", icon: Settings },
  ]},
  { group: "Acções rápidas", items: [
    { label: "Novo contacto", href: "/contactos/novo", icon: Plus },
    { label: "Nova campanha", href: "/campanhas/nova", icon: Plus },
    { label: "Importar contactos", href: "/contactos/importar", icon: Upload },
    { label: "Gerar email com IA", href: "/ia-copy", icon: Sparkles },
  ]},
]

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const allItems = commands.flatMap((g) => g.items)
  const filtered = query.trim()
    ? allItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : allItems

  useEffect(() => {
    if (open) {
      setQuery("")
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); onClose() }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)) }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
      if (e.key === "Enter") {
        e.preventDefault()
        const item = filtered[selected]
        if (item) { router.push(item.href); onClose() }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, filtered, selected, router, onClose])

  if (!open) return null

  // Group filtered items if no query
  const groups = query.trim()
    ? [{ group: "Resultados", items: filtered }]
    : commands.map((g) => ({ ...g, items: g.items }))

  let itemIndex = 0

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          animation: "fadeIn 150ms ease",
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        style={{
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "520px",
          zIndex: 101,
          background: "var(--app-surface)",
          border: "1px solid var(--app-border-strong)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
          animation: "cmdPaletteIn 150ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 16px",
            borderBottom: "1px solid var(--app-border)",
          }}
        >
          <Search size={16} color="var(--app-text-muted)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
            aria-label="Pesquisar páginas e acções"
            placeholder="Pesquisar páginas e acções..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "15px",
              color: "var(--app-text)",
              caretColor: "var(--app-orange)",
            }}
          />
          <kbd
            style={{
              fontSize: "10px",
              padding: "2px 6px",
              background: "var(--app-surface-2)",
              border: "1px solid var(--app-border-strong)",
              borderRadius: "4px",
              color: "var(--app-text-dim)",
              flexShrink: 0,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: "360px", overflowY: "auto", padding: "6px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--app-text-muted)", fontSize: "14px" }}>
              Sem resultados para "{query}"
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.group}>
                <p style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--app-text-dim)",
                  padding: "8px 10px 4px",
                  margin: 0,
                }}>
                  {group.group}
                </p>
                {group.items.map((item) => {
                  const idx = itemIndex++
                  const isSelected = idx === selected
                  return (
                    <button
                      key={item.href + item.label}
                      onClick={() => { router.push(item.href); onClose() }}
                      onMouseEnter={() => setSelected(idx)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 10px",
                        borderRadius: "var(--radius-md)",
                        background: isSelected ? "var(--app-orange-muted)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background var(--t-fast)",
                        marginBottom: "1px",
                      }}
                    >
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "7px",
                          background: isSelected ? "rgba(249,115,22,0.15)" : "var(--app-surface-2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <item.icon size={14} color={isSelected ? "var(--app-orange)" : "var(--app-text-muted)"} />
                      </div>
                      <span style={{
                        flex: 1,
                        fontSize: "14px",
                        fontWeight: 500,
                        color: isSelected ? "var(--app-text)" : "var(--app-text-muted)",
                      }}>
                        {item.label}
                      </span>
                      {item.shortcut ? (
                        <span style={{ fontSize: "11px", color: "var(--app-text-dim)", display: "flex", gap: "3px" }}>
                          {item.shortcut.split(" ").map((k) => (
                            <kbd key={k} style={{
                              padding: "1px 5px",
                              background: "var(--app-surface-2)",
                              border: "1px solid var(--app-border)",
                              borderRadius: "4px",
                            }}>{k}</kbd>
                          ))}
                        </span>
                      ) : isSelected ? (
                        <ArrowRight size={13} color="var(--app-orange)" />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 16px",
            borderTop: "1px solid var(--app-border)",
          }}
        >
          {[
            ["↑↓", "navegar"],
            ["↵", "abrir"],
            ["esc", "fechar"],
          ].map(([key, label]) => (
            <span key={key} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--app-text-dim)" }}>
              <kbd style={{
                padding: "1px 5px",
                background: "var(--app-surface-2)",
                border: "1px solid var(--app-border)",
                borderRadius: "4px",
                fontSize: "10px",
              }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
