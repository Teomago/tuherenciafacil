import { describe, expect, it } from 'vitest'
import { buildGlobalShellNavItems } from '@/components/shell/navItems'

describe('buildGlobalShellNavItems', () => {
  it('always includes Dashboard and Casos', () => {
    const items = buildGlobalShellNavItems()
    expect(items.map((item) => item.href)).toEqual(['/dashboard', '/casos'])
  })

  it('does not include case-scoped notaria link', () => {
    const items = buildGlobalShellNavItems()
    expect(items.some((item) => item.href.includes('/caso/') || item.href.includes('/notaria'))).toBe(
      false,
    )
  })
})
