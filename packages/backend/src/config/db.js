import mongoose from 'mongoose';

let isConnected = false;

export const connectToDatabase = async (mongoUri) => {
  if (isConnected) {
    return mongoose.connection;
  }

  const uri = mongoUri || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required to connect to MongoDB.');
  }

  await mongoose.connect(uri);
  isConnected = true;
  return mongoose.connection;
};

export const disconnectFromDatabase = async () => {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
};