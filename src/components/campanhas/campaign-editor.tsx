"use client"

import { useState } from "react"
import { EmailPreview } from "./email-preview"
import { Bold, Italic, Link2, Hash, FileCode } from "lucide-react"

interface CampaignEditorProps {
  value: string
  onChange: (html: string) => void
  assunto?: string
}

const VARIAVEIS = [
  { label: "{{primeiro_nome}}", title: "Primeiro nome" },
  { label: "{{nome}}", title: "Nome completo" },
  { label: "{{tipo_negocio}}", title: "Tipo de negócio" },
  { label: "{{cidade}}", title: "Cidade" },
]

const TEMPLATE_INICIAL = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0F172A;padding:24px 32px;text-align:center;">
              <span style="font-size:20px;font-weight:700;color:#F97316;letter-spacing:-0.02em;">🐾 PawReach</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#0F172A;line-height:1.3;">
                Olá, {{primeiro_nome}}!
              </h1>
              <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
                Escreve aqui o corpo do email. Personaliza com o nome do negócio, cidade, etc.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Temos a solução perfeita para o teu {{tipo_negocio}} em {{cidade}}.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#F97316;border-radius:8px;padding:12px 24px;">
                    <a href="https://pawreach.pt" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;">
                      Saber mais →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;padding:24px 32px;border-top:1px solid #E5E7EB;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;">
                Enviado por PawReach · Estás a receber este email porque te inscreveste na nossa lista.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

const textareaStyle = {
  background: "var(--app-surface-2)",
  border: "1px solid var(--app-border)",
  color: "var(--app-text)",
  borderRadius: "0 0 8px 8px",
  padding: "14px",
  fontSize: "13px",
  width: "100%",
  outline: "none",
  resize: "vertical" as const,
  fontFamily: "monospace",
  lineHeight: "1.6",
}

export function CampaignEditor({ value, onChange, assunto }: CampaignEditorProps) {
  const [tab, setTab] = useState<"editor" | "preview">("editor")

  function insertAt(snippet: string) {
    const el = document.getElementById("campaign-editor-textarea") as HTMLTextAreaElement | null
    if (!el) {
      onChange(value + snippet)
      return
    }
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const newVal = value.slice(0, start) + snippet + value.slice(end)
    onChange(newVal)
    requestAnimationFrame(() => {
      el.selectionStart = start + snippet.length
      el.selectionEnd = start + snippet.length
      el.focus()
    })
  }

  function wrapSelection(before: string, after: string) {
    const el = document.getElementById("campaign-editor-textarea") as HTMLTextAreaElement | null
    if (!el) return
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    const selected = value.slice(start, end)
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end)
    onChange(newVal)
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-1">
        {["editor", "preview"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t as "editor" | "preview")}
            className="px-4 py-1.5 text-sm rounded-lg font-medium transition-colors"
            style={{
              background: tab === t ? "#F97316" : "var(--app-surface-2)",
              color: tab === t ? "#fff" : "var(--app-text-muted)",
            }}
          >
            {t === "editor" ? "Editor" : "Preview"}
          </button>
        ))}
      </div>

      {tab === "editor" && (
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--app-border)" }}>
          {/* Toolbar */}
          <div
            className="flex items-center gap-1 px-3 py-2 border-b flex-wrap"
            style={{ background: "var(--app-surface-2)", borderColor: "var(--app-border)" }}
          >
            <button
              type="button"
              title="Negrito"
              onClick={() => wrapSelection("<strong>", "</strong>")}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              style={{ color: "var(--app-text-muted)" }}
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              title="Itálico"
              onClick={() => wrapSelection("<em>", "</em>")}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              style={{ color: "var(--app-text-muted)" }}
            >
              <Italic size={14} />
            </button>
            <button
              type="button"
              title="Link"
              onClick={() => wrapSelection('<a href="URL">', "</a>")}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              style={{ color: "var(--app-text-muted)" }}
            >
              <Link2 size={14} />
            </button>

            <div className="w-px h-4 mx-1" style={{ background: "var(--app-border)" }} />

            <button
              type="button"
              title="Carregar template"
              onClick={() => { if (!value || confirm("Substituir conteúdo pelo template?")) onChange(TEMPLATE_INICIAL) }}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-white/10 transition-colors"
              style={{ color: "var(--app-text-muted)" }}
            >
              <FileCode size={12} />
              Template
            </button>

            <div className="w-px h-4 mx-1" style={{ background: "var(--app-border)" }} />

            <div className="flex items-center gap-1">
              <Hash size={12} style={{ color: "var(--app-text-muted)" }} />
              <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                Variáveis:
              </span>
              {VARIAVEIS.map((v) => (
                <button
                  key={v.label}
                  type="button"
                  title={v.title}
                  onClick={() => insertAt(v.label)}
                  className="px-1.5 py-0.5 rounded text-xs font-mono hover:bg-white/10 transition-colors"
                  style={{
                    background: "var(--app-surface)",
                    color: "#F97316",
                    border: "1px solid var(--app-border)",
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            id="campaign-editor-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escreve o HTML do email aqui... Podes usar as variáveis acima para personalizar."
            rows={20}
            style={textareaStyle}
          />
        </div>
      )}

      {tab === "preview" && (
        <EmailPreview html={value} assunto={assunto} />
      )}
    </div>
  )
}
