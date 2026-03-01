import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: ReactNode }) => <div data-testid="session-provider">{children}</div>,
}))

import { AuthProvider } from '@/components/AuthProvider'

describe('AuthProvider', () => {
  it('wraps children with session provider', () => {
    render(
      <AuthProvider>
        <span>Secure Content</span>
      </AuthProvider>
    )

    expect(screen.getByTestId('session-provider')).toBeInTheDocument()
    expect(screen.getByText('Secure Content')).toBeInTheDocument()
  })
})
