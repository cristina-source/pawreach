import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { automacaoSchema } from "@/lib/validations"
import { z } from "zod"

const statusSchema = z.enum(["ATIVA", "INATIVA", "RASCUNHO"])

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const automacao = await prisma.automation.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: {
      enrollments: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { contact: { select: { id: true, nome: true, email: true } } },
      },
    },
  })

  if (!automacao) {
    return NextResponse.json({ success: false, error: "Automação não encontrada" }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: automacao })
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

  const parsed = automacaoSchema
    .partial()
    .extend({ status: statusSchema.optional() })
    .safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" },
      { status: 422 }
    )
  }

  const existing = await prisma.automation.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ success: false, error: "Automação não encontrada" }, { status: 404 })
  }

  const automacao = await prisma.automation.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json({ success: true, data: automacao })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.automation.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ success: false, error: "Automação não encontrada" }, { status: 404 })
  }

  await prisma.automation.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ success: true, data: { id } })
}
