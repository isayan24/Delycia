import redisService from "../services/redis.service.js";
import { getEmbedding } from "./gemini.js";

const EXPIRY_SECONDS = 86400 * 7; // 7 days

export const getCachedEmbedding = async (text) => {
  const key = `delycia:embedding:${text.toLowerCase()}`;

  const cached = await redisService.get(key);

  if (cached) {
    //console.log("Redis cache hit!");
    return JSON.parse(cached);
  }

  const vector = await getEmbedding(text);
  // console.log("Gemini API call!");
  await redisService.set(key, JSON.stringify(vector), { EX: EXPIRY_SECONDS });
  return vector;
};
