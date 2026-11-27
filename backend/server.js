import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  // Connect to database
  await connectDB();

  const PORT = env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   🛡️  SAFEVOICE / SAFEHER API                  ║
║         Emergency Voice & Distress Alert System Backend        ║
╠════════════════════════════════════════════════════════════════╣
║  Port:        http://localhost:${PORT}                           ║
║  Environment: ${env.NODE_ENV.padEnd(48)} ║
║  Client URL:  ${env.CLIENT_URL.padEnd(48)} ║
║  Health:      http://localhost:${PORT}/api/health                 ║
╚════════════════════════════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown handling
  process.on('unhandledRejection', (err) => {
    console.error(`[SafeVoice Server Unhandled Rejection]: ${err.message}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
};

startServer();
