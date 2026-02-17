import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  const error = 'MONGODB_URI environment variable is not defined!';
  console.error('❌', error);
  console.error('Please set MONGODB_URI in your environment variables');
  throw new Error(error);
}

console.log('🔗 MongoDB URI configured:', MONGODB_URI.substring(0, 20) + '...' + MONGODB_URI.substring(MONGODB_URI.length - 20));

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'fod-clinic', // Explicitly set database name
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB Connected to database:', mongoose.connection.db?.databaseName || 'fod-clinic');
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB Connection Error:', error.message);
        cached.promise = null;
        throw new Error(`MongoDB connection failed: ${error.message}`);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error('❌ MongoDB Connection Error:', e.message);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
