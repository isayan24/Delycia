
const getLoyaltyStats = async (req) => {
  const { rid } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    // Loyalty Segmentation
    const loyaltyQuery = `
      SELECT 
        CASE 
          WHEN visit_count = 1 THEN 'New'
          WHEN visit_count BETWEEN 2 AND 5 THEN 'Regular'
          WHEN visit_count BETWEEN 6 AND 10 THEN 'Loyal'
          ELSE 'VIP'
        END as customer_segment,
        COUNT(*) as count
      FROM user_restaurant_visits
      WHERE restaurant_id = ${pool.escape(rid)}
      GROUP BY customer_segment
    `;

    const [loyaltyResult] = await pool.query(loyaltyQuery);

    return apiResponse.success(
      200,
      "Loyalty stats fetched successfully",
      { loyalty: loyaltyResult }
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getChurnRisk = async (req) => {
  const { rid } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    // Churn Risk: High value (>3 visits) who haven't visited in >30 days
    // Assuming 'NOW()' is the current time db side.
    const churnQuery = `
      SELECT 
        user_id,
        visit_count,
        last_visit_at,
        DATEDIFF(NOW(), last_visit_at) as days_since_last_visit
      FROM user_restaurant_visits
      WHERE restaurant_id = ${pool.escape(rid)}
        AND visit_count > 3
        AND last_visit_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY visit_count DESC
      LIMIT 10
    `;

    const [churnResult] = await pool.query(churnQuery);

    return apiResponse.success(
      200,
      "Churn risk data fetched successfully",
      { churnRisk: churnResult }
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getRetentionStats = async (req) => {
  const { rid } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    // Retention Stats: Avg days between visits
    // This is valid only for users with > 1 visit.
    // Roughly: (last_visit - first_visit) / (visit_count - 1)

    const retentionQuery = `
      SELECT 
        AVG(
          DATEDIFF(last_visit_at, first_visit_at) / (visit_count - 1)
        ) as avg_days_between_visits,
        COUNT(*) as returning_customers
      FROM user_restaurant_visits
      WHERE restaurant_id = ${pool.escape(rid)}
        AND visit_count > 1
    `;

    const [retentionResult] = await pool.query(retentionQuery);

    return apiResponse.success(
      200,
      "Retention stats fetched successfully",
      {
        retention: {
          avgDaysBetweenVisits: parseFloat(retentionResult[0].avg_days_between_visits || 0).toFixed(1),
          returningCustomers: retentionResult[0].returning_customers
        }
      }
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};
