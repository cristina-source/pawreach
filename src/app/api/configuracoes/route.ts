import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function GET(_request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const userId = session.user.id

  const [user, subscription, contactCount, emailsThisMonth] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { senderName: true, replyTo: true },
    }),
    prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, aiGenerationsUsed: true },
    }),
    prisma.contact.count({ where: { userId, deletedAt: null } }),
    prisma.emailLog.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      plan: subscription?.plan ?? "FREE",
      aiGenerationsUsed: subscription?.aiGenerationsUsed ?? 0,
      contactCount,
      emailsThisMonth,
      senderName: user?.senderName ?? null,
      replyTo: user?.replyTo ?? null,
    },
  })
}

export async function PATCH(request: NextRequest) {
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

  const schema = z.object({
    senderName: z.string().optional(),
    replyTo: z.string().email().optional(),
  })

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" },
      { status: 422 }
    )
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  })

  return NextResponse.json({ success: true, data: parsed.data })
}
