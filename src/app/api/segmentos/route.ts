import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { segmentoSchema } from "@/lib/validations"

export async function GET(_request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const segmentos = await prisma.segment.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { segmentContacts: true } },
    },
  })

  return NextResponse.json({ success: true, data: segmentos })
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

  const parsed = segmentoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" },
      { status: 422 }
    )
  }

  const segmento = await prisma.segment.create({
    data: { ...parsed.data, userId: session.user.id },
  })

  return NextResponse.json({ success: true, data: segmento }, { status: 201 })
}
