import { getSession as auth } from "@/lib/get-session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { DashboardShell } from "@/components/layout/dashboard-shell"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/contactos": "Contactos",
  "/campanhas": "Campanhas",
  "/automacoes": "Automações",
  "/ia-copy": "IA Copy",
  "/templates": "Templates",
  "/configuracoes": "Configurações",
}

function getTitle(pathname: string): string {
  const base = "/" + pathname.split("/")[1]
  return PAGE_TITLES[base] ?? "PawReach"
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [subscription, contactCount, campaignCount] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true },
    }),
    prisma.contact.count({ where: { userId: session.user.id, deletedAt: null } }),
    prisma.campaign.count({ where: { userId: session.user.id, deletedAt: null } }),
  ])

  const headersList = await headers()
  const pathname = headersList.get("x-pathname") ?? "/dashboard"
  const title = getTitle(pathname)

  return (
    <DashboardShell
      title={title}
      userName={session.user.name}
      userEmail={session.user.email}
      userImage={session.user.image}
      plan={subscription?.plan ?? "FREE"}
      contactCount={contactCount}
      campaignCount={campaignCount}
    >
      {children}
    </DashboardShell>
  )
}
