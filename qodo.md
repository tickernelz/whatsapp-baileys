# Qodo Project Instruction File (qodo.md)

> This file provides essential guidance for AI agents (e.g., Qodo Command CLI) working on the *whatsapp-baileys* repository.
> Keep this document **up-to-date** whenever the codebase changes or new conventions are introduced.

---

## 1. Project Snapshot

| Item              | Details |
|-------------------|---------|
| Project Name      | whatsapp-baileys |
| Framework         | Next.js 14 (App Router) |
| Language          | TypeScript / React 18 |
| Styling           | TailwindCSS v3 with tailwind-merge + clsx |
| DB ORM            | Prisma (output at `src/generated/prisma`) |
| Database          | PostgreSQL (`DATABASE_URL` in `.env`) |
| Core Libraries    | @whiskeysockets/baileys, @hapi/boom, qrcode |
| UI Libraries      | @radix-ui/react-tabs, @radix-ui/react-select, lucide-react |
| WebSocket Support | ws, bufferutil, utf-8-validate, ignore-loader |
| Purpose           | Professional WhatsApp Baileys Admin Dashboard with multi-session management |

## 2. Directory Overview

| Path                        | Purpose |
|-----------------------------|---------|
| `src/app/`                  | Next.js App Router pages and layouts |
| `src/app/api/whatsapp/`     | WhatsApp API endpoints (connect, send, status, contacts, messages, sessions, cleanup) |
| `src/app/api/health/`       | Health check endpoint for system status |
| `src/app/api/test-websocket/` | WebSocket testing endpoint |
| `src/components/`           | React dashboard components |
| `src/components/ui/`        | Base UI components (Button, Card, Input, Tabs, Select, etc.) |
| `src/lib/utils.ts`          | Shared helper `cn(...)` for class names |
| `src/lib/baileys/`          | WhatsApp service and connection management |
| `src/lib/websocket-polyfill.ts` | WebSocket compatibility polyfill for Next.js |
| `src/generated/prisma/`     | Generated Prisma client |
| `prisma/schema.prisma`      | Database schema with WhatsApp-specific models |
| `auth_sessions/`            | WhatsApp authentication session storage |
| `tailwind.config.ts`        | Tailwind configuration |
| `next.config.mjs`           | Next.js settings with WebSocket webpack configuration |

## 3. Database Schema

| Model             | Purpose |
|-------------------|---------|
| `WhatsAppSession` | Manages WhatsApp connection sessions with QR codes and status |
| `Contact`         | Stores WhatsApp contacts with JID, names, and metadata |
| `Group`           | Manages WhatsApp groups with admin status and member counts |
| `Message`         | Logs all sent/received messages with content and media URLs |
| `BulkMessage`     | Handles bulk messaging campaigns (future feature) |
| `Settings`        | Application configuration key-value pairs |

## 4. Core Components

| Component             | Purpose |
|-----------------------|---------|
| `WhatsAppDashboard`   | Main dashboard with tabbed interface and session management |
| `SessionSelector`     | Multi-session selection and management with real-time status |
| `WhatsAppConnection`  | QR code display, connection management, session status |
| `MessageSender`       | Send text/media messages with type selection (session-aware) |
| `ContactsList`        | Display and search WhatsApp contacts (session-aware) |
| `MessageHistory`      | View message logs with pagination and filtering (session-aware) |

## 5. API Endpoints

| Endpoint                    | Method | Purpose |
|-----------------------------|--------|---------|
| `/api/whatsapp/sessions`    | GET    | List all sessions with real-time status |
| `/api/whatsapp/connect`     | POST   | Initialize WhatsApp connection and generate QR code |
| `/api/whatsapp/status`      | GET    | Check connection status for a session |
| `/api/whatsapp/status`      | DELETE | Complete session deletion (database + auth files) |
| `/api/whatsapp/send`        | POST   | Send text or media messages |
| `/api/whatsapp/contacts`    | GET    | Retrieve contacts for a session |
| `/api/whatsapp/messages`    | GET    | Get message history with pagination |
| `/api/whatsapp/cleanup`     | POST   | Clean up orphaned auth session directories |
| `/api/health`               | GET    | System health check and database connectivity |
| `/api/test-websocket`       | GET    | Test WebSocket configuration and error handling |

## 6. Key Features

### ✅ **Multi-Session Management**
- Session Selector with visual interface
- Real-time status monitoring for all sessions
- Seamless session switching
- Complete session deletion with cleanup

### ✅ **Enhanced UI/UX**
- Tabbed interface (Messages, Contacts, History)
- Session-aware components
- Professional design with status indicators
- Responsive layout for desktop and mobile

### ✅ **Robust Connection Handling**
- Improved connection handling and debugging
- WebSocket compatibility for Next.js
- Automatic reconnection capabilities
- Database integrity with foreign key constraints

### ✅ **Complete Session Lifecycle**
- QR code generation for authentication
- Real-time monitoring and status updates
- Complete cleanup including database and filesystem
- Orphaned session cleanup utility

## 7. Coding Conventions

1. **TypeScript First** – All code in `.tsx`/`.ts` with proper type definitions
2. **TailwindCSS** – Utility classes with `cn()` helper for conditional styling
3. **Component Architecture** – Session-aware components with prop-based session IDs
4. **Error Handling** – Comprehensive try-catch blocks with user feedback
5. **Database Operations** – Always ensure session exists before related operations
6. **WebSocket Compatibility** – Use provided polyfills and configurations
7. **Icons** – Consistent use of `lucide-react` icon set
8. **State Management** – React hooks with proper dependency arrays

## 8. WhatsApp Baileys Integration

| Concept           | Implementation |
|-------------------|----------------|
| Session Management| Enhanced `WhatsAppService` class with improved error handling |
| Authentication    | Multi-file auth state in `auth_sessions/{sessionId}/` |
| QR Code Generation| Real-time QR code generation with `qrcode` library |
| Message Handling  | Event listeners with database persistence |
| Media Support     | URL-based media handling for all message types |
| Contact Sync      | Automatic synchronization on connection |
| Connection State  | Real-time status tracking and updates |
| WebSocket Config  | Custom WebSocket configuration for Baileys |

## 9. Development Workflow

1. **Setup**: Configure `.env` with `DATABASE_URL`
2. **Database**: Run `npx prisma migrate dev` and `npx prisma generate`
3. **Development**: Use `npm run dev` for development server (default port 3000)
4. **Testing**: Interactive testing via dashboard at `http://localhost:3000`
5. **Building**: `npm run build` (production build)

## 10. Common Development Tasks

| Task | Steps |
|------|-------|
| Add new session feature | Update `SessionSelector` → Modify API endpoint → Test UI |
| Add message type | Update `MessageSender` → Modify send API → Test functionality |
| Debug session issues | Check session status → Verify auth files → Check logs |
| Add UI component | Create in `src/components/` → Add to dashboard → Style with Tailwind |
| Clean up sessions | Use `/api/whatsapp/cleanup` → Verify auth directory |
| Test connections | Use session selector → Monitor real-time status → Verify QR codes |

## 11. Dependencies

### Core Dependencies
- `@whiskeysockets/baileys` - WhatsApp Web API
- `@hapi/boom` - HTTP error handling
- `qrcode` - QR code generation
- `@prisma/client` - Database ORM
- `next` - React framework
- `react` & `react-dom` - React library
- `tailwindcss`, `tailwind-merge`, `clsx` - Styling
- `lucide-react` - Icons
- `@radix-ui/react-tabs`, `@radix-ui/react-select` - UI components

### WebSocket Dependencies
- `bufferutil`, `utf-8-validate` - WebSocket utilities
- `ws` - WebSocket library
- `ignore-loader` - Webpack loader for ignoring modules

### Development Dependencies
- `typescript` - TypeScript compiler
- `@types/*` - Type definitions
- `eslint` - Code linting
- `prisma` - Database toolkit

## 12. Troubleshooting

| Issue | Solution |
|-------|----------|
| Sessions not loading | Click refresh button in SessionSelector |
| QR Code not appearing | Check database connection and session initialization |
| Messages not sending | Verify session is connected and JID format is correct |
| Session won't delete | Check API logs and database connectivity |
| Connection issues | Check improved connection handling in recent updates |
| WebSocket errors | Handled automatically with polyfills and configuration |
| Orphaned auth files | Use `/api/whatsapp/cleanup` endpoint |

## 13. Security & Production

- **Session Files**: `auth_sessions/` contains sensitive authentication data
- **Database**: Use strong PostgreSQL credentials and encryption
- **Environment**: Never commit `.env` files or session directories
- **Rate Limiting**: Consider implementing for production use
- **Authentication**: Add admin auth for production deployments
- **Cleanup**: Regular cleanup of orphaned sessions recommended

## 14. Development Tips

1. **Session Management** – Always work with selected session context
2. **Error Handling** – Check both UI and API logs for debugging
3. **Database First** – Ensure schema changes are migrated before code changes
4. **Testing** – Use interactive browser testing for UI components
5. **Cleanup** – Run cleanup endpoint after major session operations
6. **Status Monitoring** – Use real-time status indicators for debugging

## 15. Recent Updates (2025-07-13)

### ✅ **Connection Handling Improvements**
- **Latest**: Improved connection handling and debugging capabilities
- **Previous**: Removed handling for stream error 515 (refactored approach)
- **Impact**: More robust and reliable WhatsApp connections

### ✅ **Multi-Session Management**
- **Feature**: Complete session management interface
- **Components**: SessionSelector, enhanced dashboard with tabs
- **Impact**: Professional multi-session WhatsApp management

### ✅ **Complete Session Lifecycle**
- **Feature**: Complete session deletion with cleanup
- **Implementation**: Enhanced DELETE endpoint with database and filesystem cleanup
- **Impact**: Proper session lifecycle management

### ✅ **WebSocket Compatibility**
- **Solution**: Polyfills and webpack configuration for Next.js
- **Impact**: Stable WebSocket connections in browser environment

### ✅ **Production Ready**
- **Status**: TypeScript errors resolved, ESLint compliance
- **Testing**: Interactive browser testing implemented
- **Quality**: Production-ready codebase

## 16. Future Enhancements

- [ ] Bulk messaging campaigns
- [ ] Group management features  
- [ ] Message scheduling
- [ ] Analytics dashboard
- [ ] Webhook integrations
- [ ] Multi-user authentication
- [ ] Message templates
- [ ] File upload handling
- [ ] Real-time notifications

---
*Last updated: 2025-07-13T13:30:00Z*
*Project Status: Production-ready WhatsApp Baileys admin dashboard*
*Current Version: Multi-session management with improved connection handling*
*Stability: High - Latest improvements to connection handling and debugging*