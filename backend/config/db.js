import mongoose from 'mongoose';
import { env } from './env.js';

// Disable Mongoose command buffering so queries fail immediately instead of hanging for 10s when DB is offline
mongoose.set('bufferCommands', false);

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[SafeVoice DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[SafeVoice DB Warning] MongoDB Connection Error: ${error.message}`);
    console.warn('[SafeVoice DB Warning] Ensure MongoDB is running locally (127.0.0.1:27017) or provide a valid MongoDB Atlas URI in backend/.env:');
    console.warn('                      MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/safevoice');
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
});

mongoose.connection.on('connected', () => {
  isConnected = true;
});

export const getDBStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || 'none',
});

