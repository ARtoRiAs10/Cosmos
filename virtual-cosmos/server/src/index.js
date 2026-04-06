// src/index.js
// Entry point — wires together HTTP server, Socket.IO, and MongoDB.
// KISS: Minimal bootstrap code; each concern is in its own module.

const http = require('http');
const config = require('./config/env');
const connectDB = require('./config/database');
const createApp = require('./app');
const initSocket = require('./socket');

const bootstrap = async () => {
  // 1. Connect to MongoDB first
  await connectDB();

  // 2. Create Express app
  const app = createApp();

  // 3. Wrap in http.Server so Socket.IO can attach to the same port
  const httpServer = http.createServer(app);

  // 4. Attach Socket.IO
  initSocket(httpServer);

  // 5. Listen
  httpServer.listen(config.port, () => {
    console.log(`[Server] Running on http://localhost:${config.port}`);
    console.log(`[Server] Env: ${config.nodeEnv}`);
    console.log(`[Server] Proximity radius: ${config.proximityRadius}px`);
  });
};

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal error:', err);
  process.exit(1);
});
