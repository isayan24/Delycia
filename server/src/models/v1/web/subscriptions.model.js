import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";

/**
 * Get subscription details for a restaurant
 * @param {Object} req - Express request object with rid in query
 * @returns {Object} API response with subscription data
 */
const get_subscription = async (req) => {
  try {
    const { rid } = req.query;

    if (!rid) {
      return apiResponse.error(400, "Restaurant ID is required");
    }

    // Fetch current subscription for restaurant
    const [subscriptions] = await pool.query(
      `SELECT 
        id,
        restaurant_id,
        plan_type,
        start_date,
        end_date,
        status,
        amount,
        currency,
        auto_renew,
        cancelled_at,
        created_at,
        updated_at
      FROM subscriptions
      WHERE restaurant_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1`,
      [rid]
    );

    if (!subscriptions.length) {
      return apiResponse.success(200, "No subscription found", {
        subscription: null,
        has_subscription: false,
      });
    }

    const subscription = subscriptions[0];

    // Calculate days remaining
    const today = new Date();
    const endDate = new Date(subscription.end_date);
    const daysRemaining = Math.max(
      0,
      Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
    );

    // Determine display status
    let displayStatus = subscription.status;
    if (subscription.status === "active" && daysRemaining <= 7) {
      displayStatus = "expiring_soon";
    }

    return apiResponse.success(200, "Subscription fetched successfully", {
      subscription: {
        ...subscription,
        days_remaining: daysRemaining,
        display_status: displayStatus,
      },
      has_subscription: true,
    });
  } catch (error) {
    console.error("get_subscription error:", error);
    return apiResponse.error(500, "Internal Server Error");
  }
};

/**
 * Get available subscription plans
 * Static plans - same features, different pricing
 * @returns {Object} API response with plans data
 */
const get_plans = async () => {
  try {
    // Static plans configuration
    // In production, this could come from a database table
    const plans = [
      {
        id: "monthly",
        name: "Monthly",
        plan_type: "monthly",
        price: 499,
        currency: "INR",
        billing_period: "month",
        features: [
          "Unlimited Orders",
          "Real-time Order Tracking",
          "Staff Management",
          "Inventory Management",
          "Sales Reports & Analytics",
          "Customer Management (CRM)",
          "Table Management",
          "QR Code Ordering",
          "Priority Support",
        ],
        is_popular: false,
      },
      {
        id: "yearly",
        name: "Yearly",
        plan_type: "yearly",
        price: 4999,
        currency: "INR",
        billing_period: "year",
        savings: 989, // 499*12 - 4999
        features: [
          "Unlimited Orders",
          "Real-time Order Tracking",
          "Staff Management",
          "Inventory Management",
          "Sales Reports & Analytics",
          "Customer Management (CRM)",
          "Table Management",
          "QR Code Ordering",
          "Priority Support",
        ],
        is_popular: true,
      },
    ];

    return apiResponse.success(200, "Plans fetched successfully", { plans });
  } catch (error) {
    console.error("get_plans error:", error);
    return apiResponse.error(500, "Internal Server Error");
  }
};

export default { get_subscription, get_plans };
