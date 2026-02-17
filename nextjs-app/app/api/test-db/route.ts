import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET() {
  try {
    const conn = await connectDB()
    const dbName = conn.connection.db?.databaseName || 'unknown'
    const readyState = conn.connection.readyState
    
    // Test query
    const collections = await conn.connection.db.listCollections().toArray()
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully',
      database: dbName,
      readyState: readyState === 1 ? 'connected' : readyState === 0 ? 'disconnected' : 'connecting',
      collections: collections.map(c => c.name),
      mongoUriSet: !!process.env.MONGODB_URI,
      mongoUriLength: process.env.MONGODB_URI?.length || 0,
    })
  } catch (error: any) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      mongoUriSet: !!process.env.MONGODB_URI,
    }, { status: 500 })
  }
}
