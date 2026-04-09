import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getPayload } from '@/lib/payload/getPayload'
import { isMemberUser } from '@/lib/auth/typeGuards'
import { logout } from '@/app/[locale]/(frontend)/actions/auth'

export default async function AppPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const payload = await getPayload()

  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    redirect(`/${locale}/login`)
  }

  if (isMemberUser(user) && user.role === 'abogado' && user.isActive === false) {
    redirect(`/${locale}/pending-activation`)
  }

  const name = ('firstName' in user ? user.firstName : user.name) || user.email
  const t = await getTranslations('App')

  async function handleLogout() {
    'use server'
    await logout()
    redirect(`/${locale}/login`)
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">{t('welcomeMessage', { user: name })}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
        <form action={handleLogout} className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 text-sm border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  )
}
