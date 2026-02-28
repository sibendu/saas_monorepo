'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AppShell from '@/components/AppShell'

export default function PreferencesPage() {
    const router = useRouter()
    const { data: session, status, update } = useSession()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        company: '',
    })
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated' && session?.user) {
            // Fetch current preferences from database
            const fetchPreferences = async () => {
                try {
                    const response = await fetch('/api/preferences')
                    if (response.ok) {
                        const data = await response.json()
                        setFormData({
                            name: data.name || '',
                            email: data.email || session.user.email || '',
                            username: (session.user as any).username || session.user.email || '',
                            company: data.company || '',
                        })
                    } else {
                        // Fallback to session data if fetch fails
                        setFormData({
                            name: session.user.name || '',
                            email: session.user.email || '',
                            username: (session.user as any).username || session.user.email || '',
                            company: '',
                        })
                    }
                } catch (error) {
                    console.error('Failed to fetch preferences:', error)
                    // Fallback to session data
                    setFormData({
                        name: session.user.name || '',
                        email: session.user.email || '',
                        username: (session.user as any).username || session.user.email || '',
                        company: '',
                    })
                }
            }
            fetchPreferences()
        }
    }, [status, session, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!formData.name) {
            setError('Name is required')
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    company: formData.company,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update preferences')
            }

            console.log('Preferences updated successfully')
            // Update session to refresh user data and clear isNewUser flag
            await update()
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'An error occurred while updating preferences.')
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <AppShell
            user={session?.user}
            pageTitle="Preferences"
            pageSubtitle="Configure your account preferences"
        >
            <div className="max-w-md w-full mx-auto space-y-8">
                <div className="bg-white rounded-2xl shadow-2xl p-10 transform transition-all">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                            Complete Your Profile
                        </h1>
                        <p className="text-gray-500 mt-3 text-lg">Set up your preferences</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full px-5 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={formData.username}
                                disabled
                                className="w-full px-5 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                placeholder="Your full name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                                Company / Organization
                            </label>
                            <input
                                id="company"
                                type="text"
                                value={formData.company}
                                onChange={handleChange}
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                placeholder="Your company name (optional)"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </AppShell>
    )
}
