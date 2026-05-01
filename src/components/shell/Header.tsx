'use client'

import { Menu } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/providers/UserProvider'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { ThemeToggle } from '@/components/shell/ThemeToggle'

type HeaderProps = {
  onOpenMobileDrawer: () => void
}

export function Header({ onOpenMobileDrawer }: HeaderProps) {
  const t = useTranslations('App.Header')
  const user = useUser()
  const roleLabel = user.role === 'abogado' ? t('roleAbogado') : t('roleCliente')
  const badgeVariant = user.role === 'abogado' ? 'success' : 'secondary'

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenMobileDrawer}
          aria-label={t('openMenu')}
        >
          <Menu className="size-5" />
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">{t('welcome')}</p>
          <p className="text-base font-semibold text-foreground">{user.firstName ?? user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={badgeVariant}>{roleLabel}</Badge>
        <LanguageSwitcher isMultiLangEnabled />
        <ThemeToggle />
      </div>
    </header>
  )
}
