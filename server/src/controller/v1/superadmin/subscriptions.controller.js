import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";

/**
 * Superadmin Subscriptions Controller
 * Handles subscription plans and assignments management
 */

/**
 * Get all subscription plans
 */
const getAllPlans = async (req, res) => {
  try {
    const { include_inactive = "false" } = req.query;

    // Build WHERE clause
    const whereClause = include_inactive === "true" ? "" : "WHERE sp.is_active = 1";

    // Get all plans with usage statistics
    const query = `
      SELECT 
        sp.*,
        COUNT(DISTINCT sa.id) as active_subscriptions,
        COUNT(DISTINCT sa.restaurant_id) as total_restaurants
      FROM subscription_plans sp
      LEFT JOIN subscription_assignments sa ON sp.id = sa.subscription_plan_id AND sa.status = 'active'
      ${whereClause}
      GROUP BY sp.id
      ORDER BY sp.display_order ASC, sp.created_at DESC
    `;

    const [plans] = await pool.query(query);

    return res.status(200).json(
      apiResponse.success(200, "Subscription plans retrieved successfully", {
        data: plans,
      })
    );
  } catch (error) {
    console.error("Get all plans error:", error);
    return res.status(500).json(
      apiResponse.error(500, "An error occurred while retrieving subscription plans")
    );
  }
};

/**
 * Get single plan details with usage statistics
 */
const getPlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(
        apiResponse.error(400, "Plan ID is required")
      );
    }

    // Get plan details with usage statistics
    const query = `
      SELECT 
        sp.*,
        COUNT(DISTINCT sa.id) as active_subscriptions,
        COUNT(DISTINCT sa.restaurant_id) as total_restaurants,
        SUM(CASE WHEN sa.status = 'active' THEN sp.price ELSE 0 END) as monthly_revenue
      FROM subscription_plans sp
      LEFT JOIN subscription_assignments sa ON sp.id = sa.subscription_plan_id AND sa.status = 'active'
      WHERE sp.id = ?
      GROUP BY sp.id
    `;

    const [result] = await pool.query(query, [id]);

    if (!result.length) {
      return res.status(404).json(
        apiResponse.error(404, "Subscription plan not found")
      );
    }

    return res.status(200).json(
      apiResponse.success(200, "Subscription plan retrieved successfully", {
        data: result[0],
      })
    );
  } catch (error) {
    console.error("Get plan error:", error);
    return res.status(500).json(
      apiResponse.error(500, "An error occurred while retrieving subscription plan")
    );
  }
};

/**
 * Create new subscription plan
 */
const createPlan = async (req, res) => {
  try {
    const {
      plan_code,
      plan_name,
      price,
      currency = "INR",
      billing_period,
      billing_days,
      savings = 0,
      is_popular = 0,
      display_order = 0,
      features = [],
      max_restaurants = 1,
    } = req.body;

    // Validate required fields
    if (!plan_code || !plan_name || price === undefined || !billing_period || !billing_days) {
      return res.status(400).json(
        apiResponse.error(400, "Missing required fields: plan_code, plan_name, price, billing_period, billing_days")
      );
    }

    // Validate billing_period
    const validBillingPeriods = ["month", "year", "trial"];
    if (!validBillingPeriods.includes(billing_period)) {
      return res.status(400).json(
        apiResponse.error(400, "Invalid billing_period. Must be one of: month, year, trial")
      );
    }

    // Validate price is positive
    if (price < 0) {
      return res.status(400).json(
        apiResponse.error(400, "Price must be a positive number")
      );
    }

    // Require at least one feature (Requirement 2.7)
    if (!features || !Array.isArray(features) || features.length === 0) {
      return res.status(400).json(
        apiResponse.error(400, "At least one feature must be defined")
      );
    }

    // Check if plan_code already exists (case-insensitive)
    const [existingCode] = await pool.query(
      "SELECT id FROM subscription_plans WHERE LOWER(plan_code) = LOWER(?)",
      [plan_code]
    );

    if (existingCode.length > 0) {
      return res.status(409).json(
        apiResponse.error(409, "Plan code already exists")
      );
    }

    // Check if plan_name already exists (case-insensitive)
    const [existingName] = await pool.query(
      "SELECT id FROM subscription_plans WHERE LOWER(plan_name) = LOWER(?)",
      [plan_name]
    );

    if (existingName.length > 0) {
      return res.status(409).json(
        apiResponse.error(409, "Plan name already exists")
      );
    }

    // Insert new plan
    const insertQuery = `
      INSERT INTO subscription_plans (
        plan_code, plan_name, price, currency, billing_period, billing_days,
        savings, is_popular, is_active, display_order, features, max_restaurants
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `;

    const [result] = await pool.query(insertQuery, [
      plan_code,
      plan_name,
      price,
      currency,
      billing_period,
      billing_days,
      savings,
      is_popular,
      display_order,
      JSON.stringify(features),
      max_restaurants,
    ]);

    // Fetch the created plan
    const [newPlan] = await pool.query(
      "SELECT * FROM subscription_plans WHERE id = ?",
      [result.insertId]
    );

    return res.status(201).json(
      apiResponse.success(201, "Subscription plan created successfully", {
        data: newPlan[0],
      })
    );
  } catch (error) {
    console.error("Create plan error:", error);
    return res.status(500).json(
      apiResponse.error(500, "An error occurred while creating subscription plan")
    );
  }
};

/**
 * Update subscription plan
 */
const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json(
        apiResponse.error(400, "Plan ID is required")
      );
    }

    // Check if plan exists
    const [existing] = await pool.query(
      "SELECT id, plan_code, plan_name FROM subscription_plans WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return res.status(404).json(
        apiResponse.error(404, "Subscription plan not found")
      );
    }

    // If plan_code is being updated, check for uniqueness
    if (updateData.plan_code && updateData.plan_code !== existing[0].plan_code) {
      const [existingCode] = await pool.query(
        "SELECT id FROM subscription_plans WHERE LOWER(plan_code) = LOWER(?) AND id != ?",
        [updateData.plan_code, id]
      );

      if (existingCode.length > 0) {
        return res.status(409).json(
          apiResponse.error(409, "Plan code already exists")
        );
      }
    }

    // If plan_name is being updated, check for uniqueness
    if (updateData.plan_name && updateData.plan_name !== existing[0].plan_name) {
      const [existingName] = await pool.query(
        "SELECT id FROM subscription_plans WHERE LOWER(plan_name) = LOWER(?) AND id != ?",
        [updateData.plan_name, id]
      );

      if (existingName.length > 0) {
        return res.status(409).json(
          apiResponse.error(409, "Plan name already exists")
        );
      }
    }

    // Validate billing_period if provided
    if (updateData.billing_period) {
      const validBillingPeriods = ["month", "year", "trial"];
      if (!validBillingPeriods.includes(updateData.billing_period)) {
        return res.status(400).json(
          apiResponse.error(400, "Invalid billing_period. Must be one of: month, year, trial")
        );
      }
    }

    // Validate price if provided
    if (updateData.price !== undefined && updateData.price < 0) {
      return res.status(400).json(
        apiResponse.error(400, "Price must be a positive number")
      );
    }

    // Validate features if provided
    if (updateData.features !== undefined) {
      if (!Array.isArray(updateData.features) || updateData.features.length === 0) {
        return res.status(400).json(
          apiResponse.error(400, "At least one feature must be defined")
        );
      }
    }

    // Build update query dynamically based on provided fields
    const allowedFields = [
      "plan_code", "plan_name", "price", "currency", "billing_period", "billing_days",
      "savings", "is_popular", "is_active", "display_order", "features", "max_restaurants"
    ];

    const updateFields = [];
    const updateValues = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        // JSON stringify features array
        if (field === "features") {
          updateValues.push(JSON.stringify(updateData[field]));
        } else {
          updateValues.push(updateData[field]);
        }
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json(
        apiResponse.error(400, "No valid fields to update")
      );
    }

    // Add plan ID to values
    updateValues.push(id);

    const updateQuery = `
      UPDATE subscription_plans 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    await pool.query(updateQuery, updateValues);

    // Fetch updated plan
    const [updatedPlan] = await pool.query(
      "SELECT * FROM subscription_plans WHERE id = ?",
      [id]
    );

    return res.status(200).json(
      apiResponse.success(200, "Subscription plan updated successfully. Changes will apply to new subscriptions only.", {
        data: updatedPlan[0],
      })
    );
  } catch (error) {
    console.error("Update plan error:", error);
    return res.status(500).json(
      apiResponse.error(500, "An error occurred while updating subscription plan")
    );
  }
};

/**
 * Deactivate subscription plan
 */
const deactivatePlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(
        apiResponse.error(400, "Plan ID is required")
      );
    }

    // Check if plan exists
    const [existing] = await pool.query(
      "SELECT id, is_active FROM subscription_plans WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return res.status(404).json(
        apiResponse.error(404, "Subscription plan not found")
      );
    }

    if (existing[0].is_active === 0) {
      return res.status(400).json(
        apiResponse.error(400, "Subscription plan is already inactive")
      );
    }

    // Deactivate plan (prevents new assignments, existing subscriptions continue)
    await pool.query(
      "UPDATE subscription_plans SET is_active = 0 WHERE id = ?",
      [id]
    );

    // Fetch updated plan
    const [deactivatedPlan] = await pool.query(
      "SELECT * FROM subscription_plans WHERE id = ?",
      [id]
    );

    return res.status(200).json(
      apiResponse.success(200, "Subscription plan deactivated successfully. Existing subscriptions will continue until their end date.", {
        data: deactivatedPlan[0],
      })
    );
  } catch (error) {
    console.error("Deactivate plan error:", error);
    return res.status(500).json(
      apiResponse.error(500, "An error occurred while deactivating subscription plan")
    );
  }
};

/**
 * Assign subscription plan to restaurant
 */
const assignPlan = async (req, res) => {
  try {
    const {
      restaurant_id,
      subscription_plan_id,
      start_date,
      end_date,
      auto_renew = true,
    } = req.body;

    // Validate required fields
    if (!restaurant_id || !subscription_plan_id || !start_date) {
      return res.status(400).json(
        apiResponse.error(400, "Missing required fields: restaurant_id, subscription_plan_id, start_date")
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start_date)) {
      return res.status(400).json(
        apiResponse.error(400, "Invalid start_date format. Expected YYYY-MM-DD")
      );
    }

    if (end_date && !dateRegex.test(end_date)) {
      return res.status(400).json(
        apiResponse.error(400, "Invalid end_date format. Expected YYYY-MM-DD")
      );
    }

    // Validate end_date is after start_date (Requirement 3.8)
    if (end_date) {
      const startDateObj = new Date(start_date);
      const endDateObj = new Date(end_date);
      
      if (endDateObj <= startDateObj) {
        return res.status(422).json(
          apiResponse.error(422, "End date must be after start date")
        );
      }
    }

    // Validate restaurant exists and is active
    const [restaurant] = await pool.query(
      "SELECT id, name, status FROM restaurants WHERE id = ?",
      [restaurant_id]
    );

    if (!restaurant.length) {
      return res.status(404).json(
        apiResponse.error(404, "Restaurant not found")
      );
    }

    if (restaurant[0].status !== "active") {
      return res.status(400).json(
        apiResponse.error(400, "Cannot assign subscription to inactive restaurant")
      );
    }

    // Validate subscription plan exists and is active
    const [plan] = await pool.query(
      "SELECT id, plan_name, is_active FROM subscription_plans WHERE id = ?",
      [subscription_plan_id]
    );

    if (!plan.length) {
      return res.status(404).json(
        apiResponse.error(404, "Subscription plan not found")
      );
    }

    if (plan[0].is_active === 0) {
      return res.status(400).json(
        apiResponse.error(400, "Cannot assign inactive subscription plan")
      );
    }

    // Check if restaurant already has an active subscription
    const [activeSubscription] = await pool.query(
      "SELECT id FROM subscription_assignments WHERE restaurant_id = ? AND status = 'active'",
      [restaurant_id]
    );

    if (activeSubscription.length > 0) {
      return res.status(409).json(
        apiResponse.error(409, "Restaurant already has an active subscription. Use change plan endpoint to modify.")
      );
    }

    // Create subscription assignment
    const insertQuery = `
      INSERT INTO subscription_assignments (
        restaurant_id, subscription_plan_id, start_date, end_date, auto_renew, status
      ) VALUES (?, ?, ?, ?, ?, 'active')
    `;

    const [result] = await pool.query(insertQuery, [
      restaurant_id,
      subscription_plan_id,
      start_date,
      end_date || null,
      auto_renew,
    ]);

    // Fetch the created assignment with plan and restaurant details
    const [newAssignment] = await pool.query(
      `SELECT 
        sa.*,
        sp.plan_name,
        sp.plan_code,
        sp.price,
        sp.billing_period,
        r.name as restaurant_name
      FROM subscription_assignments sa
      JOIN subscription_plans sp ON sa.subscription_plan_id = sp.id
      JOIN restaurants r ON sa.restaurant_id = r.id
      WHERE sa.id = ?`,
      [result.insertId]
    );

    return res.status(201).json(
      apiResponse.success(201, "Subscription assigned successfully", {
        data: newAssignment[0],
      })
    );
  } catch (error) {
    console.error("Assign plan error:", error);
    return res.status(500).json(
      apiResponse.error(500, "An error occurred while assigning subscription plan")
    );
  }
};

/**
 * Get restaurant subscription details
 */
const getRestaurantSubscription = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json(
        apiResponse.error(400, "Restaurant ID is required")
      );
    }

    // Validate restaurant exists
    const [restaurant] = await pool.query(
      "SELECT id, name FROM restaurants WHERE id = ?",
      [restaurantId]
    );

    if (!restaurant.length) {
      return res.status(404).json(
        apiResponse.error(404, "Restaurant not found")
      );
    }

    // Get current active subscription with plan details and usage
    const query = `
      SELECT 
        sa.*,
        sp.plan_name,
        sp.plan_code,
        sp.price,
        sp.currency,
        sp.billing_period,
        sp.billing_days,
        sp.features,
        sp.max_restaurants,
        r.name as restaurant_name,
        r.status as restaurant_status
      FROM subscription_assignments sa
      JOIN subscription_plans sp ON sa.subscription_plan_id = sp.id
      JOIN restaurants r ON sa.restaurant_id = r.id
      WHERE sa.restaurant_id = ? AND sa.status = 'active'
      ORDER BY sa.created_at DESC
      LIMIT 1
    `;

    const [subscription] = await pool.query(query, [restaurantId]);

    if (!subscription.length) {
      return res.status(404).json(
        apiResponse.error(404, "No active subscription found for this restaurant")
      );
    }

    // Parse features JSON
    const subscriptionData = subscription[0];
    if (subscriptionData.features) {
      try {
        subscriptionData.features = JSON.parse(subscriptionData.features);
      } catch (e) {
        subscriptionData.features = [];
      }
    }

    return res.status(200).json(
      apiResponse.success(200, "Restaurant subscription retrieved successfully", {
        data: subscriptionData,
      })
    );
  } catch (error) {
    console.error("Get restaurant subscription error:", error);
    return res.status(500).json(
      apiResponse.error(500, "An error occurred while retrieving restaurant subscription")
    );
  }
};

/**
 * Get restaurant subscription history
 */
const getSubscriptionHistory = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json(
        apiResponse.error(400, "Restaurant ID is required")
      );
    }

    // Validate restaurant exists
    const [restaurant] = await pool.query(
      "SELECT id, name FROM restaurants WHERE id = ?",
      [restaurantId]
    );

    if (!restaurant.length) {
      return res.status(404).json(
        apiResponse.error(404, "Restaurant not found")
      );
    }

    // Get all subscription assignments for the restaurant (past and current)
    const query = `
      SELECT 
        sa.*,
        sp.plan_name,
        sp.plan_code,
        sp.price,
        sp.currency,
        sp.billing_period
      FROM subscription_assignments sa
      JOIN subscription_plans sp ON sa.subscription_plan_id = sp.id
      WHERE sa.restaurant_id = ?
      ORDER BY sa.created_at DESC
    `;

    const [history] = await pool.query(query, [restaurantId]);

    return res.status(200).json(
      apiResponse.success(200, "Subscription history retrieved successfully", {
        data: {
          restaurant_id: parseInt(restaurantId),
          restaurant_name: restaurant[0].name,
          history: history,
          total_count: history.length,
        },
      })
    );
  } catch (error) {
    console.error("Get subscription history error:", error);
    return res.status(500).json(
      apiResponse.error(500, "An error occurred while retrieving subscription history")
    );
  }
};

/**
 * Change restaurant subscription plan
 */
const changePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subscription_plan_id,
      start_date,
      end_date,
      auto_renew = true,
    } = req.body;

    if (!id) {
      return res.status(400).json(
        apiResponse.error(400, "Assignment ID is required")
      );
    }

    // Validate required fields
    if (!subscription_plan_id) {
      return res.status(400).json(
        apiResponse.error(400, "Missing required field: subscription_plan_id")
      );
    }

    // Check if current assignment exists and is active
    const [currentAssignment] = await pool.query(
      `SELECT sa.*, r.name as restaurant_name, r.status as restaurant_status
       FROM subscription_assignments sa
       JOIN restaurants r ON sa.restaurant_id = r.id
       WHERE sa.id = ?`,
      [id]
    );

    if (!currentAssignment.length) {
      return res.status(404).json(
        apiResponse.error(404, "Subscription assignment not found")
      );
    }

    if (currentAssignment[0].status !== "active") {
      return res.status(400).json(
        apiResponse.error(400, "Cannot change plan for inactive subscription")
      );
    }

    // Validate restaurant is still active
    if (currentAssignment[0].restaurant_status !== "active") {
      return res.status(400).json(
        apiResponse.error(400, "Cannot change plan for inactive restaurant")
      );
    }

    // Validate new subscription plan exists and is active
    const [newPlan] = await pool.query(
      "SELECT id, plan_name, is_active FROM subscription_plans WHERE id = ?",
      [subscription_plan_id]
    );

    if (!newPlan.length) {
      return res.status(404).json(
        apiResponse.error(404, "Subscription plan not found")
      );
    }

    if (newPlan[0].is_active === 0) {
      return res.status(400).json(
        apiResponse.error(400, "Cannot assign inactive subscription plan")
      );
    }

    // Check if trying to change to the same plan
    if (currentAssignment[0].subscription_plan_id === subscription_plan_id) {
      return res.status(400).json(
        apiResponse.error(400, "Restaurant is already on this subscription plan")
      );
    }

    // Determine new start date (use provided or current date)
    const newStartDate = start_date || new Date().toISOString().split('T')[0];

    // Validate date format if provided
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (start_date && !dateRegex.test(start_date)) {
      return res.status(400).json(
        apiResponse.error(400, "Invalid start_date format. Expected YYYY-MM-DD")
      );
    }

    if (end_date && !dateRegex.test(end_date)) {
      return res.status(400).json(
        apiResponse.error(400, "Invalid end_date format. Expected YYYY-MM-DD")
      );
    }

    // Validate end_date is after start_date
    if (end_date) {
      const startDateObj = new Date(newStartDate);
      const endDateObj = new Date(end_date);
      
      if (endDateObj <= startDateObj) {
        return res.status(422).json(
          apiResponse.error(422, "End date must be after start date")
        );
      }
    }

    // Start transaction to maintain history
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Mark old assignment as expired (preserve history - Requirement 3.3)
      await connection.query(
        `UPDATE subscription_assignments 
         SET status = 'expired', 
             end_date = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [newStartDate, id]
      );

      // Create new assignment
      const insertQuery = `
        INSERT INTO subscription_assignments (
          restaurant_id, subscription_plan_id, start_date, end_date, auto_renew, status
        ) VALUES (?, ?, ?, ?, ?, 'active')
      `;

      const [result] = await connection.query(insertQuery, [
        currentAssignment[0].restaurant_id,
        subscription_plan_id,
        newStartDate,
        end_date || null,
        auto_renew,
      ]);

      // Fetch the new assignment with plan details
      const [newAssignment] = await connection.query(
        `SELECT 
          sa.*,
          sp.plan_name,
          sp.plan_code,
          sp.price,
          sp.billing_period,
          r.name as restaurant_name
        FROM subscription_assignments sa
        JOIN subscription_plans sp ON sa.subscription_plan_id = sp.id
        JOIN restaurants r ON sa.restaurant_id = r.id
        WHERE sa.id = ?`,
        [result.insertId]
      );

      await connection.commit();

      return res.status(200).json(
        apiResponse.success(200, "Subscription plan changed successfully. Previous subscription has been archived.", {
          data: {
            new_assignment: newAssignment[0],
            previous_assignment_id: parseInt(id),
          },
        })
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Change plan error:", error);
    return res.status(500).json(
      apiResponse.error(500, "An error occurred while changing subscription plan")
    );
  }
};

export default {
  getAllPlans,
  getPlanById: getPlan,
  getPlanStats: getPlan, // Reuse getPlan for stats endpoint
  createPlan,
  updatePlan,
  deactivatePlan,
  assignPlan,
  getRestaurantSubscription,
  getSubscriptionHistory,
  changePlan,
};
