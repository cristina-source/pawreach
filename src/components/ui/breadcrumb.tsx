import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: "16px" }}>
      <ol style={{ display: "flex", alignItems: "center", gap: "6px", margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {i > 0 && <ChevronRight size={12} style={{ color: "var(--app-text-dim)", flexShrink: 0 }} />}
              {isLast || !item.href ? (
                <span
                  style={{
                    fontSize: "13px",
                    color: isLast ? "var(--app-text)" : "var(--app-text-muted)",
                    fontWeight: isLast ? 500 : 400,
                  }}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  style={{
                    fontSize: "13px",
                    color: "var(--app-text-muted)",
                    textDecoration: "none",
                    transition: "color var(--t-fast)",
                  }}
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
