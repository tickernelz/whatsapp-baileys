'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Smartphone, RefreshCw, Plus, Trash2 } from 'lucide-react'

interface Session {
  id: string
  sessionId: string
  isConnected: boolean
  isRealTimeConnected: boolean
  connectionState: string
  phoneNumber?: string
  lastSeenFormatted?: string
  status: string
}

interface SessionSelectorProps {
  onSessionSelect: (sessionId: string) => void
  selectedSessionId?: string
}

export default function SessionSelector({ onSessionSelect, selectedSessionId }: SessionSelectorProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp/sessions')
      const data = await response.json()
      if (data.success) {
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      await fetch(`/api/whatsapp/status?sessionId=${sessionId}`, {
        method: 'DELETE'
      })
      await fetchSessions()
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const getStatusBadge = (session: Session) => {
    if (session.isRealTimeConnected) {
      return <Badge variant="success">Connected</Badge>
    }
    
    switch (session.status) {
      case 'connected':
        return <Badge variant="warning">Reconnecting</Badge>
      case 'connecting':
        return <Badge variant="warning">Connecting</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'disconnected':
      default:
        return <Badge variant="outline">Disconnected</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            WhatsApp Sessions
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessions}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          Select an existing session or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Select Session:</label>
            <Select value={selectedSessionId} onValueChange={onSessionSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a session..." />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.sessionId} value={session.sessionId}>
                    <div className="flex items-center justify-between w-full">
                      <span>{session.sessionId}</span>
                      <div className="ml-2">
                        {getStatusBadge(session)}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {sessions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Session Details:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className={`p-3 border rounded-lg ${
                    selectedSessionId === session.sessionId ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.sessionId}</span>
                        {getStatusBadge(session)}
                      </div>
                      {session.phoneNumber && (
                        <p className="text-sm text-muted-foreground">
                          Phone: {session.phoneNumber}
                        </p>
                      )}
                      {session.lastSeenFormatted && (
                        <p className="text-xs text-muted-foreground">
                          Last seen: {session.lastSeenFormatted}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSession(session.sessionId)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sessions.length === 0 && !loading && (
          <div className="text-center py-6 text-muted-foreground">
            <Plus className="h-8 w-8 mx-auto mb-2" />
            <p>No sessions found. Create your first session below.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}