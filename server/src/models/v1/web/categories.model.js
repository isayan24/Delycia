import pool from "../../../config/db.connection.js";
import others from "../../../utils/others.js";
import apiResponse from "../../../utils/apiResponse.js";
import embeddingModel from "./embedding.model.js";

const createCategory = async (req) => {
  try {
    const { name, description, img, rid } = req.body;

    // CHANGED: Now requires rid (restaurant ID)
    if (!rid) return apiResponse.error(400, "Restaurant ID (rid) is required");

    if (![name, description, img].every(Boolean))
      return apiResponse.error(400, "Data missing (name, description, img required)");

    const power = await others.getPower(req);
    if (power < 70) return apiResponse.error(401, "Unauthorized access!");

    // NEW: Verify user has access to this restaurant
    const hasAccess = await others.hasRestaurantAccess(req, rid);
    if (!hasAccess) return apiResponse.error(403, "Access denied to this restaurant");

    // NEW: Check if category name already exists for this restaurant
    const [existing] = await pool.query(
      "SELECT id FROM categories WHERE rid = ? AND name = ?",
      [rid, name]
    );

    if (existing.length > 0) {
      return apiResponse.error(400, "Category with this name already exists for this restaurant");
    }

    // CHANGED: Insert with rid and optional template_id
    const [result] = await pool.query(
      "INSERT INTO categories (rid, name, description, img, display_order) VALUES (?, ?, ?, ?, 0)",
      [rid, name, description, img]
    );
    setImmediate(async () => {
      if (result && result.insertId) await embeddingModel.category(result.insertId);
    })

    return result.warningStatus
      ? apiResponse.error(400, "Unable to create new category.")
      : apiResponse.success(201, "Category created successfully!", {
        category_id: result.insertId
      });
  } catch (err) {
    console.error("createCategory error:", err);
    return apiResponse.error(500, err.message);
  }
};

const getCategories = async (req) => {
  try {
    let { id, rid, username } = req.query;

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

    let q;
    let params = [];

    if (id && rid) {
      // CHANGED: Get specific category for a restaurant
      q = "SELECT * FROM categories WHERE id = ? AND rid = ?";
      params = [id, rid];
    } else if (rid) {
      // CHANGED: Simplified - just get all categories for the restaurant
      q = `
        SELECT 
          c.*,
          ct.cuisine_type,
          (SELECT COUNT(*) FROM inventories WHERE category_id = c.id AND rid = c.rid) as item_count
        FROM categories c
        LEFT JOIN category_templates ct ON ct.id = c.template_id
        WHERE c.rid = ?
        ORDER BY c.display_order ASC, c.name ASC
      `;
      params = [rid];
    } else {
      // CHANGED: For admin only - get all categories with restaurant info
      const power = await others.getPower(req);
      if (power < 90) {
        return apiResponse.error(401, "Restaurant ID (rid) or username is required for non-admin users");
      }

      q = `
        SELECT 
          c.*,
          r.name as restaurant_name,
          ct.cuisine_type
        FROM categories c
        INNER JOIN restaurants r ON r.id = c.rid
        LEFT JOIN category_templates ct ON ct.id = c.template_id
        ORDER BY c.rid, c.name
      `;
      params = [];
    }

    const [result] = await pool.query(q, params);

    return apiResponse.success(200, "Categories retrieved successfully", {
      categories: result
    });
  } catch (error) {
    console.error("getCategories error:", error);
    return apiResponse.error(500, "Internal Server Error");
  }
};

const getCategoryTemplates = async (req) => {
  try {
    const { cuisine_type } = req.query;

    let q = `
      SELECT 
        id,
        name,
        description,
        img,
        cuisine_type,
        usage_count
      FROM category_templates
      WHERE is_active = 1
    `;
    let params = [];

    if (cuisine_type) {
      q += " AND cuisine_type = ?";
      params = [cuisine_type];
    }

    q += " ORDER BY usage_count DESC, name ASC";

    const [templates] = await pool.query(q, params);

    // Get cuisine types for filtering
    const [cuisineTypes] = await pool.query(`
      SELECT DISTINCT cuisine_type, COUNT(*) as template_count
      FROM category_templates
      WHERE is_active = 1
      GROUP BY cuisine_type
      ORDER BY cuisine_type
    `);

    return apiResponse.success(200, "Templates retrieved successfully", {
      templates,
      cuisine_types: cuisineTypes
    });
  } catch (error) {
    console.error("getCategoryTemplates error:", error);
    return apiResponse.error(500, "Internal Server Error");
  }
};

const createFromTemplate = async (req) => {
  try {
    const { rid, template_id } = req.body;

    if (!rid || !template_id) {
      return apiResponse.error(400, "Restaurant ID (rid) and template_id are required");
    }

    const power = await others.getPower(req);
    if (power < 70) return apiResponse.error(401, "Unauthorized access!");

    // Verify restaurant access
    const hasAccess = await others.hasRestaurantAccess(req, rid);
    if (!hasAccess) return apiResponse.error(403, "Access denied to this restaurant");

    // Get template data
    const [templates] = await pool.query(
      "SELECT * FROM category_templates WHERE id = ? AND is_active = 1",
      [template_id]
    );

    if (templates.length === 0) {
      return apiResponse.error(404, "Template not found");
    }

    const template = templates[0];

    // Check if category already exists for this restaurant
    const [existing] = await pool.query(
      "SELECT id FROM categories WHERE rid = ? AND name = ?",
      [rid, template.name]
    );

    if (existing.length > 0) {
      return apiResponse.error(400, "Category already exists for this restaurant");
    }

    // Create category from template
    const [result] = await pool.query(
      `INSERT INTO categories (rid, template_id, name, description, img, display_order) 
       VALUES (?, ?, ?, ?, ?, 0)`,
      [rid, template_id, template.name, template.description, template.img]
    );

    // Update template usage count
    await pool.query(
      "UPDATE category_templates SET usage_count = usage_count + 1 WHERE id = ?",
      [template_id]
    );

    setImmediate(async () => {
      if (result && result.insertId) await embeddingModel.category(result.insertId);
    })

    return apiResponse.success(201, "Category created from template!", {
      category_id: result.insertId
    });
  } catch (error) {
    console.error("createFromTemplate error:", error);
    return apiResponse.error(500, error.message);
  }
};

const deleteCategory = async (req) => {
  try {
    const { id, rid } = req.body;

    // CHANGED: Now requires both id and rid
    if (!id || !rid) {
      return apiResponse.error(400, "Category ID and Restaurant ID (rid) are required");
    }

    const power = await others.getPower(req);
    if (power < 70) return apiResponse.error(401, "Unauthorized access!");

    // NEW: Verify user has access to this restaurant
    const hasAccess = await others.hasRestaurantAccess(req, rid);
    if (!hasAccess) return apiResponse.error(403, "Access denied to this restaurant");


    // CHANGED: Delete only if category belongs to this restaurant
    const [{ affectedRows }] = await pool.query(
      "DELETE FROM categories WHERE id = ? AND rid = ?",
      [id, rid]
    );

    if (affectedRows > 0) {
      setImmediate(async () => {
        await embeddingModel.qd_delete("categories", id);
      })
      return apiResponse.success(200, "Category deleted successfully");
    } else {
      return apiResponse.error(404, "Category not found or access denied");
    }
  } catch (error) {
    console.error("deleteCategory error:", error);
    return apiResponse.error(500, error.message);
  }
};

const updateCategory = async (req) => {
  try {
    const { id, rid, name, description, img, is_active, display_order } = req.body;

    // CHANGED: Now requires rid
    if (!id || !rid) {
      return apiResponse.error(400, "Category ID and Restaurant ID (rid) are required");
    }

    const power = await others.getPower(req);
    if (power < 70) return apiResponse.error(401, "Unauthorized access!");

    // NEW: Verify user has access to this restaurant
    const hasAccess = await others.hasRestaurantAccess(req, rid);
    if (!hasAccess) return apiResponse.error(403, "Access denied to this restaurant");

    // NEW: If changing name, check for duplicates
    if (name) {
      const [existing] = await pool.query(
        "SELECT id FROM categories WHERE rid = ? AND name = ? AND id != ?",
        [rid, name, id]
      );

      if (existing.length > 0) {
        return apiResponse.error(400, "Category with this name already exists");
      }
    }

    // FIXED: Use parameterized queries to prevent SQL injection
    const updates = [];
    const values = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    if (img) {
      updates.push("img = ?");
      values.push(img);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      values.push(is_active);
    }
    if (display_order !== undefined) {
      updates.push("display_order = ?");
      values.push(display_order);
    }

    if (updates.length === 0) {
      return apiResponse.error(400, "Nothing to update");
    }

    // Add updated_at timestamp
    updates.push("updated_at = NOW()");

    // CHANGED: Update only if category belongs to this restaurant
    const q = `UPDATE categories SET ${updates.join(", ")} WHERE id = ? AND rid = ?`;
    values.push(id, rid);

    const [result] = await pool.query(q, values);

    if (result.affectedRows === 0) {
      return apiResponse.error(404, "Category not found or access denied");
    }

    // NEW: If category has template_id, also update the linked template
    if (result.affectedRows > 0 && (name || description || img)) {
      try {
        // Get category to check if it has template_id
        const [categories] = await pool.query(
          "SELECT template_id FROM categories WHERE id = ? AND rid = ?",
          [id, rid]
        );

        if (categories.length > 0 && categories[0].template_id) {
          const templateId = categories[0].template_id;
          const templateUpdates = [];
          const templateValues = [];

          // Update template with same fields that were updated in category
          if (name) {
            templateUpdates.push("name = ?");
            templateValues.push(name);
          }
          if (description !== undefined) {
            templateUpdates.push("description = ?");
            templateValues.push(description);
          }
          if (img) {
            templateUpdates.push("img = ?");
            templateValues.push(img);
          }

          if (templateUpdates.length > 0) {
            templateUpdates.push("updated_at = NOW()");
            const templateQuery = `UPDATE category_templates SET ${templateUpdates.join(", ")} WHERE id = ?`;
            templateValues.push(templateId);

            await pool.query(templateQuery, templateValues);
            console.log(`✓ Template ${templateId} synced with category ${id}`);
          }
        }
      } catch (templateError) {
        console.error("Failed to update template:", templateError);
        // Continue even if template update fails
      }
    }

    if (result.changedRows === 0) {
      return apiResponse.success(200, "No changes made");
    }

    // Update embeddings if name or description changed
    if (name || description) {
      setImmediate(async () => {
        await embeddingModel.category(id);
      })
    }

    return apiResponse.success(200, "Category updated successfully!");
  } catch (error) {
    console.error("updateCategory error:", error);
    return apiResponse.error(500, error.message);
  }
};

const bulkCreateFromTemplates = async (req) => {
  try {
    const { rid, template_ids } = req.body;

    if (!rid || !Array.isArray(template_ids) || template_ids.length === 0) {
      return apiResponse.error(400, "Restaurant ID (rid) and template_ids array are required");
    }

    const power = await others.getPower(req);
    if (power < 70) return apiResponse.error(401, "Unauthorized access!");

    const hasAccess = await others.hasRestaurantAccess(req, rid);
    if (!hasAccess) return apiResponse.error(403, "Access denied to this restaurant");

    const created = [];
    const skipped = [];

    for (const template_id of template_ids) {
      try {
        // Get template
        const [templates] = await pool.query(
          "SELECT * FROM category_templates WHERE id = ? AND is_active = 1",
          [template_id]
        );

        if (templates.length === 0) {
          skipped.push({ template_id, reason: "Template not found" });
          continue;
        }

        const template = templates[0];

        // Check if already exists
        const [existing] = await pool.query(
          "SELECT id FROM categories WHERE rid = ? AND name = ?",
          [rid, template.name]
        );

        if (existing.length > 0) {
          skipped.push({ template_id, name: template.name, reason: "Already exists" });
          continue;
        }

        // Create category
        const [result] = await pool.query(
          `INSERT INTO categories (rid, template_id, name, description, img, display_order) 
           VALUES (?, ?, ?, ?, ?, 0)`,
          [rid, template_id, template.name, template.description, template.img]
        );

        // Update usage count
        await pool.query(
          "UPDATE category_templates SET usage_count = usage_count + 1 WHERE id = ?",
          [template_id]
        );

        setImmediate(async () => {
          if (result && result.insertId) {
            await embeddingModel.category(result.insertId);
          }
        })

        created.push({
          category_id: result.insertId,
          name: template.name,
          template_id
        });
      } catch (err) {
        console.error(`Error creating category from template ${template_id}:`, err);
        skipped.push({ template_id, reason: err.message });
      }
    }

    return apiResponse.success(201, "Bulk category creation completed", {
      created: created.length,
      skipped: skipped.length,
      details: { created, skipped }
    });
  } catch (error) {
    console.error("bulkCreateFromTemplates error:", error);
    return apiResponse.error(500, error.message);
  }
};

/**
 * Create a custom category and optionally save it as a template
 */
const createCategoryAsTemplate = async (req) => {
  try {
    const { name, description, img, rid, cuisine_type, saveAsTemplate } = req.body;

    if (!rid) return apiResponse.error(400, "Restaurant ID (rid) is required");
    if (![name, description, img, cuisine_type].every(Boolean)) {
      return apiResponse.error(400, "Data missing (name, description, img, cuisine_type required)");
    }

    const power = await others.getPower(req);
    if (power < 70) return apiResponse.error(401, "Unauthorized access!");

    const hasAccess = await others.hasRestaurantAccess(req, rid);
    if (!hasAccess) return apiResponse.error(403, "Access denied to this restaurant");

    const [existing] = await pool.query(
      "SELECT id FROM categories WHERE rid = ? AND name = ?",
      [rid, name]
    );

    if (existing.length > 0) {
      return apiResponse.error(400, "Category with this name already exists for this restaurant");
    }

    let template_id = null;

    // If saveAsTemplate is true, create template first
    if (saveAsTemplate == 'true') {
      const [templateResult] = await pool.query(
        "INSERT INTO category_templates (name, description, img, cuisine_type, usage_count, is_active) VALUES (?, ?, ?, ?, 0, 1)",
        [name, description, img, cuisine_type]
      );

      if (templateResult.warningStatus) {
        return apiResponse.error(400, "Unable to create category template");
      }

      template_id = templateResult.insertId;
    }

    // Create the category for the restaurant
    const [categoryResult] = await pool.query(
      "INSERT INTO categories (rid, template_id, name, description, img, display_order) VALUES (?, ?, ?, ?, ?, 0)",
      [rid, template_id, name, description, img]
    );

    if (categoryResult.warningStatus) {
      return apiResponse.error(400, "Unable to create category");
    }

    setImmediate(async () => {
      if (categoryResult && categoryResult.insertId) {
        await embeddingModel.category(categoryResult.insertId);
      }
    })

    return apiResponse.success(201, "Category created successfully!", {
      category_id: categoryResult.insertId,
      template_id: template_id,
      saved_as_template: saveAsTemplate == true
    });
  } catch (err) {
    console.error("createCategoryAsTemplate error:", err);
    return apiResponse.error(500, err.message);
  }
};

export default {
  createCategory,
  getCategories,
  getCategoryTemplates,
  createFromTemplate,
  bulkCreateFromTemplates,
  createCategoryAsTemplate,
  deleteCategory,
  updateCategory,
};
