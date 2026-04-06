import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

interface Params {
  params: Promise<{ id: string }>
}

const patchSchema = z.object({
  nome: z.string().min(2).max(200).optional(),
  assunto: z.string().min(1).max(500).optional(),
  preheader: z.string().max(200).optional().nullable(),
  corpo: z.string().min(1).optional(),
  cta: z.string().max(200).optional().nullable(),
  ps: z.string().max(500).optional().nullable(),
  tipo: z.string().optional(),
  tom: z.string().optional(),
  objetivo: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
})

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params

  const template = await prisma.aiTemplate.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  })

  if (!template) {
    return NextResponse.json({ success: false, error: "Template não encontrado" }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: template })
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

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" },
      { status: 422 }
    )
  }

  const existing = await prisma.aiTemplate.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ success: false, error: "Template não encontrado" }, { status: 404 })
  }

  const template = await prisma.aiTemplate.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json({ success: true, data: template })
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.aiTemplate.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    select: { id: true },
  })

  if (!existing) {
    return NextResponse.json({ success: false, error: "Template não encontrado" }, { status: 404 })
  }

  await prisma.aiTemplate.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ success: true, data: { id } })
}
