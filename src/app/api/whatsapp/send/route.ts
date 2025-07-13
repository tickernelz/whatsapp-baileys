import { NextRequest, NextResponse } from 'next/server'
import { whatsappManager } from '@/lib/baileys/whatsapp-service'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, jid, message, type = 'text', mediaUrl, caption } = await request.json()
    
    if (!sessionId || !jid || !message) {
      return NextResponse.json({ 
        error: 'Session ID, JID, and message are required' 
      }, { status: 400 })
    }

    const service = whatsappManager.getInstance(sessionId)
    
    if (!service.isConnected()) {
      return NextResponse.json({ 
        error: 'WhatsApp is not connected' 
      }, { status: 400 })
    }

    let result
    
    switch (type) {
      case 'text':
        result = await service.sendTextMessage(jid, message)
        break
      
      case 'image':
      case 'video':
      case 'audio':
      case 'document':
        if (!mediaUrl) {
          return NextResponse.json({ 
            error: 'Media URL is required for media messages' 
          }, { status: 400 })
        }
        result = await service.sendMediaMessage(jid, mediaUrl, type, caption)
        break
      
      default:
        return NextResponse.json({ 
          error: 'Invalid message type' 
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      messageId: result?.key?.id,
      timestamp: result?.messageTimestamp
    })

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}