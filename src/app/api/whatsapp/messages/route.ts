import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic' // Ensure dynamic rendering for request-dependent data
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')
    const jid = searchParams.get('jid')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const where: { sessionId: string; OR?: Array<{ fromJid: string } | { toJid: string }> } = { sessionId }
    if (jid) {
      where.OR = [
        { fromJid: jid },
        { toJid: jid }
      ]
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,

      }),
      prisma.message.count({ where })
    ])

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    )
  }
}