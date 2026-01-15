import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";
import { getEmbedding } from "../../../utils/gemini.js";
import { QdrantClient } from "@qdrant/js-client-rest";

const formatText = (row) =>
  `${row.name || ""}. ${row.description || ""}`.trim();

const embedAndStore = async (row, table) => {
  const text = formatText(row);
  const embedding = await getEmbedding(text);
  const embeddingJson = JSON.stringify(embedding);

  await pool.query(
    `REPLACE INTO ${table}_embeddings (id, combined_embedding) VALUES (?, ?)`,
    [row.id, embeddingJson]
  );

  console.log(`✅ Embedded ${table} ID: ${row.id}`);
};

const QDRANT_URL = "https://qdrant.delycia.com";
const QDRANT_API_KEY = "bjmb3dtjxmw6k52r7whxsbaem5hcebbv";
const EMBEDDING_SIZE = 768; // update if your vector size is different

const ensureCollectionExists = async (collection) => {
  const res = await fetch(`${QDRANT_URL}/collections/${collection}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "api-key": QDRANT_API_KEY,
    },
  });

  if (res.status === 200) return true;

  if (res.status === 404) {
    console.log(`ℹ️ Collection "${collection}" not found. Creating it...`);

    const createRes = await fetch(`${QDRANT_URL}/collections/${collection}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "api-key": QDRANT_API_KEY,
      },
      body: JSON.stringify({
        vectors: {
          size: EMBEDDING_SIZE,
          distance: "Cosine",
        },
      }),
    });

    if (!createRes.ok) {
      const body = await createRes.text();
      throw new Error(`Failed to create collection: ${body}`);
    }

    console.log(`✅ Collection "${collection}" created.`);
    return true;
  }

  throw new Error(`Failed to verify collection: ${await res.text()}`);
};

const deleteFromQdrant = async (collection, id) => {
  try {
    const numericId = Number(id); // force to number

    const res = await fetch(
      `${QDRANT_URL}/collections/${collection}/points/delete?wait=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": QDRANT_API_KEY,
        },
        body: JSON.stringify({
          points: [numericId], // <-- must be array of numbers
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Qdrant delete failed: ${res.status} - ${body}`);
    }

    console.log(`🗑️ Deleted ${collection} ID: ${id}`);
  } catch (err) {
    console.error(`❌ Failed deleting from Qdrant`, {
      message: err.message,
      stack: err.stack,
    });
    throw err;
  }
};

const upsertToQdrant = async (collection, row, vector) => {
  try {
    await ensureCollectionExists(collection);

    const res = await fetch(
      `${QDRANT_URL}/collections/${collection}/points?wait=true`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "api-key": QDRANT_API_KEY,
        },
        body: JSON.stringify({
          points: [
            {
              id: row.id,
              vector,
              payload: {
                name: row.name,
                description: row.description || "",
                ...(row.rid && { rid: row.rid }),
                ...(row.category_id && { category_id: row.category_id }),
                ...(row.stock !== undefined && { stock: row.stock }),
              },
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `Qdrant upsert failed with status ${res.status}: ${body}`
      );
    }

    console.log(`✅ Upserted ${collection} ID: ${row.id}`);
  } catch (err) {
    console.error(`❌ Failed upserting to Qdrant`, {
      message: err.message,
      stack: err.stack,
    });
    throw err;
  }
};

const inventory = async (id) => {
  try {
    const query = id
      ? "SELECT id, name, description, stock, rid, category_id FROM inventories WHERE id = ?"
      : "SELECT id, name, description, stock, rid, category_id FROM inventories";

    const [rows] = await pool.query(query, id ? [id] : []);
    for (const row of rows) {
      const text = formatText(row);
      const vector = await getEmbedding(text);
      await upsertToQdrant("inventories", row, vector);
    }

    return apiResponse.success(
      200,
      id ? `inventories embedded: ${id} ✅` : "All inventories embedded ✅"
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const restaurant = async (id) => {
  try {
    const query = id
      ? "SELECT id, name, description FROM restaurants WHERE id = ?"
      : "SELECT id, name, description FROM restaurants";

    const [rows] = await pool.query(query, id ? [id] : []);
    for (const row of rows) {
      const text = formatText(row);
      const vector = await getEmbedding(text);
      await upsertToQdrant("restaurants", row, vector);
    }

    return apiResponse.success(
      200,
      id ? `Restaurant embedded: ${id} ✅` : "All restaurants embedded ✅"
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const category = async (id) => {
  try {
    const query = id
      ? "SELECT id, name, description FROM categories WHERE id = ?"
      : "SELECT id, name, description FROM categories";

    const [rows] = await pool.query(query, id ? [id] : []);
    for (const row of rows) {
      const text = formatText(row);
      const vector = await getEmbedding(text);
      await upsertToQdrant("categories", row, vector);
    }

    return apiResponse.success(
      200,
      id ? `Category embedded: ${id} ✅` : "All categories embedded ✅"
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const qd_delete = async (table, id) => {
  try {
    await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    await deleteFromQdrant(table, id);
    return apiResponse.success(200, `${table} ${id} deleted ✅`);
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

export default { inventory, category, restaurant, qd_delete };
