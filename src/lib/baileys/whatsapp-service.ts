// Import WebSocket polyfill first
import '../websocket-polyfill'

import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState, 
  WASocket, 
  WAMessage,
  Contact,
  GroupMetadata,
  downloadMediaMessage,
  getContentType
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { PrismaClient } from '@/generated/prisma'
import { createWebSocketConfig, handleWebSocketError } from './websocket-config'
import path from 'path'
import fs from 'fs'

export interface WhatsAppServiceConfig {
  sessionId: string
  printQRInTerminal?: boolean
  markOnlineOnConnect?: boolean
}

export class WhatsAppService {
  private socket: WASocket | null = null
  private prisma: PrismaClient
  private sessionId: string
  private authDir: string
  private isConnecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private connectionState: string = 'disconnected'
  
  // Event callbacks
  public onQRCode?: (qr: string) => void
  public onConnectionUpdate?: (state: { connection?: string; lastDisconnect?: { error?: Error }; qr?: string }) => void
  public onMessage?: (message: WAMessage) => void
  public onContactsUpdate?: (contacts: Contact[]) => void

  constructor(config: WhatsAppServiceConfig) {
    this.sessionId = config.sessionId
    this.authDir = path.join(process.cwd(), 'auth_sessions', this.sessionId)
    this.prisma = new PrismaClient()
    this.connectionState = 'disconnected' // Initialize connection state
    
    // Note: Auth directory will be created only when connecting, not in constructor
  }

  async connect(): Promise<void> {
    if (this.isConnecting) {
      console.log(`Session ${this.sessionId} is already connecting`)
      return
    }

    if (this.socket && this.isConnected()) {
      console.log(`Session ${this.sessionId} is already connected`)
      return
    }

    this.isConnecting = true
    console.log(`Starting connection for session: ${this.sessionId}`)

    try {
      // Create auth directory only when actually connecting
      if (!fs.existsSync(this.authDir)) {
        fs.mkdirSync(this.authDir, { recursive: true })
        console.log(`Created auth directory for session: ${this.sessionId}`)
      }

      // Clean up any existing socket first
      if (this.socket) {
        try {
          await this.socket.logout()
        } catch (error) {
          console.log('Error during socket cleanup:', error)
        }
        this.socket = null
      }

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir)
      
      // Get WebSocket configuration
      const wsConfig = createWebSocketConfig()
      
      this.socket = makeWASocket({
        auth: state,
        ...wsConfig,
      })

      console.log(`Socket created for session ${this.sessionId}`)
      this.connectionState = 'connecting'

      // Handle QR code
      this.socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update
        
        console.log(`Connection update for session ${this.sessionId}:`, { connection, qr: !!qr, lastDisconnect: !!lastDisconnect })
        
        if (qr && this.onQRCode) {
          this.onQRCode(qr)
        }

        if (this.onConnectionUpdate) {
          this.onConnectionUpdate(update)
        }

        // Update connection state
        if (connection) {
          console.log(`Connection state changed for session ${this.sessionId}: ${this.connectionState} -> ${connection}`)
          this.connectionState = connection
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut
          
          console.log(`Connection closed for session ${this.sessionId}. Status code: ${statusCode}`)
          
          // Handle specific error codes
          this.connectionState = 'disconnected'
          await this.updateSessionStatus('disconnected')
          
          // Check if the error is related to WebSocket buffer utilities
          const isWebSocketError = handleWebSocketError(lastDisconnect?.error)
          if (isWebSocketError) {
            // Don't retry immediately for WebSocket-related errors
            setTimeout(() => {
              this.isConnecting = false
              this.socket = null
              if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++
                console.log(`Reconnecting after WebSocket error... Attempt ${this.reconnectAttempts}`)
                this.connect()
              }
            }, 10000) // Wait longer for WebSocket errors
          } else if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
            setTimeout(() => {
              this.isConnecting = false
              this.socket = null
              this.connect()
            }, 5000)
          } else {
            this.isConnecting = false
            this.socket = null
            this.reconnectAttempts = 0
          }
        } else if (connection === 'open') {
          console.log(`WhatsApp connection opened for session ${this.sessionId}`)
          this.connectionState = 'open'
          this.reconnectAttempts = 0
          await this.updateSessionStatus('connected')
          await this.syncContacts()
        } else if (connection === 'connecting') {
          this.connectionState = 'connecting'
          await this.updateSessionStatus('connecting')
        }
      })

      // Handle incoming messages
      this.socket.ev.on('messages.upsert', async ({ messages, type }) => {
        for (const message of messages) {
          if (type === 'notify') {
            await this.handleIncomingMessage(message)
            if (this.onMessage) {
              this.onMessage(message)
            }
          }
        }
      })

      // Handle contacts update
      this.socket.ev.on('contacts.upsert', async (contacts) => {
        await this.handleContactsUpdate(contacts)
        if (this.onContactsUpdate) {
          this.onContactsUpdate(contacts)
        }
      })

      // Save credentials when updated
      this.socket.ev.on('creds.update', saveCreds)

      this.isConnecting = false

    } catch (error) {
      console.error('Failed to connect:', error)
      this.isConnecting = false
      await this.updateSessionStatus('error')
      
      // Check if this is a WebSocket-related error
      const isWebSocketError = handleWebSocketError(error)
      if (isWebSocketError) {
        console.log('WebSocket error detected during connection setup. This may be resolved by retrying.')
      }
      
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      await this.socket.logout()
      this.socket = null
      this.connectionState = 'disconnected'
      await this.updateSessionStatus('disconnected')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendMessage(jid: string, content: any, options?: any): Promise<WAMessage | null | undefined> {
    if (!this.socket) {
      throw new Error('WhatsApp not connected')
    }

    if (!this.isConnected()) {
      throw new Error('WhatsApp session is not authenticated')
    }

    try {
      console.log(`Sending message to ${jid} from session ${this.sessionId}`)
      const message = await this.socket.sendMessage(jid, content, options)
      if (message) {
        await this.saveMessageToDatabase(message, true)
      }
      return message
    } catch (error) {
      console.error('Failed to send message:', error)
      
      // Check if this is a stream error
      if (error instanceof Error && error.message.includes('stream errored out')) {
        console.log('Stream error detected, marking session as disconnected')
        this.connectionState = 'disconnected'
        await this.updateSessionStatus('error')
        this.socket = null
      }
      
      throw error
    }
  }

  async sendTextMessage(jid: string, text: string): Promise<WAMessage | null | undefined> {
    return this.sendMessage(jid, { text })
  }

  async sendMediaMessage(jid: string, mediaPath: string, type: 'image' | 'video' | 'audio' | 'document', caption?: string): Promise<WAMessage | null | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content: any = {
      [type]: { url: mediaPath }
    }
    
    if (caption && (type === 'image' || type === 'video')) {
      content.caption = caption
    }

    return this.sendMessage(jid, content)
  }

  async getContacts(): Promise<Contact[]> {
    // Get contacts from database
    const contacts = await this.prisma.contact.findMany({
      where: { sessionId: this.sessionId }
    })
    return contacts as Contact[]
  }

  async getChats() {
    // Get chats from database or implement chat storage
    return []
  }

  async getGroups(): Promise<GroupMetadata[]> {
    if (!this.socket) return []
    
    try {
      const groups = await this.socket.groupFetchAllParticipating()
      return Object.values(groups)
    } catch (error) {
      console.error('Failed to fetch groups:', error)
      return []
    }
  }

  async createGroup(name: string, participants: string[]): Promise<GroupMetadata | null> {
    if (!this.socket) {
      throw new Error('WhatsApp not connected')
    }

    try {
      const group = await this.socket.groupCreate(name, participants)
      return group
    } catch (error) {
      console.error('Failed to create group:', error)
      throw error
    }
  }

  async downloadMedia(message: WAMessage): Promise<Buffer | null> {
    try {
      const buffer = await downloadMediaMessage(
        message,
        'buffer',
        {}
      )
      return buffer as Buffer
    } catch (error) {
      console.error('Failed to download media:', error)
      return null
    }
  }

  isConnected(): boolean {
    // Check if socket exists, connection is open, and user is authenticated
    return !!(this.socket && this.connectionState === 'open' && this.socket.user)
  }

  getConnectionState(): string {
    if (!this.socket) return 'disconnected'
    if (this.isConnecting) return 'connecting'
    return this.connectionState
  }

  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      isConnected: this.isConnected(),
      connectionState: this.getConnectionState(),
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      user: this.socket?.user || null
    }
  }

  // Force refresh connection state by checking if socket is actually connected
  async refreshConnectionState(): Promise<void> {
    if (this.socket && this.socket.user) {
      try {
        // Try to get the socket state - if this works, we're connected
        const state = this.socket.authState
        if (state && state.creds && state.creds.me) {
          this.connectionState = 'open'
          await this.updateSessionStatus('connected')
          console.log(`Refreshed connection state for session ${this.sessionId}: connected`)
        }
      } catch (error) {
        console.log(`Failed to refresh connection state for session ${this.sessionId}:`, error)
        this.connectionState = 'disconnected'
        await this.updateSessionStatus('disconnected')
      }
    } else {
      // Check if we have auth credentials but no active socket
      try {
        if (fs.existsSync(this.authDir)) {
          const files = fs.readdirSync(this.authDir)
          if (files.length > 0) {
            console.log(`Session ${this.sessionId} has auth files but no active socket. Attempting reconnection.`)
            // Try to reconnect if we have auth files but no socket
            if (!this.isConnecting) {
              this.connect().catch(error => {
                console.error(`Failed to auto-reconnect session ${this.sessionId}:`, error)
              })
            }
          }
        }
      } catch (error) {
        console.log(`Error checking auth files for session ${this.sessionId}:`, error)
      }
    }
  }

  private async updateSessionStatus(status: string): Promise<void> {
    try {
      await this.prisma.whatsAppSession.upsert({
        where: { sessionId: this.sessionId },
        update: { 
          status,
          lastSeen: new Date(),
          isConnected: status === 'connected'
        },
        create: {
          sessionId: this.sessionId,
          status,
          isConnected: status === 'connected',
          lastSeen: new Date()
        }
      })
    } catch (error) {
      console.error('Failed to update session status:', error)
    }
  }

  private async ensureSessionExists(): Promise<void> {
    try {
      await this.prisma.whatsAppSession.upsert({
        where: { sessionId: this.sessionId },
        update: { 
          lastSeen: new Date()
        },
        create: {
          sessionId: this.sessionId,
          status: 'connected',
          isConnected: true,
          lastSeen: new Date()
        }
      })
    } catch (error) {
      console.error('Failed to ensure session exists:', error)
      throw error
    }
  }

  private async handleIncomingMessage(message: WAMessage): Promise<void> {
    await this.saveMessageToDatabase(message, false)
  }

  private async saveMessageToDatabase(message: WAMessage | undefined, isFromMe: boolean): Promise<void> {
    if (!message) return
    
    try {
      // Ensure session exists before saving message
      await this.ensureSessionExists()
      
      const messageType = getContentType(message.message || {})
      const content = this.extractMessageContent(message)
      
      await this.prisma.message.create({
        data: {
          messageId: message.key.id || '',
          fromJid: message.key.remoteJid || '',
          toJid: message.key.remoteJid || '',
          type: messageType || 'unknown',
          content: content,
          isFromMe,
          isGroup: message.key.remoteJid?.endsWith('@g.us') || false,
          timestamp: new Date(message.messageTimestamp as number * 1000),
          sessionId: this.sessionId
        }
      })
    } catch (error) {
      console.error('Failed to save message to database:', error)
    }
  }

  private extractMessageContent(message: WAMessage): string {
    const messageContent = message.message
    if (!messageContent) return ''

    if (messageContent.conversation) {
      return messageContent.conversation
    }
    
    if (messageContent.extendedTextMessage?.text) {
      return messageContent.extendedTextMessage.text
    }

    if (messageContent.imageMessage?.caption) {
      return messageContent.imageMessage.caption
    }

    if (messageContent.videoMessage?.caption) {
      return messageContent.videoMessage.caption
    }

    return '[Media Message]'
  }

  private async handleContactsUpdate(contacts: Contact[]): Promise<void> {
    // Ensure session exists before saving contacts
    await this.ensureSessionExists()
    
    for (const contact of contacts) {
      try {
        await this.prisma.contact.upsert({
          where: {
            sessionId_jid: {
              sessionId: this.sessionId,
              jid: contact.id
            }
          },
          update: {
            name: contact.name,
            pushName: contact.notify
          },
          create: {
            jid: contact.id,
            name: contact.name,
            pushName: contact.notify,
            sessionId: this.sessionId
          }
        })
      } catch (error) {
        console.error('Failed to save contact:', error)
      }
    }
  }

  private async syncContacts(): Promise<void> {
    try {
      // Sync contacts from WhatsApp if available
      console.log('Syncing contacts...')
    } catch (error) {
      console.error('Failed to sync contacts:', error)
    }
  }

  async cleanup(): Promise<void> {
    await this.prisma.$disconnect()
  }
}

// Singleton instance manager
class WhatsAppManager {
  private instances: Map<string, WhatsAppService> = new Map()

  getInstance(sessionId: string): WhatsAppService {
    if (!this.instances.has(sessionId)) {
      const service = new WhatsAppService({ sessionId })
      this.instances.set(sessionId, service)
    }
    return this.instances.get(sessionId)!
  }

  removeInstance(sessionId: string): void {
    const instance = this.instances.get(sessionId)
    if (instance) {
      instance.cleanup()
      this.instances.delete(sessionId)
    }
  }

  getAllInstances(): WhatsAppService[] {
    return Array.from(this.instances.values())
  }
}

export const whatsappManager = new WhatsAppManager()