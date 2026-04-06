"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { CommandPalette } from "./command-palette"
import { ToastProvider } from "@/components/ui/toast"

interface DashboardShellProps {
  title: string
  userName?: string | null
  userEmail?: string | null
  userImage?: string | null
  plan?: string
  contactCount?: number
  campaignCount?: number
  children: React.ReactNode
}

export function DashboardShell({
  title,
  userName,
  userEmail,
  userImage,
  plan = "FREE",
  contactCount,
  campaignCount,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  // ⌘K global shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <ToastProvider>
      <a
        href="#main-content"
        className="skip-link"
      >
        Saltar para o conteúdo
      </a>
      <div className="flex h-screen overflow-hidden" style={{ background: "var(--app-bg)" }}>
        <Sidebar
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
          plan={plan}
          contactCount={contactCount}
          campaignCount={campaignCount}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Topbar
            title={title}
            userName={userName}
            userEmail={userEmail}
            userImage={userImage}
            onMenuClick={() => setSidebarOpen(true)}
            onSearchClick={() => setCmdOpen(true)}
          />
          <main id="main-content" className="flex-1 overflow-y-auto" style={{ padding: "24px" }}>
            {children}
          </main>
        </div>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </ToastProvider>
  )
}
