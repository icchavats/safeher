import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[SafeVoice DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[SafeVoice DB Warning] MongoDB Connection Error: ${error.message}`);
    console.warn('[SafeVoice DB Warning] Ensure MongoDB is running locally or provide a valid Atlas MONGO_URI in .env');
    // We do not exit process immediately so that the server can still run or report health status
  }
};

export const getDBStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || 'none',
});
