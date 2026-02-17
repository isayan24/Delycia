import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";

/**
 * Superadmin Menus Controller
 * Handles menu management across all restaurants
 */

/**
 * Get all menu items with optional filters
 * Requirement 5.1, 5.2: List all menu items with filters
 */
const getAllMenus = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      restaurant_id = "",
      category_id = "",
      min_price = "",
      max_price = "",
      status = "",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build WHERE clause for filters
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push("(i.name LIKE ? OR i.description LIKE ?)");
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern);
    }

    if (restaurant_id) {
      whereConditions.push("i.rid = ?");
      queryParams.push(parseInt(restaurant_id));
    }

    if (category_id) {
      whereConditions.push("i.category_id = ?");
      queryParams.push(parseInt(category_id));
    }

    // Price range filter (Requirement 5.2)
    if (min_price) {
      whereConditions.push("i.price >= ?");
      queryParams.push(parseInt(min_price));
    }

    if (max_price) {
      whereConditions.push("i.price <= ?");
      queryParams.push(parseInt(max_price));
    }

    // Availability status filter (Requirement 5.2)
    if (status) {
      whereConditions.push("i.status = ?");
      queryParams.push(status);
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM inventories i
      ${whereClause}
    `;
    const [countResult] = await pool.query(countQuery, queryParams);
    const total = countResult[0].total;

    // Get menu items with restaurant and category info (Requirement 5.1)
    const query = `
      SELECT 
        i.id,
        i.rid as restaurant_id,
        r.name as restaurant_name,
        i.category_id,
        c.name as category_name,
        i.name,
        i.description,
        i.images,
        i.is_veg,
        i.cost,
        i.price,
        i.status,
        i.stock,
        i.recommend,
        i.created_at,
        i.updated_at
      FROM inventories i
      LEFT JOIN restaurants r ON i.rid = r.id
      LEFT JOIN categories c ON i.category_id = c.id
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const [menuItems] = await pool.query(query, queryParams);

    // Parse images JSON for each item
    const formattedItems = menuItems.map((item) => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : [],
    }));

    return res.status(200).json(
      apiResponse.success(200, "Menu items retrieved successfully", {
        data: formattedItems,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      })
    );
  } catch (error) {
    console.error("Get all menus error:", error);
    return res
      .status(500)
      .json(
        apiResponse.error(500, "An error occurred while retrieving menu items")
      );
  }
};

/**
 * Get single menu item details
 */
const getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json(apiResponse.error(400, "Menu item ID is required"));
    }

    // Get menu item details with restaurant and category info
    const query = `
      SELECT 
        i.id,
        i.rid as restaurant_id,
        r.name as restaurant_name,
        i.category_id,
        c.name as category_name,
        i.name,
        i.description,
        i.images,
        i.is_veg,
        i.cost,
        i.price,
        i.status,
        i.stock,
        i.recommend,
        i.ai,
        i.created_at,
        i.updated_at
      FROM inventories i
      LEFT JOIN restaurants r ON i.rid = r.id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?
    `;

    const [result] = await pool.query(query, [id]);

    if (!result.length) {
      return res
        .status(404)
        .json(apiResponse.error(404, "Menu item not found"));
    }

    const menuItem = {
      ...result[0],
      images: result[0].images ? JSON.parse(result[0].images) : [],
    };

    return res.status(200).json(
      apiResponse.success(200, "Menu item details retrieved successfully", {
        data: menuItem,
      })
    );
  } catch (error) {
    console.error("Get menu item error:", error);
    return res
      .status(500)
      .json(
        apiResponse.error(
          500,
          "An error occurred while retrieving menu item details"
        )
      );
  }
};

/**
 * Update menu item
 * Requirement 5.3: Edit menu item details
 * Requirement 5.7: Validate prices are positive
 */
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res
        .status(400)
        .json(apiResponse.error(400, "Menu item ID is required"));
    }

    // Check if menu item exists
    const [existing] = await pool.query(
      "SELECT id, name FROM inventories WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return res
        .status(404)
        .json(apiResponse.error(404, "Menu item not found"));
    }

    // Validate price is positive (Requirement 5.7)
    if (updateData.price !== undefined) {
      const price = parseFloat(updateData.price);
      if (isNaN(price) || price <= 0) {
        return res
          .status(400)
          .json(
            apiResponse.error(
              400,
              "Price must be a positive number greater than zero"
            )
          );
      }
    }

    // Validate cost if provided
    if (updateData.cost !== undefined) {
      const cost = parseFloat(updateData.cost);
      if (isNaN(cost) || cost < 0) {
        return res
          .status(400)
          .json(apiResponse.error(400, "Cost must be a non-negative number"));
      }
    }

    // Build update query dynamically based on provided fields
    const allowedFields = [
      "name",
      "description",
      "images",
      "is_veg",
      "cost",
      "price",
      "status",
      "stock",
      "recommend",
      "category_id",
    ];

    const updateFields = [];
    const updateValues = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        // Handle images JSON stringification
        if (field === "images" && Array.isArray(updateData[field])) {
          updateFields.push(`${field} = ?`);
          updateValues.push(JSON.stringify(updateData[field]));
        } else {
          updateFields.push(`${field} = ?`);
          updateValues.push(updateData[field]);
        }
      }
    }

    if (updateFields.length === 0) {
      return res
        .status(400)
        .json(apiResponse.error(400, "No valid fields to update"));
    }

    // Add menu item ID to values
    updateValues.push(id);

    const updateQuery = `
      UPDATE inventories 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    await pool.query(updateQuery, updateValues);

    // Fetch updated menu item
    const [updatedItem] = await pool.query(
      `SELECT 
        i.id,
        i.rid as restaurant_id,
        r.name as restaurant_name,
        i.category_id,
        c.name as category_name,
        i.name,
        i.description,
        i.images,
        i.is_veg,
        i.cost,
        i.price,
        i.status,
        i.stock,
        i.recommend,
        i.created_at,
        i.updated_at
      FROM inventories i
      LEFT JOIN restaurants r ON i.rid = r.id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?`,
      [id]
    );

    const menuItem = {
      ...updatedItem[0],
      images: updatedItem[0].images ? JSON.parse(updatedItem[0].images) : [],
    };

    return res.status(200).json(
      apiResponse.success(200, "Menu item updated successfully", {
        data: menuItem,
      })
    );
  } catch (error) {
    console.error("Update menu item error:", error);
    return res
      .status(500)
      .json(
        apiResponse.error(500, "An error occurred while updating menu item")
      );
  }
};

/**
 * Delete menu item (soft delete)
 * Requirement 5.5: Soft delete to preserve historical order data
 */
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json(apiResponse.error(400, "Menu item ID is required"));
    }

    // Check if menu item exists
    const [existing] = await pool.query(
      "SELECT id, name, status FROM inventories WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return res
        .status(404)
        .json(apiResponse.error(404, "Menu item not found"));
    }

    if (existing[0].status === "unavailable") {
      return res
        .status(400)
        .json(
          apiResponse.error(
            400,
            "Menu item is already marked as unavailable (deleted)"
          )
        );
    }

    // Soft delete: Mark as unavailable to preserve historical order data (Requirement 5.5)
    await pool.query(
      "UPDATE inventories SET status = 'unavailable' WHERE id = ?",
      [id]
    );

    // Fetch updated menu item
    const [deletedItem] = await pool.query(
      `SELECT 
        i.id,
        i.rid as restaurant_id,
        r.name as restaurant_name,
        i.category_id,
        c.name as category_name,
        i.name,
        i.description,
        i.images,
        i.is_veg,
        i.cost,
        i.price,
        i.status,
        i.stock,
        i.recommend,
        i.created_at,
        i.updated_at
      FROM inventories i
      LEFT JOIN restaurants r ON i.rid = r.id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?`,
      [id]
    );

    const menuItem = {
      ...deletedItem[0],
      images: deletedItem[0].images ? JSON.parse(deletedItem[0].images) : [],
    };

    return res.status(200).json(
      apiResponse.success(
        200,
        "Menu item deleted successfully (soft delete - historical data preserved)",
        {
          data: menuItem,
        }
      )
    );
  } catch (error) {
    console.error("Delete menu item error:", error);
    return res
      .status(500)
      .json(
        apiResponse.error(500, "An error occurred while deleting menu item")
      );
  }
};

/**
 * Create menu category
 * Requirement 5.4: Create category for specific restaurant
 */
const createCategory = async (req, res) => {
  try {
    const {
      rid,
      name,
      description = "",
      img = null,
      display_order = 0,
      template_id = null,
    } = req.body;

    // Validate required fields
    if (!rid || !name) {
      return res
        .status(400)
        .json(
          apiResponse.error(
            400,
            "Missing required fields: rid (restaurant_id), name"
          )
        );
    }

    // Validate restaurant exists and is active (Requirement 5.4)
    const [restaurant] = await pool.query(
      "SELECT id, is_active FROM restaurants WHERE id = ?",
      [rid]
    );

    if (!restaurant.length) {
      return res
        .status(404)
        .json(apiResponse.error(404, "Restaurant not found"));
    }

    if (restaurant[0].is_active === 0) {
      return res
        .status(400)
        .json(
          apiResponse.error(
            400,
            "Cannot create category for inactive restaurant"
          )
        );
    }

    // Check if category name already exists for this restaurant
    const [existingCategory] = await pool.query(
      "SELECT id FROM categories WHERE rid = ? AND LOWER(name) = LOWER(?)",
      [rid, name]
    );

    if (existingCategory.length > 0) {
      return res
        .status(409)
        .json(
          apiResponse.error(
            409,
            "Category with this name already exists for this restaurant"
          )
        );
    }

    // Insert new category
    const insertQuery = `
      INSERT INTO categories (
        rid, name, description, img, display_order, template_id, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, 1)
    `;

    const [result] = await pool.query(insertQuery, [
      rid,
      name,
      description,
      img,
      display_order,
      template_id,
    ]);

    // Fetch the created category
    const [newCategory] = await pool.query(
      `SELECT 
        c.id,
        c.rid as restaurant_id,
        r.name as restaurant_name,
        c.name,
        c.description,
        c.img,
        c.display_order,
        c.template_id,
        c.is_active,
        c.created_at,
        c.updated_at
      FROM categories c
      LEFT JOIN restaurants r ON c.rid = r.id
      WHERE c.id = ?`,
      [result.insertId]
    );

    return res.status(201).json(
      apiResponse.success(201, "Category created successfully", {
        data: newCategory[0],
      })
    );
  } catch (error) {
    console.error("Create category error:", error);
    return res
      .status(500)
      .json(apiResponse.error(500, "An error occurred while creating category"));
  }
};

/**
 * Update menu category
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res
        .status(400)
        .json(apiResponse.error(400, "Category ID is required"));
    }

    // Check if category exists
    const [existing] = await pool.query(
      "SELECT id, name, rid FROM categories WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return res
        .status(404)
        .json(apiResponse.error(404, "Category not found"));
    }

    // If name is being updated, check for uniqueness within restaurant
    if (updateData.name && updateData.name !== existing[0].name) {
      const [existingName] = await pool.query(
        "SELECT id FROM categories WHERE rid = ? AND LOWER(name) = LOWER(?) AND id != ?",
        [existing[0].rid, updateData.name, id]
      );

      if (existingName.length > 0) {
        return res
          .status(409)
          .json(
            apiResponse.error(
              409,
              "Category with this name already exists for this restaurant"
            )
          );
      }
    }

    // Build update query dynamically
    const allowedFields = [
      "name",
      "description",
      "img",
      "display_order",
      "is_active",
    ];

    const updateFields = [];
    const updateValues = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updateData[field]);
      }
    }

    if (updateFields.length === 0) {
      return res
        .status(400)
        .json(apiResponse.error(400, "No valid fields to update"));
    }

    updateValues.push(id);

    const updateQuery = `
      UPDATE categories 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    await pool.query(updateQuery, updateValues);

    // Fetch updated category
    const [updatedCategory] = await pool.query(
      `SELECT 
        c.id,
        c.rid as restaurant_id,
        r.name as restaurant_name,
        c.name,
        c.description,
        c.img,
        c.display_order,
        c.template_id,
        c.is_active,
        c.created_at,
        c.updated_at
      FROM categories c
      LEFT JOIN restaurants r ON c.rid = r.id
      WHERE c.id = ?`,
      [id]
    );

    return res.status(200).json(
      apiResponse.success(200, "Category updated successfully", {
        data: updatedCategory[0],
      })
    );
  } catch (error) {
    console.error("Update category error:", error);
    return res
      .status(500)
      .json(apiResponse.error(500, "An error occurred while updating category"));
  }
};

/**
 * Delete menu category
 * Requirement 5.8: Handle menu items in category when deleting
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json(apiResponse.error(400, "Category ID is required"));
    }

    // Check if category exists
    const [existing] = await pool.query(
      "SELECT id, name, rid FROM categories WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return res
        .status(404)
        .json(apiResponse.error(404, "Category not found"));
    }

    // Check if category has menu items
    const [itemsInCategory] = await pool.query(
      "SELECT COUNT(*) as count FROM inventories WHERE category_id = ?",
      [id]
    );

    if (itemsInCategory[0].count > 0) {
      return res
        .status(400)
        .json(
          apiResponse.error(
            400,
            `Cannot delete category with ${itemsInCategory[0].count} menu items. Please reassign or delete the items first.`
          )
        );
    }

    // Delete category
    await pool.query("DELETE FROM categories WHERE id = ?", [id]);

    return res.status(200).json(
      apiResponse.success(200, "Category deleted successfully", {
        data: {
          id: parseInt(id),
          name: existing[0].name,
          restaurant_id: existing[0].rid,
        },
      })
    );
  } catch (error) {
    console.error("Delete category error:", error);
    return res
      .status(500)
      .json(apiResponse.error(500, "An error occurred while deleting category"));
  }
};

/**
 * Bulk update menu items
 * Requirement 5.6: Support bulk operations with validation
 */
const bulkUpdateMenus = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json(
          apiResponse.error(
            400,
            "Items array is required and must contain at least one item"
          )
        );
    }

    // Validate all items before updating
    const validationErrors = [];
    const itemIds = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item.id) {
        validationErrors.push(`Item at index ${i}: ID is required`);
        continue;
      }

      itemIds.push(item.id);

      // Validate price if provided (Requirement 5.7)
      if (item.price !== undefined) {
        const price = parseFloat(item.price);
        if (isNaN(price) || price <= 0) {
          validationErrors.push(
            `Item at index ${i} (ID: ${item.id}): Price must be a positive number greater than zero`
          );
        }
      }

      // Validate cost if provided
      if (item.cost !== undefined) {
        const cost = parseFloat(item.cost);
        if (isNaN(cost) || cost < 0) {
          validationErrors.push(
            `Item at index ${i} (ID: ${item.id}): Cost must be a non-negative number`
          );
        }
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json(
        apiResponse.error(400, "Validation errors", {
          errors: validationErrors,
        })
      );
    }

    // Check if all items exist
    const placeholders = itemIds.map(() => "?").join(",");
    const [existingItems] = await pool.query(
      `SELECT id FROM inventories WHERE id IN (${placeholders})`,
      itemIds
    );

    if (existingItems.length !== itemIds.length) {
      const existingIds = existingItems.map((item) => item.id);
      const missingIds = itemIds.filter((id) => !existingIds.includes(id));
      return res.status(404).json(
        apiResponse.error(404, "Some menu items not found", {
          missing_ids: missingIds,
        })
      );
    }

    // Perform bulk update
    const updatePromises = items.map(async (item) => {
      const allowedFields = [
        "name",
        "description",
        "images",
        "is_veg",
        "cost",
        "price",
        "status",
        "stock",
        "recommend",
        "category_id",
      ];

      const updateFields = [];
      const updateValues = [];

      for (const field of allowedFields) {
        if (item[field] !== undefined) {
          if (field === "images" && Array.isArray(item[field])) {
            updateFields.push(`${field} = ?`);
            updateValues.push(JSON.stringify(item[field]));
          } else {
            updateFields.push(`${field} = ?`);
            updateValues.push(item[field]);
          }
        }
      }

      if (updateFields.length > 0) {
        updateValues.push(item.id);
        const updateQuery = `
          UPDATE inventories 
          SET ${updateFields.join(", ")}
          WHERE id = ?
        `;
        return pool.query(updateQuery, updateValues);
      }
    });

    await Promise.all(updatePromises);

    // Fetch updated items
    const [updatedItems] = await pool.query(
      `SELECT 
        i.id,
        i.rid as restaurant_id,
        r.name as restaurant_name,
        i.category_id,
        c.name as category_name,
        i.name,
        i.description,
        i.images,
        i.is_veg,
        i.cost,
        i.price,
        i.status,
        i.stock,
        i.recommend,
        i.created_at,
        i.updated_at
      FROM inventories i
      LEFT JOIN restaurants r ON i.rid = r.id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id IN (${placeholders})`,
      itemIds
    );

    const formattedItems = updatedItems.map((item) => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : [],
    }));

    return res.status(200).json(
      apiResponse.success(
        200,
        `Successfully updated ${formattedItems.length} menu items`,
        {
          data: formattedItems,
          updated_count: formattedItems.length,
        }
      )
    );
  } catch (error) {
    console.error("Bulk update menus error:", error);
    return res
      .status(500)
      .json(
        apiResponse.error(
          500,
          "An error occurred while performing bulk update"
        )
      );
  }
};

export default {
  getAllMenus,
  getMenuItemById: getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkUpdateMenuItems: bulkUpdateMenus,
};
