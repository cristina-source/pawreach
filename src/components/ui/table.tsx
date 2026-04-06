import { clsx } from "clsx"

interface Column<T> {
  header: string
  accessor?: keyof T
  render?: (row: T) => React.ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
}

export function Table<T extends { id?: string }>({
  columns,
  data,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--app-border)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--app-border)", background: "var(--app-surface-2)" }}>
            {columns.map((col, i) => (
              <th
                key={i}
                className={clsx("px-4 py-3 text-left font-medium text-xs uppercase tracking-wider", col.className)}
                style={{ color: "var(--app-text-muted)" }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row.id ?? rowIdx}
              onClick={() => onRowClick?.(row)}
              className={clsx(
                "transition-colors",
                onRowClick && "cursor-pointer",
                rowIdx < data.length - 1 && "border-b"
              )}
              style={{
                background: "var(--app-surface)",
                borderColor: "var(--app-border)",
              }}
              onMouseEnter={(e) => {
                if (onRowClick)
                  (e.currentTarget as HTMLTableRowElement).style.background =
                    "var(--app-surface-2)"
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background =
                  "var(--app-surface)"
              }}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={clsx("px-4 py-3", col.className)}
                  style={{ color: "var(--app-text)" }}
                >
                  {col.render
                    ? col.render(row)
                    : col.accessor
                    ? String(row[col.accessor] ?? "")
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
