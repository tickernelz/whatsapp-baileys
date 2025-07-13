# Qodo Project Instructions (qodo.md)

> Essential guidance for AI agents working on the **whatsapp-baileys** repository.

---

## Project Overview

**WhatsApp Baileys Admin Dashboard** - A Next.js 14 application for managing multiple WhatsApp sessions using the Baileys library.

| Technology | Details |
|------------|---------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript + React 18 |
| Styling | TailwindCSS v3 |
| Database | PostgreSQL + Prisma ORM |
| Core Library | @whiskeysockets/baileys |

## Key Directories

```
src/
├── app/                    # Next.js App Router
│   ├── api/whatsapp/      # WhatsApp API endpoints
│   └── page.tsx           # Main dashboard
├── components/            # React components
├── lib/baileys/          # WhatsApp service logic
└── generated/prisma/     # Generated Prisma client

auth_sessions/            # WhatsApp session storage
prisma/schema.prisma     # Database schema
```

## Core Features

- **Multi-Session Management** - Handle multiple WhatsApp connections
- **QR Code Authentication** - Generate QR codes for WhatsApp login
- **Message Sending** - Send text and media messages
- **Contact Management** - View and manage WhatsApp contacts
- **Message History** - Track sent/received messages
- **Session Cleanup** - Complete session deletion with cleanup

## Essential API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/whatsapp/sessions` | GET | List all sessions |
| `/api/whatsapp/connect` | POST | Create new session + QR code |
| `/api/whatsapp/status` | GET/DELETE | Check status / Delete session |
| `/api/whatsapp/send` | POST | Send messages |
| `/api/whatsapp/contacts` | GET | Get contacts |
| `/api/whatsapp/messages` | GET | Get message history |

## Database Models

- **WhatsAppSession** - Session management with QR codes
- **Contact** - WhatsApp contacts storage
- **Message** - Message logging
- **Group** - WhatsApp groups (future)

## Development Setup

1. Configure `.env` with `DATABASE_URL`
2. Run `npx prisma migrate dev && npx prisma generate`
3. Start with `npm run dev`
4. Access dashboard at `http://localhost:3000`

## Coding Guidelines

- **TypeScript First** - All files use `.tsx`/`.ts`
- **Session-Aware Components** - Pass `sessionId` as props
- **Error Handling** - Use try-catch with user feedback
- **TailwindCSS** - Use `cn()` helper for conditional classes
- **Database Operations** - Always verify session exists first

## Documentation Search Strategy

When searching for the latest documentation, follow this priority order:

### 1. DeepWiki (Primary Source)
- Use `ask_question` with repository name (e.g., "whiskeysockets/baileys")
- Use `read_wiki_contents` for comprehensive documentation
- Use `read_wiki_structure` to explore available topics

### 2. Context7 First (Secondary Source)
- **Baileys Repository**: Use library ID `whiskeysockets/baileys`
- **Next.js**: Use library ID `/vercel/next.js`
- **Prisma**: Use library ID `/prisma/prisma`
- **TailwindCSS**: Use library ID `/tailwindlabs/tailwindcss`

### 3. Web Search (Last Resort)
If both Context7 and DeepWiki don't help:
- Use `web_search` for the latest updates and community solutions
- Focus on official documentation sites and GitHub issues
- Verify information currency and reliability

## Baileys Documentation

Context7 resources contain comprehensive documentation about:
- Baileys API methods and events
- WhatsApp Web protocol details
- Authentication and session management
- Message handling and media support
- Advanced features and troubleshooting

## Common Tasks

| Task | Quick Steps |
|------|-------------|
| Add new session | Use SessionSelector → Click "Add Session" → Scan QR |
| Send message | Select session → Choose contact → Type message → Send |
| Debug connection | Check session status → Verify auth files → Check logs |
| Clean up sessions | Use `/api/whatsapp/cleanup` endpoint |

## Important Notes

- **Session Files**: `auth_sessions/` contains sensitive auth data
- **WebSocket Support**: Configured for Next.js compatibility
- **Multi-Session**: All components are session-aware
- **Production Ready**: TypeScript compliant, ESLint clean
