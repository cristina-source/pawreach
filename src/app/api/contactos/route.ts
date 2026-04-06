import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { contactoSchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get("tipo")
  const estado = searchParams.get("estado")
  const cidade = searchParams.get("cidade")
  const q = searchParams.get("q")
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const take = 50
  const skip = (page - 1) * take

  const where = {
    userId: session.user.id,
    deletedAt: null,
    ...(tipo ? { tipoNegocio: tipo as never } : {}),
    ...(estado ? { estadoLead: estado as never } : {}),
    ...(cidade ? { cidade: { contains: cidade, mode: "insensitive" as never } } : {}),
    ...(q
      ? {
          OR: [
            { nome: { contains: q, mode: "insensitive" as never } },
            { email: { contains: q, mode: "insensitive" as never } },
          ],
        }
      : {}),
  }

  const [contactos, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.contact.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    data: { contactos, total, page, pages: Math.ceil(total / take) },
  })
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

  const parsed = contactoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" },
      { status: 422 }
    )
  }

  const existing = await prisma.contact.findUnique({
    where: { userId_email: { userId: session.user.id, email: parsed.data.email } },
    select: { id: true, deletedAt: true },
  })

  if (existing && !existing.deletedAt) {
    return NextResponse.json({ success: false, error: "Email já existe na tua base de dados" }, { status: 409 })
  }

  try {
    const contacto = await prisma.contact.upsert({
      where: { userId_email: { userId: session.user.id, email: parsed.data.email } },
      create: { ...parsed.data, userId: session.user.id, tags: parsed.data.tags ?? [] },
      update: { ...parsed.data, tags: parsed.data.tags ?? [], deletedAt: null },
    })
    return NextResponse.json({ success: true, data: contacto }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 })
  }
}
