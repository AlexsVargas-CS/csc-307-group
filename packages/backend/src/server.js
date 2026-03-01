import app from './app.js';
import { connectToDatabase, disconnectFromDatabase } from './config/db.js';
import { env } from './config/env.js';

let server;

const startServer = async () => {
  await connectToDatabase(env.MONGODB_URI);

  server = app.listen(env.PORT, () => {
    console.log(`Showme backend listening on port ${env.PORT}`);
  });
};

const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down...`);

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  await disconnectFromDatabase();
  process.exit(0);
};

process.on('SIGINT', () => {
  shutdown('SIGINT').catch((error) => {
    console.error('Shutdown error:', error);
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM').catch((error) => {
    console.error('Shutdown error:', error);
    process.exit(1);
  });
});

startServer().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});