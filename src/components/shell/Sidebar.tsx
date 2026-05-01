'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useTransition } from 'react'
import { useRouter } from '@/i18n/routing'
import { cn } from '@/lib/utils/index'
import { logout } from '@/app/[locale]/(frontend)/actions/auth'
import { Button } from '@/components/ui/button'

import { buildGlobalShellNavItems, type ShellNavItem } from '@/components/shell/navItems'

// Re-export so existing consumers of '@/components/shell/Sidebar' still work
export type { ShellNavItem }
export { buildGlobalShellNavItems }

type SidebarProps = {
  className?: string
  onNavigate?: () => void
  currentPath?: string
  /** Desktop-only: when true the sidebar collapses to icon-only rail */
  collapsed?: boolean
  /** Called when the user clicks the collapse toggle button */
  onToggleCollapse?: () => void
  /** When true, hides the built-in title section (MobileDrawer provides its own header) */
  hideTitleSection?: boolean
}

export function Sidebar({
  className,
  onNavigate,
  currentPath,
  collapsed = false,
  onToggleCollapse,
  hideTitleSection = false,
}: SidebarProps) {
  const t = useTranslations('App.Sidebar')
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const navItems = buildGlobalShellNavItems({
    dashboard: t('dashboard'),
    cases: t('casos'),
  })

  function handleLogout() {
    startTransition(async () => {
      await logout()
      router.replace('/login')
    })
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-card transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
        className,
      )}
    >
      {/* 1. Title / brand section — hidden when MobileDrawer provides its own header */}
      {!hideTitleSection && (
        <div
          className={cn(
            'flex shrink-0 items-center border-b border-border',
            collapsed ? 'justify-center px-2 py-5' : 'justify-between px-4 py-5',
          )}
        >
          {!collapsed && (
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Tu Herencia Fácil
            </p>
          )}
          {/* Only show the collapse toggle when a handler is provided (desktop) */}
          {onToggleCollapse && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              aria-label={t('toggleSidebar')}
              className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
            >
              {collapsed
                ? <PanelLeftOpen className="size-4" />
                : <PanelLeftClose className="size-4" />
              }
            </Button>
          )}
        </div>
      )}

      {/* 2. Navigation — scrollable if content overflows */}
      <nav className={cn('flex-1 overflow-y-auto space-y-1', collapsed ? 'p-2' : 'p-4')}>
        {navItems.map((item) => {
          const href = `/${locale}${item.href}`
          const isActive = currentPath ? currentPath.startsWith(href) : false

          return (
            <Link
              key={item.href}
              href={href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex min-h-[44px] items-center rounded-md text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-2 gap-0' : 'gap-3 px-4',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <item.icon className="size-5 shrink-0" aria-hidden />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* 3. Logout — always pinned at the bottom */}
      <div className={cn('shrink-0 border-t border-border', collapsed ? 'p-2' : 'p-4')}>
        <Button
          type="button"
          variant="ghost"
          title={collapsed ? t('cerrarSesion') : undefined}
          className={cn(
            'w-full text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
            collapsed ? 'justify-center px-2 gap-0' : 'justify-start gap-3 px-4',
          )}
          onClick={handleLogout}
          disabled={isPending}
        >
          <LogOut className="size-5 shrink-0" aria-hidden />
          {!collapsed && <span>{t('cerrarSesion')}</span>}
        </Button>
      </div>
    </aside>
  )
}
