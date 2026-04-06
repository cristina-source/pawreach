"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TipoNegocioBadge, EstadoLeadBadge } from "@/components/ui/badge"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Trash2, Download, Tag, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"

const ESTADOS = [
  { value: "FRIO", label: "Frio" },
  { value: "MORNO", label: "Morno" },
  { value: "QUENTE", label: "Quente" },
  { value: "CLIENTE", label: "Cliente" },
]

interface ContactRow {
  id: string
  nome: string
  email: string
  tipoNegocio: string
  cidade: string | null
  estadoLead: string
  createdAt: string
}

interface ContactosTableProps {
  contactos: ContactRow[]
}

export function ContactosTable({ contactos }: ContactosTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEstadoMenu, setShowEstadoMenu] = useState(false)
  const estadoMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (estadoMenuRef.current && !estadoMenuRef.current.contains(e.target as Node)) {
        setShowEstadoMenu(false)
      }
    }
    if (showEstadoMenu) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showEstadoMenu])

  const allSelected = selected.size === contactos.length && contactos.length > 0
  const someSelected = selected.size > 0

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(contactos.map((c) => c.id)))
    }
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
      await fetch("/api/contactos/bulk", {
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

  async function handleBulkExport() {
    const ids = Array.from(selected)
    const rows = contactos.filter((c) => ids.includes(c.id))
    const csv = [
      "nome,email,tipoNegocio,cidade,estadoLead",
      ...rows.map((r) => `"${r.nome}","${r.email}","${r.tipoNegocio}","${r.cidade ?? ""}","${r.estadoLead}"`),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `contactos-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleBulkEstado(estado: string) {
    setBulkLoading(true)
    try {
      await fetch("/api/contactos/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), estadoLead: estado }),
      })
      setSelected(new Set())
      router.refresh()
    } finally {
      setBulkLoading(false)
    }
  }

  const checkboxStyle: React.CSSProperties = {
    width: "16px",
    height: "16px",
    accentColor: "var(--app-orange)",
    cursor: "pointer",
  }

  return (
    <>
      <div
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: "var(--app-border)" }}
      >
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
                  aria-label="Seleccionar todos"
                />
              </th>
              {["Nome", "Email", "Tipo", "Cidade", "Estado", "Criado em", "Acções"].map((h) => (
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
            {contactos.map((c) => (
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
                <td className="px-4 py-3" style={{ color: "var(--app-text-muted)" }}>
                  {c.email}
                </td>
                <td className="px-4 py-3">
                  <TipoNegocioBadge tipo={c.tipoNegocio} />
                </td>
                <td className="px-4 py-3" style={{ color: "var(--app-text-muted)" }}>
                  {c.cidade ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <EstadoLeadBadge estado={c.estadoLead} />
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--app-text-muted)" }}>
                  {format(new Date(c.createdAt), "dd MMM yyyy", { locale: pt })}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/contactos/${c.id}`}
                    className="text-xs hover:underline"
                    style={{ color: "#F97316" }}
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating bulk action bar */}
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
            {selected.size} seleccionado{selected.size > 1 ? "s" : ""}
          </span>

          <div style={{ width: "1px", height: "20px", background: "var(--app-border)" }} />

          <button
            onClick={handleBulkExport}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 12px", borderRadius: "var(--radius-md)",
              background: "transparent", border: "none",
              color: "var(--app-text-muted)", fontSize: "13px", fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Download size={14} /> Exportar
          </button>

          <div style={{ position: "relative" }} ref={estadoMenuRef}>
            <button
              onClick={() => setShowEstadoMenu((v) => !v)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 12px", borderRadius: "var(--radius-md)",
                background: "transparent", border: "none",
                color: "var(--app-text-muted)", fontSize: "13px", fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <Tag size={14} /> Mudar estado <ChevronDown size={12} />
            </button>
            {showEstadoMenu && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: 0,
                  marginBottom: "6px",
                  background: "var(--app-surface)",
                  border: "1px solid var(--app-border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                  overflow: "hidden",
                  minWidth: "140px",
                  zIndex: 60,
                }}
              >
                {ESTADOS.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => {
                      setShowEstadoMenu(false)
                      handleBulkEstado(e.value)
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px 14px",
                      background: "transparent",
                      border: "none",
                      color: "var(--app-text)",
                      fontSize: "13px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            )}
          </div>

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
              color: "var(--app-text-dim)", fontSize: "12px",
              cursor: "pointer",
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
        title={`Eliminar ${selected.size} contacto${selected.size > 1 ? "s" : ""}?`}
        description="Esta acção é irreversível. Os contactos seleccionados serão permanentemente removidos."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </>
  )
}
