import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-01-27.acacia",
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Assinatura em falta" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    )
  } catch (err) {
    console.error("Webhook signature failed:", err)
    return NextResponse.json({ error: "Webhook inválido" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plan = (session.metadata?.plan as "SOLO" | "GROWTH") ?? "SOLO"

        if (!userId) break

        const subscriptionId = session.subscription as string
        const customerId = session.customer as string

        // Resolve priceId from Stripe subscription
        let stripePriceId = ""
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)
          stripePriceId = sub.items.data[0]?.price?.id ?? ""
        }

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId,
            status: "ACTIVE",
            plan,
          },
          update: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId,
            status: "ACTIVE",
            plan,
          },
        })

        await prisma.auditLog.create({
          data: {
            userId,
            acao: "SUBSCRIPTION_CREATED",
            entidade: "Subscription",
            detalhes: { plan, stripePriceId },
          },
        })
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const subId = invoice.subscription as string

        if (!subId) break

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subId },
          data: { status: "PAST_DUE" },
        })
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "CANCELED", plan: "FREE" },
        })
        break
      }

      default:
        break
    }
  } catch (e) {
    console.error("Erro ao processar webhook:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
