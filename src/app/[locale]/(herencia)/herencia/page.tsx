import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from '@/lib/payload/getPayload'

export default async function HerenciaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const payload = await getPayload()

  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    redirect(`/${locale}/login`)
  }

  const name = ('firstName' in user ? user.firstName : user.name) || user.email

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Bienvenido, {name}</h1>
        <p className="mt-2 text-muted-foreground">Tu proceso de sucesión comienza aquí.</p>
      </div>
    </main>
  )
}
