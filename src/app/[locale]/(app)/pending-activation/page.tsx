import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from '@/lib/payload/getPayload'
import { isMemberUser } from '@/lib/auth/typeGuards'
import { logout } from '@/app/[locale]/(frontend)/actions/auth'

export default async function PendingActivationPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const payload = await getPayload()
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) redirect(`/${locale}/login`)
  if (!isMemberUser(user) || user.isActive !== false) redirect(`/${locale}/app`)

  const contactEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@tuherenciafacil.com'

  async function handleLogout() {
    'use server'
    await logout()
    redirect(`/${locale}/login`)
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="text-2xl font-semibold text-foreground">Cuenta pendiente de activación</h1>
        <p className="mt-3 text-muted-foreground">
          Tu cuenta está pendiente de activación por parte del administrador. Una vez activada,
          cierra sesión y vuelve a iniciar para acceder a la plataforma.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          ¿Tienes preguntas?{' '}
          <a
            href={`mailto:${contactEmail}`}
            className="underline text-foreground hover:text-muted-foreground transition-colors"
          >
            Contáctanos
          </a>
        </p>
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
