import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

export async function GET() {
  try {
    const conn = await connectDB()
    const db = conn.connection.db
    const dbName = db?.databaseName || 'unknown'
    const readyState = conn.connection.readyState
    
    const collections = db ? await db.listCollections().toArray() : []
    
    // Get document counts and sample data for each collection
    const collectionStats: Record<string, { count: number; sample?: any[] }> = {}
    if (db) {
      for (const col of collections) {
        const collection = db.collection(col.name)
        const count = await collection.countDocuments()
        const sample = count > 0 
          ? await collection.find().limit(2).toArray() 
          : undefined
        collectionStats[col.name] = { count, sample }
      }
    }

    // List ALL databases on the cluster (to find where user's data might be)
    const adminDb = conn.connection.db?.admin()
    let allDatabases: string[] = []
    if (adminDb) {
      try {
        const dbs = await adminDb.listDatabases()
        allDatabases = dbs.databases?.map((d: any) => d.name) || []
      } catch (_) {
        // May fail if user lacks admin rights
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully',
      database: dbName,
      readyState: readyState === 1 ? 'connected' : readyState === 0 ? 'disconnected' : 'connecting',
      collections: collections.map(c => c.name),
      collectionStats,
      allDatabasesOnCluster: allDatabases,
      mongoUriSet: !!process.env.MONGODB_URI,
      connectionStringHint: process.env.MONGODB_URI 
        ? (process.env.MONGODB_URI.includes('/') && !process.env.MONGODB_URI.split('net/')[1]?.startsWith('?'))
          ? 'Connection string includes database name'
          : 'Connection string may use default database - we force dbName: fod-clinic'
        : 'MONGODB_URI not set',
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
