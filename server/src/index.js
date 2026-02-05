import app from "./app.js";
import "dotenv/config";
import pool from "./config/db.connection.js";
import { initScheduler, shutdownScheduler } from "./jobs/scheduler.js";

const port = process.env.PORT || 3000;

// Start server
app.server.listen(port, () => {
  console.log(
    `Server has started : http://localhost:${port}`
  );

  // Initialize scheduled jobs
  initScheduler();
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {

  shutdownScheduler();

  app.server.close(() => {

    pool.end(() => {
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
