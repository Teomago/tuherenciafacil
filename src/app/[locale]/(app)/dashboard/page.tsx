import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { isMemberUser } from '@/lib/auth/typeGuards'
import { getPayload } from '@/lib/payload/getPayload'
import { DashboardClient } from './DashboardClient'
import { getActiveCasesCount } from './queries'

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const payload = await getPayload()
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || !isMemberUser(user)) {
    redirect(`/${locale}/login`)
  }

  const t = await getTranslations('App.Dashboard.Stubs')
  const queryClient = new QueryClient()
  const initialCount = await getActiveCasesCount(user.id)

  await queryClient.prefetchQuery({
    queryKey: ['cases', user.id],
    queryFn: async () => initialCount,
  })

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t('welcome', { name: user.firstName })}</h1>
        <p className="text-muted-foreground">{t('noCases')}</p>
      </div>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <DashboardClient memberId={user.id} initialCount={initialCount} />
      </HydrationBoundary>
    </section>
  )
}
