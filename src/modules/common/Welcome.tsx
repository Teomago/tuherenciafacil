import React from 'react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export async function Welcome() {
  const t = await getTranslations('Welcome')

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-background px-6">
      <div className="relative max-w-lg text-center rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="absolute right-4 top-4 flex items-center gap-1">
          <LanguageSwitcher isMultiLangEnabled={true} />
          <ThemeToggle />
        </div>

        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border-2 border-border">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
        </div>

        <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
          {t('title')}
        </h1>

        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {t('description')}
        </p>

        <div className="mb-8 rounded-lg border border-border bg-muted/30 p-6 text-left">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('gettingStarted')}
          </h2>
          <ol className="space-y-3 text-sm text-foreground/80">
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                1
              </span>
              <span>
                {t('step1pre')}
                <Link href="/admin" className="font-medium text-foreground underline underline-offset-4">
                  {t('step1link')}
                </Link>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                2
              </span>
              <span>
                {t('step2pre')}<strong>{t('step2bold')}</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                3
              </span>
              <span>
                {t('step3pre')}<strong>{t('step3bold')}</strong>{t('step3post')}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                4
              </span>
              <span>{t('step4')}</span>
            </li>
          </ol>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t('openAdmin')}
        </Link>
      </div>
    </div>
  )
}
