import { LayoutDashboard, FolderOpen, type LucideIcon } from 'lucide-react'

export type ShellNavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export const buildGlobalShellNavItems = (
  labels: { dashboard: string; cases: string } = {
    dashboard: 'Dashboard',
    cases: 'Casos',
  },
): ShellNavItem[] => [
  { href: '/dashboard', label: labels.dashboard, icon: LayoutDashboard },
  { href: '/casos', label: labels.cases, icon: FolderOpen },
]
