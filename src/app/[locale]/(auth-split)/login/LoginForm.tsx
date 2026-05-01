'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

interface LoginFormProps {
  coverImageUrl: string | null
  isMultiLangEnabled: boolean
}

export function LoginForm({ coverImageUrl, isMultiLangEnabled }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('Auth')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/members/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        router.push(`/${locale}/app`)
        // Keep loading=true — button stays disabled until the component unmounts on navigation
        return
      }

      const data = await res.json()
      setError(data?.errors?.[0]?.message || t('invalidCredentials'))
    } catch {
      setError(t('somethingWentWrong'))
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left column — cover image, managed from Admin › Settings › Site Settings */}
      {coverImageUrl && (
        <div className="relative hidden lg:block lg:w-1/2">
          <Image
            src={coverImageUrl}
            alt="tuHerenciaFácil"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Right column — header + form */}
      <div className={`flex flex-col ${coverImageUrl ? 'w-full lg:w-1/2' : 'w-full'}`}>
        {/* Top bar */}
        <header className="flex items-center justify-between p-6">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="h-4 w-4 text-foreground/80 group-hover:text-foreground transition-colors" />
            <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
              {t('backToHome')}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher isMultiLangEnabled={isMultiLangEnabled} />
            <ThemeToggle />
          </div>
        </header>

        {/* Form area */}
        <main
          id="login-main"
          className="flex flex-1 flex-col items-center justify-center px-8 py-8"
        >
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground/75 tracking-widest uppercase">
                tuHerenciaFácil
              </p>
              <h1 className="text-3xl font-bold tracking-tight">{t('welcomeBack')}</h1>
              <p className="text-sm text-foreground/80">{t('loginDescription')}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">
                  {t('email')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">
                  {t('password')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('minCharsPlaceholder')}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm font-medium rounded-md bg-red-950/20 p-3 border border-red-900">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? t('signingIn') : t('signIn')}
              </Button>
            </form>

            <div className="flex flex-col items-center gap-2 text-sm">
              <Link
                href={`/${locale}/forgot-password`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {t('forgotPassword')}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {t('createAccount')}
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
