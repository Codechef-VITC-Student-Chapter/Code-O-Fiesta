import mongoose from 'mongoose';

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalThis.mongooseCache = cached;

// The globalThis cache is only shared *within a single instance*. Under
// concurrency the platform runs many instances, and each one opens its own
// pool, so the real connection count is (instances x maxPoolSize).
//
// The driver default is 100 sockets per instance, which meant a handful of
// concurrent instances could exhaust a 500-connection Atlas limit. An instance
// serves one request at a time, so a small pool is sufficient.
const MAX_POOL_SIZE = Number(process.env.MONGODB_MAX_POOL_SIZE ?? 10);

export async function connectDB(): Promise<typeof mongoose> {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error('Please define the MONGODB_URI environment variable.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  cached.promise ??= mongoose.connect(mongodbUri, {
    bufferCommands: false,
    maxPoolSize: MAX_POOL_SIZE,
    minPoolSize: 0,
    maxIdleTimeMS: 10000,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Without this reset the rejected promise stays cached, so every later
    // request re-awaits the same failure and the instance never recovers.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
