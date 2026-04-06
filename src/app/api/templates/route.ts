import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const templateSchema = z.object({
  nome: z.string().min(2).max(200),
  tipo: z.string(),
  tom: z.string(),
  objetivo: z.string(),
  assunto: z.string(),
  preheader: z.string().optional(),
  corpo: z.string().min(1),
  cta: z.string().optional(),
  ps: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
})

export async function GET(_request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const templates = await prisma.aiTemplate.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { geradoEm: "desc" },
  })

  return NextResponse.json({ success: true, data: templates })
}

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

  const parsed = templateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" },
      { status: 422 }
    )
  }

  const template = await prisma.aiTemplate.create({
    data: { ...parsed.data, userId: session.user.id },
  })

  return NextResponse.json({ success: true, data: template }, { status: 201 })
}
