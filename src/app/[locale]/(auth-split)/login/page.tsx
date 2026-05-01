import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getCachedGlobal } from '@/modules/common/data'
import type { Media, SiteSetting } from '@/payload/payload-types'
import { LoginForm } from './LoginForm'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Auth' })
  return { title: t('signIn') }
}

export default async function LoginPage({ params }: Props) {
  await params
  const settings = await getCachedGlobal<SiteSetting>('site-settings', 1)

  const image = settings.loginCoverImage
  const coverImageUrl =
    image && typeof image === 'object' ? (image as Media).url ?? null : null

  const isMultiLangEnabled = settings.enableMultiLanguage !== false

  return <LoginForm coverImageUrl={coverImageUrl} isMultiLangEnabled={isMultiLangEnabled} />
}
