import { TipoNegocioBadge, EstadoLeadBadge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Mail, MapPin } from "lucide-react"

interface ContactCardProps {
  id: string
  nome: string
  email: string
  tipoNegocio: string
  cidade?: string | null
  estadoLead: string
  onDelete?: (id: string) => void
}

export function ContactCard({
  id,
  nome,
  email,
  tipoNegocio,
  cidade,
  estadoLead,
  onDelete,
}: ContactCardProps) {
  return (
    <Card className="hover:border-orange-500/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <TipoNegocioBadge tipo={tipoNegocio} />
          <EstadoLeadBadge estado={estadoLead} />
        </div>
      </div>

      <h3
        className="font-semibold mb-2"
        style={{ color: "var(--app-text)", fontFamily: "Syne, sans-serif" }}
      >
        {nome}
      </h3>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2">
          <Mail size={13} style={{ color: "var(--app-text-muted)" }} />
          <span className="text-xs truncate" style={{ color: "var(--app-text-muted)" }}>
            {email}
          </span>
        </div>
        {cidade && (
          <div className="flex items-center gap-2">
            <MapPin size={13} style={{ color: "var(--app-text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--app-text-muted)" }}>
              {cidade}
            </span>
          </div>
        )}
      </div>

      <div
        className="flex items-center gap-3 pt-3 border-t"
        style={{ borderColor: "var(--app-border)" }}
      >
        <Link
          href={`/contactos/${id}`}
          className="text-xs font-medium hover:underline"
          style={{ color: "#F97316" }}
        >
          Ver perfil
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(id)}
            className="text-xs hover:underline"
            style={{ color: "var(--app-text-muted)" }}
          >
            Eliminar
          </button>
        )}
      </div>
    </Card>
  )
}
