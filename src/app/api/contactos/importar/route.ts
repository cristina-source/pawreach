import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const importSchema = z.object({
  contactos: z
    .array(
      z.object({
        nome: z.string().min(1),
        email: z.string().email(),
        tipoNegocio: z.enum([
          "PET_SHOP",
          "GROOMING",
          "CLINICA_VET",
          "HOTEL_PETS",
          "ADESTRADOR",
          "PET_SITTER",
          "LOJA_ONLINE",
          "OUTROS",
        ]),
        telefone: z.string().optional(),
        cidade: z.string().optional(),
        regiao: z.string().optional(),
        estadoLead: z.enum(["FRIO", "MORNO", "QUENTE", "CLIENTE"]).optional(),
        fonteContato: z.string().optional(),
        notas: z.string().optional(),
      })
    )
    .max(500, "Máximo de 500 contactos por importação"),
})

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

  const parsed = importSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Dados inválidos" },
      { status: 422 }
    )
  }

  const userId = session.user.id
  let imported = 0
  let errors = 0

  for (const row of parsed.data.contactos) {
    try {
      await prisma.contact.upsert({
        where: { userId_email: { userId, email: row.email } },
        create: {
          userId,
          nome: row.nome,
          email: row.email,
          tipoNegocio: row.tipoNegocio,
          telefone: row.telefone,
          cidade: row.cidade,
          regiao: row.regiao,
          estadoLead: row.estadoLead ?? "FRIO",
          fonteContato: row.fonteContato,
          notas: row.notas,
          tags: [],
        },
        update: {
          nome: row.nome,
          tipoNegocio: row.tipoNegocio,
          telefone: row.telefone,
          cidade: row.cidade,
          regiao: row.regiao,
          estadoLead: row.estadoLead ?? "FRIO",
          fonteContato: row.fonteContato,
          notas: row.notas,
          deletedAt: null,
        },
      })
      imported++
    } catch {
      errors++
    }
  }

  await prisma.auditLog.create({
    data: {
      userId,
      acao: "IMPORTAR_CONTACTOS",
      entidade: "Contact",
      detalhes: { imported, errors, total: parsed.data.contactos.length },
    },
  })

  return NextResponse.json({ success: true, data: { imported, errors } })
}
