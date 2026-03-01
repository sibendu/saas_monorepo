import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import ForgotPasswordPage from './page'
import { server } from '@/tests/msw/server'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}))

describe('ForgotPasswordPage integration', () => {
  it('submits email and shows success message', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email'), 'direct@example.com')
    await user.click(screen.getByRole('button', { name: 'Send Reset Link' }))

    expect(await screen.findByText(/If your account is eligible/i)).toBeInTheDocument()
  })

  it('shows social-login guidance when api returns social message', async () => {
    server.use(
      http.post('*/api/auth/forgot-password', async () =>
        HttpResponse.json({
          message: 'You registered using your Google or Github account, please use the same to Login',
        })
      )
    )

    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email'), 'social@example.com')
    await user.click(screen.getByRole('button', { name: 'Send Reset Link' }))

    expect(await screen.findByText(/Google or Github account/i)).toBeInTheDocument()
  })
})
