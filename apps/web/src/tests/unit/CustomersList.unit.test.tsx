import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import CustomersList from '@/components/CustomersList'

describe('CustomersList', () => {
  it('renders customer rows and total count', () => {
    render(
      <CustomersList
        total={2}
        customers={[
          {
            id: '1',
            name: 'Acme',
            email: 'acme@example.com',
            company: 'Acme Corp',
            phone: '+1-111',
            status: 'active',
            createdAt: '2026-03-01T00:00:00Z',
          },
          {
            id: '2',
            name: 'Beta',
            email: 'beta@example.com',
            company: 'Beta Inc',
            phone: '+1-222',
            status: 'pending',
            createdAt: '2026-03-01T00:00:00Z',
          },
        ]}
      />
    )

    expect(screen.getByText('All Customers (2)')).toBeInTheDocument()
    expect(screen.getByText('acme@example.com')).toBeInTheDocument()
    expect(screen.getByText('beta@example.com')).toBeInTheDocument()
  })

  it('shows empty-state text when there are no customers', () => {
    render(<CustomersList total={0} customers={[]} />)

    expect(screen.getByText('No customers found.')).toBeInTheDocument()
  })
})
