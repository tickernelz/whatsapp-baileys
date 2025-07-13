# WhatsApp Baileys Admin Dashboard

A comprehensive admin dashboard for managing WhatsApp connections using the Baileys API. Built with Next.js 14, TypeScript, Prisma, and TailwindCSS.

## Features

### 🔌 Connection Management
- **QR Code Authentication**: Scan QR codes to link WhatsApp accounts
- **Multi-Session Support**: Manage multiple WhatsApp sessions simultaneously
- **Real-time Status**: Monitor connection status and health
- **Auto-Reconnection**: Automatic reconnection on connection drops

### 💬 Message Management
- **Send Text Messages**: Send text messages to individuals and groups
- **Media Support**: Send images, videos, audio, and documents
- **Message History**: View sent and received message logs
- **Bulk Messaging**: Send messages to multiple recipients (planned)

### 👥 Contact & Group Management
- **Contact List**: View and manage WhatsApp contacts
- **Group Management**: Create and manage WhatsApp groups
- **Search & Filter**: Find contacts and messages quickly
- **Real-time Sync**: Automatic contact synchronization

### 📊 Dashboard Features
- **Real-time Updates**: Live status updates and notifications
- **Message Analytics**: Track message delivery and read status
- **Session Management**: Monitor multiple WhatsApp sessions
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS, Lucide React Icons
- **Backend**: Next.js API Routes, Baileys WhatsApp API
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Session-based (WhatsApp QR/Pairing)

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- WhatsApp account for linking

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whatsapp-baileys
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your database:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/whatsapp_baileys"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the dashboard**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Quick Setup Script

For automated setup, run:
```bash
node setup-db.js
```

## Usage Guide

### 1. Connect WhatsApp

1. Enter a unique **Session ID** (e.g., "main", "business", "support")
2. Click **Connect**
3. Scan the QR code with your WhatsApp mobile app:
   - Open WhatsApp → Settings → Linked Devices → Link a Device
4. Wait for connection confirmation

### 2. Send Messages

1. Ensure WhatsApp is connected (green status)
2. Enter the recipient's **WhatsApp ID** (JID):
   - Individual: `1234567890@s.whatsapp.net`
   - Group: `1234567890-1234567890@g.us`
3. Choose message type (Text, Image, Video, Audio, Document)
4. Enter your message content
5. Click **Send**

### 3. View Contacts & Messages

- **Contacts**: Automatically synced from your WhatsApp
- **Message History**: View all sent/received messages
- **Search**: Filter contacts and messages
- **Real-time Updates**: New messages appear automatically

## API Endpoints

### Connection Management
- `POST /api/whatsapp/connect` - Connect WhatsApp session
- `GET /api/whatsapp/status` - Get connection status
- `DELETE /api/whatsapp/status` - Disconnect session

### Messaging
- `POST /api/whatsapp/send` - Send message
- `GET /api/whatsapp/messages` - Get message history

### Data Management
- `GET /api/whatsapp/contacts` - Get contacts
- `GET /api/whatsapp/groups` - Get groups (planned)

## Database Schema

The application uses the following main models:

- **WhatsAppSession**: Manages connection sessions
- **Contact**: Stores WhatsApp contacts
- **Group**: Manages WhatsApp groups
- **Message**: Logs all messages
- **BulkMessage**: Handles bulk messaging (planned)

## Configuration

### Environment Variables

```env
# Required
DATABASE_URL="postgresql://username:password@localhost:5432/whatsapp_baileys"

# Optional
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Session Management

Each WhatsApp connection requires a unique session ID. Sessions are stored in:
- Database: Connection metadata and status
- File System: `auth_sessions/{sessionId}/` - Authentication credentials
- Memory: Active connection state

## Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── whatsapp/      # WhatsApp API endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── WhatsAppConnection.tsx
│   ├── MessageSender.tsx
│   ├── ContactsList.tsx
│   └── MessageHistory.tsx
├── lib/                   # Utilities
│   ├── baileys/          # Baileys service
│   └── utils.ts          # Helper functions
└── generated/            # Generated Prisma client
```

### Adding Features

1. **New API Endpoint**: Add to `src/app/api/whatsapp/`
2. **New Component**: Add to `src/components/`
3. **Database Changes**: Update `prisma/schema.prisma` and migrate
4. **Baileys Features**: Extend `src/lib/baileys/whatsapp-service.ts`

## Troubleshooting

### Common Issues

1. **QR Code Not Appearing**
   - Check if session is already connected
   - Verify database connection
   - Check browser console for errors

2. **Messages Not Sending**
   - Ensure WhatsApp is connected (green status)
   - Verify JID format is correct
   - Check API response in Network tab

3. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

4. **Session Authentication Issues**
   - Delete session folder: `auth_sessions/{sessionId}/`
   - Reconnect with new QR code
   - Check file permissions

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=baileys*
```

## Security Considerations

- **Session Security**: Auth files contain sensitive data
- **Database Access**: Use strong database credentials
- **API Protection**: Consider adding authentication for production
- **Rate Limiting**: Implement rate limiting for message sending
- **CORS**: Configure CORS for production deployment

## Deployment

### Production Checklist

1. Set up production database
2. Configure environment variables
3. Build the application: `npm run build`
4. Set up process manager (PM2, Docker)
5. Configure reverse proxy (Nginx)
6. Set up SSL certificates
7. Configure backup strategy

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing GitHub issues
3. Create a new issue with detailed information

## Acknowledgments

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://prisma.io/) - Database toolkit
- [TailwindCSS](https://tailwindcss.com/) - CSS framework