import { getSession as auth } from "@/lib/get-session"
import { redirect } from "next/navigation"
import { AiCopyGenerator } from "@/components/ia/ai-copy-generator"

export default async function IaCopyPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Syne, sans-serif", color: "var(--app-text)" }}
        >
          Gerador de Copy IA
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--app-text-muted)" }}>
          Gera emails personalizados para o mercado pet em segundos.
        </p>
      </div>
      <AiCopyGenerator />
    </div>
  )
}
