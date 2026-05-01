import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { Media } from '@/components/display/Media'
import { RichText } from '@/modules/richText'
import { Button } from '@/components/buttons'
import { getLinkProps } from '@/lib/utils/getLinkProps'
import type { HeroBlockType } from '@/payload/payload-types'

type HeroBlockProps = Omit<HeroBlockType, 'blockType' | 'blockName'>

/**
 * Hero block component.
 * Supports four layouts: contentLeft, contentRight, contentCenter, overlay.
 */
export function HeroBlock({ heading, subheading, body, links, media, design }: HeroBlockProps) {
  if (!heading) return null

  const layout = design?.layout || 'contentLeft'
  const hasMedia = !!media

  const content = (
    <div
      className={cn(
        'flex flex-col gap-6',
        layout === 'contentCenter' && 'items-center text-center',
        // In overlay modes the image provides a dark backdrop regardless of the OS theme,
        // so we force white on the container and let cascade handle all children.
        (layout === 'overlay' || layout === 'fullOverlay') && 'items-center text-center text-white',
      )}
    >
      {subheading && (
        <p
          className={cn(
            'text-sm font-semibold uppercase tracking-widest',
            layout === 'overlay' || layout === 'fullOverlay' ? 'text-white/90!' : 'text-primary/80',
          )}
        >
          {subheading}
        </p>
      )}
      <h1
        className={cn(
          'text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl leading-[1.1]',
          layout === 'overlay' || layout === 'fullOverlay'
            ? 'text-white! drop-shadow-lg'
            : 'drop-shadow-sm text-foreground',
        )}
      >
        {heading}
      </h1>
      {body && (
        <div
          className={cn(
            'max-w-2xl text-lg',
            layout === 'overlay' || layout === 'fullOverlay'
              ? 'text-white/85!'
              : 'text-muted-foreground',
          )}
        >
          <RichText
            data={body}
            enableProse
            enableGutter={false}
            invert={layout === 'overlay' || layout === 'fullOverlay'}
          />
        </div>
      )}
      {links && links.length > 0 && (
        <div className="flex flex-wrap gap-4 pt-4">
          {links.map((item, index) => {
            const linkData = item.link
            const props = getLinkProps(linkData)
            if (!props.href) return null

            const isPrimary = Number(index) === 0
            const variant = isPrimary ? (linkData.appearance as any) || 'default' : 'outline'

            return (
              <Button
                key={item.id || index}
                variant={variant}
                size={(linkData.size as any) || 'lg'}
                className={cn(
                  isPrimary &&
                    'shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow',
                  'rounded-full px-8',
                )}
                asChild
              >
                <Link href={props.href} target={props.target} rel={props.rel}>
                  {linkData.label}
                </Link>
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )

  const heightMaps = {
    default: 'min-h-[70vh]',
    medium: 'min-h-[85vh]',
    full: 'min-h-[100vh]',
  }
  const heroHeightOption = (design as any)?.heroHeight || 'default'
  const isCustomHeight = heroHeightOption === 'custom'
  const customHeightValue = (design as any)?.customHeroHeight
  
  const minHeightClass = isCustomHeight ? '' : (heightMaps[heroHeightOption as keyof typeof heightMaps] || 'min-h-[70vh]')
  const customStyle = isCustomHeight && customHeightValue ? { minHeight: customHeightValue } : {}

  // Center layout — stacked content, optional media below
  if (layout === 'contentCenter') {
    return (
      <div className={cn("flex flex-col items-center gap-8", minHeightClass)} style={customStyle}>
        {content}
        {hasMedia && (
          // self-stretch overrides items-center so the media fills the full container width
          <div className="self-stretch w-full relative aspect-video">
            <Media
              resource={media}
              fill
              className="rounded-2xl shadow-2xl ring-1 ring-border/50 object-cover"
            />
          </div>
        )}
      </div>
    )
  }

  // Overlay layouts — media as background with content overlay
  if (layout === 'overlay' || layout === 'fullOverlay') {
    const isFull = layout === 'fullOverlay'
    return (
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-700',
          minHeightClass,
          isFull ? 'w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]' : 'rounded-3xl',
        )}
        style={customStyle}
      >
        {hasMedia && (
          <div className="absolute inset-0">
            <Media
              resource={media}
              fill
              className="object-cover transition-transform duration-1000 scale-105"
            />
            {/* Stronger gradient so text stays readable in both light & dark OS themes */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/55 to-black/20" />
          </div>
        )}
        {/* Glass card — mx-4 on mobile so it doesn't bleed to screen edges */}
        <div
          className={cn(
            'relative z-10 py-16 sm:py-24 w-full backdrop-blur-sm bg-black/20 border border-white/15 shadow-2xl rounded-2xl',
            'mx-4 px-6 sm:mx-8 sm:px-10',
            isFull ? 'max-w-7xl lg:mx-auto' : 'max-w-6xl mx-auto',
          )}
        >
          {content}
        </div>
      </div>
    )
  }

  // Two-column layout (contentLeft / contentRight)
  const mediaFirst = layout === 'contentRight'

  return (
    <div className={cn("grid items-center gap-8 lg:grid-cols-2 lg:gap-12", minHeightClass)} style={customStyle}>
      <div className={cn(mediaFirst && 'lg:order-2')}>{content}</div>
      {hasMedia && (
        <div className={cn(mediaFirst && 'lg:order-1')}>
          <Media
            resource={media}
            className="rounded-3xl shadow-2xl ring-1 ring-border/50 -rotate-1 hover:rotate-0 transition-all duration-500"
          />
        </div>
      )}
    </div>
  )
}
