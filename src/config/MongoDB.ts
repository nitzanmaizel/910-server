import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('❌ MongoDB URI is required');
}

const mongoURI: string = process.env.MONGODB_URI;

interface MongoOptions {
  useNewUrlParser?: boolean;
  useUnifiedTopology?: boolean;
  autoReconnect?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

const defaultOptions: MongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoReconnect: true,
  maxRetries: 5,
  retryDelay: 1000,
};

/**
 * Connect to MongoDB with retry logic.
 * @param {MongoOptions} [options] - Optional connection options.
 * @returns {Promise<void>}
 */
export const connectDB = async (options?: MongoOptions): Promise<void> => {
  const config = { ...defaultOptions, ...options };
  let retries = 0;

  const connect = async (): Promise<void> => {
    try {
      await mongoose.connect(mongoURI);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      if (config.autoReconnect && retries < (config.maxRetries || 5)) {
        retries += 1;
        console.log(`🔄 Retry ${retries} in ${config.retryDelay}ms`);
        setTimeout(connect, config.retryDelay);
      } else {
        console.error('❌ Max retries reached. Exiting process.');
        process.exit(1);
      }
    }
  };

  await connect();
};

/**
 * Disconnect from MongoDB gracefully.
 * @returns {Promise<void>}
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};
