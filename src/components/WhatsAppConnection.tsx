'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Smartphone, Wifi, WifiOff, Loader2, QrCode, AlertTriangle } from 'lucide-react'

interface ConnectionStatus {
  sessionId: string
  isConnected: boolean
  connectionState: string
  qrCode?: string
}

interface WhatsAppConnectionProps {
  sessionId?: string
  onSessionChange?: (sessionId: string) => void
}

export default function WhatsAppConnection({ sessionId: propSessionId, onSessionChange }: WhatsAppConnectionProps) {
  const [sessionId, setSessionId] = useState(propSessionId || 'default')
  const [inputSessionId, setInputSessionId] = useState(propSessionId || 'default') // Separate state for input
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = useCallback(async () => {
    if (!sessionId) return
    
    try {
      const response = await fetch(`/api/whatsapp/status?sessionId=${sessionId}`)
      const data = await response.json()
      setStatus(data)
      setError(null)
    } catch (error) {
      console.error('Failed to check status:', error)
      setError('Failed to check connection status')
    }
  }, [sessionId])

  // Update sessionId when prop changes
  useEffect(() => {
    if (propSessionId && propSessionId !== sessionId) {
      setSessionId(propSessionId)
      setInputSessionId(propSessionId)
      setQrCode(null)
      setError(null)
    }
  }, [propSessionId, sessionId])

  const connect = async () => {
    if (!inputSessionId.trim()) {
      setError('Please enter a session ID')
      return
    }

    // Update the actual sessionId only when connecting
    const connectingSessionId = inputSessionId.trim()
    setSessionId(connectingSessionId)
    if (onSessionChange) {
      onSessionChange(connectingSessionId)
    }

    setIsConnecting(true)
    setQrCode(null)
    setError(null)
    
    try {
      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: connectingSessionId })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect')
      }
      
      if (data.qrCode) {
        setQrCode(data.qrCode)
      }
      
      setStatus(data)
      
      // Poll for connection status
      const pollInterval = setInterval(async () => {
        await checkStatus()
        const currentStatus = await fetch(`/api/whatsapp/status?sessionId=${connectingSessionId}`)
        const currentData = await currentStatus.json()
        
        if (currentData.isConnected) {
          clearInterval(pollInterval)
          setIsConnecting(false)
          setQrCode(null)
        }
      }, 2000)
      
      // Stop polling after 2 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        setIsConnecting(false)
      }, 120000)
      
    } catch (error) {
      console.error('Failed to connect:', error)
      setError(error instanceof Error ? error.message : 'Failed to connect')
      setIsConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      await fetch(`/api/whatsapp/status?sessionId=${sessionId}`, {
        method: 'DELETE'
      })
      setStatus(null)
      setQrCode(null)
      setError(null)
    } catch (error) {
      console.error('Failed to disconnect:', error)
      setError('Failed to disconnect')
    }
  }

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  const getStatusBadge = () => {
    if (!status) return <Badge variant="outline">Unknown</Badge>
    
    switch (status.connectionState) {
      case 'connected':
        return <Badge variant="success">Connected</Badge>
      case 'connecting':
        return <Badge variant="warning">Connecting</Badge>
      case 'disconnected':
        return <Badge variant="destructive">Disconnected</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">{status.connectionState}</Badge>
    }
  }

  const handleSessionIdChange = (value: string) => {
    setInputSessionId(value)
    // Don't trigger onSessionChange until user actually connects
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          WhatsApp Connection
        </CardTitle>
        <CardDescription>
          Manage your WhatsApp connection and view status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Session ID (e.g., my-session)"
            value={inputSessionId}
            onChange={(e) => handleSessionIdChange(e.target.value)}
            className="flex-1"
            disabled={isConnecting}
          />
          {status?.isConnected ? (
            <Button onClick={disconnect} variant="destructive" disabled={isConnecting}>
              <WifiOff className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <Button onClick={connect} disabled={isConnecting || !inputSessionId.trim()}>
              {isConnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4 mr-2" />
              )}
              Connect
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge()}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {qrCode && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <QrCode className="h-4 w-4" />
              Scan QR Code with WhatsApp
            </div>
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="WhatsApp QR Code for connection" className="max-w-xs border rounded" />
            </div>
            <p className="text-xs text-muted-foreground">
              Open WhatsApp → Settings → Linked Devices → Link a Device
            </p>
          </div>
        )}

        {isConnecting && !qrCode && (
          <div className="text-center py-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Initializing connection...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}