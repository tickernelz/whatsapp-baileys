// Custom WebSocket configuration for Baileys in Next.js environment
import { SocketConfig } from '@whiskeysockets/baileys'

export const createWebSocketConfig = (): Partial<SocketConfig> => {
  const config: Partial<SocketConfig> = {
    // Browser configuration to avoid detection issues
    browser: ['WhatsApp Baileys', 'Chrome', '4.0.0'],
    
    // Connection timeouts
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    
    // Retry configuration
    retryRequestDelayMs: 250,
    maxMsgRetryCount: 5,
    
    // Disable features that might cause issues
    syncFullHistory: false,
    markOnlineOnConnect: false,
    printQRInTerminal: false,
    generateHighQualityLinkPreview: true,
    
    // Message retrieval function
    getMessage: async () => {
      return undefined
    },
  }

  // Add server-specific configurations
  if (typeof window === 'undefined') {
    // Server-side specific configurations
    config.logger = {
      level: 'error', // Reduce logging on server
      child: () => config.logger!,
      trace: () => {},
      debug: () => {},
      info: () => {},
      warn: console.warn,
      error: console.error,
    }
  }

  return config
}

// WebSocket error handler
export const handleWebSocketError = (error: Error | unknown): boolean => {
  const errorMessage = (error as Error)?.message || ''
  
  // Check for buffer utility errors
  if (errorMessage.includes('bufferUtil.mask is not a function') ||
      errorMessage.includes('bufferUtil.unmask is not a function')) {
    console.error('WebSocket buffer utility error detected:', errorMessage)
    console.log('This is a known compatibility issue between Next.js and the ws library.')
    console.log('The connection will be retried with a longer delay.')
    return true // Indicates this is a known error
  }
  
  // Check for other WebSocket-related errors
  if (errorMessage.includes('WebSocket') || errorMessage.includes('ws')) {
    console.error('WebSocket error:', errorMessage)
    return true
  }
  
  return false // Unknown error
}

const webSocketConfig = { createWebSocketConfig, handleWebSocketError }

export default webSocketConfig