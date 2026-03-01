import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const DEMO_DELAY_MS = Number(process.env.PW_DEMO_DELAY_MS ?? 2500)
const POST_LOGIN_HOLD_MS = Number(process.env.PW_POST_LOGIN_HOLD_MS ?? 3000)

async function demoPause(page: Page, ms = DEMO_DELAY_MS) {
  await page.waitForTimeout(ms)
}

test('login page renders', async ({ page }) => {
  await page.goto('/login')
  await demoPause(page)

  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
  await expect(page.locator('#email')).toBeVisible()
  await expect(page.locator('#password')).toBeVisible()
})

test('login to dashboard with configured credentials', async ({ page }) => {
  test.skip(!process.env.E2E_LOGIN_EMAIL || !process.env.E2E_LOGIN_PASSWORD, 'E2E credentials not configured')

  await page.goto('/login')
  await demoPause(page)

  await page.fill('#email', process.env.E2E_LOGIN_EMAIL as string)
  await page.fill('#password', process.env.E2E_LOGIN_PASSWORD as string)

  await demoPause(page)

  await page.getByRole('button', { name: 'Sign In' }).click()

  await page.waitForURL('**/dashboard', { timeout: 15000 })
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  await demoPause(page, POST_LOGIN_HOLD_MS)
})