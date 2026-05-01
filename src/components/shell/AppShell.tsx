'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/shell/Sidebar'
import { Header } from '@/components/shell/Header'
import { MobileDrawer } from '@/components/shell/MobileDrawer'

const STORAGE_KEY = 'thf:sidebar-collapsed'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  // Lazy initializer: reads localStorage once on first render, no effect needed
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  function toggleSidebar() {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar — collapsible, hidden on mobile */}
      <Sidebar
        className="hidden md:flex"
        currentPath={pathname}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* Main area — header + scrollable content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenMobileDrawer={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile drawer — full-width, no collapse */}
      <MobileDrawer open={mobileOpen} onOpenChange={setMobileOpen} currentPath={pathname} />
    </div>
  )
}
