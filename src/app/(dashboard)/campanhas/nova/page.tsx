"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CampaignEditor } from "@/components/campanhas/campaign-editor"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useToast } from "@/components/ui/toast"
import { ArrowLeft, ArrowRight, Send, Eye } from "lucide-react"
import { z } from "zod"

const stepSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  assunto: z.string().min(2, "Assunto obrigatório"),
  preheader: z.string().optional(),
  testAbEnabled: z.boolean().optional(),
  assuntoB: z.string().optional(),
  conteudoHtml: z.string().min(10, "Conteúdo obrigatório"),
  agendadoPara: z.string().optional(),
})

type FormData = z.infer<typeof stepSchema>

const STEPS = ["Detalhes", "Destinatários", "Conteúdo", "Revisão"]

export default function NovaCampanhaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Partial<FormData>>({
    testAbEnabled: false,
    conteudoHtml: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [segmentoOpcao, setSegmentoOpcao] = useState<"todos" | "segmento">("todos")
  const [segmentId, setSegmentId] = useState<string>("")
  const [envioImediato, setEnvioImediato] = useState(true)

  function update(field: keyof FormData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  function validateStep(): boolean {
    const newErrors: Record<string, string> = {}
    if (step === 0) {
      if (!form.nome || form.nome.length < 2) newErrors.nome = "Nome obrigatório"
      if (!form.assunto || form.assunto.length < 2) newErrors.assunto = "Assunto obrigatório"
    }
    if (step === 2) {
      if (!form.conteudoHtml || form.conteudoHtml.length < 10) newErrors.conteudoHtml = "Conteúdo obrigatório"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(imediato: boolean) {
    setLoading(true)
    try {
      const body = {
        nome: form.nome,
        assunto: form.assunto,
        preheader: form.preheader,
        conteudoHtml: form.conteudoHtml,
        testAbEnabled: form.testAbEnabled,
        assuntoB: form.assuntoB,
        segmentId: segmentoOpcao === "segmento" ? segmentId : undefined,
        agendadoPara: !imediato && form.agendadoPara ? form.agendadoPara : undefined,
      }
      const res = await fetch("/api/campanhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        if (imediato) {
          await fetch(`/api/campanhas/${data.data.id}/enviar`, { method: "POST" })
          toast("Campanha criada e enviada.")
        } else {
          toast("Campanha criada com sucesso.")
        }
        router.push("/campanhas")
      } else {
        setErrors({ geral: data.error ?? "Erro ao criar campanha" })
      }
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: "var(--app-surface-2)",
    border: "1px solid var(--app-border)",
    color: "var(--app-text)",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Breadcrumb
          items={[
            { label: "Campanhas", href: "/campanhas" },
            { label: "Nova campanha" },
          ]}
        />
        <h1
          className="text-2xl font-bold mt-3"
          style={{ fontFamily: "Syne, sans-serif", color: "var(--app-text)" }}
        >
          Nova campanha
        </h1>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: i === step ? "#F97316" : i < step ? "rgba(249,115,22,0.2)" : "var(--app-surface-2)",
                color: i === step ? "#fff" : i < step ? "#F97316" : "var(--app-text-muted)",
              }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: i === step ? "rgba(255,255,255,0.2)" : "transparent",
                }}
              >
                {i + 1}
              </span>
              {s}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-8 h-px mx-1"
                style={{ background: i < step ? "#F97316" : "var(--app-border)" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Detalhes */}
      {step === 0 && (
        <Card>
          <div className="space-y-4">
            <div>
              <label htmlFor="camp-nome" className="block text-sm font-medium mb-1.5" style={{ color: "var(--app-text)" }}>
                Nome da campanha *
              </label>
              <input
                id="camp-nome"
                type="text"
                placeholder="Ex: Newsletter Setembro 2026"
                value={form.nome ?? ""}
                onChange={(e) => update("nome", e.target.value)}
                style={inputStyle}
              />
              {errors.nome && (
                <p className="text-xs mt-1" style={{ color: "var(--app-red)" }}>{errors.nome}</p>
              )}
            </div>

            <div>
              <label htmlFor="camp-assunto" className="block text-sm font-medium mb-1.5" style={{ color: "var(--app-text)" }}>
                Assunto do email *
              </label>
              <input
                id="camp-assunto"
                type="text"
                placeholder="Ex: Novidades para o teu negócio pet 🐾"
                value={form.assunto ?? ""}
                onChange={(e) => update("assunto", e.target.value)}
                style={inputStyle}
              />
              {errors.assunto && (
                <p className="text-xs mt-1" style={{ color: "var(--app-red)" }}>{errors.assunto}</p>
              )}
            </div>

            <div>
              <label htmlFor="camp-preheader" className="block text-sm font-medium mb-1.5" style={{ color: "var(--app-text)" }}>
                Pré-cabeçalho
              </label>
              <input
                id="camp-preheader"
                type="text"
                placeholder="Texto que aparece no preview do email"
                value={form.preheader ?? ""}
                onChange={(e) => update("preheader", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ background: "var(--app-surface-2)" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>
                  Teste A/B de assunto
                </p>
                <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                  Testa dois assuntos diferentes
                </p>
              </div>
              <button
                type="button"
                onClick={() => update("testAbEnabled", !form.testAbEnabled)}
                className="w-11 h-6 rounded-full transition-colors relative"
                style={{ background: form.testAbEnabled ? "#F97316" : "var(--app-border)" }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ left: form.testAbEnabled ? "calc(100% - 22px)" : "2px" }}
                />
              </button>
            </div>

            {form.testAbEnabled && (
              <div>
                <label htmlFor="camp-assunto-b" className="block text-sm font-medium mb-1.5" style={{ color: "var(--app-text)" }}>
                  Assunto B
                </label>
                <input
                  id="camp-assunto-b"
                  type="text"
                  placeholder="Variante B do assunto"
                  value={form.assuntoB ?? ""}
                  onChange={(e) => update("assuntoB", e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 1: Destinatários */}
      {step === 1 && (
        <Card>
          <div className="space-y-4">
            <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>
              Quem recebe esta campanha?
            </p>
            <div className="space-y-2">
              {[
                { value: "todos", label: "Todos os contactos", desc: "Envia para toda a lista" },
                { value: "segmento", label: "Segmento específico", desc: "Filtra por segmento criado" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-colors"
                  style={{
                    background: segmentoOpcao === opt.value ? "rgba(249,115,22,0.08)" : "var(--app-surface-2)",
                    border: `1px solid ${segmentoOpcao === opt.value ? "#F97316" : "var(--app-border)"}`,
                  }}
                >
                  <input
                    type="radio"
                    name="destinatarios"
                    value={opt.value}
                    checked={segmentoOpcao === opt.value}
                    onChange={() => setSegmentoOpcao(opt.value as "todos" | "segmento")}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>
                      {opt.label}
                    </p>
                    <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                      {opt.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            {segmentoOpcao === "segmento" && (
              <div>
                <label htmlFor="camp-segment-id" className="block text-sm font-medium mb-1.5" style={{ color: "var(--app-text)" }}>
                  ID do segmento
                </label>
                <input
                  id="camp-segment-id"
                  type="text"
                  placeholder="Cole o ID do segmento"
                  value={segmentId}
                  onChange={(e) => setSegmentId(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 2: Conteúdo */}
      {step === 2 && (
        <div className="space-y-4">
          <CampaignEditor
            value={form.conteudoHtml ?? ""}
            onChange={(html) => update("conteudoHtml", html)}
          />
          {errors.conteudoHtml && (
            <p className="text-xs" style={{ color: "var(--app-red)" }}>{errors.conteudoHtml}</p>
          )}
        </div>
      )}

      {/* Step 3: Revisão */}
      {step === 3 && (
        <Card>
          <div className="space-y-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--app-text)", fontFamily: "Syne, sans-serif" }}>
              Resumo da campanha
            </h2>
            <div className="space-y-3">
              {[
                { label: "Nome", value: form.nome },
                { label: "Assunto", value: form.assunto },
                { label: "Pré-cabeçalho", value: form.preheader || "—" },
                { label: "Teste A/B", value: form.testAbEnabled ? `Sim — assunto B: ${form.assuntoB || "não definido"}` : "Não" },
                { label: "Destinatários", value: segmentoOpcao === "todos" ? "Todos os contactos" : `Segmento: ${segmentId || "não seleccionado"}` },
              ].map((row) => (
                <div key={row.label} className="flex gap-4">
                  <span className="text-sm w-32 shrink-0" style={{ color: "var(--app-text-muted)" }}>
                    {row.label}
                  </span>
                  <span className="text-sm" style={{ color: "var(--app-text)" }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t" style={{ borderColor: "var(--app-border)" }}>
              <p className="text-sm font-medium mb-3" style={{ color: "var(--app-text)" }}>
                Quando enviar?
              </p>
              <div className="flex items-center gap-3">
                {[
                  { value: true, label: "Enviar agora" },
                  { value: false, label: "Agendar" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setEnvioImediato(opt.value)}
                    className="px-4 py-2 text-sm rounded-lg border transition-colors"
                    style={{
                      background: envioImediato === opt.value ? "#F97316" : "var(--app-surface-2)",
                      borderColor: envioImediato === opt.value ? "#F97316" : "var(--app-border)",
                      color: envioImediato === opt.value ? "#fff" : "var(--app-text)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {!envioImediato && (
                <input
                  type="datetime-local"
                  value={form.agendadoPara ?? ""}
                  onChange={(e) => update("agendadoPara", e.target.value)}
                  style={{ ...inputStyle, marginTop: "12px" }}
                />
              )}
            </div>

            {errors.geral && (
              <p className="text-sm" style={{ color: "var(--app-red)" }}>{errors.geral}</p>
            )}
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ArrowLeft size={15} />
          Anterior
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            variant="primary"
            onClick={() => {
              if (validateStep()) setStep((s) => s + 1)
            }}
          >
            Próximo
            <ArrowRight size={15} />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              loading={loading}
              onClick={() => handleSubmit(false)}
            >
              <Eye size={15} />
              Guardar rascunho
            </Button>
            <Button
              variant="primary"
              loading={loading}
              onClick={() => handleSubmit(envioImediato)}
            >
              <Send size={15} />
              {envioImediato ? "Enviar agora" : "Agendar envio"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
