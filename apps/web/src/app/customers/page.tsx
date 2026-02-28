import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/auth-options'
import { CustomersResponse } from '@saas/shared-types'
import CustomersList from '@/components/CustomersList'
import Header from '@/components/Header'

async function getCustomers(): Promise<CustomersResponse | null> {
  try {
    // In production, use the private/internal BFF URL
    const bffUrl = process.env.BFF_INTERNAL_URL || process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:3001'
    
    const response = await fetch(`${bffUrl}/api/customers`, {
      cache: 'no-store', // Always fetch fresh data
    })

    if (!response.ok) {
      console.error('Failed to fetch customers:', response.statusText)
      return null
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching customers:', error)
    return null
  }
}

export default async function CustomersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const customersData = await getCustomers()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={session.user} />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage and view your customer database</p>
        </div>

        {customersData ? (
          <CustomersList customers={customersData.customers} total={customersData.total} />
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600">Failed to load customers. Please try again later.</p>
          </div>
        )}
      </main>
    </div>
  )
}
