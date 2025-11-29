import { NextResponse } from 'next/server'
import { matchCrystals } from '@/lib/crystal-matcher'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { birthDate, birthTime, concerns } = body

        // Validate input
        if (!birthDate) {
            return NextResponse.json(
                { error: 'Birth date is required' },
                { status: 400 }
            )
        }

        if (!concerns || concerns.length === 0) {
            return NextResponse.json(
                { error: 'At least one concern is required' },
                { status: 400 }
            )
        }

        // Parse birth date
        const parsedDate = new Date(birthDate)
        if (isNaN(parsedDate.getTime())) {
            return NextResponse.json(
                { error: 'Invalid birth date' },
                { status: 400 }
            )
        }

        // Parse birth time if provided
        let parsedTime
        if (birthTime) {
            const [hour, minute] = birthTime.split(':').map(Number)
            if (!isNaN(hour) && !isNaN(minute)) {
                parsedTime = { hour, minute }
            }
        }

        // Call matcher
        const results = await matchCrystals({
            birthDate: parsedDate,
            birthTime: parsedTime,
            concerns
        })

        return NextResponse.json(results)
    } catch (error) {
        console.error('Crystal match error:', error)
        return NextResponse.json(
            { error: 'Failed to find crystal matches' },
            { status: 500 }
        )
    }
}
