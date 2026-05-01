'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

export function HeaderScrollWrapper({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    // Check initial scroll position
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-colors duration-300',
        isScrolled
          ? 'border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      {children}
    </header>
  )
}
