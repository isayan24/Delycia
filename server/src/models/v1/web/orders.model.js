import pool from "../../../config/db.connection.js";
import app from "../../../app.js";
import apiResponse from "../../../utils/apiResponse.js";
import others from "../../../utils/others.js";
import auth from "../../../utils/auth.js";
import getOrderDetails from "../system/getorder.model.js";
import utils from "../../../utils/whatsapp.js";
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
      "INSERT INTO orders (rid, cart_id, customer_id, item_id, variant_id, quantity, payment_method, special_instructions, delivery_type, discount_amount, total_amount, table_no, order_status) VALUES ?";
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
      order.order_status || "pending",
    ]);

    // Output example : [[1, 101, 2, "shipped", "paid", 200],..]

    await conn.query(q, [values]);
    await conn.commit();
    app.io.of("/orders").emit("orders_refresh");
    app.io.of("/orders-by-table").emit("orders_created", { orders });
    return apiResponse.success(201, "Orders placed successfully");
  } catch (error) {
    await conn.rollback();
    return apiResponse.error(500, error.message);
  } finally {
    conn.release();
    const data = await getOrderDetails(orders);
    // fix in future uncomment this and before that link another twillio account
    // await utils.sendOrderPlaceUpdate(data);
  }
};

const get_orders = async (req) => {
  const { customer_id } = req.query;
  if (!customer_id) return apiResponse.error(400, "Customer ID is missing!");

  try {
    [result] = await pool.query(
      "SELECT * FROM orders WHERE customer_id = ?",
      customer_id
    );
    return apiResponse.success(200, "success", { orders: result });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const get_all_orders = async (req) => {
  const { rid, limit = 50 } = req.query;
  if (!rid) return apiResponse.error(400, "rid is missing!");

  try {
    const [countResult] = await pool.query(
      "SELECT COUNT(*) AS total_orders FROM orders WHERE rid = ? AND (order_status = 'completed' OR order_status = 'cancelled') ",
      [rid]
    );
    const total_orders = countResult[0].total_orders;

    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE rid = ? AND (order_status = 'completed' OR order_status = 'cancelled') LIMIT ?",
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
        u.name,
        CONCAT(LEFT(u.phone_number, 2), REPEAT('*', LENGTH(u.phone_number) - 4), RIGHT(u.phone_number, 2)) AS phone_number,
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
            'table_no', o.table_no
          )
        ) AS items
      FROM orders o
      JOIN users u ON o.customer_id = u.id
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
  try {
    const { id, ...data } = req.body;
    if (!data) return apiResponse.error(400, "Data is missing!");

    for (let key in data) if (!data[key] || key === "id") delete data[key];

    let setClause = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(",");
    setClause = setClause + `, updated_at = CURRENT_TIMESTAMP`;

    const values = Object.values(data);

    q = `UPDATE orders SET ${setClause} WHERE id = ?`;

    const [{ changedRows }] = await pool.query(q, [...values, id]);
    if (!changedRows)
      return apiResponse.success(
        200,
        "No content updated — data already up to date."
      );

    app.io.of("/orders").emit("orders_refresh");
    app.io.of("/orders-by-table").emit("orders_refresh");
    return apiResponse.success(200, "Order updated successfully.");
  } catch (error) {
    return apiResponse.error(500, error.message);
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
      JSON_DATA.customer_ids === undefined ||
      JSON_DATA.rid === undefined
    )
      return { status: false, error: "Data missing" };

    const q = `
      SELECT 
        orders.*, 
        users.name AS name,
        users.profile_pic AS profile_pic,
        inventories.name AS item_name,
        inventories.images AS item_img
      FROM orders
      JOIN users ON orders.customer_id = users.id
      LEFT JOIN inventories ON orders.item_id = inventories.id
      WHERE table_no = ?
        AND orders.rid = ?
        AND customer_id IN (${JSON_DATA.customer_ids})
        AND orders.created_at >= NOW() - INTERVAL 3 HOUR
      ORDER BY orders.created_at DESC
    `;

    const [rows] = await pool.query(q, [JSON_DATA.table_no, JSON_DATA.rid]);

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
        item_img: parsedImages, // <-- now always an array
      });
    }

    const groupedData = Array.from(userMap.values());

    return { status: true, data: groupedData };
  } catch (error) {
    return { status: false, error: error.message };
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
};
