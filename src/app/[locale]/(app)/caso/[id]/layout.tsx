import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getPayload } from '@/lib/payload/getPayload'
import { isMemberUser } from '@/lib/auth/typeGuards'

export default async function CaseLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const payload = await getPayload()
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || !isMemberUser(user)) {
    redirect(`/${locale}/login`)
  }

  const t = await getTranslations('App.CaseTabs')

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap items-center gap-2">
        <Link href={`/${locale}/caso/${id}`} className="min-h-[44px] rounded-md px-4 py-2 text-sm hover:bg-accent">
          Caso
        </Link>
        {user.role === 'abogado' ? (
          <Link
            href={`/${locale}/caso/${id}/notaria`}
            className="min-h-[44px] rounded-md px-4 py-2 text-sm hover:bg-accent"
          >
            {t('notaria')}
          </Link>
        ) : null}
      </nav>
      {children}
    </div>
  )
}
