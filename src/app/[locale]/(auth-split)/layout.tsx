import React from 'react'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import '@/styles/index.css'

const inter = Inter({ subsets: ['latin'] })

export default async function AuthSplitLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await props.params
  const messages = await getMessages({ locale })

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} bg-background antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider messages={messages}>
            {props.children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
