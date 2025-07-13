-- DropForeignKey
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_sessionId_fkey";

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "whatsapp_sessions"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "whatsapp_sessions"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "whatsapp_sessions"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;
