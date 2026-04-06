import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { contactoSchema } from "@/lib/validations"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const contacto = await prisma.contact.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: {
      emailLogs: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { campaign: { select: { nome: true } } },
      },
    },
  })

  if (!contacto) {
    return NextResponse.json({ success: false, error: "Contacto não encontrado" }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: contacto })
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

  const parsed = contactoSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" },
      { status: 422 }
    )
  }

  const existing = await prisma.contact.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ success: false, error: "Contacto não encontrado" }, { status: 404 })
  }

  const contacto = await prisma.contact.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json({ success: true, data: contacto })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.contact.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ success: false, error: "Contacto não encontrado" }, { status: 404 })
  }

  await prisma.contact.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ success: true, data: { id } })
}
