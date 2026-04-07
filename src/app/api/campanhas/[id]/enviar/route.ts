import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { PLANS } from "@/lib/plans"

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const userId = session.user.id

  const campanha = await prisma.campaign.findFirst({
    where: { id, userId, deletedAt: null },
    include: { segment: { include: { segmentContacts: { include: { contact: true } } } } },
  })

  if (!campanha) {
    return NextResponse.json({ success: false, error: "Campanha não encontrada" }, { status: 404 })
  }

  if (campanha.status === "ENVIADA") {
    return NextResponse.json({ success: false, error: "Campanha já foi enviada" }, { status: 409 })
  }

  // Verificar limites do plano
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true },
  })

  const plano = subscription?.plan ?? "FREE"
  const limites = PLANS[plano as keyof typeof PLANS].limites

  const emailsMes = await prisma.emailLog.count({
    where: {
      userId,
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  })

  if (limites.emailsMes !== -1 && emailsMes >= limites.emailsMes) {
    return NextResponse.json(
      { success: false, error: "Limite de emails mensais atingido. Faz upgrade do teu plano." },
      { status: 403 }
    )
  }

  // Obter destinatários
  type Destinatario = { id: string; email: string; nome: string; tipoNegocio?: string | null; cidade?: string | null }
  let destinatarios: Destinatario[] = []

  if (campanha.segment) {
    destinatarios = campanha.segment.segmentContacts
      .filter((sc) => !sc.contact.deletedAt && !sc.contact.unsubscribed)
      .map((sc) => ({
        id: sc.contact.id,
        email: sc.contact.email,
        nome: sc.contact.nome,
        tipoNegocio: sc.contact.tipoNegocio,
        cidade: sc.contact.cidade,
      }))
  } else {
    const contactos = await prisma.contact.findMany({
      where: { userId, deletedAt: null, unsubscribed: false },
      select: { id: true, email: true, nome: true, tipoNegocio: true, cidade: true },
    })
    destinatarios = contactos
  }

  if (destinatarios.length === 0) {
    return NextResponse.json({ success: false, error: "Nenhum destinatário disponível" }, { status: 400 })
  }

  // Enviar emails — usa Resend se disponível, senão simula
  const resendKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.EMAIL_FROM ?? "PawReach <noreply@pawreach.pt>"
  const appUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "http://localhost:3001"
  let enviados = 0

  // Instanciar Resend uma única vez fora do loop
  let resend: InstanceType<Awaited<typeof import("resend")>["Resend"]> | null = null
  if (resendKey && resendKey !== "re_xxx" && resendKey !== "TODO") {
    const { Resend } = await import("resend")
    resend = new Resend(resendKey)
  }

  // Injector de preheader no HTML (hidden div antes do conteúdo visível)
  function injectPreheader(html: string, preheader: string): string {
    const preheaderHtml = `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff;opacity:0;">${preheader}</div>`
    const bodyMatch = html.match(/<body[^>]*>/i)
    if (bodyMatch && bodyMatch.index !== undefined) {
      const insertAt = bodyMatch.index + bodyMatch[0].length
      return html.slice(0, insertAt) + preheaderHtml + html.slice(insertAt)
    }
    return preheaderHtml + html
  }

  for (const dest of destinatarios) {
    try {
      const unsubToken = Buffer.from(`${dest.id}:${userId}`).toString("base64")
      const unsubLink = `${appUrl}/api/unsubscribe?token=${unsubToken}`
      const unsubFooter = `<p style="margin-top:24px;font-size:11px;color:#64748B;text-align:center">
        Não queres receber mais emails? <a href="${unsubLink}" style="color:#94A3B8">Cancelar subscrição</a>
      </p>`

      if (resend) {
        let personalizedHtml = (campanha.conteudoHtml + unsubFooter)
          .replace(/\{\{primeiro_nome\}\}/g, dest.nome.split(" ")[0])
          .replace(/\{\{nome\}\}/g, dest.nome)
          .replace(/\{\{tipo_negocio\}\}/g, dest.tipoNegocio ?? "")
          .replace(/\{\{cidade\}\}/g, dest.cidade ?? "")

        if (campanha.preheader) {
          personalizedHtml = injectPreheader(personalizedHtml, campanha.preheader)
        }

        const result = await resend.emails.send({
          from: fromEmail,
          to: dest.email,
          subject: campanha.assunto,
          html: personalizedHtml,
        })

        await prisma.emailLog.create({
          data: {
            userId,
            contactId: dest.id,
            campaignId: campanha.id,
            assunto: campanha.assunto,
            status: "ENVIADO",
            resendId: result.data?.id,
          },
        })
      } else {
        // Modo simulação (sem chave Resend válida)
        await prisma.emailLog.create({
          data: {
            userId,
            contactId: dest.id,
            campaignId: campanha.id,
            assunto: campanha.assunto,
            status: "ENVIADO",
          },
        })
      }
      enviados++
    } catch (e) {
      console.error(`Erro ao enviar para ${dest.email}:`, e)
    }
  }

  // Actualizar campanha e stats
  await prisma.campaign.update({
    where: { id },
    data: { status: "ENVIADA", enviadoEm: new Date() },
  })

  await prisma.campaignStats.upsert({
    where: { campaignId: id },
    create: { campaignId: id, totalEnviados: enviados },
    update: { totalEnviados: enviados },
  })

  await prisma.auditLog.create({
    data: {
      userId,
      acao: "ENVIAR_CAMPANHA",
      entidade: "Campaign",
      entidadeId: id,
      detalhes: { enviados, total: destinatarios.length },
    },
  })

  return NextResponse.json({ success: true, data: { enviados, total: destinatarios.length } })
}
