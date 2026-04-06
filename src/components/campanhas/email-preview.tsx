"use client"

import { useState } from "react"
import { Monitor, Smartphone } from "lucide-react"

interface EmailPreviewProps {
  html: string
  assunto?: string
}

export function EmailPreview({ html, assunto }: EmailPreviewProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")

  const wrappedHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.6; color: #1a1a1a; background: #fff; }
  a { color: #F97316; }
  p { margin: 0 0 12px; }
</style>
</head>
<body>${html}</body>
</html>`

  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--app-border)" }}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "var(--app-surface-2)", borderColor: "var(--app-border)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: "rgba(249,115,22,0.15)", color: "#F97316" }}
          >
            PREVIEW
          </span>
          {assunto && (
            <span className="text-xs truncate max-w-xs" style={{ color: "var(--app-text-muted)" }}>
              {assunto}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDevice("desktop")}
            className="p-1.5 rounded-md transition-colors"
            style={{
              background: device === "desktop" ? "var(--app-surface)" : "transparent",
              color: device === "desktop" ? "var(--app-text)" : "var(--app-text-muted)",
            }}
          >
            <Monitor size={15} />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className="p-1.5 rounded-md transition-colors"
            style={{
              background: device === "mobile" ? "var(--app-surface)" : "transparent",
              color: device === "mobile" ? "var(--app-text)" : "var(--app-text-muted)",
            }}
          >
            <Smartphone size={15} />
          </button>
        </div>
      </div>

      {/* Preview frame */}
      <div
        className="flex items-start justify-center p-6 overflow-auto"
        style={{ background: "#e2e8f0", minHeight: "400px" }}
      >
        <div
          className="bg-white shadow-lg rounded-lg overflow-hidden"
          style={{ width: device === "desktop" ? "600px" : "375px", minHeight: "300px" }}
        >
          {html ? (
            <iframe
              srcDoc={wrappedHtml}
              className="w-full border-0"
              style={{ height: "500px" }}
              title="Email preview"
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-gray-400">O conteúdo aparece aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
