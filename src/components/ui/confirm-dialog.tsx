"use client"

import { Dialog } from "./dialog"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning"
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const colors = {
    danger: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", icon: "#EF4444", btn: "#EF4444" },
    warning: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", icon: "#F59E0B", btn: "#F59E0B" },
  }
  const c = colors[variant]

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: c.bg,
            border: `1px solid ${c.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <AlertTriangle size={22} color={c.icon} />
        </div>
        <h3
          style={{
            fontFamily: "var(--font-syne), Syne, sans-serif",
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--app-text)",
            margin: "0 0 8px",
          }}
        >
          {title}
        </h3>
        <p style={{ fontSize: "14px", color: "var(--app-text-muted)", margin: "0 0 24px", lineHeight: 1.5 }}>
          {description}
        </p>
        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: "9px 18px",
              background: "var(--app-surface-2)",
              border: "1px solid var(--app-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--app-text-muted)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: "9px 18px",
              background: loading ? "var(--app-text-dim)" : c.btn,
              border: "none",
              borderRadius: "var(--radius-md)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "A processar..." : confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
