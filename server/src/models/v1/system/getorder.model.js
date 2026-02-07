import pool from "../../../config/db.connection.js";

async function getOrderDetails(ordersData) {
  try {
    let customerName = "";
    let customerPhone = ""; // Added missing variable
    let itemsList = [];
    let totalAmount = 0;
    const cartId = generateCartId();
    for (const orderData of ordersData) {
      // Updated query to get name, country_code, and phone_number
      const customerQuery = `SELECT name, country_code, phone_number FROM users WHERE id = ?`;
      const [customerResult] = await pool.execute(customerQuery, [
        orderData.customer_id,
      ]);

      if (customerResult.length > 0) {
        customerName = customerResult[0].name;
        // Remove + from country code and combine with phone number
        const countryCode = customerResult[0].country_code.replace("+", "");
        customerPhone = countryCode + customerResult[0].phone_number;
      }

      // Get item details
      const itemQuery = `SELECT name FROM inventories WHERE id = ?`;
      const [itemResult] = await pool.execute(itemQuery, [orderData.item_id]);

      if (itemResult.length > 0) {
        let itemName = itemResult[0].name;

        // If variant_id exists, try to get variant name (assuming you have a variants table)
        if (orderData.variant_id) {
          try {
            const variantQuery = `SELECT name FROM variants WHERE id = ?`;
            const [variantResult] = await pool.execute(variantQuery, [
              orderData.variant_id,
            ]);
            if (variantResult.length > 0) {
              itemName += ` (${variantResult[0].name})`;
            }
          } catch (error) {
            // If variants table doesn't exist, just use item name
            console.log("Variants table not found, using item name only");
          }
        }

        if (parseInt(orderData.quantity) > 1) {
          itemName += ` x${orderData.quantity}`;
        }

        // Fetch addons for this order item
        const addonQuery = `
          SELECT a.name, oa.quantity, oa.price 
          FROM order_addons oa 
          JOIN addons a ON oa.addon_id = a.id 
          WHERE oa.order_id = ?
        `;
        const [addonResult] = await pool.execute(addonQuery, [orderData.id]);

        if (addonResult.length > 0) {
          const addonDetails = addonResult.map(addon => {
            const qty = addon.quantity > 1 ? ` x${addon.quantity}` : '';
            return `${addon.name}${qty}`;
          }).join(', ');
          itemName += `\n   + ${addonDetails}`;

          // Add addon prices to total
          // Assuming orderData.total_amount already includes addon prices if it was updated during order creation/linking
          // If not, we might need to add it here, but usually total_amount in orders table should be final.
          // Let's check logic: create_orders inserts orders first, then addons. 
          // It inserts price into order_addons. 
          // Does it update orders.total_amount?
          // In create_orders:
          // const values = orders.map(...) -> includes total_amount.
          // Frontend calculates total_amount including addons.
          // So database total_amount is correct. We don't need to add it here.
        }

        itemsList.push(itemName);
        totalAmount += parseInt(orderData.total_amount);
      }
    }

    return {
      name: customerName,
      phone: customerPhone,
      orderID: cartId,
      orderDate: new Date().toLocaleDateString(),
      items: itemsList.join(",\n"),
      totalAmount: `₹${totalAmount}`, // Add ₹ symbol here
    };
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

function generateCartId() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default getOrderDetails;
