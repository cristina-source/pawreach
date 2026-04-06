"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[PawReach] Erro no dashboard:", error)
  }, [error])

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        minHeight: "400px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <AlertTriangle size={28} color="#EF4444" />
        </div>
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--app-text)",
            margin: "0 0 10px",
            letterSpacing: "-0.02em",
          }}
        >
          Erro ao carregar esta página
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "var(--app-text-muted)",
            margin: "0 0 28px",
            lineHeight: 1.6,
          }}
        >
          Não foi possível carregar o conteúdo. Podes tentar novamente
          ou regressar ao dashboard.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              background: "var(--app-orange)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 150ms",
            }}
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              background: "var(--app-surface-2)",
              color: "var(--app-text-muted)",
              border: "1px solid var(--app-border)",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              textDecoration: "none",
              transition: "background 150ms",
            }}
          >
            <Home size={14} />
            Ir para o dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
