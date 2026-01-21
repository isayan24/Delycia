import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";
import others from "../../../utils/others.js";

const getItemStats = async (req) => {
  const { rid, page = 1, limit = 10 } = req.query;
  const { itemId } = req.params;

  if (!rid || !itemId) {
    return apiResponse.error(400, "Restaurant ID (rid) and Item ID (itemId) are required");
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const limitValue = parseInt(limit);

  try {
    // 1. Fetch Item Details & Stats
    const statsQuery = `
      SELECT 
        i.id, i.name, i.description, i.price, i.stock, i.status, i.images, i.category_id,
        c.name as category_name,
        COALESCE(s.order_count, 0) as stats_order_count,
        COALESCE(s.units_sold, 0) as stats_units_sold,
        COALESCE(s.total_revenue, 0) as stats_total_revenue,
        COALESCE(s.popularity_score, 0) as popularity_score,
        s.last_ordered_at,
        s.days_since_last_order,
        s.updated_at as stats_updated_at
      FROM inventories i
      LEFT JOIN inventory_stats s ON i.id = s.item_id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ? AND i.rid = ?
    `;

    const [itemResult] = await pool.query(statsQuery, [itemId, rid]);

    if (itemResult.length === 0) {
      return apiResponse.error(404, "Item not found");
    }

    const itemData = itemResult[0];

    // parse images
    try {
      itemData.images = JSON.parse((itemData.images || "[]").replace(/'/g, '"'));
    } catch (e) {
      itemData.images = [];
    }


    // 2. Get Total Orders Count (for pagination)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders
      WHERE item_id = ? AND rid = ?
    `;
    const [countResult] = await pool.query(countQuery, [itemId, rid]);
    const totalOrders = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalOrders / limitValue);

    // 3. Fetch Recent Orders for this Item (Paginated)
    const ordersQuery = `
      SELECT 
        o.id,
        o.order_status,
        o.quantity,
        o.total_amount,
        o.created_at,
        o.customer_id,
        u.name as customer_name,
        u.phone_number
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE o.item_id = ? AND o.rid = ?
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [ordersResult] = await pool.query(ordersQuery, [itemId, rid, limitValue, offset]);

    // 3. Construct Response
    const responseData = {
      // Basic Info
      id: itemData.id,
      name: itemData.name,
      description: itemData.description,
      price: itemData.price,
      stock: itemData.stock,
      status: itemData.status,
      category: itemData.category_name,
      images: itemData.images,

      // Stats from inventory_stats table
      performance: {
        totalOrders: itemData.stats_order_count,
        unitsSold: itemData.stats_units_sold,
        revenue: itemData.stats_total_revenue,
        popularityScore: itemData.popularity_score,
        lastOrdered: itemData.last_ordered_at,
        daysSinceLastOrder: itemData.days_since_last_order,
      },

      // Recent Activity
      recentOrders: ordersResult.map(order => ({
        id: order.id,
        status: order.order_status,
        quantity: order.quantity,
        amount: order.total_amount,
        date: order.created_at,
        customer: {
          id: order.customer_id,
          name: order.customer_name || 'Guest',
          phone: order.phone_number
        }
      })),

      pagination: {
        total: totalOrders,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    };

    return apiResponse.success(200, "Item stats fetched successfully", responseData);

  } catch (error) {
    console.error("getItemStats error:", error);
    return apiResponse.error(500, error.message);
  }
};

export default {
  getItemStats
};
