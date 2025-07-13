import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Get contacts from database
    const contacts = await prisma.contact.findMany({
      where: { sessionId },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ contacts })

  } catch (error) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { error: 'Failed to get contacts' },
      { status: 500 }
    )
  }
}