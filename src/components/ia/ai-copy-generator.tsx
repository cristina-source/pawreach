"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Wand2, Copy, Save, ArrowRight, Clock } from "lucide-react"

const TIPOS_EMAIL = [
  "Cold outreach",
  "Follow-up",
  "Nurturing",
  "Oferta",
  "Urgência",
  "Caso de sucesso",
]

const PERFIS_DESTINATARIO = [
  "Pet shop",
  "Grooming",
  "Clínica vet",
  "Hotel pets",
  "Adestrador",
  "Pet sitter",
]

const TONS = [
  "Profissional",
  "Próximo e empático",
  "Directo e urgente",
  "Educativo",
  "Inspiracional",
]

const OBJETIVOS = [
  "Gerar curiosidade",
  "Agendar demo",
  "Converter para trial",
  "Reactivar lead frio",
]

interface EmailGerado {
  assunto: string
  assuntoB?: string
  preheader?: string
  corpo: string
  cta?: string
  ctaAlternativo?: string
  ps?: string
  avisoTom?: string
}

interface HistoricoItem {
  tipo: string
  negocio: string
  assunto: string
  gerado: EmailGerado
  ts: number
}

const selectStyle = {
  background: "var(--app-surface-2)",
  border: "1px solid var(--app-border)",
  color: "var(--app-text)",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
}

export function AiCopyGenerator() {
  const router = useRouter()
  const [tipoEmail, setTipoEmail] = useState(TIPOS_EMAIL[0])
  const [tipoNegocio, setTipoNegocio] = useState(PERFIS_DESTINATARIO[0])
  const [tom, setTom] = useState(TONS[0])
  const [objetivo, setObjetivo] = useState(OBJETIVOS[0])
  const [contexto, setContexto] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resultado, setResultado] = useState<EmailGerado | null>(null)
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [copiado, setCopiado] = useState(false)
  const [guardado, setGuardado] = useState(false)

  // Carregar histórico do localStorage na montagem
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pawreach_ia_historico")
      if (saved) setHistorico(JSON.parse(saved))
    } catch { /* ignorar erros de parse */ }
  }, [])

  async function handleGerar() {
    setLoading(true)
    setError("")
    setResultado(null)

    try {
      const res = await fetch("/api/ia/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoEmail,
          tipoNegocio,
          tom,
          objetivo,
          contextoAdicional: contexto || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResultado(data.data)
        setHistorico((prev) => {
          const next = [
            {
              tipo: tipoEmail,
              negocio: tipoNegocio,
              assunto: data.data.assunto,
              gerado: data.data,
              ts: Date.now(),
            },
            ...prev.slice(0, 9),
          ]
          try { localStorage.setItem("pawreach_ia_historico", JSON.stringify(next)) } catch { /* quota exceeded */ }
          return next
        })
      } else {
        setError(data.error ?? "Erro ao gerar email.")
      }
    } catch {
      setError("Erro de rede. Tenta novamente.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGuardar() {
    if (!resultado) return
    setGuardado(false)
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: `${tipoEmail} — ${tipoNegocio}`,
          tipo: tipoEmail,
          tom,
          objetivo,
          assunto: resultado.assunto,
          preheader: resultado.preheader,
          corpo: resultado.corpo,
          cta: resultado.cta,
          ps: resultado.ps,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setGuardado(true)
        setTimeout(() => setGuardado(false), 2500)
      }
    } catch {
      // silently fail
    }
  }

  async function handleCopiar() {
    if (!resultado) return
    const text = [
      `Assunto: ${resultado.assunto}`,
      resultado.assuntoB ? `Assunto B: ${resultado.assuntoB}` : "",
      resultado.preheader ? `Pré-cabeçalho: ${resultado.preheader}` : "",
      "",
      resultado.corpo.replace(/<[^>]+>/g, ""),
      resultado.cta ? `\nCTA: ${resultado.cta}` : "",
      resultado.ps ? `\n${resultado.ps}` : "",
    ]
      .filter(Boolean)
      .join("\n")
    await navigator.clipboard.writeText(text)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Formulário */}
      <div className="space-y-4">
        <Card>
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--app-text)", fontFamily: "Syne, sans-serif" }}
          >
            Configurar email
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--app-text-muted)" }}>
                Tipo de email
              </label>
              <select value={tipoEmail} onChange={(e) => setTipoEmail(e.target.value)} style={selectStyle}>
                {TIPOS_EMAIL.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--app-text-muted)" }}>
                Perfil do destinatário
              </label>
              <select value={tipoNegocio} onChange={(e) => setTipoNegocio(e.target.value)} style={selectStyle}>
                {PERFIS_DESTINATARIO.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--app-text-muted)" }}>
                Tom
              </label>
              <select value={tom} onChange={(e) => setTom(e.target.value)} style={selectStyle}>
                {TONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--app-text-muted)" }}>
                Objectivo
              </label>
              <select value={objetivo} onChange={(e) => setObjetivo(e.target.value)} style={selectStyle}>
                {OBJETIVOS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: "var(--app-text-muted)" }}>
                Personalização extra (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: negócio em Lisboa chamado PetWorld"
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                style={selectStyle}
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm" style={{ color: "var(--app-red)" }}>{error}</p>
          )}

          <div className="mt-4">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              onClick={handleGerar}
            >
              <Wand2 size={16} />
              Gerar email
            </Button>
          </div>
        </Card>

        {/* Histórico */}
        {historico.length > 0 && (
          <Card padding="sm">
            <h3
              className="text-xs font-semibold mb-3 flex items-center gap-1.5"
              style={{ color: "var(--app-text-muted)" }}
            >
              <Clock size={13} />
              Gerados nesta sessão
            </h3>
            <div className="space-y-2">
              {historico.map((h) => (
                <button
                  key={h.ts}
                  type="button"
                  onClick={() => setResultado(h.gerado)}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ background: "var(--app-surface-2)" }}
                >
                  <p className="text-xs font-medium truncate" style={{ color: "var(--app-text)" }}>
                    {h.assunto}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)" }}>
                    {h.tipo} · {h.negocio}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Output */}
      <div>
        {!resultado && !loading && (
          <div
            className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-20 text-center px-4"
            style={{ borderColor: "var(--app-border)" }}
          >
            <Wand2 size={32} className="mb-3" style={{ color: "var(--app-text-muted)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>
              O email gerado aparece aqui
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--app-text-muted)" }}>
              Configura as opções e clica em "Gerar email"
            </p>
          </div>
        )}

        {loading && (
          <div
            className="rounded-xl border flex flex-col items-center justify-center py-20"
            style={{ background: "var(--app-surface)", borderColor: "var(--app-border)" }}
          >
            <div className="animate-spin w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent mb-3" />
            <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
              A gerar o email...
            </p>
          </div>
        )}

        {resultado && !loading && (
          <Card className="space-y-4">
            {/* Assunto */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--app-text-muted)" }}>
                  Assunto
                </span>
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>
                {resultado.assunto}
              </p>
              {resultado.assuntoB && (
                <div className="flex items-center gap-2 mt-1.5">
                  <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
                    {resultado.assuntoB}
                  </p>
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-bold"
                    style={{ background: "rgba(59,130,246,0.15)", color: "#3B82F6" }}
                  >
                    A/B
                  </span>
                </div>
              )}
            </div>

            {resultado.preheader && (
              <div className="pt-3 border-t" style={{ borderColor: "var(--app-border)" }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--app-text-muted)" }}>
                  Pré-cabeçalho
                </p>
                <p className="text-sm" style={{ color: "var(--app-text)" }}>
                  {resultado.preheader}
                </p>
              </div>
            )}

            {/* Corpo */}
            <div className="pt-3 border-t" style={{ borderColor: "var(--app-border)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--app-text-muted)" }}>
                Corpo do email
              </p>
              <div
                className="text-sm rounded-lg p-4 prose prose-sm max-w-none"
                style={{
                  background: "var(--app-surface-2)",
                  color: "var(--app-text)",
                  lineHeight: "1.7",
                }}
                dangerouslySetInnerHTML={{ __html: resultado.corpo }}
              />
            </div>

            {resultado.cta && (
              <div className="pt-3 border-t" style={{ borderColor: "var(--app-border)" }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--app-text-muted)" }}>
                  CTA
                </p>
                <span
                  className="inline-block px-4 py-2 rounded-lg text-sm font-bold"
                  style={{ background: "#F97316", color: "#fff" }}
                >
                  {resultado.cta}
                </span>
                {resultado.ctaAlternativo && (
                  <p className="text-xs mt-1" style={{ color: "var(--app-text-muted)" }}>
                    Alternativo: {resultado.ctaAlternativo}
                  </p>
                )}
              </div>
            )}

            {resultado.ps && (
              <p className="text-sm italic pt-2 border-t" style={{ color: "var(--app-text-muted)", borderColor: "var(--app-border)" }}>
                {resultado.ps}
              </p>
            )}

            {resultado.avisoTom && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{ background: "rgba(245,158,11,0.1)" }}
              >
                <span className="text-xs font-bold" style={{ color: "#F59E0B" }}>
                  Nota de tom:
                </span>
                <p className="text-xs" style={{ color: "#F59E0B" }}>
                  {resultado.avisoTom}
                </p>
              </div>
            )}

            {/* Acções */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t" style={{ borderColor: "var(--app-border)" }}>
              <Button variant="primary" size="sm" onClick={handleGuardar}>
                <Save size={14} />
                {guardado ? "Guardado!" : "Guardar template"}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCopiar}>
                <Copy size={14} />
                {copiado ? "Copiado!" : "Copiar"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/campanhas/nova")}
              >
                Usar em campanha
                <ArrowRight size={14} />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
