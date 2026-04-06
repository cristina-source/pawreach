"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card } from "@/components/ui/card"

interface ChartData {
  date: string
  enviados: number
  abertos: number
}

interface DashboardChartProps {
  data: ChartData[]
}

export function DashboardChart({ data }: DashboardChartProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className="text-base font-semibold"
            style={{ fontFamily: "Syne, sans-serif", color: "var(--app-text)" }}
          >
            Performance de Email — 30 dias
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--app-text-muted)" }}>
            Emails enviados vs abertos
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEnviados" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAbertos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            stroke="#475569"
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#475569"
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#1E293B",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#F8FAFC",
              fontSize: "12px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#94A3B8" }}
          />
          <Area
            type="monotone"
            dataKey="enviados"
            name="Enviados"
            stroke="#F97316"
            strokeWidth={2}
            fill="url(#colorEnviados)"
          />
          <Area
            type="monotone"
            dataKey="abertos"
            name="Abertos"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#colorAbertos)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}

interface CampaignStatsCardsProps {
  totalEnviados: number
  totalAbertos: number
  totalCliques: number
  totalBounces: number
  totalUnsubs: number
}

export function CampaignStatsCards({
  totalEnviados,
  totalAbertos,
  totalCliques,
  totalBounces,
  totalUnsubs,
}: CampaignStatsCardsProps) {
  const taxaAbertura =
    totalEnviados > 0 ? ((totalAbertos / totalEnviados) * 100).toFixed(1) : "0"
  const taxaCliques =
    totalEnviados > 0 ? ((totalCliques / totalEnviados) * 100).toFixed(1) : "0"

  const stats = [
    { label: "Enviados", value: totalEnviados.toLocaleString("pt-PT"), color: "#F97316" },
    { label: "Abertos", value: `${totalAbertos} (${taxaAbertura}%)`, color: "#10B981" },
    { label: "Cliques", value: `${totalCliques} (${taxaCliques}%)`, color: "#3B82F6" },
    { label: "Bounces", value: totalBounces, color: "#EF4444" },
    { label: "Unsubs", value: totalUnsubs, color: "#F59E0B" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl p-4 text-center"
          style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}
        >
          <p
            className="text-2xl font-bold"
            style={{ color: s.color, fontFamily: "Syne, sans-serif" }}
          >
            {s.value}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--app-text-muted)" }}>
            {s.label}
          </p>
        </div>
      ))}
    </div>
  )
}
