import { NextResponse } from 'next/server'
import { registerUser } from '@/lib/register'

export async function POST(req: Request) {
    try {
        const { name, username, email, password } = await req.json()

        const result = await registerUser({
            name,
            username,
            email,
            password
        })

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Registration failed' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: 'User registered successfully' },
            { status: 201 }
        )
    } catch (error) {
        console.error('Registration API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
