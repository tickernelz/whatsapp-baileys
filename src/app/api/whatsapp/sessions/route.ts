import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { whatsappManager } from '@/lib/baileys/whatsapp-service'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get all sessions from database
    const sessions = await prisma.whatsAppSession.findMany({
      orderBy: { lastSeen: 'desc' }
    })

    // Check real-time connection status for each session
    const sessionsWithStatus = sessions.map(session => {
      const service = whatsappManager.getInstance(session.sessionId)
      const isRealTimeConnected = service.isConnected()
      const connectionState = service.getConnectionState()
      
      return {
        ...session,
        isRealTimeConnected,
        connectionState,
        lastSeenFormatted: session.lastSeen ? new Date(session.lastSeen).toLocaleString() : null
      }
    })

    return NextResponse.json({
      success: true,
      sessions: sessionsWithStatus
    })

  } catch (error) {
    console.error('Failed to get sessions:', error)
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    )
  }
}