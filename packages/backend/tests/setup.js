import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { connectToDatabase, disconnectFromDatabase } from '../src/config/db.js';

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/showme-test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_12345';
process.env.TMDB_API_KEY = process.env.TMDB_API_KEY || 'test_tmdb_key';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
process.env.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'google_test_client';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'google_test_secret';
process.env.GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback';
process.env.NODE_ENV = 'test';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  process.env.MONGODB_URI = mongoServer.getUri();

  await connectToDatabase(process.env.MONGODB_URI);
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await disconnectFromDatabase();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
