export const PLANS = {
  FREE: {
    nome: "Gratuito",
    preco: 0,
    limites: {
      contactos: 100,
      emailsMes: 500,
      geracoesIa: 0,
      automacoes: false,
    },
  },
  SOLO: {
    nome: "Solo",
    preco: 29,
    stripePriceId: process.env.STRIPE_PRICE_SOLO,
    limites: {
      contactos: 2000,
      emailsMes: 10000,
      geracoesIa: 50,
      automacoes: false,
    },
  },
  GROWTH: {
    nome: "Growth",
    preco: 79,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH,
    limites: {
      contactos: 10000,
      emailsMes: -1,
      geracoesIa: -1,
      automacoes: true,
    },
  },
} as const

export type PlanKey = keyof typeof PLANS

export function dentroDoLimite(limite: number, atual: number): boolean {
  if (limite === -1) return true
  return atual < limite
}
