import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const signOutMock = vi.fn()

vi.mock('next-auth/react', () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
}))

import Header from '@/components/Header'

describe('Header', () => {
  it('renders user details', () => {
    render(<Header user={{ name: 'Alice', email: 'alice@example.com', company: 'Acme Inc' }} />)

    expect(screen.getByText('SaaS Platform')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('(Acme Inc)')).toBeInTheDocument()
  })

  it('triggers logout action', () => {
    render(<Header user={{ email: 'alice@example.com' }} />)

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: '/login' })
  })
})
