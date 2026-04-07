"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Zap, Mail, Clock, GitBranch, Plus, X, Save, Check } from "lucide-react"

type TipoNo = "trigger" | "email" | "delay" | "condicao"

interface No {
  tipo: TipoNo
  titulo: string
  subtitulo?: string
}

interface AutomationCanvasProps {
  nos: No[]
  automacaoId?: string
}

const NO_CORES: Record<TipoNo, { bg: string; border: string; text: string }> = {
  trigger: { bg: "rgba(59,130,246,0.1)", border: "#3B82F6", text: "#3B82F6" },
  email: { bg: "rgba(16,185,129,0.1)", border: "#10B981", text: "#10B981" },
  delay: { bg: "rgba(100,116,139,0.1)", border: "#64748B", text: "#64748B" },
  condicao: { bg: "rgba(245,158,11,0.1)", border: "#F59E0B", text: "#F59E0B" },
}

const NO_ICONES: Record<TipoNo, React.ReactNode> = {
  trigger: <Zap size={18} />,
  email: <Mail size={18} />,
  delay: <Clock size={18} />,
  condicao: <GitBranch size={18} />,
}

const NO_LABELS: Record<TipoNo, string> = {
  trigger: "Trigger",
  email: "Email",
  delay: "Aguardar",
  condicao: "Condição",
}

export function AutomationCanvas({ nos, automacaoId }: AutomationCanvasProps) {
  const [localNos, setLocalNos] = useState<No[]>(nos)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  async function guardarNos() {
    if (!automacaoId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/automacoes/${automacaoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nos: localNos }),
      })
      if (res.ok) {
        setSaved(true)
        setIsDirty(false)
        setTimeout(() => setSaved(false), 2500)
      }
    } finally {
      setSaving(false)
    }
  }

  function addNo(tipo: TipoNo) {
    const defaults: Record<TipoNo, No> = {
      trigger: { tipo: "trigger", titulo: "Novo trigger", subtitulo: "Inscrição no segmento" },
      email: { tipo: "email", titulo: "Novo email", subtitulo: "Assunto por definir" },
      delay: { tipo: "delay", titulo: "Aguardar", subtitulo: "3 dias" },
      condicao: { tipo: "condicao", titulo: "Condição", subtitulo: "Abriu email?" },
    }
    setLocalNos((prev) => [...prev, defaults[tipo]])
    setIsDirty(true)
    setShowAddPanel(false)
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl p-6 border"
        style={{ background: "var(--app-surface)", borderColor: "var(--app-border)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--app-text)", fontFamily: "Syne, sans-serif" }}
          >
            Fluxo da automação
          </h2>
          {automacaoId && isDirty && (
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={guardarNos}
            >
              {saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? "Guardado" : "Guardar fluxo"}
            </Button>
          )}
        </div>

        {localNos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-sm mb-4" style={{ color: "var(--app-text-muted)" }}>
              Nenhum nó definido. Adiciona o primeiro nó.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-0">
            {localNos.map((no, i) => {
              const cores = NO_CORES[no.tipo] ?? NO_CORES.email
              return (
                <div key={i} className="flex flex-col items-center w-full max-w-sm">
                  <div
                    className="w-full rounded-xl p-4 border flex items-start gap-3 cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ background: cores.bg, borderColor: cores.border }}
                  >
                    <div style={{ color: cores.text }}>{NO_ICONES[no.tipo]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-xs font-bold uppercase tracking-wider"
                          style={{ color: cores.text }}
                        >
                          {NO_LABELS[no.tipo]}
                        </span>
                      </div>
                      <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>
                        {no.titulo}
                      </p>
                      {no.subtitulo && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)" }}>
                          {no.subtitulo}
                        </p>
                      )}
                    </div>
                  </div>
                  {i < localNos.length - 1 && (
                    <div
                      className="w-px h-8"
                      style={{ background: "var(--app-border)" }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Add node */}
        <div className="flex flex-col items-center mt-6">
          {localNos.length > 0 && (
            <div className="w-px h-8" style={{ background: "var(--app-border)" }} />
          )}
          {!showAddPanel ? (
            <button
              type="button"
              onClick={() => setShowAddPanel(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-dashed transition-colors hover:border-orange-500/50"
              style={{ borderColor: "var(--app-border)", color: "var(--app-text-muted)" }}
            >
              <Plus size={15} />
              Adicionar nó
            </button>
          ) : (
            <div
              className="rounded-xl p-4 border w-full max-w-sm"
              style={{ background: "var(--app-surface-2)", borderColor: "var(--app-border)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold" style={{ color: "var(--app-text)" }}>
                  Tipo de nó
                </p>
                <button onClick={() => setShowAddPanel(false)}>
                  <X size={14} style={{ color: "var(--app-text-muted)" }} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["trigger", "email", "delay", "condicao"] as TipoNo[]).map((t) => {
                  const cores = NO_CORES[t]
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addNo(t)}
                      className="flex items-center gap-2 p-3 rounded-lg border transition-colors hover:opacity-80"
                      style={{ background: cores.bg, borderColor: cores.border }}
                    >
                      <span style={{ color: cores.text }}>{NO_ICONES[t]}</span>
                      <span className="text-xs font-medium" style={{ color: cores.text }}>
                        {NO_LABELS[t]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Templates modal for automacoes page
const AUTOMATION_TEMPLATES = [
  {
    nome: "Sequência PetBiz — 5 emails",
    descricao: "Apresentação, benefícios, caso de sucesso, oferta de trial, urgência.",
    nos: [
      { tipo: "trigger", titulo: "Novo contacto inscrito", subtitulo: "Ao adicionar ao segmento" },
      { tipo: "email", titulo: "Bem-vindo à PawReach", subtitulo: "Email de apresentação" },
      { tipo: "delay", titulo: "Aguardar 2 dias", subtitulo: "2 dias" },
      { tipo: "email", titulo: "3 problemas que a PawReach resolve", subtitulo: "Email de benefícios" },
      { tipo: "delay", titulo: "Aguardar 3 dias", subtitulo: "3 dias" },
      { tipo: "email", titulo: "Caso de sucesso: Grooming Lisboa", subtitulo: "Email de prova social" },
      { tipo: "delay", titulo: "Aguardar 2 dias", subtitulo: "2 dias" },
      { tipo: "email", titulo: "30 dias grátis — sem cartão", subtitulo: "Email de oferta" },
      { tipo: "delay", titulo: "Aguardar 3 dias", subtitulo: "3 dias" },
      { tipo: "email", titulo: "Última oportunidade", subtitulo: "Email de urgência" },
    ] as No[],
  },
  {
    nome: "Reactivação de leads frios — 3 emails",
    descricao: "Sequência para reactivar contactos que não interagiram há mais de 30 dias.",
    nos: [
      { tipo: "trigger", titulo: "Lead inativo há 30 dias", subtitulo: "Trigger de inactividade" },
      { tipo: "email", titulo: "Ainda está aí?", subtitulo: "Email de reactivação" },
      { tipo: "delay", titulo: "Aguardar 5 dias", subtitulo: "5 dias" },
      { tipo: "condicao", titulo: "Abriu o email?", subtitulo: "Verificar abertura" },
      { tipo: "email", titulo: "O que mudou na PawReach", subtitulo: "Email de novidades" },
      { tipo: "delay", titulo: "Aguardar 7 dias", subtitulo: "7 dias" },
      { tipo: "email", titulo: "Deixamos-te partir?", subtitulo: "Email final de reactivação" },
    ] as No[],
  },
  {
    nome: "Onboarding de novos clientes — 4 emails",
    descricao: "Sequência de boas-vindas e activação para novos clientes pagantes.",
    nos: [
      { tipo: "trigger", titulo: "Plano activado", subtitulo: "Após pagamento confirmado" },
      { tipo: "email", titulo: "Bem-vindo ao plano pago!", subtitulo: "Email de confirmação" },
      { tipo: "delay", titulo: "Aguardar 1 dia", subtitulo: "1 dia" },
      { tipo: "email", titulo: "Primeiros 3 passos", subtitulo: "Email de onboarding" },
      { tipo: "delay", titulo: "Aguardar 3 dias", subtitulo: "3 dias" },
      { tipo: "email", titulo: "Como importar os teus contactos", subtitulo: "Tutorial" },
      { tipo: "delay", titulo: "Aguardar 7 dias", subtitulo: "7 dias" },
      { tipo: "email", titulo: "30 dias depois — como estás?", subtitulo: "Check-in" },
    ] as No[],
  },
]

interface AutomationTemplatesModalProps {
  showAsButton?: boolean
}

export function AutomationTemplatesModal({ showAsButton }: AutomationTemplatesModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function useTemplate(template: (typeof AUTOMATION_TEMPLATES)[0]) {
    setLoading(true)
    try {
      const res = await fetch("/api/automacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: template.nome,
          descricao: template.descricao,
          nos: template.nos,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setOpen(false)
        router.push(`/automacoes/${data.data.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
        style={{
          background: "var(--app-surface)",
          borderColor: "var(--app-border)",
          color: "var(--app-text)",
        }}
      >
        {showAsButton ? "Usar template" : "Usar template"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden border"
            style={{ background: "var(--app-surface)", borderColor: "var(--app-border)" }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--app-border)" }}
            >
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "Syne, sans-serif", color: "var(--app-text)" }}
              >
                Templates de automação
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5"
                style={{ color: "var(--app-text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {AUTOMATION_TEMPLATES.map((t) => (
                <div
                  key={t.nome}
                  className="flex items-start justify-between gap-4 p-4 rounded-xl border transition-colors hover:border-orange-500/40"
                  style={{ background: "var(--app-surface-2)", borderColor: "var(--app-border)" }}
                >
                  <div>
                    <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--app-text)" }}>
                      {t.nome}
                    </h3>
                    <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                      {t.descricao}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#F97316" }}>
                      {t.nos.length} nós
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={loading}
                    onClick={() => useTemplate(t)}
                  >
                    Usar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
