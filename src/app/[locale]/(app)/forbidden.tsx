import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/** `params` can be missing when this UI is rendered from `forbidden()` (auth interrupt). */
export default async function ForbiddenPage({
  params,
}: {
  params?: Promise<{ locale: string } | undefined>
}) {
  const fromParams = params !== undefined ? await params : undefined
  const locale = fromParams?.locale ?? (await getLocale())

  const t = await getTranslations({ locale, namespace: 'App.Errors.forbidden' })

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('description')}</p>
        <Button asChild className="mt-6">
          <Link href={`/${locale}/dashboard`}>{t('cta')}</Link>
        </Button>
      </Card>
    </main>
  )
}
