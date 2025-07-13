import WhatsAppDashboard from '@/components/WhatsAppDashboard'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                WhatsApp Baileys Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your WhatsApp connections and send messages
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Built with Baileys API
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WhatsAppDashboard />

        {/* Footer Info */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">1. Connect WhatsApp</h4>
              <p className="text-gray-600">
                Enter a session ID and click Connect. Scan the QR code with your WhatsApp mobile app.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">2. Send Messages</h4>
              <p className="text-gray-600">
                Use the message sender to send text or media messages to any WhatsApp number or group.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">3. Monitor Activity</h4>
              <p className="text-gray-600">
                View your contacts and message history in real-time through the dashboard.
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Important Notes</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Make sure your database is properly configured in the .env file</li>
              <li>• Run <code className="bg-gray-100 px-1 rounded">npx prisma migrate dev</code> to set up the database</li>
              <li>• Each session ID represents a separate WhatsApp connection</li>
              <li>• Use proper JID formats: individual (1234567890@s.whatsapp.net), group (id@g.us)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}