//External Imports
import express from "express";
import http, { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

//Internal imports
import setupSocketNamespaces from "./sockets/index.js";
import sanitizeInput from "./middlewares/sanitizeInputs.middleware.js";
import redisService from "./services/redis.service.js";
import tokenCacheService from "./services/tokenCache.service.js";
import sessionService from "./services/session.service.js";
import rateLimiterService from "./services/rateLimiter.service.js";

//User routes
import userRoutes from "./routes/v1/web/user.routes.js";
import authRoutes from "./routes/v1/web/auth.routes.js";
import sessionRoutes from "./routes/v1/web/session.routes.js";
import categoriesRoutes from "./routes/v1/web/categories.routes.js";
import orderRouters from "./routes/v1/web/orders.routes.js";
import userInventoryRoutes from "./routes/v1/web/inventory.routes.js";
import userVariantsRoutes from "./routes/v1/web/variant.routes.js";
import searchRoutes from "./routes/v1/web/search.routes.js";
import restaurantsRoutes from "./routes/v1/web/restaurants.routes.js";
import tablesRoutes from "./routes/v1/web/tables.routes.js";
import userAddonsRoutes from "./routes/v1/web/addons.routes.js";
import notificationRoutes from "./routes/v1/web/notifications.routes.js";
// app routes
import qrcodeRoutes from "./routes/v1/app/qrcodes.routes.js";
import tempSessionRoutes from "./routes/v1/app/temp.session.routes.js";
import voiceRoutes from "./routes/v1/app/voice.routes.js";

//Admin routes
import adminAuthRoutes from "./routes/v1/admin/auth.routes.js";
import adminUserRoutes from "./routes/v1/admin/user.routes.js";
import adminInventoryRoutes from "./routes/v1/admin/inventory.routes.js";
import adminVariantRoutes from "./routes/v1/admin/variant.routes.js";
import adminOrdersRoutes from "./routes/v1/admin/orders.routes.js";
import adminRestaurantsRoutes from "./routes/v1/admin/restaurants.routes.js";
import adminTablesRoutes from "./routes/v1/admin/tables.routes.js";
import adminDashboardRoutes from "./routes/v1/admin/dashboard.routes.js";
import adminAddonsRoutes from "./routes/v1/admin/addons.routes.js";
import adminCrmRoutes from "./routes/v1/admin/crm.routes.js";
import adminInventoryStatsRoutes from "./routes/v1/admin/inventory-stats.routes.js";
import adminStaffReportsRoutes from "./routes/v1/admin/staff-reports.routes.js";
import adminSubscriptionsRoutes from "./routes/v1/admin/subscriptions.routes.js";
import adminFeaturesRoutes from "./routes/v1/admin/features.routes.js";
// System routes
import systemDataRoutes from "./routes/v1/system/data.routes.js";

// Superadmin routes
import superadminAuthRoutes from "./routes/v1/superadmin/auth.routes.js";
import superadminRestaurantsRoutes from "./routes/v1/superadmin/restaurants.routes.js";
import superadminSubscriptionsRoutes from "./routes/v1/superadmin/subscriptions.routes.js";
import superadminUsersRoutes from "./routes/v1/superadmin/users.routes.js";
import superadminMenusRoutes from "./routes/v1/superadmin/menus.routes.js";
import superadminStaffRoutes from "./routes/v1/superadmin/staff.routes.js";
import superadminDashboardRoutes from "./routes/v1/superadmin/dashboard.routes.js";

// ...

// ...
const app = express();
//Creating HTTP server using express app
const server = createServer(app);
// Creating Socket server using the same HTTP server
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50kb" }));
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use(cookieParser());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("❌ Malformed JSON:", err.message);
    return res.status(400).json({ status: 400, error: "Invalid JSON payload" });
  }
  next(err);
});

const allowedOrigins = [
  "http://localhost:4000",
  "http://localhost:4500",
  "http://localhost:5000", // Superadmin frontend
  "http://192.168.0.115:5500",
  "https://delycia-frontend-wquuyx-617afa-195-35-21-102.traefik.me",
  "http://192.168.0.115:5173",
  "http://72.61.255.194:4000",
  "http://192.168.0.110:4500/",
  "http://192.168.0.110:4000/"
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".delycia.com") ||
        origin === "https://delycia.com"
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Credentials",
      "x-signature",
      "x-csrf-token", // CSRF token header for superadmin
    ],

    credentials: true,
  })
);

// Limiting requests per minute
const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: { error: "Too many requests, please try again later." },
  headers: true,
});

app.use(rateLimiter);
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.send("v29");
});

// Health check endpoints
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.get("/health/redis", async (req, res) => {
  const health = await redisService.healthCheck();
  const statusCode = health.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(health);
});

// Cache statistics endpoint (for monitoring)
app.get("/health/cache", async (req, res) => {
  const stats = tokenCacheService.getStats();
  res.status(200).json({
    service: "Token Cache",
    ...stats,
  });
});

// Session statistics endpoint (for monitoring)
app.get("/health/sessions", async (req, res) => {
  const stats = await sessionService.getStats();
  res.status(200).json({
    service: "Session Management",
    ...stats,
  });
});

// Rate limiter statistics endpoint (for monitoring)
app.get("/health/ratelimit", async (req, res) => {
  const stats = rateLimiterService.getStats();
  const config = rateLimiterService.getConfig();
  res.status(200).json({
    service: "Rate Limiter",
    stats,
    config,
  });
});

setupSocketNamespaces(io);

// v1 user APIs
app.use("/api/v1/users", sanitizeInput, userRoutes);
app.use("/api/v1/users/auth", sanitizeInput, authRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/", categoriesRoutes);
app.use("/api/v1/inventory", userInventoryRoutes);
app.use("/api/v1/variants", userVariantsRoutes);
app.use("/api/v1/orders", orderRouters);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/restaurant", restaurantsRoutes);
app.use("/api/v1/tables", tablesRoutes);
app.use("/api/v1/users/addons", userAddonsRoutes);


// Aps
app.use("/api/v1/app/qrcode", qrcodeRoutes);
app.use("/api/v1/app/temp-session", tempSessionRoutes);
app.use("/api/v1/app/voice", voiceRoutes);

// Admin Apis
app.use("/api/v1/admin/auth", sanitizeInput, adminAuthRoutes);
app.use("/api/v1/admin/users", sanitizeInput, adminUserRoutes);
app.use("/api/v1/admin/inventory", sanitizeInput, adminInventoryRoutes);
app.use("/api/v1/admin/inventory-stats", sanitizeInput, adminInventoryStatsRoutes);
app.use("/api/v1/admin/variants", sanitizeInput, adminVariantRoutes);
app.use("/api/v1/admin/orders", adminOrdersRoutes);
app.use("/api/v1/admin/restaurants", adminRestaurantsRoutes);
app.use("/api/v1/admin/tables", adminTablesRoutes);
app.use("/api/v1/admin/dashboard", adminDashboardRoutes);
app.use("/api/v1/admin/addons", adminAddonsRoutes);
app.use("/api/v1/admin/crm", adminCrmRoutes);
app.use("/api/v1/admin/staff-reports", adminStaffReportsRoutes);
app.use("/api/v1/admin/subscriptions", adminSubscriptionsRoutes);
app.use("/api/v1/admin/features", adminFeaturesRoutes);
app.use("/api/v1/admin/notifications", notificationRoutes);

// Superadmin APIs
app.use("/api/v1/superadmin/auth", sanitizeInput, superadminAuthRoutes);
app.use("/api/v1/superadmin/restaurants", sanitizeInput, superadminRestaurantsRoutes);
app.use("/api/v1/superadmin/subscriptions", sanitizeInput, superadminSubscriptionsRoutes);
app.use("/api/v1/superadmin/users", sanitizeInput, superadminUsersRoutes);
app.use("/api/v1/superadmin/menus", sanitizeInput, superadminMenusRoutes);
app.use("/api/v1/superadmin/staff", sanitizeInput, superadminStaffRoutes);
app.use("/api/v1/superadmin/dashboard", sanitizeInput, superadminDashboardRoutes);

//System routes
app.use("/api/v1/system/upsells", systemDataRoutes);
import systemEmbeddingRoutes from "./routes/v1/system/embedding.routes.js";
import cronJobs from "./routes/v1/system/crons.routes.js";
app.use("/api/v1/system/embedding", systemEmbeddingRoutes);
app.use("/api/v1/system/cronJobs", cronJobs);

export default { server, io };
