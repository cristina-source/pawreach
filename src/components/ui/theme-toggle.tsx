"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    const saved = localStorage.getItem("pawreach-theme") as "dark" | "light" | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute("data-theme", saved)
    }
  }, [])

  function toggle() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("pawreach-theme", next)
    document.documentElement.setAttribute("data-theme", next)
  }

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
      aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo escuro"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "var(--radius-md)",
        background: "transparent",
        border: "1px solid var(--app-border)",
        color: "var(--app-text-muted)",
        cursor: "pointer",
        transition: "background var(--t-fast), color var(--t-fast), border-color var(--t-fast)",
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background = "var(--app-surface-2)"
        ;(e.currentTarget as HTMLButtonElement).style.color = "var(--app-text)"
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = "var(--app-border-strong)"
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background = "transparent"
        ;(e.currentTarget as HTMLButtonElement).style.color = "var(--app-text-muted)"
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = "var(--app-border)"
      }}
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
