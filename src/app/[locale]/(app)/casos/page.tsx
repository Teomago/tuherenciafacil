import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from '@/lib/payload/getPayload'
import { isMemberUser } from '@/lib/auth/typeGuards'
import { getActiveCasesCount } from '../dashboard/queries'

export default async function CasesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const payload = await getPayload()
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || !isMemberUser(user)) {
    redirect(`/${locale}/login`)
  }

  const tDashboard = await getTranslations('App.Dashboard.Stubs')
  const tCases = await getTranslations('App.Cases')
  const initialCount = await getActiveCasesCount(user.id)

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Mis casos</h1>

      <Card>
        <CardHeader>
          <CardTitle>{tDashboard('activeCases')}</CardTitle>
          <CardDescription>
            {initialCount > 0
              ? tDashboard('hasCasesDescription', { count: initialCount })
              : tDashboard('noCasesDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold mb-6">{initialCount}</p>
          <Button asChild>
            <Link href={`/${locale}/dashboard`}>{tCases('emptyCta')}</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
