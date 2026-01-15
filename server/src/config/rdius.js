import { createClient } from "redis";

const redis = createClient({
  url: "redis://195.35.21.102:6379",
  socket: {
    connectTimeout: 5000, // 5 second timeout
    reconnectStrategy: false, // Don't keep retrying
  },
});

let isConnected = false;

redis.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

redis.on("connect", () => {
  isConnected = true;
  console.log("✅ Redis connected successfully!");
});

// Try to connect but don't crash if it fails
try {
  await redis.connect();
} catch (err) {
  console.warn("⚠️  Redis connection failed. Continuing without cache...");
  console.warn("   Redis URL:", "redis://195.35.21.102:6379");
}

// Export a mock client if connection failed
const redisClient = isConnected ? redis : {
  get: async () => null,
  set: async () => { },
  del: async () => { },
  disconnect: async () => { },
};

export default redisClient;
