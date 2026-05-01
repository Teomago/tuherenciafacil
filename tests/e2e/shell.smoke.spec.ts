import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {
  seedShellE2eMembers,
  teardownShellE2eMembers,
  type ShellE2eCredentials,
} from '../helpers/shellE2eMembers'

async function loginMember(page: Page, creds: { email: string; password: string }) {
  const res = await page.request.post('/api/members/login', {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ email: creds.email, password: creds.password }),
  })
  expect(res.ok(), await res.text()).toBeTruthy()
}

test.describe('App shell smoke (unauthenticated)', () => {
  test('redirects dashboard to login without session', async ({ page }) => {
    await page.goto('/es/dashboard')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('redirects cases page to login without session', async ({ page }) => {
    await page.goto('/es/casos')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('redirects notaria route to login without session', async ({ page }) => {
    await page.goto('/es/caso/test-id/notaria')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('redirects pending-activation to login without session', async ({ page }) => {
    await page.goto('/es/pending-activation')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('login page has no axe violations (wcag2a & wcag2aa)', async ({ page }) => {
    await page.goto('/es/login')
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    expect(results.violations).toEqual([])
  })
})

test.describe('App shell (authenticated)', () => {
  let creds: ShellE2eCredentials | undefined

  test.beforeAll(async ({}, testInfo) => {
    test.setTimeout(180000)
    const projectKey = `${testInfo.project.name}-w${testInfo.workerIndex}`
    creds = await seedShellE2eMembers(projectKey)
  })

  test.afterAll(async () => {
    test.setTimeout(180000)
    if (!creds) return
    await teardownShellE2eMembers(creds)
  })

  test('active abogado reaches caso notaria stub', async ({ page }) => {
    await loginMember(page, creds!.abogadoActive)
    await page.goto('/es/caso/test-id/notaria')
    await expect(page.getByRole('heading', { name: 'Notaría' })).toBeVisible()
  })

  test('inactive abogado is redirected to pending-activation from app', async ({ page }) => {
    await loginMember(page, creds!.abogadoInactive)
    await page.goto('/es/dashboard')
    await expect(page).toHaveURL(/\/pending-activation/)
    // Task 10.3.3: assert lawyer's name
    await expect(page.getByText('E2E')).toBeVisible()
  })

  test('cliente receives forbidden on notaria', async ({ page }) => {
    await loginMember(page, creds!.cliente)
    await page.goto('/es/caso/test-id/notaria')
    await expect(page.getByRole('heading', { name: 'Acceso restringido' })).toBeVisible()
  })

  test('dashboard shows sidebar nav after login', async ({ page }) => {
    await loginMember(page, creds!.abogadoActive)
    await page.goto('/es/dashboard')

    const openMenu = page.getByRole('button', { name: 'Abrir navegación' })
    if (await openMenu.isVisible()) {
      await openMenu.click()
    }

    await expect(page.getByRole('link', { name: 'Panel' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Mis casos' }).first()).toBeVisible()
  })

  test('cliente sees cases empty state with correct CTA', async ({ page }) => {
    await loginMember(page, creds!.cliente)
    await page.goto('/es/casos')
    await expect(page.getByRole('heading', { name: 'Mis casos' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Volver al panel' })).toBeVisible()
  })
})
