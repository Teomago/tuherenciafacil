import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from '@/lib/payload/getPayload'
import { AppShell } from '@/components/shell/AppShell'
import { UserProvider } from '@/providers/UserProvider'

import { resolveAuthGuardResolution } from './AuthGuard.logic'

export type { AuthGuardAction, AuthGuardResolution } from './AuthGuard.logic'
export { resolveAuthGuardAction, resolveAuthGuardResolution } from './AuthGuard.logic'

export async function AuthGuard({
  children,
  locale,
}: {
  children: React.ReactNode
  locale: string
}) {
  const payload = await getPayload()
  const { user } = await payload.auth({ headers: await headers() })
  const resolution = resolveAuthGuardResolution(user)

  if (resolution.outcome === 'redirect_login') {
    redirect(`/${locale}/login`)
  }

  if (resolution.outcome === 'redirect_pending_activation') {
    redirect(`/${locale}/pending-activation`)
  }

  return (
    <UserProvider user={resolution.member}>
      <AppShell>{children}</AppShell>
    </UserProvider>
  )
}
