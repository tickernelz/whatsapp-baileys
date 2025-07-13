import { NextResponse } from 'next/server'
import { createWebSocketConfig, handleWebSocketError } from '@/lib/baileys/websocket-config'

export async function GET() {
  try {
    // Test WebSocket configuration
    const config = createWebSocketConfig()
    
    // Test error handler
    const testError = new Error('bufferUtil.mask is not a function')
    const isWebSocketError = handleWebSocketError(testError)
    
    return NextResponse.json({
      success: true,
      message: 'WebSocket configuration test passed',
      config: {
        browser: config.browser,
        connectTimeoutMs: config.connectTimeoutMs,
        syncFullHistory: config.syncFullHistory,
      },
      errorHandling: {
        testError: testError.message,
        isWebSocketError,
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'WebSocket configuration test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}