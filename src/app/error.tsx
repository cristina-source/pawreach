"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[PawReach] Erro global:", error)
  }, [error])

  return (
    <html lang="pt">
      <body style={{ background: "var(--app-bg, #0F172A)", margin: 0, fontFamily: "sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
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
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#F8FAFC",
                margin: "0 0 10px",
                letterSpacing: "-0.02em",
              }}
            >
              Algo correu mal
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#94A3B8",
                margin: "0 0 28px",
                lineHeight: 1.6,
              }}
            >
              Ocorreu um erro inesperado. A nossa equipa foi notificada.
              Podes tentar novamente ou regressar à aplicação.
            </p>
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                background: "#F97316",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={15} />
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
