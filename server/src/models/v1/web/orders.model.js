import pool from "../../../config/db.connection.js";
import app from "../../../app.js";
import apiResponse from "../../../utils/apiResponse.js";
import others from "../../../utils/others.js";
import auth from "../../../utils/auth.js";
import getOrderDetails from "../system/getorder.model.js";
import utils from "../../../utils/whatsapp.js";
import { internalCreateNotification } from "./notifications.model.js";
let q, result;

const create_orders = async (req) => {
  const orders = req.body;
  const receivedSignature = req?.headers["x-signature"];


  if (!orders?.length) return apiResponse.error(400, "Invalid or empty orders");

  if (!auth.isValidSignature(receivedSignature, orders))
    return apiResponse.error(403, "Signature mismatch");
  const cart_id = others.generateRandomString(10);

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    q =
      "INSERT INTO orders (rid, cart_id, customer_id, item_id, variant_id, quantity, payment_method, special_instructions, delivery_type, discount_amount, total_amount, table_no, party_size, order_status, placed_by_staff_id, placed_by_role_id) VALUES ?";
    const values = orders.map((order) => [
      order.rid,
      cart_id,
      order.customer_id,
      order.item_id,
      order.variant_id,
      order.quantity,
      order.payment_method,
      order.special_instructions,
      order.delivery_type,
      order.discount_amount,
      order.total_amount,
      order.table_no || 0,
      order.party_size || 1,
      order.order_status || "pending",
      order.placed_by_staff_id || null,
      order.placed_by_role_id || null,
    ]);

    // Output example : [[1, 101, 2, "shipped", "paid", 200, 1, 3],..]

    const [result] = await conn.query(q, [values]);

    // Insert addons if present
    const addonValues = [];
    const startId = result.insertId;

    orders.forEach((order, index) => {
      const orderId = startId + index;
      order.id = orderId; // Assign ID to the order object for further use (sockets, getOrderDetails)

      if (order.addons && Array.isArray(order.addons) && order.addons.length > 0) {
        order.addons.forEach((addon) => {
          addonValues.push([
            orderId,
            addon.addon_id || addon.id, // Support both formats
            addon.quantity || 1,
            addon.price
          ]);
        });
      }
    });

    if (addonValues.length > 0) {
      const addonQ = "INSERT INTO order_addons (order_id, addon_id, quantity, price) VALUES ?";
      await conn.query(addonQ, [addonValues]);
    }

    // Automatically update table status to 'occupied' if table_no is provided
    const tableNo = orders[0]?.table_no;
    const rid = orders[0]?.rid;
    if (tableNo && rid) {
      const updateTableQ = `
        UPDATE tables 
        SET status = 'occupied', updated_at = NOW() 
        WHERE table_number = ? AND rid = ? AND status = 'available'
      `;
      await conn.query(updateTableQ, [tableNo, rid]);
    }

    // Decrement Stock for each item
    for (const order of orders) {
      if (order.item_id && order.quantity) {
        await conn.query("UPDATE inventories SET stock = GREATEST(0, stock - ?) WHERE id = ?", [order.quantity, order.item_id]);

        // Check for Stock Alerts (Real-time trigger)
        const [stockCheck] = await conn.query("SELECT stock, name FROM inventories WHERE id = ?", [order.item_id]);

        if (stockCheck.length > 0) {
          const currentStock = stockCheck[0].stock;

          // 1. OUT OF STOCK CHECK (Critical)
          if (currentStock === 0) {
            try {
              await internalCreateNotification({
                restaurant_id: rid,
                type: "out_of_stock",
                title: "OUT OF STOCK",
                message: `"${stockCheck[0].name}" is now out of stock!`,
                priority: "critical",
                data: { item_id: order.item_id, item_name: stockCheck[0].name, last_stock: 0 },
                action_url: `/reports/inventory?filter=critical`,
                action_label: "Restock Now"
              });
            } catch (e) {
              console.error("Failed to create out_of_stock notification:", e);
            }
          }
          // 2. LOW STOCK CHECK (High, Threshold <= 10)
          else if (currentStock <= 10) {
            // Prevent duplicate low stock alerts (check if sent in last 24h)
            const [existing] = await conn.query(
              "SELECT id FROM notifications WHERE restaurant_id = ? AND type = 'low_stock' AND JSON_EXTRACT(data, '$.item_id') = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)",
              [rid, order.item_id]
            );

            if (existing.length === 0) {
              try {
                await internalCreateNotification({
                  restaurant_id: rid,
                  type: "low_stock",
                  title: "Low Stock Alert",
                  message: `Only ${currentStock} units of "${stockCheck[0].name}" remaining.`,
                  priority: "high",
                  data: {
                    item_id: order.item_id,
                    item_name: stockCheck[0].name,
                    current_stock: currentStock,
                    threshold: 10
                  },
                  action_url: `/reports/inventory?filter=low`,
                  action_label: "Restock"
                });
              } catch (e) {
                console.error("Failed to create low_stock notification:", e);
              }
            }
          }
        }
      }
    }

    await conn.commit();
    app.io.of("/orders").emit("orders_refresh");
    app.io.of("/orders-by-table").emit("orders_created", { orders });



    const data = await getOrderDetails(orders);

    // fix in future uncomment this and before that link another twillio account
    // await utils.sendOrderPlaceUpdate(data); 

    return apiResponse.success(201, "Orders placed successfully", {
      order_id: data.orderID,
    });
  } catch (error) {
    await conn.rollback();
    return apiResponse.error(500, error.message);
  } finally {
    conn.release();
  }
};

const get_orders = async (req) => {
  const { customer_id } = req.query;
  if (!customer_id) return apiResponse.error(400, "Customer ID is missing!");

  try {
    const [result] = await pool.query(
      `SELECT o.*, 
              i.name as item_name, 
              i.images as item_images,
              v.name as variant_name,
              (
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'name', a.name,
                    'price', oa.price,
                    'quantity', oa.quantity
                  )
                )
                FROM order_addons oa
                JOIN addons a ON oa.addon_id = a.id
                WHERE oa.order_id = o.id
              ) AS addons
       FROM orders o 
       LEFT JOIN inventories i ON o.item_id = i.id
       LEFT JOIN variants v ON o.variant_id = v.id
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC`,
      [customer_id]
    );



    const processedOrders = result.map(order => {
      // Construct name: Item Name (Variant Name)
      let displayName = order.item_name || `Item #${order.item_id}`;
      if (order.variant_name) {
        displayName += ` (${order.variant_name})`;
      }

      return {
        ...order,
        // Remove backend formatted dates per request
        // ordered_on_ist, created_at_ist, updated_at_ist are removed
        foodDetails: {
          name: displayName,
          preparation_time: order.preparation_time || 0,
          img: order.item_images // Send raw string to frontend
        },
        // Ensure addons is an array
        addons: order.addons || []
      };
    });

    // console.log(processedOrders, 'processedOrders \n\n\n\n\n')

    return apiResponse.success(200, "success", { orders: processedOrders });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const get_all_orders = async (req) => {
  const { rid, limit = 50 } = req.query;
  if (!rid) return apiResponse.error(400, "rid is missing!");

  try {
    const [countResult] = await pool.query(
      "SELECT COUNT(*) AS total_orders FROM orders WHERE rid = ? AND (order_status = 'completed' OR order_status = 'cancelled' OR order_status = 'settled') ",
      [rid]
    );
    const total_orders = countResult[0].total_orders;

    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE rid = ? AND (order_status = 'completed' OR order_status = 'cancelled' OR order_status = 'settled') LIMIT ?",
      [rid, parseInt(limit)]
    );

    return apiResponse.success(200, "success", {
      total_orders,
      orders,
    });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getOrders24Hours = async (rid) => {
  try {
    const q = `
      SELECT 
        o.customer_id,
        SUM(o.total_amount) AS total_amount,
        SUM(o.discount_amount) AS discount_amount,
        COUNT(o.id) AS order_count,
        u.name,
        u.phone_number,
        CONCAT(LEFT(u.email, 2), REPEAT('*', GREATEST(0, LOCATE('@', u.email) - 2)), SUBSTRING(u.email, LOCATE('@', u.email))) AS email,
        u.username,
        u.profile_pic,
        o.created_at,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', o.id,
            'item_id', o.item_id,
            'display_name', o.display_name,
            'quantity', o.quantity,
            'order_status', o.order_status,
            'payment_status', o.payment_status,
            'created_at', o.created_at,
            'total_amount', o.total_amount,
            'special_instructions', o.special_instructions,
            'preparation_time', o.preparation_time,
            'delivery_type', o.delivery_type,
            'discount_amount', o.discount_amount,
            'updated_at', o.updated_at,
            'table_no', o.table_no,
            'variant_name', v.name,
            'addons', (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'name', a.name,
                  'price', oa.price,
                  'quantity', oa.quantity
                )
              )
              FROM order_addons oa
              JOIN addons a ON oa.addon_id = a.id
              WHERE oa.order_id = o.id
            )
          )
        ) AS items
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      LEFT JOIN variants v ON o.variant_id = v.id
      WHERE o.rid = ? AND o.created_at >= NOW() - INTERVAL 1 DAY
      GROUP BY o.customer_id, o.created_at
      ORDER BY o.created_at DESC
    `;

    const [result] = await pool.query(q, [rid]);

    return { status: true, type: "all_orders", orders: result };
  } catch (error) {
    return { status: false, type: "all_orders", error: error.message };
  }
};

const update_orders = async (req) => {
  const conn = await pool.getConnection();

  try {
    const { id, ...data } = req.body;
    if (!data) return apiResponse.error(400, "Data is missing!");

    for (let key in data) if (!data[key] || key === "id") delete data[key];

    await conn.beginTransaction();

    // Check if we're cancelling an order - need to restore stock
    if (data.order_status === 'cancelled') {
      // Fetch current order to get item_id, quantity, and current status
      const [orderResult] = await conn.query(
        "SELECT item_id, quantity, order_status FROM orders WHERE id = ?",
        [id]
      );

      if (orderResult.length > 0 && orderResult[0].order_status !== 'cancelled') {
        const { item_id, quantity } = orderResult[0];

        // Restore stock to inventory by incrementing by the order quantity
        if (item_id && quantity > 0) {
          await conn.query(
            "UPDATE inventories SET stock = stock + ? WHERE id = ?",
            [quantity, item_id]
          );

          // Check for stock 0 after update
          const [inventoryCheck] = await conn.query(
            "SELECT stock FROM inventories WHERE id = ?",
            [item_id]
          );
          if (inventoryCheck.length > 0 && inventoryCheck[0].stock === 0) {
            // Trigger notification or other action if stock is now 0
            console.warn(`Inventory item ${item_id} stock is now 0 after order cancellation.`);
            // Example: Notify restaurant owner about low stock
            // await internalCreateNotification({
            //   restaurant_id: o[0].rid, // Assuming rid is available from orderResult or fetched
            //   type: "inventory_low_stock",
            //   title: "Item Out of Stock",
            //   message: `Item ${item_id} is now out of stock.`,
            //   priority: "high",
            //   data: { item_id: item_id }
            // });
          }
        }


      }
    }

    let setClause = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(",");
    setClause = setClause + `, updated_at = CURRENT_TIMESTAMP`;

    const values = Object.values(data);

    q = `UPDATE orders SET ${setClause} WHERE id = ?`;

    const [{ changedRows }] = await conn.query(q, [...values, id]);

    await conn.commit();

    if (!changedRows)
      return apiResponse.success(
        200,
        "No content updated — data already up to date."
      );

    app.io.of("/orders").emit("orders_refresh");
    app.io.of("/orders-by-table").emit("orders_refresh");
    return apiResponse.success(200, "Order updated successfully.");
  } catch (error) {
    await conn.rollback();
    return apiResponse.error(500, error.message);
  } finally {
    conn.release();
  }
};


const delete_order = async (req) => {
  try {
    const { id } = req.body;

    if (!id)
      return apiResponse.error(400, "Missing required 'id' in request body.");

    if ((await others.getPower(req)) < 70)
      return apiResponse.error(401, "Unauthorized access!");

    const [{ affectedRows }] = await pool.query(
      "DELETE FROM orders WHERE id = ?",
      id
    );

    if (!affectedRows)
      return apiResponse.error(404, "Order not found or already deleted.");

    return apiResponse.success(200, "Order deleted successfully.");
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getOrderByTable = async (data) => {
  try {
    let JSON_DATA = data;

    if (
      JSON_DATA.table_no === undefined ||
      JSON_DATA.rid === undefined
    )
      return { status: false, error: "Data missing - table_no and rid are required" };

    // Build the query - if customer_ids is provided and not empty, filter by it
    // Otherwise, get all orders for the table
    const hasCustomerFilter = JSON_DATA.customer_ids &&
      Array.isArray(JSON_DATA.customer_ids) &&
      JSON_DATA.customer_ids.length > 0;

    let q;
    let queryParams;

    if (hasCustomerFilter) {
      q = `
        SELECT 
          orders.*, 
          users.name AS name,
          users.profile_pic AS profile_pic,
          inventories.name AS item_name,
          inventories.images AS item_img,
          variants.name AS variant_name
        FROM orders
        JOIN users ON orders.customer_id = users.id
        LEFT JOIN inventories ON orders.item_id = inventories.id
        LEFT JOIN variants ON orders.variant_id = variants.id
        WHERE table_no = ?
          AND orders.rid = ?
          AND customer_id IN (${JSON_DATA.customer_ids.map(() => '?').join(',')})
          AND orders.created_at >= NOW() - INTERVAL 2 HOUR
          AND orders.order_status NOT IN ('cancelled', 'settled')
        ORDER BY orders.created_at DESC
      `;
      queryParams = [JSON_DATA.table_no, JSON_DATA.rid, ...JSON_DATA.customer_ids];
    } else {
      // Get all active orders for this table (includes pending, confirmed, preparing, delivered)
      q = `
        SELECT 
          orders.*, 
          users.name AS name,
          users.profile_pic AS profile_pic,
          inventories.name AS item_name,
          inventories.images AS item_img,
          variants.name AS variant_name
        FROM orders
        JOIN users ON orders.customer_id = users.id
        LEFT JOIN inventories ON orders.item_id = inventories.id
        LEFT JOIN variants ON orders.variant_id = variants.id
        WHERE table_no = ?
          AND orders.rid = ?
          AND orders.created_at >= NOW() - INTERVAL 2 HOUR
          AND orders.order_status NOT IN ('cancelled', 'settled')
        ORDER BY orders.created_at DESC
      `;
      queryParams = [JSON_DATA.table_no, JSON_DATA.rid];
    }

    const [rows] = await pool.query(q, queryParams);

    const userMap = new Map();


    for (const row of rows) {
      const {
        customer_id,
        name,
        profile_pic,
        id,
        item_id,
        quantity,
        order_status,
        payment_status,
        total_amount,
        table_no,
        created_at,
        updated_at,
        item_name,
        item_img,
      } = row;

      // Convert item_img safely into JSON array
      let parsedImages = [];
      try {
        if (item_img) {
          parsedImages = JSON.parse(item_img.replace(/'/g, '"'));
        }
      } catch (e) {
        parsedImages = [];
      }

      if (!userMap.has(customer_id)) {
        userMap.set(customer_id, {
          customer_id,
          name,
          profile_pic,
          orders: [],
        });
      }

      // Fetch addons for this order item
      const [addonsResult] = await pool.query(
        `SELECT a.name, oa.quantity, oa.price 
         FROM order_addons oa 
         JOIN addons a ON oa.addon_id = a.id 
         WHERE oa.order_id = ?`,
        [id]
      );

      userMap.get(customer_id).orders.push({
        id,
        item_id,
        quantity,
        order_status,
        payment_status,
        total_amount,
        table_no,
        created_at,
        updated_at,
        item_name,
        item_img: parsedImages,
        addons: addonsResult, // Add addons here
      });
    }

    const result = Array.from(userMap.values());

    return { status: true, data: result };
  } catch (error) {
    return { status: false, error: error.message };
  }
};

const merge_orders = async (req) => {
  try {
    const { cart_ids, target_cart_id } = req.body;

    if (!cart_ids || !Array.isArray(cart_ids) || cart_ids.length < 2) {
      return apiResponse.error(400, "At least two cart IDs are required to merge.");
    }

    if (!target_cart_id) {
      return apiResponse.error(400, "Target cart ID is required.");
    }

    // 1. Verify all carts belong to the same customer (Optional safety check)
    // For now, we assume the admin knows what they are doing, but let's at least check they exist.

    // 2. Get the latest created_at time among the orders to be merged
    const placeholder = cart_ids.map(() => "?").join(",");
    const timeQuery = `SELECT MAX(created_at) as latest_time FROM orders WHERE cart_id IN (${placeholder})`;
    const [timeResult] = await pool.query(timeQuery, cart_ids);

    const latestTime = timeResult[0].latest_time;

    if (!latestTime) {
      return apiResponse.error(404, "No orders found for the provided cart IDs.");
    }

    // 3. Update all orders to the target_cart_id and the latest time
    const updateQuery = `UPDATE orders SET cart_id = ?, created_at = ? WHERE cart_id IN (${placeholder})`;
    const [updateResult] = await pool.query(updateQuery, [target_cart_id, latestTime, ...cart_ids]);

    if (updateResult.changedRows > 0) {
      app.io.of("/orders").emit("orders_refresh");
      return apiResponse.success(200, "Orders merged successfully.");
    } else {
      return apiResponse.success(200, "No orders were updated (IDs might be incorrect or already merged).");
    }

  } catch (error) {
    console.error("Merge orders error:", error);
    return apiResponse.error(500, error.message);
  }
};

const get_paginated_orders = async (req) => {
  const {
    rid,
    page = 1,
    limit = 10,
    search = "",
    start_date = null,
    end_date = null,
  } = req.query;

  if (!rid) return apiResponse.error(400, "rid is missing!");

  try {
    // Parse pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause conditions for filtering
    const conditions = [
      "o.rid = ?",
      "(o.order_status = 'completed' OR o.order_status = 'cancelled' OR o.order_status = 'settled')",
    ];
    const params = [rid];

    // Add search conditions (customer name, mobile, or item name)
    if (search && search.trim() !== "") {
      conditions.push(
        "(u.name LIKE ? OR u.phone_number LIKE ? OR i.name LIKE ? OR o.display_name LIKE ?)"
      );
      const searchPattern = `%${search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Add date range filtering
    if (start_date) {
      conditions.push("o.created_at >= ?");
      params.push(start_date);
    }

    if (end_date) {
      conditions.push("o.created_at <= ?");
      params.push(end_date);
    }

    const whereClause = conditions.join(" AND ");

    // Count total DISTINCT cart_ids (unique orders) matching the criteria
    const countQuery = `
      SELECT COUNT(DISTINCT o.cart_id) AS total_orders
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN inventories i ON o.item_id = i.id
      WHERE ${whereClause}
    `;

    const [countResult] = await pool.query(countQuery, params);
    const total_orders = countResult[0].total_orders;
    const total_pages = Math.ceil(total_orders / limitNum);

    // Fetch paginated orders grouped by cart_id with aggregated items
    const ordersQuery = `
      SELECT 
        o.cart_id,
        o.customer_id,
        o.table_no,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.delivery_type,
        o.created_at,
        o.updated_at,
        u.name AS customer_name,
        u.phone_number AS customer_phone,
        u.email AS customer_email,
        u.username AS customer_username,
        u.profile_pic AS customer_profile_pic,
        SUM(o.total_amount) AS total_amount,
        SUM(o.discount_amount) AS discount_amount,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', o.id,
            'item_id', o.item_id,
            'item_name', COALESCE(i.name, o.display_name),
            'quantity', o.quantity,
            'price', o.total_amount,
            'variant_id', o.variant_id,
            'variant_name', v.name,
            'special_instructions', o.special_instructions,
            'addons', (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'name', a.name,
                  'price', oa.price,
                  'quantity', oa.quantity
                )
              )
              FROM order_addons oa
              JOIN addons a ON oa.addon_id = a.id
              WHERE oa.order_id = o.id
            )
          )
        ) AS items
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN inventories i ON o.item_id = i.id
      LEFT JOIN variants v ON o.variant_id = v.id
      WHERE ${whereClause}
      GROUP BY o.cart_id, o.customer_id,  o.payment_method, 
               o.payment_status, o.order_status, 
               u.name, u.phone_number, u.email, u.username, u.profile_pic
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;
    // o.created_at, o.updated_at,o.table_no, o.delivery_type, 
    const [orders] = await pool.query(ordersQuery, [...params, limitNum, offset]);

    return apiResponse.success(200, "success", {
      total_orders,
      total_pages,
      current_page: pageNum,
      per_page: limitNum,
      has_next_page: pageNum < total_pages,
      has_prev_page: pageNum > 1,
      orders,
    });
  } catch (error) {
    console.error("Error in get_paginated_orders:", error);
    return apiResponse.error(500, error.message);
  }
};

// Settle all orders for a specific customer at a table
const settleCustomerOrders = async (req) => {
  const { customer_id, table_no, rid } = req.body;

  console.log(customer_id, table_no, rid, "customer_id, table_no, rid")

  if (!customer_id || !table_no || !rid) {
    return apiResponse.error(400, "customer_id, table_no, and rid are required");
  }

  try {
    const q = `
      UPDATE orders 
      SET order_status = 'settled', updated_at = NOW() 
      WHERE customer_id = ? 
        AND table_no = ? 
        AND rid = ?
        AND order_status NOT IN ('cancelled', 'settled')
        AND created_at >= NOW() - INTERVAL 2 HOUR
    `;

    const [result] = await pool.query(q, [customer_id, table_no, rid]);

    if (result.affectedRows === 0) {
      return apiResponse.success(200, "No orders to settle");
    }

    // Check if there are any remaining active orders at this table
    const checkActiveOrdersQuery = `
      SELECT COUNT(*) as activeCount 
      FROM orders 
      WHERE table_no = ? 
        AND rid = ? 
        AND order_status NOT IN ('cancelled', 'settled')
        AND created_at >= NOW() - INTERVAL 2 HOUR
    `;
    const [activeOrdersResult] = await pool.query(checkActiveOrdersQuery, [table_no, rid]);

    // If no active orders remain, mark the table as available
    if (activeOrdersResult[0].activeCount === 0) {
      const updateTableQuery = `
        UPDATE tables 
        SET status = 'available', updated_at = NOW() 
        WHERE table_number = ? AND rid = ?
      `;
      await pool.query(updateTableQuery, [table_no, rid]);
    }

    // Emit socket events to refresh UI
    app.io.of("/orders").emit("orders_refresh");
    app.io.of("/orders-by-table").emit("orders_refresh");

    return apiResponse.success(200, `Settled ${result.affectedRows} order(s) for customer`);
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

export default {
  create_orders,
  get_orders,
  getOrders24Hours,
  update_orders,
  delete_order,
  getOrderByTable,
  get_all_orders,
  get_paginated_orders,
  merge_orders,
  settleCustomerOrders,
};
