import app from "./app.js";
import "dotenv/config";
import pool from "./config/db.connection.js";
import { initScheduler, shutdownScheduler } from "./jobs/scheduler.js";

const host = "192.168.0.115";
const port = process.env.PORT;

// Start server
app.server.listen(port || 8080, () => {
  console.log(
    `Server has started : http://localhost:${process.env.PORT || 8080}`
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
