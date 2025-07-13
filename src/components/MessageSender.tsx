'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Send, MessageSquare, Image, Video, FileText, Loader2 } from 'lucide-react'

interface MessageSenderProps {
  sessionId: string
}

export default function MessageSender({ sessionId }: MessageSenderProps) {
  const [jid, setJid] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'text' | 'image' | 'video' | 'document'>('text')
  const [mediaUrl, setMediaUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)

  const sendMessage = async () => {
    if (!sessionId || !jid || !message) {
      setLastResult('Please fill in all required fields')
      return
    }

    setIsSending(true)
    setLastResult(null)

    try {
      const payload: {
        sessionId: string;
        jid: string;
        message: string;
        type: 'text' | 'image' | 'video' | 'document';
        mediaUrl?: string;
        caption?: string;
      } = {
        sessionId,
        jid,
        message,
        type: messageType
      }

      if (messageType !== 'text') {
        if (!mediaUrl) {
          setLastResult('Media URL is required for media messages')
          setIsSending(false)
          return
        }
        payload.mediaUrl = mediaUrl
        if (caption) payload.caption = caption
      }

      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        setLastResult(`Message sent successfully! ID: ${data.messageId}`)
        if (messageType === 'text') {
          setMessage('')
        } else {
          setMediaUrl('')
          setCaption('')
        }
      } else {
        setLastResult(`Failed to send message: ${data.error}`)
      }
    } catch (error) {
      setLastResult(`Error: ${error}`)
    } finally {
      setIsSending(false)
    }
  }

  const getIcon = () => {
    switch (messageType) {
      // eslint-disable-next-line jsx-a11y/alt-text
      case 'image': return <Image className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Message
        </CardTitle>
        <CardDescription>
          Send text or media messages to WhatsApp contacts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">WhatsApp ID</label>
          <Input
            placeholder="WhatsApp ID (e.g., 1234567890@s.whatsapp.net)"
            value={jid}
            onChange={(e) => setJid(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Use format: 1234567890@s.whatsapp.net for individuals, groupid@g.us for groups
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Message Type</label>
          <div className="flex gap-2">
            {(['text', 'image', 'video', 'document'] as const).map((type) => (
              <Button
                key={type}
                variant={messageType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMessageType(type)}
                className="flex items-center gap-1"
              >
                {type === 'text' && <MessageSquare className="h-3 w-3" />}
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                {type === 'image' && <Image className="h-3 w-3" />}
                {type === 'video' && <Video className="h-3 w-3" />}
                {type === 'document' && <FileText className="h-3 w-3" />}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {messageType === 'text' ? (
          <Textarea
            placeholder="Enter your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        ) : (
          <div className="space-y-2">
            <Input
              placeholder="Media URL or file path"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
            <Input
              placeholder="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <Input
              placeholder="Message content (for media description)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        )}

        <Button onClick={sendMessage} disabled={isSending} className="w-full">
          {isSending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            getIcon()
          )}
          <span className="ml-2">
            {isSending ? 'Sending...' : `Send ${messageType.charAt(0).toUpperCase() + messageType.slice(1)}`}
          </span>
        </Button>

        {lastResult && (
          <div className={`p-3 rounded text-sm ${
            lastResult.includes('successfully') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {lastResult}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>JID Examples:</strong></p>
          <p>• Individual: 1234567890@s.whatsapp.net</p>
          <p>• Group: 1234567890-1234567890@g.us</p>
          <p>• Broadcast: 1234567890@broadcast</p>
        </div>
      </CardContent>
    </Card>
  )
}