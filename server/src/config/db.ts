import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error: any) {
    console.error('\n============================================================');
    console.error('[Database] MongoDB Connection Error:');
    console.error(error.message || error);
    console.error('\n--> ACTION REQUIRED IN MONGODB ATLAS:');
    console.error('1. Log in to https://cloud.mongodb.com');
    console.error('2. Click "Network Access" in the left sidebar.');
    console.error('3. Click "Add IP Address" -> click "Allow Access from Anywhere" (0.0.0.0/0).');
    console.error('4. Save changes and wait 1 minute for Atlas to apply.');
    console.error('============================================================\n');
    if (ENV.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
