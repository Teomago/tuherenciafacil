import React from 'react'
import { cn } from '@/lib/utils/cn'
import { containerVariants } from '@/lib/variants/containerVariants'
import { spaceVariants } from '@/lib/variants/spaceVariants'
import { RichText } from '@/modules/richText'

interface BlockWrapperProps {
  /** The HTML tag to render (div, section, article) */
  htmlTag?: 'div' | 'section' | 'article' | null
  /** Container type (none, default, post) */
  containerType?: 'none' | 'default' | 'post' | null
  /** Padding size */
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom' | null
  /** Margin size */
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom' | null
  /** Custom padding value */
  customPadding?: string | null
  /** Custom margin value */
  customMargin?: string | null
  /** Rich text content shown before the block */
  prefix?: any
  /** Rich text content shown after the block */
  suffix?: any
  /** Whether prefix is enabled */
  withPrefix?: boolean | null
  /** Whether suffix is enabled */
  withSuffix?: boolean | null
  /** Block name for debugging */
  blockName?: string | null
  /** Block ID */
  id?: string | null
  /** Additional CSS classes */
  className?: string
  children: React.ReactNode
}

/**
 * Shared block wrapper that applies common block settings:
 * - HTML tag (section, div, article)
 * - Container width (none, default, post)
 * - Spacing (margin/padding with size)
 * - Prefix/suffix rich text content
 */
export function Block({
  htmlTag,
  containerType,
  padding,
  margin,
  customPadding,
  customMargin,
  prefix,
  suffix,
  withPrefix,
  withSuffix,
  blockName,
  id,
  className,
  children,
}: BlockWrapperProps) {
  const Tag = htmlTag || 'div'

  const isCustomPadding = padding === 'custom'
  const isCustomMargin = margin === 'custom'
  
  const paddingClasses =
    padding && padding !== 'none' && !isCustomPadding
      ? spaceVariants({
          type: 'padding',
          variant: 'y',
          size: padding as any,
        })
      : undefined

  const marginClasses =
    margin && margin !== 'none' && !isCustomMargin
      ? spaceVariants({
          type: 'margin',
          variant: 'y',
          size: margin as any,
        })
      : undefined

  const customStyle: React.CSSProperties = {
    ...(isCustomPadding && customPadding ? { paddingTop: customPadding, paddingBottom: customPadding } : {}),
    ...(isCustomMargin && customMargin ? { marginTop: customMargin, marginBottom: customMargin } : {}),
  }

  const containerClasses = containerVariants({
    type: containerType === 'none' ? 'none' : containerType || 'default',
    container: containerType !== 'none',
    variant: 'standard',
  })

  return (
    <Tag
      className={cn(paddingClasses, marginClasses, containerClasses, className)}
      style={Object.keys(customStyle).length > 0 ? customStyle : undefined}
      id={id || undefined}
      data-block={blockName || undefined}
    >
      {withPrefix && prefix && (
        <RichText data={prefix} enableProse enableGutter={false} className="mb-8" />
      )}
      {children}
      {withSuffix && suffix && (
        <RichText data={suffix} enableProse enableGutter={false} className="mt-8" />
      )}
    </Tag>
  )
}
