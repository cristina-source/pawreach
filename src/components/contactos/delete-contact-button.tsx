"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface DeleteContactButtonProps {
  contactId: string
  contactName: string
}

export function DeleteContactButton({ contactId, contactName }: DeleteContactButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    try {
      await fetch(`/api/contactos/${contactId}`, { method: "DELETE" })
      setOpen(false)
      router.push("/contactos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
        style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "none", cursor: "pointer" }}
      >
        Eliminar
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title={`Eliminar "${contactName}"?`}
        description="O contacto será removido permanentemente. Esta acção é irreversível."
        confirmLabel="Eliminar contacto"
        variant="danger"
        loading={loading}
      />
    </>
  )
}
