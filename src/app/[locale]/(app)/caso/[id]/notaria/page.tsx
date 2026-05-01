import { headers } from 'next/headers'
import { forbidden, redirect } from 'next/navigation'
import { getPayload } from '@/lib/payload/getPayload'
import { isMemberUser } from '@/lib/auth/typeGuards'

export default async function NotariaPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale } = await params
  const payload = await getPayload()
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || !isMemberUser(user)) {
    redirect(`/${locale}/login`)
  }

  if (user.role !== 'abogado') {
    forbidden()
  }

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold text-foreground">Notaría</h1>
      <p className="text-muted-foreground">Espacio de trabajo notarial (stub RFC-004).</p>
    </section>
  )
}
