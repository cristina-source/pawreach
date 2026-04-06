"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface DeleteTemplateButtonProps {
  templateId: string
  templateName: string
}

export function DeleteTemplateButton({ templateId, templateName }: DeleteTemplateButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    try {
      await fetch(`/api/templates/${templateId}`, { method: "DELETE" })
      setOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs hover:underline"
        style={{ color: "var(--app-text-muted)", background: "none", border: "none", cursor: "pointer" }}
      >
        Eliminar
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title={`Eliminar "${templateName}"?`}
        description="O template será permanentemente removido. Esta acção é irreversível."
        confirmLabel="Eliminar"
        variant="danger"
        loading={loading}
      />
    </>
  )
}
