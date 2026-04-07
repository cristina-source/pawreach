"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"

type ParsedRow = Record<string, string>

const REQUIRED_COLUMNS = ["nome", "email", "tipoNegocio"]
const TIPO_NEGOCIO_VALUES = [
  "PET_SHOP",
  "GROOMING",
  "CLINICA_VET",
  "HOTEL_PETS",
  "ADESTRADOR",
  "PET_SITTER",
  "LOJA_ONLINE",
  "OUTROS",
]

export function ImportCsv() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; errors: number } | null>(null)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const parseFile = useCallback((f: File) => {
    setFile(f)
    setResult(null)
    setError("")
    Papa.parse<ParsedRow>(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const h = results.meta.fields ?? []
        setHeaders(h)
        setRows(results.data as ParsedRow[])
        // Auto-map columns
        const autoMap: Record<string, string> = {}
        for (const field of [
          "nome",
          "email",
          "telefone",
          "tipoNegocio",
          "cidade",
          "regiao",
          "estadoLead",
          "fonteContato",
          "notas",
        ]) {
          const match = h.find(
            (h) =>
              h.toLowerCase() === field.toLowerCase() ||
              h.toLowerCase().replace(/[_\s-]/g, "") ===
                field.toLowerCase().replace(/[_\s-]/g, "")
          )
          if (match) autoMap[field] = match
        }
        setMapping(autoMap)
      },
      error: () => setError("Erro ao ler o ficheiro CSV."),
    })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const f = e.dataTransfer.files[0]
      if (f?.name.endsWith(".csv")) parseFile(f)
      else setError("Apenas ficheiros CSV são suportados.")
    },
    [parseFile]
  )

  async function handleImport() {
    setImporting(true)
    setError("")
    try {
      const mapped = rows
        .map((row) => {
          const obj: Record<string, string> = {}
          for (const [field, col] of Object.entries(mapping)) {
            if (col && row[col] !== undefined) obj[field] = row[col]
          }
          return obj
        })
        .filter(
          (r) =>
            r.nome &&
            r.email &&
            r.tipoNegocio &&
            TIPO_NEGOCIO_VALUES.includes(r.tipoNegocio.toUpperCase())
        )
        .map((r) => ({ ...r, tipoNegocio: r.tipoNegocio.toUpperCase() }))

      const res = await fetch("/api/contactos/importar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactos: mapped }),
      })
      const data = await res.json()
      if (data.success) {
        setResult({ imported: data.data.imported, errors: data.data.errors })
        // Navegar para os contactos após 2.5s
        setTimeout(() => router.push("/contactos"), 2500)
      } else {
        setError(data.error ?? "Erro ao importar.")
      }
    } catch {
      setError("Erro de rede. Tenta novamente.")
    } finally {
      setImporting(false)
    }
  }

  const APP_FIELDS = [
    { key: "nome", label: "Nome *" },
    { key: "email", label: "Email *" },
    { key: "tipoNegocio", label: "Tipo de Negócio *" },
    { key: "telefone", label: "Telefone" },
    { key: "cidade", label: "Cidade" },
    { key: "regiao", label: "Região" },
    { key: "estadoLead", label: "Estado Lead" },
    { key: "fonteContato", label: "Fonte" },
    { key: "notas", label: "Notas" },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Drop zone */}
      <div
        className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors"
        style={{
          borderColor: dragging ? "var(--app-orange)" : "var(--app-border)",
          background: dragging ? "rgba(249,115,22,0.05)" : "var(--app-surface)",
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) parseFile(f)
          }}
        />
        <Upload size={32} className="mx-auto mb-3" style={{ color: "var(--app-text-muted)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--app-text)" }}>
          Arrasta o teu ficheiro CSV aqui ou clica para seleccionar
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--app-text-muted)" }}>
          Colunas recomendadas: nome, email, tipoNegocio
        </p>
        {file && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <FileText size={14} style={{ color: "var(--app-emerald)" }} />
            <span className="text-sm" style={{ color: "var(--app-emerald)" }}>
              {file.name} — {rows.length} linhas
            </span>
          </div>
        )}
      </div>

      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-sm"
          style={{ background: "rgba(239,68,68,0.1)", color: "var(--app-red)" }}
        >
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {result && (
        <div
          className="flex items-center justify-between gap-2 p-4 rounded-lg text-sm"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--app-emerald)" }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={15} />
            <span>
              <strong>{result.imported}</strong> contactos importados com sucesso.
              {result.errors > 0 && ` ${result.errors} linhas ignoradas.`}
            </span>
          </div>
          <a
            href="/contactos"
            className="inline-flex items-center gap-1 font-semibold text-xs shrink-0"
            style={{ color: "var(--app-emerald)", textDecoration: "none" }}
          >
            Ver contactos <ArrowRight size={12} />
          </a>
        </div>
      )}

      {/* Column mapping */}
      {headers.length > 0 && (
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}
        >
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--app-text)" }}
          >
            Mapear colunas do CSV
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {APP_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs w-32 shrink-0" style={{ color: "var(--app-text-muted)" }}>
                  {label}
                </span>
                <select
                  value={mapping[key] ?? ""}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [key]: e.target.value }))
                  }
                  style={{
                    background: "var(--app-bg)",
                    border: "1px solid var(--app-border)",
                    color: "var(--app-text)",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    fontSize: "12px",
                    flex: 1,
                  }}
                >
                  <option value="">— ignorar —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {rows.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: "var(--app-text-muted)" }}>
            Pré-visualização (primeiras 5 linhas)
          </p>
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--app-border)" }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "var(--app-surface-2)" }}>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-medium"
                      style={{ color: "var(--app-text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((row, i) => (
                  <tr
                    key={i}
                    className="border-t"
                    style={{ borderColor: "var(--app-border)", background: "var(--app-surface)" }}
                  >
                    {headers.map((h) => (
                      <td
                        key={h}
                        className="px-3 py-2"
                        style={{ color: "var(--app-text)" }}
                      >
                        {row[h] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <Button
          variant="primary"
          size="lg"
          loading={importing}
          onClick={handleImport}
          disabled={!REQUIRED_COLUMNS.every((col) => mapping[col])}
        >
          Importar {rows.length} contactos
        </Button>
      )}
    </div>
  )
}
