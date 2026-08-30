const mongoose = require('mongoose');
const env = require('./env');

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  try {
    let uri = env.MONGODB_URI;

    if (uri && uri.trim() !== '') {
      console.log(`[Database] Connecting to MongoDB at ${uri.split('@')[1] || uri}...`);
      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log('[Database] Connected to external MongoDB successfully.');
        return;
      } catch (err) {
        console.warn(`[Database] External MongoDB connection failed: ${err.message}. Falling back to in-memory MongoDB.`);
      }
    } else {
      console.log('[Database] No MONGODB_URI provided. Initializing in-memory MongoDB (MongoMemoryServer)...');
    }

    // In-memory fallback
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServerInstance = await MongoMemoryServer.create();
    uri = mongoMemoryServerInstance.getUri();
    await mongoose.connect(uri);
    console.log('[Database] In-memory MongoDB initialized and connected successfully at', uri);
  } catch (error) {
    console.error('[Database] MongoDB connection critical error:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServerInstance) {
      await mongoMemoryServerInstance.stop();
    }
  } catch (error) {
    console.error('[Database] Disconnect error:', error);
  }
};

module.exports = { connectDB, disconnectDB };
