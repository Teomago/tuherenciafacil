'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export type MobileNavLink = {
  id?: string | null
  href: string
  label: string
}

export type MobileLogoData =
  | { type: 'image'; src: string; alt: string }
  | { type: 'text'; text: string }
  | null

type Props = {
  navLinks: MobileNavLink[]
  logo: MobileLogoData
  isMultiLangEnabled: boolean
  iconColor?: string
}

export function MarketingMobileMenu({ navLinks, logo, isMultiLangEnabled, iconColor }: Props) {
  const [open, setOpen] = useState(false)

  // Close menu on route change / Escape key
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* Hamburger — only visible on mobile */}
      <button
        type="button"
        className={["flex items-center justify-center rounded-md p-2 transition-colors md:hidden", !iconColor && "text-foreground/70 hover:text-foreground"].filter(Boolean).join(" ")}
        style={iconColor ? { color: iconColor } : undefined}
        aria-label="Abrir menú"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navegación principal"
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-[80vw] max-w-xs flex-col bg-background shadow-2xl transition-transform duration-300 md:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Drawer header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-5">
          {logo?.type === 'image' ? (
            <Link href="/" onClick={() => setOpen(false)}>
              <Image src={logo.src} alt={logo.alt} width={100} height={32} className="h-7 w-auto object-contain" />
            </Link>
          ) : logo?.type === 'text' ? (
            <Link href="/" onClick={() => setOpen(false)} className="text-sm font-bold tracking-tight text-foreground">
              {logo.text}
            </Link>
          ) : (
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Tu Herencia Fácil
            </span>
          )}
          <button
            type="button"
            className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav links — scrollable if many */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.id ?? link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer — theme + language */}
        <div className="shrink-0 border-t border-border px-4 py-4 flex items-center gap-3">
          <LanguageSwitcher isMultiLangEnabled={isMultiLangEnabled} />
          <ThemeToggle />
        </div>
      </aside>
    </>
  )
}
