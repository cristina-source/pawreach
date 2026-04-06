import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { anthropic, SYSTEM_PROMPT_PETBIZ } from "@/lib/anthropic"
import { iaGerarSchema } from "@/lib/validations"
import { PLANS } from "@/lib/plans"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 })
  }

  const parsed = iaGerarSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" },
      { status: 422 }
    )
  }

  const userId = session.user.id

  // Verificar limite de gerações IA
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, aiGenerationsUsed: true, aiGenerationsResetAt: true },
  })

  const plano = subscription?.plan ?? "FREE"
  const limites = PLANS[plano as keyof typeof PLANS].limites
  const usado = subscription?.aiGenerationsUsed ?? 0

  if (limites.geracoesIa !== -1) {
    if (limites.geracoesIa === 0) {
      return NextResponse.json(
        { success: false, error: "O teu plano não inclui gerações IA. Faz upgrade para continuar." },
        { status: 403 }
      )
    }
    if (usado >= limites.geracoesIa) {
      return NextResponse.json(
        { success: false, error: `Limite de ${limites.geracoesIa} gerações IA atingido este mês. Faz upgrade do plano.` },
        { status: 403 }
      )
    }
  }

  const { tipoEmail, tipoNegocio, tom, objetivo, contextoAdicional } = parsed.data

  const userPrompt = `Gera um email de ${tipoEmail} para um negócio do tipo "${tipoNegocio}".
Tom: ${tom}
Objetivo: ${objetivo}
${contextoAdicional ? `Contexto adicional: ${contextoAdicional}` : ""}

Devolve APENAS o objeto JSON especificado, sem texto adicional.`

  let emailGerado: Record<string, unknown>

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey || anthropicKey === "TODO") {
    return NextResponse.json(
      { success: false, error: "Geração IA não configurada. Adiciona a ANTHROPIC_API_KEY no .env.local." },
      { status: 503 }
    )
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT_PETBIZ,
      messages: [{ role: "user", content: userPrompt }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Resposta inválida da IA")
    }

    emailGerado = JSON.parse(jsonMatch[0])
  } catch (e) {
    console.error("Erro na API Anthropic:", e)
    return NextResponse.json(
      { success: false, error: "Erro ao gerar email. Tenta novamente." },
      { status: 500 }
    )
  }

  // Actualizar contador de gerações
  if (subscription) {
    await prisma.subscription.update({
      where: { userId },
      data: { aiGenerationsUsed: { increment: 1 } },
    })
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId,
      acao: "GERAR_COPY_IA",
      entidade: "AiTemplate",
      detalhes: { tipoEmail, tipoNegocio, tom, objetivo },
    },
  })

  return NextResponse.json({ success: true, data: emailGerado })
}
