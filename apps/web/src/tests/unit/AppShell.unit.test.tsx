import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

const signOutMock = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

vi.mock('next/link', () => ({
  default: ({ href, children, onClick, className }: { href: string; children: ReactNode; onClick?: () => void; className?: string }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}))

vi.mock('next-auth/react', () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
}))

import AppShell from '@/components/AppShell'

describe('AppShell', () => {
  it('renders shell metadata and navigation items', () => {
    render(
      <AppShell user={{ name: 'Demo User', email: 'demo@example.com' }} pageTitle="Dashboard" pageSubtitle="Overview">
        <div>Dashboard Content</div>
      </AppShell>
    )

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument()
    expect(screen.getByText('Demo User')).toBeInTheDocument()
    expect(screen.getByText('Customers')).toBeInTheDocument()
    expect(screen.getByText('Task List')).toBeInTheDocument()
    expect(screen.getByText('Preferences')).toBeInTheDocument()
  })

  it('calls signOut when logout is clicked', () => {
    render(
      <AppShell user={{ name: 'Demo User' }} pageTitle="Dashboard">
        <div>Body</div>
      </AppShell>
    )

    const logoutButtons = screen.getAllByRole('button', { name: 'Logout' })
    fireEvent.click(logoutButtons[0])

    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: '/login' })
  })
})
