"use client"

import { AnimatedCounter } from "./animated-counter"

interface StatCardValueProps {
  value: string | number
  style?: React.CSSProperties
}

export function StatCardValue({ value, style }: StatCardValueProps) {
  // Parse numeric values — handle "1.234" (pt-PT formatted) and "45%"
  if (typeof value === "number") {
    return <AnimatedCounter value={value} style={style} />
  }

  const match = String(value).match(/^(\d+)(%?)$/)
  if (match) {
    return <AnimatedCounter value={Number(match[1])} suffix={match[2]} style={style} />
  }

  // Non-numeric (e.g. "1.234" formatted string) — render as-is
  return <span style={style}>{value}</span>
}
