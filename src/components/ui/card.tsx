import { clsx } from "clsx"
import { StatCardValue } from "./stat-card-value"

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: "sm" | "md" | "lg" | "none"
}

export function Card({ children, className, padding = "md" }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  }

  return (
    <div
      className={clsx(
        "rounded-xl border",
        paddings[padding],
        className
      )}
      style={{
        background: "var(--app-surface)",
        borderColor: "var(--app-border)",
      }}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: { value: number; label: string }
  color?: "orange" | "emerald" | "amber" | "blue"
  index?: number
}

const colorMap = {
  orange:  { text: "#F97316", bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.2)" },
  emerald: { text: "#10B981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.2)" },
  amber:   { text: "#F59E0B", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.2)" },
  blue:    { text: "#3B82F6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.2)" },
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "orange",
  index = 0,
}: StatCardProps) {
  const c = colorMap[color]
  const animClass = `stat-card-${Math.min(index + 1, 4)}`

  return (
    <div
      className={`rounded-xl border stat-card-hover ${animClass}`}
      style={{
        background: "var(--app-surface)",
        borderColor: "var(--app-border)",
        padding: "20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--app-text-muted)",
              margin: "0 0 10px",
            }}
          >
            {title}
          </p>
          <StatCardValue
            value={value}
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "30px",
              fontWeight: 700,
              color: c.text,
              margin: "0 0 4px",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              display: "block",
            }}
          />
          {subtitle && (
            <p style={{ fontSize: "12px", color: "var(--app-text-dim)", margin: 0 }}>
              {subtitle}
            </p>
          )}
          {trend && (
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                margin: "6px 0 0",
                color: trend.value >= 0 ? "#10B981" : "#EF4444",
              }}
            >
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: c.bg,
              border: `1px solid ${c.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: c.text,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
