// lib/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

export const getEmbedding = async (text) => {
  const result = await model.embedContent(text);
  return result.embedding.values;
};
