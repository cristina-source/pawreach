"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Search, X } from "lucide-react"

const TIPO_NEGOCIO_OPTIONS = [
  { value: "", label: "Todos os tipos" },
  { value: "PET_SHOP", label: "Pet Shop" },
  { value: "GROOMING", label: "Grooming" },
  { value: "CLINICA_VET", label: "Clínica Vet." },
  { value: "HOTEL_PETS", label: "Hotel Pets" },
  { value: "ADESTRADOR", label: "Adestrador" },
  { value: "PET_SITTER", label: "Pet Sitter" },
  { value: "LOJA_ONLINE", label: "Loja Online" },
  { value: "OUTROS", label: "Outros" },
]

const ESTADO_LEAD_OPTIONS = [
  { value: "", label: "Todos os estados" },
  { value: "FRIO", label: "Frio" },
  { value: "MORNO", label: "Morno" },
  { value: "QUENTE", label: "Quente" },
  { value: "CLIENTE", label: "Cliente" },
]

const selectStyle = {
  background: "var(--app-surface-2)",
  border: "1px solid var(--app-border)",
  color: "var(--app-text)",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "14px",
  outline: "none",
  cursor: "pointer",
}

export function ContactFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const search = searchParams.get("search") ?? ""
  const tipo = searchParams.get("tipo") ?? ""
  const estado = searchParams.get("estado") ?? ""

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page") // reset page
      router.push(`/contactos?${params.toString()}`)
    },
    [router, searchParams]
  )

  const hasFilters = search || tipo || estado

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--app-text-muted)" }}
        />
        <input
          type="text"
          placeholder="Pesquisar nome ou email..."
          defaultValue={search}
          onChange={(e) => updateFilter("search", e.target.value)}
          style={{
            ...selectStyle,
            paddingLeft: "36px",
            width: "100%",
          }}
        />
      </div>

      {/* Tipo */}
      <select
        value={tipo}
        onChange={(e) => updateFilter("tipo", e.target.value)}
        style={selectStyle}
      >
        {TIPO_NEGOCIO_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Estado */}
      <select
        value={estado}
        onChange={(e) => updateFilter("estado", e.target.value)}
        style={selectStyle}
      >
        {ESTADO_LEAD_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => router.push("/contactos")}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "var(--app-text-muted)" }}
        >
          <X size={14} />
          Limpar
        </button>
      )}
    </div>
  )
}
