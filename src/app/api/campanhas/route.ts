import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { campanhaSchema } from "@/lib/validations"

export async function GET(_request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const campanhas = await prisma.campaign.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { stats: true },
  })

  return NextResponse.json({ success: true, data: campanhas })
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

  const parsed = campanhaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" },
      { status: 422 }
    )
  }

  try {
    const campanha = await prisma.campaign.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
        agendadoPara: parsed.data.agendadoPara ? new Date(parsed.data.agendadoPara) : undefined,
        status: parsed.data.agendadoPara ? "AGENDADA" : "RASCUNHO",
      },
    })
    return NextResponse.json({ success: true, data: campanha }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 })
  }
}
