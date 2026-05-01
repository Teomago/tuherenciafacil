import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCachedGlobal } from '@/modules/common/data'
import type { HeaderSettings, Media } from '@/payload/payload-types'
import { getLinkProps, type LinkFieldData } from '@/lib/utils/getLinkProps'
import { isExpanded } from '@/lib/utils/isExpanded'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { getPayload } from '@/lib/payload/getPayload'
import { MarketingMobileMenu, type MobileLogoData, type MobileNavLink } from './MarketingMobileMenu'
import { HeaderScrollWrapper } from './HeaderScrollWrapper'
import { cn } from '@/lib/utils/cn'

/**
 * Marketing site header — Server Component.
 *
 * Desktop layout:  [Nav links]  |  [Logo — centered]  |  [Lang + Theme + CTA]
 * Mobile layout:   [Hamburger]  |  [Logo — centered]  |  [CTA only]
 *
 * Nav links, language switcher and theme toggle are hidden on mobile and
 * instead appear inside the slide-in drawer (MarketingMobileMenu).
 */
export async function Header({ locale }: { locale?: string }) {
  const header = await getCachedGlobal<HeaderSettings>('header', 2, locale).catch(() => null)

  const payload = await getPayload()
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' as any }).catch(() => null)
  const isMultiLangEnabled = (siteSettings as any)?.enableMultiLanguage !== false

  const navLinks = header?.navLinks || []
  const logo = header?.logo
  const cta = header?.cta
  const theme = (header as any)?.theme
  const linkColor = theme?.linkColor || undefined
  const iconColor = theme?.iconColor || undefined
  const ctaBgColor = theme?.ctaBgColor || undefined
  const ctaTextColor = theme?.ctaTextColor || undefined

  // --- Resolve logo for the mobile client component ---
  let mobileLogo: MobileLogoData = null
  if (logo?.type === 'image' && logo.image && isExpanded(logo.image)) {
    mobileLogo = { type: 'image', src: (logo.image as Media).url || '', alt: (logo.image as Media).alt || '' }
  } else if (logo?.type === 'text' && logo.text) {
    mobileLogo = { type: 'text', text: logo.text }
  }

  // --- Resolve nav links for the mobile client component ---
  const resolvedNavLinks: MobileNavLink[] = navLinks
    .map((item): MobileNavLink | null => {
      const linkData = item.link as LinkFieldData | undefined
      if (!linkData) return null
      const props = getLinkProps(linkData)
      if (!props.href) return null
      return { id: item.id ?? undefined, href: props.href, label: linkData.label || '' }
    })
    .filter((x): x is MobileNavLink => x !== null)

  // --- CTA ---
  const ctaEl = (() => {
    if (!cta?.enabled || !cta.link) return null
    const ctaLink = cta.link as LinkFieldData
    const props = getLinkProps(ctaLink)
    if (!props.href) return null
    return (
      <Link
        href={props.href}
        target={props.target}
        rel={props.rel}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90",
          !ctaBgColor && "bg-primary",
          !ctaTextColor && "text-primary-foreground"
        )}
        style={{
          backgroundColor: ctaBgColor,
          color: ctaTextColor,
        }}
      >
        {ctaLink.label}
      </Link>
    )
  })()

  return (
    <HeaderScrollWrapper>
      <div className="container relative flex h-16 items-center justify-between">

        {/* ── LEFT ── */}
        {/* Mobile: hamburger button (client component handles the drawer too) */}
        {/* Desktop: nav links inline */}
        <div className="flex items-center gap-6">
          <MarketingMobileMenu
            navLinks={resolvedNavLinks}
            logo={mobileLogo}
            isMultiLangEnabled={isMultiLangEnabled}
            iconColor={iconColor}
          />

          {/* Desktop-only nav links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
            {navLinks.map((item) => {
              const linkData = item.link as LinkFieldData | undefined
              if (!linkData) return null
              const props = getLinkProps(linkData)
              if (!props.href) return null
              return (
                <Link
                  key={item.id}
                  href={props.href}
                  target={props.target}
                  rel={props.rel}
                  className={cn("text-sm font-medium transition-colors hover:opacity-80", !linkColor && "text-foreground/70 hover:text-foreground")}
                  style={linkColor ? { color: linkColor } : undefined}
                >
                  {linkData.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* ── CENTER — Logo ── */}
        <div className="absolute left-1/2 -translate-x-1/2">
          {logo?.type === 'image' && logo.image && isExpanded(logo.image) ? (
            <Link href="/">
              <Image
                src={(logo.image as Media).url || ''}
                alt={(logo.image as Media).alt || ''}
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </Link>
          ) : logo?.type === 'text' && logo.text ? (
            <Link href="/" className="text-lg font-bold" style={linkColor ? { color: linkColor } : { color: 'var(--foreground)' }}>
              {logo.text}
            </Link>
          ) : null}
        </div>

        {/* ── RIGHT ── */}
        {/* Mobile: CTA only  |  Desktop: Lang + Theme + CTA */}
        <div className="flex items-center gap-3">
          {/* Language + Theme — hidden on mobile (they're in the drawer) */}
          <div className="hidden md:flex items-center gap-3" style={iconColor ? { color: iconColor } : undefined}>
            <LanguageSwitcher isMultiLangEnabled={isMultiLangEnabled} />
            <ThemeToggle />
          </div>
          {ctaEl}
        </div>

      </div>
    </HeaderScrollWrapper>
  )
}
