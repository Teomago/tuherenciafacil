import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from '@/lib/payload/getPayload'
import { isMemberUser } from '@/lib/auth/typeGuards'
import { logout } from '@/app/[locale]/(frontend)/actions/auth'
import { Button } from '@/components/ui/button'

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
      <div className="max-w-md px-4 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Hola, {user.firstName}</h1>
        <p className="mt-3 text-muted-foreground">
          Tu cuenta está pendiente de activación por parte del administrador. Una vez activada,
          cierra sesión y vuelve a iniciar para acceder a la plataforma.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          ¿Tienes preguntas?{' '}
          <a
            href={`mailto:${contactEmail}`}
            className="text-foreground underline transition-colors hover:text-muted-foreground"
          >
            Contáctanos
          </a>
        </p>
        <form action={handleLogout} className="mt-6">
          <Button type="submit" variant="outline">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </main>
  )
}
