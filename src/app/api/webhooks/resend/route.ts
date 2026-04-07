import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createHmac, timingSafeEqual } from "crypto"

// Verifica assinatura Resend (header "svix-signature" / "webhook-id" / "webhook-timestamp")
function verifyResendSignature(request: NextRequest, rawBody: string): boolean {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  if (!webhookSecret) return true // Em dev, sem segredo configurado, aceitar tudo

  const msgId = request.headers.get("webhook-id")
  const msgTimestamp = request.headers.get("webhook-timestamp")
  const msgSignature = request.headers.get("webhook-signature")

  if (!msgId || !msgTimestamp || !msgSignature) return false

  // Verificar que o timestamp não é demasiado antigo (5 minutos)
  const ts = parseInt(msgTimestamp, 10)
  if (isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false

  const toSign = `${msgId}.${msgTimestamp}.${rawBody}`
  const secret = webhookSecret.startsWith("whsec_")
    ? Buffer.from(webhookSecret.slice(6), "base64")
    : Buffer.from(webhookSecret)

  const computedHmac = createHmac("sha256", secret).update(toSign).digest("base64")
  const computedSig = `v1,${computedHmac}`

  // msgSignature pode conter múltiplas assinaturas separadas por espaço
  const signatures = msgSignature.split(" ")
  return signatures.some((sig) => {
    try {
      return timingSafeEqual(Buffer.from(sig), Buffer.from(computedSig))
    } catch {
      return false
    }
  })
}

// Resend envia eventos como: email.opened, email.clicked, email.bounced, email.complained
export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  if (!verifyResendSignature(request, rawBody)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const type = body.type as string
  const data = body.data as Record<string, unknown> | undefined

  if (!type || !data) {
    return NextResponse.json({ ok: true })
  }

  const resendId = data.email_id as string | undefined
  if (!resendId) {
    return NextResponse.json({ ok: true })
  }

  const log = await prisma.emailLog.findFirst({
    where: { resendId },
    select: { id: true, contactId: true, campaignId: true, aberto: true, clicado: true },
  })

  if (!log) {
    return NextResponse.json({ ok: true })
  }

  if (type === "email.opened" && !log.aberto) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { aberto: true, abertoEm: new Date(), status: "ABERTO" },
    })
    // Actualizar stats da campanha
    if (log.campaignId) {
      await prisma.campaignStats.upsert({
        where: { campaignId: log.campaignId },
        create: { campaignId: log.campaignId, totalAbertos: 1 },
        update: { totalAbertos: { increment: 1 } },
      })
    }
  } else if (type === "email.clicked" && !log.clicado) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { clicado: true, clicadoEm: new Date(), status: "CLICADO" },
    })
    if (log.campaignId) {
      await prisma.campaignStats.upsert({
        where: { campaignId: log.campaignId },
        create: { campaignId: log.campaignId, totalCliques: 1 },
        update: { totalCliques: { increment: 1 } },
      })
    }
  } else if (type === "email.bounced") {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { bounce: true, status: "BOUNCE" },
    })
    if (log.campaignId) {
      await prisma.campaignStats.upsert({
        where: { campaignId: log.campaignId },
        create: { campaignId: log.campaignId, totalBounces: 1 },
        update: { totalBounces: { increment: 1 } },
      })
    }
    if (log.contactId) {
      await prisma.contact.update({
        where: { id: log.contactId },
        data: { unsubscribed: true, unsubscribedAt: new Date() },
      })
    }
  } else if (type === "email.complained") {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "SPAM" },
    })
    if (log.campaignId) {
      await prisma.campaignStats.upsert({
        where: { campaignId: log.campaignId },
        create: { campaignId: log.campaignId, totalUnsubs: 1 },
        update: { totalUnsubs: { increment: 1 } },
      })
    }
    if (log.contactId) {
      await prisma.contact.update({
        where: { id: log.contactId },
        data: { unsubscribed: true, unsubscribedAt: new Date() },
      })
    }
  }

  return NextResponse.json({ ok: true })
}
