import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { whatsappManager } from '@/lib/baileys/whatsapp-service'
import { PrismaClient } from '@/generated/prisma'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // First check if session exists in database or has auth files
    const session = await prisma.whatsAppSession.findUnique({
      where: { sessionId }
    })

    const authDir = path.join(process.cwd(), 'auth_sessions', sessionId)
    const hasAuthFiles = fs.existsSync(authDir) && fs.readdirSync(authDir).length > 0

    // Only get service instance if session exists in DB or has auth files
    if (session || hasAuthFiles) {
      const service = whatsappManager.getInstance(sessionId)
      
      return NextResponse.json({
        sessionId,
        isConnected: service.isConnected(),
        connectionState: service.getConnectionState(),
        session: session || null
      })
    } else {
      // Session doesn't exist yet
      return NextResponse.json({
        sessionId,
        isConnected: false,
        connectionState: 'disconnected',
        session: null
      })
    }

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Disconnect and remove from memory
    const service = whatsappManager.getInstance(sessionId)
    await service.disconnect()
    whatsappManager.removeInstance(sessionId)

    // Delete from database (this will cascade delete related messages, contacts, etc.)
    await prisma.whatsAppSession.delete({
      where: { sessionId }
    })

    // Clean up auth session files
    const authDir = path.join(process.cwd(), 'auth_sessions', sessionId)
    if (fs.existsSync(authDir)) {
      try {
        fs.rmSync(authDir, { recursive: true, force: true })
        console.log(`Auth session files deleted for ${sessionId}`)
      } catch (fileError) {
        console.warn(`Failed to delete auth files for ${sessionId}:`, fileError)
      }
    }

    console.log(`Session ${sessionId} deleted successfully`)
    return NextResponse.json({ success: true, message: 'Session deleted successfully' })

  } catch (error) {
    console.error('Delete session error:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}