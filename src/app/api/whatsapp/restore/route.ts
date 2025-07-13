import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { whatsappManager } from '@/lib/baileys/whatsapp-service'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Check if auth files exist
    const authDir = path.join(process.cwd(), 'auth_sessions', sessionId)
    const hasAuthFiles = fs.existsSync(authDir) && fs.readdirSync(authDir).length > 0

    if (!hasAuthFiles) {
      return NextResponse.json({ 
        error: 'No auth files found for this session' 
      }, { status: 404 })
    }

    const service = whatsappManager.getInstance(sessionId)
    
    // Check if already connected
    if (service.isConnected()) {
      return NextResponse.json({
        success: true,
        message: 'Session is already connected',
        sessionId,
        connectionState: service.getConnectionState()
      })
    }

    // Attempt to restore the session
    console.log(`Restoring session: ${sessionId}`)
    await service.refreshConnectionState()

    // Wait a moment for connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000))

    return NextResponse.json({
      success: true,
      message: 'Session restoration initiated',
      sessionId,
      connectionState: service.getConnectionState(),
      isConnected: service.isConnected()
    })

  } catch (error) {
    console.error('Session restoration error:', error)
    return NextResponse.json(
      { error: 'Failed to restore session' },
      { status: 500 }
    )
  }
}