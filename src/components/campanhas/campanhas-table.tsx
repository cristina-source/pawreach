"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CampaignStatusBadge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Trash2, Download, BarChart2 } from "lucide-react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"

interface CampanhaRow {
  id: string
  nome: string
  status: string
  enviados: number
  openRate: number
  clickRate: number
  enviadoEm: string | null
  agendadoPara: string | null
}

interface CampanhasTableProps {
  campanhas: CampanhaRow[]
}

export function CampanhasTable({ campanhas }: CampanhasTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()

  const allSelected = selected.size === campanhas.length && campanhas.length > 0
  const someSelected = selected.size > 0

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(campanhas.map((c) => c.id)))
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleBulkDelete() {
    setBulkLoading(true)
    try {
      await fetch("/api/campanhas/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      setSelected(new Set())
      router.refresh()
    } finally {
      setBulkLoading(false)
    }
  }

  function handleBulkExport() {
    const ids = Array.from(selected)
    const rows = campanhas.filter((c) => ids.includes(c.id))
    const csv = [
      "nome,status,enviados,openRate,clickRate",
      ...rows.map((r) => `"${r.nome}","${r.status}",${r.enviados},${r.openRate},${r.clickRate}`),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `campanhas-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const checkboxStyle: React.CSSProperties = {
    width: "16px",
    height: "16px",
    accentColor: "var(--app-orange)",
    cursor: "pointer",
  }

  return (
    <>
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--app-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--app-surface-2)" }}>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                  onChange={toggleAll}
                  style={checkboxStyle}
                  aria-label="Seleccionar todas"
                />
              </th>
              {["Nome", "Estado", "Destinatários", "Enviada em", "Open rate", "Click rate", "Acções"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campanhas.map((c) => (
              <tr
                key={c.id}
                className="border-t hover:bg-white/5 transition-colors"
                style={{
                  borderColor: "var(--app-border)",
                  background: selected.has(c.id) ? "rgba(249,115,22,0.05)" : "var(--app-surface)",
                }}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggle(c.id)}
                    style={checkboxStyle}
                    aria-label={`Seleccionar ${c.nome}`}
                  />
                </td>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--app-text)" }}>
                  {c.nome}
                </td>
                <td className="px-4 py-3">
                  <CampaignStatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3" style={{ color: "var(--app-text-muted)" }}>
                  {c.enviados > 0 ? c.enviados.toLocaleString("pt-PT") : "—"}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--app-text-muted)" }}>
                  {c.enviadoEm
                    ? format(new Date(c.enviadoEm), "dd/MM/yyyy HH:mm", { locale: pt })
                    : c.agendadoPara
                    ? `Agendada: ${format(new Date(c.agendadoPara), "dd/MM/yyyy HH:mm", { locale: pt })}`
                    : "—"}
                </td>
                <td className="px-4 py-3" style={{ color: c.openRate > 20 ? "#10B981" : "var(--app-text-muted)" }}>
                  {c.enviados > 0 ? `${c.openRate}%` : "—"}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--app-text-muted)" }}>
                  {c.enviados > 0 ? `${c.clickRate}%` : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/campanhas/${c.id}`} className="text-xs hover:underline" style={{ color: "#F97316" }}>
                    <BarChart2 size={14} className="inline mr-1" />
                    Analytics
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {someSelected && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
            background: "rgba(30,41,59,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--app-border-strong)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-lg)",
            animation: "fadeInUp 200ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--app-orange)", marginRight: "4px" }}>
            {selected.size} seleccionada{selected.size > 1 ? "s" : ""}
          </span>
          <div style={{ width: "1px", height: "20px", background: "var(--app-border)" }} />
          <button
            onClick={handleBulkExport}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 12px", borderRadius: "var(--radius-md)",
              background: "transparent", border: "none",
              color: "var(--app-text-muted)", fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}
          >
            <Download size={14} /> Exportar
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={bulkLoading}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 12px", borderRadius: "var(--radius-md)",
              background: "rgba(239,68,68,0.1)", border: "none",
              color: "#EF4444", fontSize: "13px", fontWeight: 500,
              cursor: bulkLoading ? "not-allowed" : "pointer",
            }}
          >
            <Trash2 size={14} /> Eliminar
          </button>
          <button
            onClick={() => setSelected(new Set())}
            style={{
              padding: "4px 8px", borderRadius: "var(--radius-sm)",
              background: "transparent", border: "none",
              color: "var(--app-text-dim)", fontSize: "12px", cursor: "pointer",
            }}
          >
            Limpar
          </button>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false)
          handleBulkDelete()
        }}
        title={`Eliminar ${selected.size} campanha${selected.size > 1 ? "s" : ""}?`}
        description="Esta acção é irreversível. As campanhas seleccionadas serão permanentemente removidas."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </>
  )
}
