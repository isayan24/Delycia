import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";
import others from "../../../utils/others.js";

// GET ADDONS
const getAddons = async (req) => {
  try {
    const { rid, addon_id, is_active, id } = req.query;

    let q = `
      SELECT a.*, COUNT(ia.inventory_id) as linked_items_count 
      FROM addons a 
      LEFT JOIN inventory_addons ia ON a.id = ia.addon_id 
      WHERE 1=1
    `;
    const params = [];

    if (rid) {
      q += " AND a.rid = ?";
      params.push(rid);
    }

    if (id) {
      q += " AND a.id = ?";
      params.push(id);
    }

    if (addon_id) {
      const q = `
        SELECT 
          ia.*,
          i.id as inventory_item_id,
          i.name as inventory_item_name,
          i.description as inventory_item_description,
          i.price as inventory_item_price,
          i.images as inventory_item_images,
          i.is_veg as inventory_item_is_veg,
          i.category_id as inventory_item_category_id,
          c.name as inventory_item_category_name
        FROM inventory_addons ia
        LEFT JOIN inventories i ON ia.inventory_id = i.id
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE ia.addon_id = ?
      `;
      const [addons] = await pool.query(q, [addon_id]);

      // Parse inventory_item_images from string to array
      const parsedAddons = addons.map((item) => {
        try {
          item.inventory_item_images = JSON.parse(
            (item.inventory_item_images || "[]").replace(/'/g, '"')
          );
        } catch (e) {
          item.inventory_item_images = [];
        }
        return item;
      });

      return apiResponse.success(200, "Addons retrieved", { addons: parsedAddons });
    }

    if (is_active !== undefined) {
      q += " AND a.is_active = ?";
      params.push(is_active);
    }

    q += " GROUP BY a.id ORDER BY a.name ASC";

    const [addons] = await pool.query(q, params);

    return apiResponse.success(200, "Addons retrieved", { addons });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

// GET ADDONS FOR INVENTORY ITEM
const getAddonsForItem = async (inventory_id) => {
  console.log(inventory_id, 'inventory_id \n\n\n')
  try {
    if (!inventory_id) {
      return apiResponse.error(400, "inventory_id is required");
    }

    const q = `
      SELECT 
        a.id, 
        a.name, 
        a.description, 
        a.price, 
        a.is_veg,
        ia.is_default,
        ia.max_quantity
      FROM addons a
      INNER JOIN inventory_addons ia ON a.id = ia.addon_id
      WHERE ia.inventory_id = ? AND a.is_active = 1
      ORDER BY a.name ASC
    `;

    const [addons] = await pool.query(q, [inventory_id]);

    return apiResponse.success(200, "Item addons retrieved", { addons });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

// CREATE ADDON
const createAddon = async (req) => {
  try {
    const { rid, name, description, price, is_veg, is_active } = req.body;

    if (!rid || !name || price === undefined) {
      return apiResponse.error(400, "rid, name, and price are required");
    }

    if ((await others.getPower(req)) < 70) {
      return apiResponse.error(401, "Unauthorized access");
    }

    const q = `
      INSERT INTO addons (rid, name, description, price, is_veg, is_active) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(q, [
      rid,
      name,
      description || "",
      price,
      is_veg !== undefined ? is_veg : 1,
      is_active !== undefined ? is_active : 1
    ]);

    // Fetch the created addon
    const [newAddon] = await pool.query("SELECT * FROM addons WHERE id = ?", [result.insertId]);

    return apiResponse.success(201, "Addon created", newAddon[0]); // Return the full object
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return apiResponse.error(400, "Addon with this name already exists for this restaurant");
    }
    return apiResponse.error(500, error.message);
  }
};

// LINK ADDON TO INVENTORY ITEM(S)
// Supports single inventory_id or array of inventory_ids
const linkAddonsToItem = async (req) => {
  const connection = await pool.getConnection();

  try {
    const { inventory_id, inventory_ids, addon_id, is_default, max_quantity } = req.body;

    // Check if user provided inventory_id (single) or inventory_ids (array)
    let itemIds = [];

    if (inventory_ids && Array.isArray(inventory_ids) && inventory_ids.length > 0) {
      // Bulk mode
      itemIds = inventory_ids;
    } else if (inventory_id) {
      // Single mode
      itemIds = [inventory_id];
    } else {
      return apiResponse.error(400, "inventory_id or inventory_ids array is required");
    }

    if (!addon_id) {
      return apiResponse.error(400, "addon_id is required");
    }

    if ((await others.getPower(req)) < 70) {
      return apiResponse.error(401, "Unauthorized access");
    }

    // Start transaction
    await connection.beginTransaction();

    const inserted = [];
    const errors = [];
    const skipped = [];

    for (let i = 0; i < itemIds.length; i++) {
      const itemId = itemIds[i];

      try {
        // Check if link already exists
        const [existing] = await connection.query(
          "SELECT id FROM inventory_addons WHERE inventory_id = ? AND addon_id = ?",
          [itemId, addon_id]
        );

        if (existing.length > 0) {
          skipped.push({
            inventory_id: itemId,
            reason: "Already linked"
          });
          continue;
        }

        // Verify inventory item exists
        const [inventoryCheck] = await connection.query(
          "SELECT id FROM inventories WHERE id = ?",
          [itemId]
        );

        if (inventoryCheck.length === 0) {
          errors.push({
            inventory_id: itemId,
            error: "Inventory item not found"
          });
          continue;
        }

        // Insert link
        const [result] = await connection.query(
          `INSERT INTO inventory_addons (inventory_id, addon_id, is_default, max_quantity) 
           VALUES (?, ?, ?, ?)`,
          [
            itemId,
            addon_id,
            is_default || 0,
            max_quantity || 10
          ]
        );

        inserted.push({
          id: result.insertId,
          inventory_id: itemId,
          addon_id: addon_id
        });
      } catch (itemError) {
        errors.push({
          inventory_id: itemId,
          error: itemError.message
        });
      }
    }

    // If nothing was inserted, rollback
    if (inserted.length === 0) {
      await connection.rollback();
      return apiResponse.error(400, "No items were linked", {
        inserted: 0,
        skipped: skipped.length,
        failed: errors.length,
        details: {
          skipped_items: skipped,
          failed_items: errors
        }
      });
    }

    // Commit transaction
    await connection.commit();

    return apiResponse.success(201, "Addon linked to item(s)", {
      inserted: inserted.length,
      skipped: skipped.length,
      failed: errors.length,
      details: {
        inserted_items: inserted,
        skipped_items: skipped,
        failed_items: errors
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error("linkAddonToItem error:", error);
    return apiResponse.error(500, error.message);
  } finally {
    connection.release();
  }
};

// BULK UNLINK ADDONS FROM INVENTORY ITEM
const unlinkAddonsFromItem = async (req) => {
  try {
    const { inventory_id, addon_ids } = req.body;

    // Validate input
    if (!inventory_id || !Array.isArray(addon_ids) || addon_ids.length === 0) {
      return apiResponse.error(400, "inventory_id and addon_ids array are required");
    }

    if ((await others.getPower(req)) < 70) {
      return apiResponse.error(401, "Unauthorized access");
    }

    // Delete multiple addon links
    const placeholders = addon_ids.map(() => '?').join(',');
    const q = `
      DELETE FROM inventory_addons 
      WHERE inventory_id = ? AND addon_id IN (${placeholders})
    `;

    const params = [inventory_id, ...addon_ids];
    const [{ affectedRows }] = await pool.query(q, params);

    if (affectedRows === 0) {
      return apiResponse.error(404, "No links found to remove");
    }

    return apiResponse.success(200, "Addons unlinked from item", {
      unlinked: affectedRows,
      requested: addon_ids.length
    });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

// LINK MULTIPLE ADDONS TO ORDER (Bulk)
const linkAddonsToOrder = async (req) => {
  const connection = await pool.getConnection();

  try {
    const { order_id, addons } = req.body;

    // Validate input
    if (!order_id || !Array.isArray(addons) || addons.length === 0) {
      return apiResponse.error(400, "order_id and addons array are required");
    }

    // Verify order exists
    const [orderCheck] = await connection.query(
      "SELECT id FROM orders WHERE id = ?",
      [order_id]
    );

    if (orderCheck.length === 0) {
      return apiResponse.error(404, "Order not found");
    }

    // Start transaction
    await connection.beginTransaction();

    const insertedIds = [];
    const errors = [];

    for (let i = 0; i < addons.length; i++) {
      const addon = addons[i];

      try {
        // Validate each addon
        if (!addon.addon_id || !addon.price) {
          errors.push({
            index: i,
            addon_id: addon.addon_id || 'unknown',
            error: "addon_id and price are required"
          });
          continue;
        }

        // Verify addon exists
        const [addonCheck] = await connection.query(
          "SELECT id FROM addons WHERE id = ?",
          [addon.addon_id]
        );

        if (addonCheck.length === 0) {
          errors.push({
            index: i,
            addon_id: addon.addon_id,
            error: "Addon not found"
          });
          continue;
        }

        // Insert addon to order
        const [result] = await connection.query(
          `INSERT INTO order_addons (order_id, addon_id, quantity, price) 
           VALUES (?, ?, ?, ?)`,
          [
            order_id,
            addon.addon_id,
            addon.quantity || 1,
            addon.price
          ]
        );

        insertedIds.push({
          index: i,
          id: result.insertId,
          addon_id: addon.addon_id,
          quantity: addon.quantity || 1,
          price: addon.price
        });
      } catch (itemError) {
        errors.push({
          index: i,
          addon_id: addon.addon_id || 'unknown',
          error: itemError.message
        });
      }
    }

    // If all addons failed, rollback
    if (insertedIds.length === 0) {
      await connection.rollback();
      return apiResponse.error(400, "All addons failed to link", {
        errors,
        inserted: 0,
        failed: errors.length
      });
    }

    // review Update order total amount with addons
    const totalAddonPrice = insertedIds.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);

    await connection.query(
      `UPDATE orders 
       SET total_amount = total_amount + ? 
       WHERE id = ?`,
      [totalAddonPrice, order_id]
    );

    // Commit transaction
    await connection.commit();

    return apiResponse.success(201, "Addons linked to order", {
      inserted: insertedIds.length,
      failed: errors.length,
      total_addon_price: totalAddonPrice,
      details: {
        inserted_addons: insertedIds,
        failed_addons: errors
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error("linkAddonsToOrder error:", error);
    return apiResponse.error(500, error.message);
  } finally {
    connection.release();
  }
};

// UPDATE ADDON
const updateAddon = async (req) => {
  try {
    const { id, rid, ...params } = req.body;

    if (!id || !rid) {
      return apiResponse.error(400, "id and rid are required");
    }

    if ((await others.getPower(req)) < 70) {
      return apiResponse.error(401, "Unauthorized access");
    }

    // Remove empty params
    for (let key in params) {
      if (params[key] === undefined || params[key] === null) {
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

    const q = `UPDATE addons SET ${setClause} WHERE id = ? AND rid = ?`;

    const [{ affectedRows }] = await pool.query(q, values);

    if (affectedRows === 0) {
      return apiResponse.error(404, "Addon not found");
    }

    // Fetch the updated addon with linked items count
    const [updatedAddon] = await pool.query(`
      SELECT a.*, COUNT(ia.inventory_id) as linked_items_count 
      FROM addons a 
      LEFT JOIN inventory_addons ia ON a.id = ia.addon_id 
      WHERE a.id = ?
      GROUP BY a.id
    `, [id]);

    return apiResponse.success(200, "Addon updated", updatedAddon[0]); // Return the full object
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

// DELETE ADDON
const deleteAddon = async (req) => {
  try {
    const { id, rid } = req.body;

    if (!id || !rid) {
      return apiResponse.error(400, "id and rid are required");
    }

    if ((await others.getPower(req)) < 70) {
      return apiResponse.error(401, "Unauthorized access");
    }

    const [{ affectedRows }] = await pool.query(
      "DELETE FROM addons WHERE id = ? AND rid = ?",
      [id, rid]
    );

    if (!affectedRows) {
      return apiResponse.error(404, "Addon not found");
    }

    return apiResponse.success(200, "Addon deleted");
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

export default {
  getAddons,
  getAddonsForItem,
  createAddon,
  linkAddonsToItem,
  unlinkAddonsFromItem,
  linkAddonsToOrder,
  updateAddon,
  deleteAddon,
};
