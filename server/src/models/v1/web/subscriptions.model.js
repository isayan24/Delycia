import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";

/**
 * Get subscription details for a restaurant
 * @param {Object} req - Express request object with rid in query
 * @returns {Object} API response with subscription data
 *
 * Grace Period Logic:
 * - Days 0-3 after expiry: Grace period (warning banner shown, full access)
 * - After 3 days: Hard blocked (no access except settings/subscription page)
 */
const GRACE_PERIOD_DAYS = 3;

const get_subscription = async (req) => {
  try {
    const { rid } = req.query;

    if (!rid) {
      return apiResponse.error(400, "Restaurant ID is required");
    }

    // Fetch current subscription with plan details via JOIN
    const [subscriptions] = await pool.query(
      `SELECT 
        s.id,
        s.restaurant_id,
        s.plan_id,
        s.plan_type,
        s.start_date,
        s.end_date,
        s.status,
        s.amount,
        s.currency,
        s.auto_renew,
        s.cancelled_at,
        s.created_at,
        s.updated_at,
        p.plan_code,
        p.plan_name,
        p.price AS plan_price,
        p.billing_period,
        p.billing_days,
        p.savings,
        p.is_popular,
        p.max_restaurants,
        p.features
      FROM subscriptions s
      LEFT JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.restaurant_id = ? 
      ORDER BY s.created_at DESC 
      LIMIT 1`,
      [rid]
    );

    if (!subscriptions.length) {
      // No subscription = hard blocked
      return apiResponse.success(200, "No subscription found", {
        subscription: null,
        has_subscription: false,
        is_in_grace_period: false,
        is_hard_blocked: true,
        grace_period_days_remaining: 0,
      });
    }

    const subscription = subscriptions[0];

    // Parse features if it's a JSON string
    let features = subscription.features;
    if (typeof features === "string") {
      try {
        features = JSON.parse(features);
      } catch (e) {
        features = [];
      }
    }

    // Calculate days remaining / days since expired
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const endDate = new Date(subscription.end_date);
    endDate.setHours(0, 0, 0, 0);

    const timeDiff = endDate - today;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Grace period and blocking logic
    let displayStatus = subscription.status;
    let isInGracePeriod = false;
    let isHardBlocked = false;
    let daysSinceExpired = 0;
    let gracePeriodDaysRemaining = 0;

    if (daysRemaining < 0) {
      // Subscription has expired
      daysSinceExpired = Math.abs(daysRemaining);

      if (daysSinceExpired <= GRACE_PERIOD_DAYS) {
        // In grace period
        isInGracePeriod = true;
        gracePeriodDaysRemaining = GRACE_PERIOD_DAYS - daysSinceExpired;
        displayStatus = "grace_period";
      } else {
        // Grace period over - hard block
        isHardBlocked = true;
        displayStatus = "expired";
      }
    } else if (daysRemaining <= 7) {
      // Expiring soon warning
      displayStatus = "expiring_soon";
    }

    return apiResponse.success(200, "Subscription fetched successfully", {
      subscription: {
        id: subscription.id,
        restaurant_id: subscription.restaurant_id,
        plan_id: subscription.plan_id,
        plan_type: subscription.plan_type,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        status: subscription.status,
        amount: subscription.amount,
        currency: subscription.currency,
        auto_renew: subscription.auto_renew,
        cancelled_at: subscription.cancelled_at,
        created_at: subscription.created_at,
        updated_at: subscription.updated_at,
        // Plan details from JOIN
        plan: {
          id: subscription.plan_id,
          code: subscription.plan_code,
          name: subscription.plan_name,
          price: subscription.plan_price,
          billing_period: subscription.billing_period,
          billing_days: subscription.billing_days,
          savings: subscription.savings,
          is_popular: Boolean(subscription.is_popular),
          max_restaurants: subscription.max_restaurants,
          features: features,
        },
        // Computed fields
        days_remaining: Math.max(0, daysRemaining),
        days_since_expired: daysSinceExpired,
        display_status: displayStatus,
      },
      has_subscription: true,
      is_in_grace_period: isInGracePeriod,
      is_hard_blocked: isHardBlocked,
      grace_period_days_remaining: gracePeriodDaysRemaining,
    });
  } catch (error) {
    console.error("get_subscription error:", error);
    return apiResponse.error(500, "Internal Server Error");
  }
};

/**
 * Get available subscription plans from database
 * Only returns active plans, ordered by display_order
 * @returns {Object} API response with plans data
 */
const get_plans = async () => {
  try {
    const [plans] = await pool.query(
      `SELECT 
        id,
        plan_code,
        plan_name,
        price,
        currency,
        billing_period,
        billing_days,
        savings,
        is_popular,
        is_active,
        display_order,
        max_restaurants,
        features,
        created_at,
        updated_at
      FROM subscription_plans
      WHERE is_active = 1
      ORDER BY display_order ASC`
    );

    // Parse features JSON for each plan
    const parsedPlans = plans.map((plan) => {
      let features = plan.features;
      if (typeof features === "string") {
        try {
          features = JSON.parse(features);
        } catch (e) {
          features = [];
        }
      }

      return {
        id: plan.id,
        plan_code: plan.plan_code,
        name: plan.plan_name,
        plan_type: plan.plan_code, // For frontend compatibility
        price: plan.price,
        currency: plan.currency,
        billing_period: plan.billing_period,
        billing_days: plan.billing_days,
        savings: plan.savings || 0,
        is_popular: Boolean(plan.is_popular),
        max_restaurants: plan.max_restaurants,
        features: features,
      };
    });

    return apiResponse.success(200, "Plans fetched successfully", {
      plans: parsedPlans,
    });
  } catch (error) {
    console.error("get_plans error:", error);
    return apiResponse.error(500, "Internal Server Error");
  }
};

export default { get_subscription, get_plans };
