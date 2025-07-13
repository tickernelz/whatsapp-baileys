import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

export async function GET() {
  try {
    const prisma = new PrismaClient()
    
    // Test database connection
    await prisma.$connect()
    await prisma.$disconnect()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: 'disconnected',
        api: 'running'
      }
    }, { status: 500 })
  }
}