// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { DashboardClient } from '../../../src/app/[locale]/(app)/dashboard/DashboardClient'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('next-intl', () => ({
  useLocale: () => 'es',
  useTranslations: () => (key: string, values?: Record<string, any>) => {
    if (key === 'noCasesDescription') return 'Aún no tienes un proceso activo.'
    if (key === 'hasCasesDescription') return `Tienes ${values?.count} caso(s) activo(s).`
    return key
  },
}))

// No need to mock react-query

describe('DashboardClient copy logic', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders noCasesDescription when activeCasesCount is 0', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardClient memberId="123" initialCount={0} />
      </QueryClientProvider>
    )

    expect(screen.getByText('Aún no tienes un proceso activo.')).toBeDefined()
    expect(screen.queryByText(/Tienes 0 caso\(s\) activo\(s\)\./)).toBeNull()
  })

  it('renders hasCasesDescription with count when activeCasesCount > 0', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardClient memberId="123" initialCount={2} />
      </QueryClientProvider>
    )

    expect(screen.getByText('Tienes 2 caso(s) activo(s).')).toBeDefined()
    expect(screen.queryByText('Aún no tienes un proceso activo.')).toBeNull()
  })
})
