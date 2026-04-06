import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return new NextResponse(unsubscribePage("Token inválido.", false), {
      headers: { "Content-Type": "text/html" },
    })
  }

  // Token = base64(contactId:userId)
  let contactId: string
  let userId: string
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const parts = decoded.split(":")
    if (parts.length !== 2) throw new Error()
    contactId = parts[0]
    userId = parts[1]
  } catch {
    return new NextResponse(unsubscribePage("Link inválido ou expirado.", false), {
      headers: { "Content-Type": "text/html" },
    })
  }

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, userId, deletedAt: null },
  })

  if (!contact) {
    return new NextResponse(unsubscribePage("Contacto não encontrado.", false), {
      headers: { "Content-Type": "text/html" },
    })
  }

  if (contact.unsubscribed) {
    return new NextResponse(
      unsubscribePage("Já estás dessubscrito. Não receberás mais emails.", true),
      { headers: { "Content-Type": "text/html" } }
    )
  }

  await prisma.contact.update({
    where: { id: contactId },
    data: { unsubscribed: true },
  })

  return new NextResponse(
    unsubscribePage("Dessubscrito com sucesso. Não receberás mais emails desta lista.", true),
    { headers: { "Content-Type": "text/html" } }
  )
}

function unsubscribePage(message: string, success: boolean): string {
  const color = success ? "#10B981" : "#EF4444"
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dessubscrição — PawReach</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0F172A; color: #F8FAFC; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #1E293B; border: 1px solid rgba(148,163,184,0.12); border-radius: 16px; padding: 40px 32px; max-width: 420px; width: 100%; text-align: center; }
    .icon { font-size: 48px; margin-bottom: 20px; }
    h1 { font-size: 20px; font-weight: 700; color: #F8FAFC; margin-bottom: 12px; }
    p { font-size: 14px; color: #94A3B8; line-height: 1.6; }
    .brand { margin-top: 32px; font-size: 12px; color: #64748B; }
    .brand span { color: #F97316; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? "✅" : "❌"}</div>
    <h1 style="color: ${color}">${success ? "Dessubscrição confirmada" : "Erro"}</h1>
    <p>${message}</p>
    <p class="brand">Enviado por <span>PawReach</span></p>
  </div>
</body>
</html>`
}
