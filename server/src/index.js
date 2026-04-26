import "dotenv/config";
import { app, server } from "./app.js";
import pool from "./config/db.connection.js";
import { initScheduler, shutdownScheduler } from "./jobs/scheduler.js";
import redisService from "./services/redis.service.js";

// Initialize Redis connection (non-blocking — works in both environments)
redisService.connect().catch((err) => {
  console.warn("⚠️  Redis connection failed during startup:", err.message);
});

/**
 * Vercel serverless: VERCEL=1 is automatically injected by Vercel's runtime.
 * In that case we skip server.listen() — Vercel manages the HTTP lifecycle.
 * We export `app` (the raw Express instance) so Vercel can invoke it per-request.
 *
 * Traditional / Docker: start the HTTP server and scheduler as normal.
 */
const isVercel = process.env.VERCEL === "1";

if (!isVercel) {
  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server has started : http://localhost:${port}`);

    // Scheduled jobs only run in long-lived environments.
    // On Vercel, these are replaced by Vercel Cron Jobs (see vercel.json).
    initScheduler();
  });

  // Graceful shutdown — only meaningful in long-lived processes
  const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 ${signal} received — shutting down gracefully...`);

    shutdownScheduler();
    await redisService.disconnect();

    server.close(() => {
      pool.end(() => {
        console.log("✅ All connections closed. Exiting.");
        process.exit(0);
      });
    });

    // Force-exit if graceful shutdown takes too long
    setTimeout(() => {
      console.error("⚠️ Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
}

// Default export is the raw Express `app` — Vercel's @vercel/node runtime
// will call it as a standard Node.js http.RequestListener.
export default app;
