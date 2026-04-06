import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { campanhaSchema } from "@/lib/validations"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const campanha = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: { stats: true, emailLogs: { take: 20, orderBy: { createdAt: "desc" } } },
  })

  if (!campanha) {
    return NextResponse.json({ success: false, error: "Campanha não encontrada" }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: campanha })
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 })
  }

  const parsed = campanhaSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" },
      { status: 422 }
    )
  }

  const existing = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ success: false, error: "Campanha não encontrada" }, { status: 404 })
  }

  const campanha = await prisma.campaign.update({
    where: { id },
    data: {
      ...parsed.data,
      agendadoPara: parsed.data.agendadoPara ? new Date(parsed.data.agendadoPara) : undefined,
    },
  })

  return NextResponse.json({ success: true, data: campanha })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.campaign.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ success: false, error: "Campanha não encontrada" }, { status: 404 })
  }

  await prisma.campaign.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ success: true, data: { id } })
}
