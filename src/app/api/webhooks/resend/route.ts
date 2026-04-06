import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Resend envia eventos como: email.opened, email.clicked, email.bounced, email.complained
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
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
  })

  if (!log) {
    return NextResponse.json({ ok: true })
  }

  if (type === "email.opened") {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { aberto: true, abertoEm: new Date(), status: "ABERTO" },
    })
  } else if (type === "email.clicked") {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { clicado: true, clicadoEm: new Date(), status: "CLICADO" },
    })
  } else if (type === "email.bounced") {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "BOUNCE" },
    })
    // Marcar contacto como bounce
    if (log.contactId) {
      await prisma.contact.update({
        where: { id: log.contactId },
        data: { unsubscribed: true },
      })
    }
  } else if (type === "email.complained") {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "SPAM" },
    })
    if (log.contactId) {
      await prisma.contact.update({
        where: { id: log.contactId },
        data: { unsubscribed: true },
      })
    }
  }

  return NextResponse.json({ ok: true })
}
