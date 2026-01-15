import redis from "../config/rdius.js";
import { getEmbedding } from "./gemini.js";

const EXPIRY_SECONDS = 86400 * 7; // 7 days

export const getCachedEmbedding = async (text) => {
  const key = `delycia:embedding:${text.toLowerCase()}`;

  const cached = await redis.get(key);

  if (cached) {
    //console.log("Redius call!");
    return JSON.parse(cached);
  }

  const vector = await getEmbedding(text);
  // console.log("Gemini call!");
  await redis.set(key, JSON.stringify(vector), { EX: EXPIRY_SECONDS });
  return vector;
};
