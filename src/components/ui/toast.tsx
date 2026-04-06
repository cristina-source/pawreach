"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const icons = {
    success: <CheckCircle2 size={16} />,
    error: <AlertCircle size={16} />,
    info: <Info size={16} />,
  }

  const colors = {
    success: { bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", text: "#10B981" },
    error: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", text: "#EF4444" },
    info: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)", text: "#3B82F6" },
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxWidth: "380px",
            width: "100%",
          }}
        >
          {toasts.map((t) => {
            const c = colors[t.type]
            return (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  background: "var(--app-surface)",
                  border: `1px solid ${c.border}`,
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-lg)",
                  animation: "toastIn 250ms cubic-bezier(0.4,0,0.2,1)",
                  fontSize: "14px",
                  color: "var(--app-text)",
                }}
              >
                <span style={{ color: c.text, flexShrink: 0, display: "flex" }}>{icons[t.type]}</span>
                <span style={{ flex: 1 }}>{t.message}</span>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Fechar notificação"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--app-text-muted)",
                    cursor: "pointer",
                    padding: "2px",
                    flexShrink: 0,
                    display: "flex",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </ToastContext.Provider>
  )
}
