import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      if (!mongoMemoryServer) {
        mongoMemoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'inventory_db',
            storageEngine: 'wiredTiger',
          },
        });
      }
      mongoUri = mongoMemoryServer.getUri();
      process.env.MONGO_URI = mongoUri;
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB connected successfully to ${mongoose.connection.host || 'in-memory instance'}`);
    return mongoose.connection;
  } catch (error) {
    console.error('[Database] MongoDB connection error:', error.message);
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    console.log('[Database] MongoDB disconnected');
  } catch (error) {
    console.error('[Database] Disconnect error:', error.message);
  }
};
