'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { History, RefreshCw, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'

interface Message {
  id: string
  messageId: string
  fromJid: string
  toJid: string
  type: string
  content?: string
  mediaUrl?: string
  caption?: string
  isFromMe: boolean
  isGroup: boolean
  status: string
  timestamp: string
  createdAt: string
  contact?: {
    name?: string
    pushName?: string
  }
  group?: {
    name: string
  }
}

interface MessageResponse {
  messages: Message[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface MessageHistoryProps {
  sessionId: string
}

export default function MessageHistory({ sessionId }: MessageHistoryProps) {
  const [jidFilter, setJidFilter] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })
  const [isLoading, setIsLoading] = useState(false)

  const loadMessages = useCallback(async (page = 1) => {
    if (!sessionId) return
    
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        sessionId,
        page: page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (jidFilter) {
        params.append('jid', jidFilter)
      }

      const response = await fetch(`/api/whatsapp/messages?${params}`)
      const data: MessageResponse = await response.json()
      
      setMessages(data.messages || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, jidFilter, pagination.limit])

  useEffect(() => {
    loadMessages(1)
  }, [loadMessages])

  const formatJid = (jid: string) => {
    if (jid.includes('@s.whatsapp.net')) {
      return jid.replace('@s.whatsapp.net', '')
    }
    if (jid.includes('@g.us')) {
      return jid.split('@')[0] + ' (Group)'
    }
    return jid
  }

  const getDisplayName = (message: Message) => {
    if (message.isGroup && message.group) {
      return message.group.name
    }
    if (message.contact?.name || message.contact?.pushName) {
      return message.contact.name || message.contact.pushName
    }
    return formatJid(message.isFromMe ? message.toJid : message.fromJid)
  }

  const getMessageContent = (message: Message) => {
    if (message.content) {
      return message.content
    }
    if (message.caption) {
      return `[${message.type}] ${message.caption}`
    }
    return `[${message.type.toUpperCase()}]`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="outline">Sent</Badge>
      case 'delivered':
        return <Badge variant="secondary">Delivered</Badge>
      case 'read':
        return <Badge variant="success">Read</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const nextPage = () => {
    if (pagination.page < pagination.pages) {
      loadMessages(pagination.page + 1)
    }
  }

  const prevPage = () => {
    if (pagination.page > 1) {
      loadMessages(pagination.page - 1)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Message History ({pagination.total})
        </CardTitle>
        <CardDescription>
          View sent and received messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Filter by JID (optional)"
            value={jidFilter}
            onChange={(e) => setJidFilter(e.target.value)}
            className="flex-1"
          />
          <Button onClick={() => loadMessages(1)} disabled={isLoading} size="icon">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isLoading ? 'Loading messages...' : 'No messages found'}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 border rounded-lg ${
                  message.isFromMe ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {message.isFromMe ? 'You' : getDisplayName(message)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {message.type}
                      </Badge>
                      {message.isGroup && (
                        <Badge variant="secondary" className="text-xs">
                          Group
                        </Badge>
                      )}
                      {message.isFromMe && getStatusBadge(message.status)}
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      {getMessageContent(message)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatJid(message.isFromMe ? message.toJid : message.fromJid)}</span>
                      <span>•</span>
                      <span>{new Date(message.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <MessageSquare className="h-4 w-4 text-muted-foreground ml-2" />
                </div>
              </div>
            ))
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <Button
              onClick={prevPage}
              disabled={pagination.page <= 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </span>
            
            <Button
              onClick={nextPage}
              disabled={pagination.page >= pagination.pages}
              variant="outline"
              size="sm"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}