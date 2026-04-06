import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const deleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
})

const patchSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
  estadoLead: z.enum(["FRIO", "MORNO", "QUENTE", "CLIENTE"]),
})

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = deleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 })
  }

  await prisma.contact.updateMany({
    where: {
      id: { in: parsed.data.ids },
      userId: session.user.id,
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 })
  }

  await prisma.contact.updateMany({
    where: {
      id: { in: parsed.data.ids },
      userId: session.user.id,
      deletedAt: null,
    },
    data: { estadoLead: parsed.data.estadoLead },
  })

  return NextResponse.json({ success: true })
}
