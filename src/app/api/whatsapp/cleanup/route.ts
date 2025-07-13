import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Get all session IDs from database
    const sessions = await prisma.whatsAppSession.findMany({
      select: { sessionId: true }
    })
    const validSessionIds = new Set(sessions.map(s => s.sessionId))

    // Get all auth session directories
    const authSessionsDir = path.join(process.cwd(), 'auth_sessions')
    if (!fs.existsSync(authSessionsDir)) {
      return NextResponse.json({ 
        success: true, 
        message: 'No auth_sessions directory found',
        cleaned: 0
      })
    }

    const authDirs = fs.readdirSync(authSessionsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    // Find orphaned directories
    const orphanedDirs = authDirs.filter(dirName => !validSessionIds.has(dirName))
    
    let cleanedCount = 0
    const cleanedDirs: string[] = []

    // Remove orphaned directories
    for (const dirName of orphanedDirs) {
      try {
        const dirPath = path.join(authSessionsDir, dirName)
        fs.rmSync(dirPath, { recursive: true, force: true })
        cleanedCount++
        cleanedDirs.push(dirName)
        console.log(`Cleaned up orphaned auth directory: ${dirName}`)
      } catch (error) {
        console.error(`Failed to clean up directory ${dirName}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup completed. Removed ${cleanedCount} orphaned directories.`,
      cleaned: cleanedCount,
      cleanedDirectories: cleanedDirs,
      validSessions: Array.from(validSessionIds),
      totalAuthDirs: authDirs.length
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup orphaned sessions' },
      { status: 500 }
    )
  }
}