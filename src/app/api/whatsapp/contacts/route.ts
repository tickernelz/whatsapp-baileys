import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { PrismaClient } from '@/generated/prisma'
import { whatsappManager } from '@/lib/baileys/whatsapp-service'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const sessionId = searchParams.get('sessionId')
    const refresh = searchParams.get('refresh') === 'true'

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    let contacts = []

    if (refresh) {
      // Manual refresh - get contacts from WhatsApp service (includes store)
      const service = whatsappManager.getInstance(sessionId)
      contacts = await service.refreshContacts()
    } else {
      // Regular fetch - get contacts from database only
      const dbContacts = await prisma.contact.findMany({
        where: { sessionId },
        orderBy: { name: 'asc' }
      })
      contacts = dbContacts
    }

    return NextResponse.json({ 
      contacts,
      refreshed: refresh,
      count: contacts.length
    })

  } catch (error) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { error: 'Failed to get contacts' },
      { status: 500 }
    )
  }
}