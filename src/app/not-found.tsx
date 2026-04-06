"use client"

import Link from "next/link"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--app-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "440px" }}>
        {/* Número 404 grande */}
        <p
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "96px",
            fontWeight: 800,
            background: "linear-gradient(135deg, #F97316 0%, #F59E0B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: "0 0 8px",
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          404
        </p>

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <span style={{ fontSize: "20px" }}>🐾</span>
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "16px",
              fontWeight: 700,
              color: "var(--app-text-muted)",
            }}
          >
            PawReach
          </span>
        </div>

        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--app-text)",
            margin: "0 0 12px",
            letterSpacing: "-0.02em",
          }}
        >
          Esta página não existe
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--app-text-muted)",
            margin: "0 0 32px",
            lineHeight: 1.6,
          }}
        >
          O endereço que procuras não foi encontrado ou foi movido.
          Regresa ao dashboard para continuar a trabalhar.
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              background: "var(--app-orange)",
              color: "white",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(249,115,22,0.25)",
            }}
          >
            <Home size={15} />
            Ir para o dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              background: "var(--app-surface)",
              color: "var(--app-text-muted)",
              border: "1px solid var(--app-border)",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={15} />
            Voltar atrás
          </button>
        </div>
      </div>
    </div>
  )
}
