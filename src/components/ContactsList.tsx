'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, Search, RefreshCw, MessageCircle } from 'lucide-react'

interface Contact {
  id: string
  jid: string
  name?: string
  pushName?: string
  phone?: string
  isBlocked: boolean
  createdAt: string
  updatedAt: string
}

interface ContactsListProps {
  sessionId: string
}

export default function ContactsList({ sessionId }: ContactsListProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const loadContacts = useCallback(async () => {
    if (!sessionId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/whatsapp/contacts?sessionId=${sessionId}`)
      const data = await response.json()
      setContacts(data.contacts || [])
      setFilteredContacts(data.contacts || [])
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  useEffect(() => {
    const filtered = contacts.filter(contact => {
      const searchLower = searchTerm.toLowerCase()
      return (
        contact.name?.toLowerCase().includes(searchLower) ||
        contact.pushName?.toLowerCase().includes(searchLower) ||
        contact.jid.toLowerCase().includes(searchLower) ||
        contact.phone?.toLowerCase().includes(searchLower)
      )
    })
    setFilteredContacts(filtered)
  }, [searchTerm, contacts])

  const formatJid = (jid: string) => {
    if (jid.includes('@s.whatsapp.net')) {
      return jid.replace('@s.whatsapp.net', '')
    }
    return jid
  }

  const getDisplayName = (contact: Contact) => {
    return contact.name || contact.pushName || formatJid(contact.jid)
  }

  const copyJid = (jid: string) => {
    navigator.clipboard.writeText(jid)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Contacts ({filteredContacts.length})
        </CardTitle>
        <CardDescription>
          View and manage your WhatsApp contacts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={loadContacts} disabled={isLoading} className="ml-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Contacts
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isLoading ? 'Loading contacts...' : 'No contacts found'}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">
                      {getDisplayName(contact)}
                    </h4>
                    {contact.isBlocked && (
                      <Badge variant="destructive" className="text-xs">
                        Blocked
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {formatJid(contact.jid)}
                  </p>
                  {contact.phone && (
                    <p className="text-xs text-muted-foreground">
                      {contact.phone}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyJid(contact.jid)}
                    className="text-xs"
                  >
                    Copy JID
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // This could trigger opening the message sender with this contact
                      const event = new CustomEvent('selectContact', { 
                        detail: { jid: contact.jid, name: getDisplayName(contact) } 
                      })
                      window.dispatchEvent(event)
                    }}
                  >
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {contacts.length > 0 && (
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}