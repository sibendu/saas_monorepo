import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Fetch customer data from database
        const customer = await prisma.customer.findFirst({
            where: {
                email: session.user.email || ''
            }
        })

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            name: customer.name,
            company: customer.company,
            email: customer.email
        })
    } catch (error) {
        console.error('Preferences fetch error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { name, company } = await req.json()

        // Validate input
        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            )
        }

        // Update customer in database
        const customer = await prisma.customer.updateMany({
            where: {
                email: session.user.email || ''
            },
            data: {
                name,
                company: company || null
            }
        })

        if (customer.count === 0) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            )
        }

        console.log('--- USER PREFERENCES UPDATED ---')
        console.log('User Email:', session.user.email)
        console.log('Name:', name)
        console.log('Company:', company || '(not provided)')
        console.log('--------------------------------')

        return NextResponse.json(
            { message: 'Preferences updated successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Preferences update error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
