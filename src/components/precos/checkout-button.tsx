"use client"

import { useState } from "react"

interface CheckoutButtonProps {
  plan: "SOLO" | "GROWTH"
  label: string
  highlighted?: boolean
}

export function CheckoutButton({ plan, label, highlighted }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.assign(data.url)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "11px 20px",
        borderRadius: "var(--radius-md)",
        fontSize: "14px",
        fontWeight: 600,
        background: highlighted ? "var(--app-orange)" : "var(--app-surface-2)",
        color: highlighted ? "white" : "var(--app-text)",
        border: highlighted ? "none" : "1px solid var(--app-border)",
        boxShadow: highlighted ? "var(--shadow-orange)" : "none",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        transition: "opacity var(--t-fast)",
      }}
    >
      {loading ? "A redirecionar..." : label}
    </button>
  )
}
