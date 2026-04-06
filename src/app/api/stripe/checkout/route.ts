import { NextRequest, NextResponse } from "next/server"
import { getSession as auth } from "@/lib/get-session"
import { stripe } from "@/lib/stripe"
import { PLANS, type PlanKey } from "@/lib/plans"
import { z } from "zod"

const schema = z.object({
  plan: z.enum(["SOLO", "GROWTH"]),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Plano inválido" }, { status: 400 })
  }

  const plan = PLANS[parsed.data.plan as PlanKey]
  const priceId = "stripePriceId" in plan ? plan.stripePriceId : undefined
  if (!priceId) {
    return NextResponse.json({ success: false, error: "Plano sem preço configurado" }, { status: 400 })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.AUTH_URL}/configuracoes?checkout=success`,
    cancel_url: `${process.env.AUTH_URL}/precos?checkout=cancel`,
    metadata: {
      userId: session.user.id,
      plan: parsed.data.plan,
    },
  })

  return NextResponse.json({ success: true, url: checkoutSession.url })
}
