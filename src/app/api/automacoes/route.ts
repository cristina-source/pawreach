import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { automacaoSchema } from "@/lib/validations"

export async function GET(_request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const automacoes = await prisma.automation.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true } },
    },
  })

  return NextResponse.json({ success: true, data: automacoes })
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

  const parsed = automacaoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" },
      { status: 422 }
    )
  }

  const automacao = await prisma.automation.create({
    data: { ...parsed.data, userId: session.user.id },
  })

  return NextResponse.json({ success: true, data: automacao }, { status: 201 })
}
