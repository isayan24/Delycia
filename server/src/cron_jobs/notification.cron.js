import pool from "../config/db.connection.js";
import { internalCreateNotification } from "../models/v1/web/notifications.model.js";

// 1. Plan Expiry Check
export const checkPlanExpiry = async (req, res) => {
  console.log("Running Plan Expiry Check...");
  try {
    // Check for subscriptions expiring in next 7 days
    // Ensure we don't spam if already notified recently (last 24h)
    const q = `
                SELECT 
                    s.restaurant_id,
                    sp.plan_name,
                    s.end_date,
                    DATEDIFF(s.end_date, CURDATE()) as days_remaining
                FROM subscriptions s
                JOIN subscription_plans sp ON s.plan_id = sp.id
                WHERE s.status = 'active'
                    AND s.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
                    AND NOT EXISTS (
                        SELECT 1 FROM notifications n
                        WHERE n.restaurant_id = s.restaurant_id
                            AND n.type = 'plan_expiring'
                            AND n.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
                    )
            `;
    const [expiring] = await pool.query(q);

    let count = 0;
    for (const sub of expiring) {
      await internalCreateNotification({
        restaurant_id: sub.restaurant_id,
        type: "plan_expiring",
        title: `Plan Expiring in ${sub.days_remaining} Days`,
        message: `Your ${sub.plan_name} expires on ${new Date(sub.end_date).toLocaleDateString()}. Renew now to avoid interruption.`,
        priority: "critical",
        action_url: "/settings/subscription",
        action_label: "Renew Plan"
      });
      count++;
    }
    if (res) return res.status(200).json({ status: "success", message: `Processed ${count} expiring plans` });
  } catch (e) {
    console.error("Error in Plan Expiry Cron:", e);
    if (res) return res.status(500).json({ error: e.message });
  }
};

// 2. Low Stock Check
export const checkLowStock = async (req, res) => {
  console.log("Running Low Stock Check...");
  try {
    // Using logic similar to user request: check items <= 10
    const q = `
                SELECT i.id, i.name, i.stock, i.rid 
                FROM inventories i 
                WHERE i.stock <= 10 AND i.stock > 0
            `;
    const [lowStockItems] = await pool.query(q);

    let count = 0;
    for (const item of lowStockItems) {
      // Check if notified today already
      const [existing] = await pool.query(
        "SELECT id FROM notifications WHERE restaurant_id = ? AND type = 'low_stock' AND JSON_EXTRACT(data, '$.item_id') = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)",
        [item.rid, item.id]
      );

      if (existing.length === 0) {
        await internalCreateNotification({
          restaurant_id: item.rid,
          type: "low_stock",
          title: "Low Stock Alert",
          message: `Only ${item.stock} units of "${item.name}" remaining.`,
          priority: "high",
          data: {
            item_id: item.id,
            item_name: item.name,
            current_stock: item.stock,
            threshold: 10
          },
          action_url: "/inventory/stock",
          action_label: "Restock"
        });
        count++;
      }
    }
    if (res) return res.status(200).json({ status: "success", message: `Processed ${count} low stock items` });
  } catch (e) {
    console.error("Error in Low Stock Cron:", e);
    if (res) return res.status(500).json({ error: e.message });
  }
};

// 3. Out of Stock Check
export const checkOutOfStock = async (req, res) => {
  console.log("Running Out of Stock Check...");
  try {
    // Check items where stock = 0
    const q = `
                SELECT i.id, i.name, i.stock, i.rid 
                FROM inventories i 
                WHERE i.stock = 0
            `;
    const [outOfStockItems] = await pool.query(q);

    let count = 0;
    for (const item of outOfStockItems) {
      // Check if notified today already
      const [existing] = await pool.query(
        "SELECT id FROM notifications WHERE restaurant_id = ? AND type = 'out_of_stock' AND JSON_EXTRACT(data, '$.item_id') = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)",
        [item.rid, item.id]
      );

      if (existing.length === 0) {
        await internalCreateNotification({
          restaurant_id: item.rid,
          type: "out_of_stock",
          title: "OUT OF STOCK",
          message: `"${item.name}" is now out of stock!`,
          priority: "critical",
          data: {
            item_id: item.id,
            item_name: item.name,
            current_stock: 0
          },
          action_url: "/inventory/stock",
          action_label: "Restock Now"
        });
        count++;
      }
    }
    if (res) return res.status(200).json({ status: "success", message: `Processed ${count} out of stock items` });
  } catch (e) {
    console.error("Error in Out of Stock Cron:", e);
    if (res) return res.status(500).json({ error: e.message });
  }
};

// 4. Cleanup Old Notifications
export const cleanupNotifications = async (req, res) => {
  console.log("Running Old Notifications Cleanup...");
  try {
    // Delete read notifications older than 7 days
    // Delete unread notifications older than 30 days
    await pool.query("DELETE FROM notifications WHERE is_read = 1 AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)");
    await pool.query("DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
    console.log("Cleanup completed.");
    if (res) return res.status(200).send("Cleanup Completed");
  } catch (e) {
    console.error("Error in Notification Cleanup:", e);
    if (res) return res.status(500).json({ error: e.message });
  }
};

export default { checkPlanExpiry, checkLowStock, checkOutOfStock, cleanupNotifications };
