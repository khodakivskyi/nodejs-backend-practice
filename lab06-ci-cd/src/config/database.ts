import mongoose from 'mongoose';
import {env} from './env'

export async function connectDB(): Promise<void> {
    const uri = env.MONGODB_URI;
    await mongoose.connect(uri);
}

export async function disconnectDB(): Promise<void> {
    await mongoose.connection.close();
}

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
});