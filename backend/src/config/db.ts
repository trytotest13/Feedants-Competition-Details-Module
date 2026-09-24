import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

/**
 * Connect to MongoDB. With no URI (dev/test), starts an isolated in-memory
 * instance so the project runs out-of-the-box — never used when MONGODB_URI
 * is provided (Atlas / local / Docker).
 */
export async function connectDatabase(uri?: string, allowFallback = true): Promise<void> {
  if (uri) {
    await mongoose.connect(uri);
    // eslint-disable-next-line no-console
    console.log('✅ MongoDB connected');
    return;
  }
  if (!allowFallback) {
    throw new Error('MONGODB_URI is required (ALLOW_DB_FALLBACK=false)');
  }
  memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri('feedants'));
  // eslint-disable-next-line no-console
  console.log('🧠 In-memory MongoDB started (dev fallback — set MONGODB_URI for persistence)');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
