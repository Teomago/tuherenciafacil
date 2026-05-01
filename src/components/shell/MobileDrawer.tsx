'use client'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Sidebar } from '@/components/shell/Sidebar'
import { Button } from '@/components/ui/button'

type MobileDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPath?: string
}

export function MobileDrawer({ open, onOpenChange, currentPath }: MobileDrawerProps) {
  const t = useTranslations('App.Sidebar')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="left-0 top-0 flex h-full max-h-dvh w-[85vw] max-w-sm translate-x-0 translate-y-0 flex-col rounded-none border-r border-border p-0"
      >
        <DialogTitle className="sr-only">{t('mobileDrawerTitle')}</DialogTitle>
        <DialogDescription className="sr-only">{t('mobileDrawerDescription')}</DialogDescription>

        {/* Title row: brand name + explicit close button */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-5">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Tu Herencia Fácil
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label={t('closeMobileDrawer')}
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Sidebar: hide its own title section since we have ours above */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <Sidebar
            className="h-full w-full border-r-0"
            currentPath={currentPath}
            onNavigate={() => onOpenChange(false)}
            hideTitleSection
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
