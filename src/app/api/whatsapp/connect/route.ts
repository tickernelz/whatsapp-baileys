import { NextRequest, NextResponse } from 'next/server'
import { whatsappManager } from '@/lib/baileys/whatsapp-service'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const service = whatsappManager.getInstance(sessionId)
    
    let qrCodeData: string | null = null
    let connectionState = 'connecting'

    // Set up QR code handler
    service.onQRCode = async (qr: string) => {
      try {
        qrCodeData = await QRCode.toDataURL(qr)
      } catch (error) {
        console.error('Failed to generate QR code:', error)
      }
    }

    // Set up connection update handler
    service.onConnectionUpdate = (update) => {
      if (update.connection) {
        connectionState = update.connection
      }
    }

    // Start connection
    await service.connect()

    // Wait a bit for QR code generation
    await new Promise(resolve => setTimeout(resolve, 2000))

    return NextResponse.json({
      success: true,
      sessionId,
      qrCode: qrCodeData,
      connectionState,
      isConnected: service.isConnected()
    })

  } catch (error) {
    console.error('Connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to WhatsApp' },
      { status: 500 }
    )
  }
}