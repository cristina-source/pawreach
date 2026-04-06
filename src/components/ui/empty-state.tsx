"use client"

import Link from "next/link"
import { Button } from "./button"

interface EmptyStateAction {
  label: string
  href?: string
  onClick?: () => void
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
}

function ActionButton({ action, variant }: { action: EmptyStateAction; variant: "primary" | "secondary" }) {
  if (action.href) {
    return (
      <Link
        href={action.href}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: variant === "primary" ? "9px 18px" : "8px 16px",
          background: variant === "primary" ? "var(--app-orange)" : "var(--app-surface-2)",
          color: variant === "primary" ? "white" : "var(--app-text-muted)",
          border: variant === "primary" ? "none" : "1px solid var(--app-border)",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: variant === "primary" ? "var(--shadow-orange)" : "none",
          transition: "background var(--t-fast)",
        }}
      >
        {action.label}
      </Link>
    )
  }
  return (
    <Button variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  )
}

export function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4 fade-in-up">
      {icon && (
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "var(--app-surface-2)",
            border: "1px solid var(--app-border-strong)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            color: "var(--app-text-muted)",
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontFamily: "Syne, sans-serif",
          fontSize: "18px",
          fontWeight: 700,
          color: "var(--app-text)",
          margin: "0 0 8px",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: "var(--app-text-muted)",
          margin: "0 0 28px",
          maxWidth: "360px",
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      {(action || secondaryAction) && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {action && <ActionButton action={action} variant="primary" />}
          {secondaryAction && <ActionButton action={secondaryAction} variant="secondary" />}
        </div>
      )}
    </div>
  )
}
