import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";
import embeddingModel from "./embedding.model.js";
import { getCachedEmbedding } from "../../../utils/embedCache.js";

const QDRANT_URL = "https://qdrant.delycia.com";
const QDRANT_API_KEY = "bjmb3dtjxmw6k52r7whxsbaem5hcebbv";
const LIMITS = {
  inventory: 20,
  restaurants: 10,
  category: 6,
};
const SIMILARITY_THRESHOLD = 0.5;

// Search a single Qdrant collection
const searchQdrant = async (collection, vector, limit) => {
  const res = await fetch(
    `${QDRANT_URL}/collections/${collection}/points/search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": QDRANT_API_KEY,
      },
      body: JSON.stringify({
        vector,
        top: limit,
        with_payload: false,
        score_threshold: SIMILARITY_THRESHOLD,
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Qdrant search failed for ${collection}: ${res.status} - ${body}`
    );
  }

  const json = await res.json();
  return json.result.map((point) => ({
    id: point.id,
    similarity_score: point.score,
  }));
};

const fetchMySQL = async (table, ids, pholders = ["id"]) => {
  if (!ids.length) return [];

  const fields = Array.isArray(pholders) ? pholders.join(", ") : pholders;
  const placeholders = ids.map(() => "?").join(",");

  const [rows] = await pool.query(
    `SELECT ${fields} FROM ${table} WHERE id IN (${placeholders})`,
    ids
  );

  return rows;
};

const attachScores = (rows, scoreMap) =>
  rows.map((row) => ({
    ...row,
    similarity_score: scoreMap[row.id],
  }));

const fixInventoryImages = (rows) =>
  rows.map((row) => {
    if (typeof row.images === "string") {
      try {
        const fixed = row.images.replace(/'/g, '"');
        row.images = JSON.parse(fixed);
      } catch {
        row.images = [];
      }
    }
    return row;
  });

const search = async (req) => {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return apiResponse.error(400, "Invalid query");
  }

  try {
    const vector = await getCachedEmbedding(query);

    const [inventoryHits, categoryHits, restaurantHits] = await Promise.all([
      searchQdrant("inventories", vector, LIMITS.inventory),
      searchQdrant("categories", vector, LIMITS.category),
      searchQdrant("restaurants", vector, LIMITS.restaurants),
    ]);

    const inventoryIds = inventoryHits.map((r) => r.id);
    const categoryIds = categoryHits.map((r) => r.id);
    const restaurantIds = restaurantHits.map((r) => r.id);

    const inventoryScoreMap = Object.fromEntries(
      inventoryHits.map((r) => [r.id, r.similarity_score])
    );
    const categoryScoreMap = Object.fromEntries(
      categoryHits.map((r) => [r.id, r.similarity_score])
    );
    const restaurantScoreMap = Object.fromEntries(
      restaurantHits.map((r) => [r.id, r.similarity_score])
    );

    const [inventoryRows, categoryRows, restaurantRows] = await Promise.all([
      fetchMySQL("inventories", inventoryIds, [
        "id",
        "name",
        "description",
        "images",
        "is_veg",
        "price",
        "status",
        "stock",
      ]),
      fetchMySQL("categories", categoryIds, ["*"]),
      fetchMySQL("restaurants", restaurantIds, [
        "id",
        "name",
        "logo",
        "banner",
      ]),
    ]);

    const inventories = fixInventoryImages(
      attachScores(inventoryRows, inventoryScoreMap)
    ).sort((a, b) => {
      const aOut = a.stock === 0;
      const bOut = b.stock === 0;
      if (aOut && !bOut) return 1;
      if (!aOut && bOut) return -1;
      return b.similarity_score - a.similarity_score;
    });

    const categories = attachScores(categoryRows, categoryScoreMap).sort(
      (a, b) => b.similarity_score - a.similarity_score
    );

    const restaurants = attachScores(restaurantRows, restaurantScoreMap).sort(
      (a, b) => b.similarity_score - a.similarity_score
    );

    return apiResponse.success(200, "success", {
      results: {
        inventories,
        categories,
        restaurants,
      },
    });
  } catch (error) {
    console.log(error);
    return apiResponse.error(500, error.message);
  }
};

const suggestions = async (req, res) => {
  const { term } = req.query;
  if (!term || typeof term !== "string") {
    return apiResponse.error(400, "Invalid input");
  }

  try {
    const vector = await getCachedEmbedding(term);

    const collections = ["inventories", "categories", "restaurants"];
    const limits = { inventories: 5, categories: 5, restaurants: 5 };

    let suggestions = [];

    for (const col of collections) {
      const response = await fetch(
        `${QDRANT_URL}/collections/${col}/points/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": QDRANT_API_KEY,
          },
          body: JSON.stringify({
            vector,
            top: limits[col],
            with_payload: true,
          }),
        }
      );

      const json = await response.json();

      const mapped = json.result.map((item) => ({
        id: item.id,
        name: item.payload?.name,
        type: col,
        similarity_score: item.score, // Add similarity score
      }));

      suggestions.push(...mapped);
    }

    // 🔥 Sort all suggestions globally by score descending
    suggestions = suggestions
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .map(({ similarity_score, ...rest }) => rest); // Remove score from final response

    return apiResponse.success(200, "Autocomplete", {
      results: suggestions,
    });
  } catch (err) {
    return apiResponse.error(500, err.message || "Autocomplete failed");
  }
};

export default { search, suggestions };
