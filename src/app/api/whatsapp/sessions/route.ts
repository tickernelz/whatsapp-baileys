import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { whatsappManager } from '@/lib/baileys/whatsapp-service'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get all sessions from database
    const sessions = await prisma.whatsAppSession.findMany({
      orderBy: { lastSeen: 'desc' }
    })

    // Also check for sessions with auth files but not in database
    const authSessionsDir = path.join(process.cwd(), 'auth_sessions')
    let authSessions: string[] = []
    
    if (fs.existsSync(authSessionsDir)) {
      authSessions = fs.readdirSync(authSessionsDir).filter(dir => {
        const dirPath = path.join(authSessionsDir, dir)
        return fs.statSync(dirPath).isDirectory()
      })
    }

    // Check real-time connection status for each session
    const sessionsWithStatus = sessions.map(session => {
      const service = whatsappManager.getInstance(session.sessionId)
      const isRealTimeConnected = service.isConnected()
      const connectionState = service.getConnectionState()
      
      // Check if auth files exist
      const authDir = path.join(process.cwd(), 'auth_sessions', session.sessionId)
      const hasAuthFiles = fs.existsSync(authDir) && fs.readdirSync(authDir).length > 0
      
      return {
        ...session,
        isRealTimeConnected,
        connectionState,
        hasAuthFiles,
        canRestore: hasAuthFiles && !isRealTimeConnected,
        lastSeenFormatted: session.lastSeen ? new Date(session.lastSeen).toLocaleString() : null
      }
    })

    // Add sessions that have auth files but aren't in database
    const dbSessionIds = sessions.map(s => s.sessionId)
    const orphanedSessions = authSessions.filter(sessionId => !dbSessionIds.includes(sessionId))
    
    const orphanedSessionsWithStatus = orphanedSessions.map(sessionId => {
      const service = whatsappManager.getInstance(sessionId)
      const isRealTimeConnected = service.isConnected()
      const connectionState = service.getConnectionState()
      
      return {
        sessionId,
        status: 'orphaned',
        isConnected: false,
        lastSeen: null,
        isRealTimeConnected,
        connectionState,
        hasAuthFiles: true,
        canRestore: true,
        lastSeenFormatted: null
      }
    })

    return NextResponse.json({
      success: true,
      sessions: [...sessionsWithStatus, ...orphanedSessionsWithStatus],
      totalSessions: sessionsWithStatus.length + orphanedSessionsWithStatus.length,
      orphanedSessions: orphanedSessionsWithStatus.length
    })

  } catch (error) {
    console.error('Failed to get sessions:', error)
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    )
  }
}