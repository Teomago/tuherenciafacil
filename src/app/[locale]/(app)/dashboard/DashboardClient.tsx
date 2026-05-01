'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type DashboardClientProps = {
  memberId: string
  initialCount: number
}

export function DashboardClient({ memberId, initialCount }: DashboardClientProps) {
  const locale = useLocale()
  const t = useTranslations('App.Dashboard.Stubs')
  const { data: activeCasesCount } = useQuery({
    queryKey: ['cases', memberId],
    queryFn: async () => initialCount,
    initialData: initialCount,
    staleTime: 30_000,
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('activeCases')}</CardTitle>
          <CardDescription>
            {activeCasesCount > 0
              ? t('hasCasesDescription', { count: activeCasesCount })
              : t('noCasesDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold">{activeCasesCount}</p>
        </CardContent>
      </Card>

      <Button asChild>
        <Link href={`/${locale}/casos`}>{t('noCasesCta')}</Link>
      </Button>
    </div>
  )
}
