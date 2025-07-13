'use client'

import { useState } from 'react'
import SessionSelector from './SessionSelector'
import WhatsAppConnection from './WhatsAppConnection'
import MessageSender from './MessageSender'
import ContactsList from './ContactsList'
import MessageHistory from './MessageHistory'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function WhatsAppDashboard() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('')

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SessionSelector 
          onSessionSelect={setSelectedSessionId}
          selectedSessionId={selectedSessionId}
        />
        <WhatsAppConnection 
          sessionId={selectedSessionId}
          onSessionChange={setSelectedSessionId}
        />
      </div>

      {selectedSessionId && (
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="messages">Send Messages</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="history">Message History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages" className="space-y-4">
            <MessageSender sessionId={selectedSessionId} />
          </TabsContent>
          
          <TabsContent value="contacts" className="space-y-4">
            <ContactsList sessionId={selectedSessionId} />
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <MessageHistory sessionId={selectedSessionId} />
          </TabsContent>
        </Tabs>
      )}

      {!selectedSessionId && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">Select or create a session to get started</p>
          <p className="text-sm">Choose an existing session from the list above or create a new one by entering a session ID and clicking Connect.</p>
        </div>
      )}
    </div>
  )
}