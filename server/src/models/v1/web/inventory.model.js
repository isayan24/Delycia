import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";
import others from "../../../utils/others.js";
import embeddingModel from "./embedding.model.js";

const getItems = async (req) => {
  let { category_id, id, rid, username } = req.query || {};

  try {
    // If username is provided, resolve it to rid
    if (username && !rid) {
      const [restaurants] = await pool.query(
        "SELECT id FROM restaurants WHERE username = ?",
        [username]
      );
      
      if (restaurants.length === 0) {
        return apiResponse.error(404, "Restaurant not found");
      }
      
      rid = restaurants[0].id;
    }

    let q = "";
    const params = [];

    if (id) {
      q = "SELECT * FROM inventories WHERE id = ?";
      params.push(id);
    } else if (category_id && rid) {
      q = "SELECT * FROM inventories WHERE category_id = ? AND rid = ?";
      params.push(category_id, rid);
    } else if (category_id) {
      q = "SELECT * FROM inventories WHERE category_id = ?";
      params.push(category_id);
    } else if (rid) {
      q = "SELECT * FROM inventories WHERE rid = ?";
      params.push(rid);
    } else {
      q = "SELECT * FROM inventories";
    }

    const [result] = await pool.query(q, params);

    const parsedResult = result.map((item) => {
      let images = [];
      try {
        images = JSON.parse((item.images || "[]").replace(/'/g, '"'));
      } catch (e) {
        images = [];
      }

      return {
        ...item,
        images,
      };
    });

    return apiResponse.success(200, "success", { inventory: parsedResult });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};
const addItem = async (req) => {
  const connection = await pool.getConnection();
  try {


    const {
      rid,
      category_id,
      name,
      description,
      images,
      is_veg,
      cost,
      price,
      stock,
      status,
    } = req.body;

    // Validate required fields
    if (!rid || !category_id || !name) {
      return apiResponse.error(400, "rid, category_id, and name are required");
    }

    // Check authorization
    if ((await others.getPower(req)) < 70) {
      return apiResponse.error(401, "Unauthorized access!");
    }

    // Verify restaurant access
    const hasAccess = await others.hasRestaurantAccess(req, rid);
    if (!hasAccess) {
      return apiResponse.error(403, "Access denied to this restaurant");
    }

    // Verify category belongs to this restaurant
    const [categoryCheck] = await pool.query(
      "SELECT id FROM categories WHERE id = ? AND rid = ?",
      [category_id, rid]
    );

    if (categoryCheck.length === 0) {
      return apiResponse.error(400, "Category does not belong to this restaurant");
    }

    const q = `
      INSERT INTO inventories 
      (rid, category_id, name, description, images, is_veg, cost, price, stock, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(q, [
      rid,
      category_id,
      name,
      description,
      images || "[]",
      is_veg || 1,
      cost || 0,
      price,
      stock || 0,
      status || "available",
    ]);

    await connection.commit();

    // Generate embeddings asynchronously
    setImmediate(async () => {
      if (result && result.insertId) {
        await embeddingModel.inventory(result.insertId);
      }
    });

    return apiResponse.success(201, "Item added successfully!", {
      id: result.insertId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("addItem error:", error);

    // Check for duplicate entry error
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return apiResponse.error(409, "Item with this name already exists in this restaurant");
    }

    return apiResponse.error(500, error.message);
  } finally {
    connection.release();
  }
};

const bulkAddItemsOptimized = async (req) => {
  const connection = await pool.getConnection();
  try {
    const { rid, items } = req.body;

    // Validate input
    if (!rid || !Array.isArray(items) || items.length === 0) {
      return apiResponse.error(400, "rid and items array are required");
    }

    if (items.length > 500) {
      return apiResponse.error(400, "Maximum 500 items allowed per bulk insert");
    }

    // Check authorization
    if ((await others.getPower(req)) < 70) {
      return apiResponse.error(401, "Unauthorized access!");
    }

    // Verify restaurant access
    const hasAccess = await others.hasRestaurantAccess(req, rid);
    if (!hasAccess) {
      return apiResponse.error(403, "Access denied to this restaurant");
    }

    // Get category_id from first item (all items share the same category)
    const categoryId = parseInt(items[0]?.category_id);

    if (!categoryId) {
      return apiResponse.error(400, "category_id is required");
    }

    // Verify category belongs to restaurant (single validation for all items)
    const [categoryCheck] = await connection.query(
      "SELECT id FROM categories WHERE id = ? AND rid = ?",
      [categoryId, rid]
    );

    if (categoryCheck.length === 0) {
      return apiResponse.error(400, "Category does not belong to this restaurant");
    }

    // Validate all items
    const validItems = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item.name || !item.name.trim()) {
        errors.push({
          index: i,
          item: item.name || 'Unnamed',
          error: "name is required"
        });
        continue;
      }

      // Convert string values to proper types
      validItems.push({
        name: item.name,
        description: item.description || "",
        images: item.images || "[]",
        is_veg: parseInt(item.is_veg) || 1,
        cost: parseFloat(item.cost) || 0,
        price: parseFloat(item.price) || 0,
        stock: parseInt(item.stock) || 0,
        status: item.status || "available",
        index: i
      });
    }

    if (validItems.length === 0) {
      return apiResponse.error(400, "No valid items to insert", { errors });
    }

    // Start transaction
    await connection.beginTransaction();

    // Build bulk insert query
    const values = validItems.map(item => [
      parseInt(rid),
      categoryId,
      item.name,
      item.description,
      item.images,
      item.is_veg,
      item.cost,
      item.price,
      item.stock,
      item.status,
    ]);

    const [result] = await connection.query(
      `INSERT INTO inventories 
       (rid, category_id, name, description, images, is_veg, cost, price, stock, status) 
       VALUES ?`,
      [values]
    );

    // Commit transaction
    await connection.commit();

    const insertedIds = Array.from(
      { length: result.affectedRows },
      (_, i) => result.insertId + i
    );

    // Generate embeddings asynchronously
    setImmediate(async () => {
      for (const id of insertedIds) {
        try {
          await embeddingModel.inventory(id);
        } catch (embeddingError) {
          console.error(`Embedding failed for item ${id}:`, embeddingError);
        }
      }
    });

    return apiResponse.success(201, "Bulk insert completed", {
      inserted: result.affectedRows,
      failed: errors.length,
      first_id: result.insertId,
      last_id: result.insertId + result.affectedRows - 1,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    await connection.rollback();
    console.error("bulkAddItemsOptimized error:", error);
    return apiResponse.error(500, error.message);
  } finally {
    connection.release();
  }
};

const deleteItem = async (req) => {

  try {
    const { id, rid } = req.body;

    if (!id || !rid) {
      return apiResponse.error(400, "id and rid are required");
    }

    if ((await others.getPower(req)) < 70) {
      return apiResponse.error(401, "Unauthorized access!");
    }

    // Verify restaurant access
    const hasAccess = await others.hasRestaurantAccess(req, rid);
    if (!hasAccess) {
      return apiResponse.error(403, "Access denied to this restaurant");
    }

    const [{ affectedRows }] = await pool.query(
      "DELETE FROM inventories WHERE id = ? AND rid = ?",
      [id, rid]
    );

    if (!affectedRows) {
      return apiResponse.error(404, "Item not found or access denied");
    }

    setImmediate(async () => {
      await embeddingModel.qd_delete("inventories", id);
    })

    return apiResponse.success(200, "Item deleted successfully!");
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const updateItem = async (req) => {
  try {
    const { id, rid, ...params } = req.body;

    if (!id || !rid) {
      return apiResponse.error(400, "id and rid are required");
    }

    if ((await others.getPower(req)) < 70) {
      return apiResponse.error(401, "Unauthorized access!");
    }

    // Verify restaurant access
    const hasAccess = await others.hasRestaurantAccess(req, rid);
    if (!hasAccess) {
      return apiResponse.error(403, "Access denied to this restaurant");
    }

    // Remove empty params
    for (let key in params) {
      if (params[key] === undefined || params[key] === null || params[key] === "") {
        delete params[key];
      }
    }

    if (Object.keys(params).length === 0) {
      return apiResponse.error(400, "No fields to update");
    }

    const values = Object.values(params);
    values.push(id, rid);

    const setClause = Object.keys(params)
      .map((key) => `${key} = ?`)
      .join(", ");

    const q = `UPDATE inventories 
               SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
               WHERE id = ? AND rid = ?`;

    const [{ affectedRows }] = await pool.query(q, values);

    if (affectedRows === 0) {
      return apiResponse.error(404, "Item not found or access denied");
    }

    setImmediate(async () => {
      if (params.name || params.description) {
        await embeddingModel.inventory(id);
      }
    })

    return apiResponse.success(200, "Item updated successfully");
  } catch (error) {
    console.error(error.message);

    // Check for duplicate entry error
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return apiResponse.error(409, "Item with this name already exists in this restaurant");
    }

    return apiResponse.error(500, error.message);
  }
};

const getRecommendedList = async (req) => {
  const { ai, rid } = req.query;

  try {
    let q;
    let params = [rid];

    if (ai && ai === "true") {
      q = `SELECT id, name, description, images, price 
           FROM inventories 
           WHERE status = 'available' AND ai = 1 AND rid = ?`;
    } else {
      q = `SELECT id, name, description, images, price 
           FROM inventories 
           WHERE status = 'available' AND recommend = 1 AND rid = ?`;
    }

    const [rows] = await pool.query(q, params);

    const parsedResult = rows.map((item) => {
      let imagesArray = [];
      if (item.images) {
        try {
          imagesArray = JSON.parse(item.images.replace(/'/g, '"'));
        } catch (err) {
          console.error("Image parse error for id:", item.id, err.message);
        }
      }
      return { ...item, images: imagesArray };
    });

    return { status: true, statusCode: 200, data: parsedResult };
  } catch (error) {
    console.error("DB Error:", error);
    return { status: false, statusCode: 500, error: error.message };
  }
};

export default {
  addItem,
  bulkAddItemsOptimized,
  deleteItem,
  updateItem,
  getItems,
  getRecommendedList,
};
