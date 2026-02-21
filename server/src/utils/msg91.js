/**
 * MSG91 WhatsApp API Integration
 * 
 * Sends WhatsApp messages using MSG91's template-based API.
 * Used for sending magic link login URLs.
 */

import "dotenv/config";

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_INTEGRATED_NUMBER = process.env.MSG91_INTEGRATED_NUMBER || "916295725623";
const MSG91_TEMPLATE_NAMESPACE = process.env.MSG91_TEMPLATE_NAMESPACE || "2fb39566_9358_442b_b4b4_6ac16392a472";
const MSG91_TEMPLATE_NAME = process.env.MSG91_TEMPLATE_NAME || "delycia_whatsapp_link";

/**
 * Send a login magic link via WhatsApp
 * 
 * @param {string} phoneNumber - Full phone number with country code (e.g., "+919876543210")
 * @param {string} userName - User's name or fallback text (e.g., "there")
 * @param {string} loginUrl - The magic link URL
 * @returns {Promise<boolean>} - True if message sent successfully
 */
const sendLoginLink = async (phoneNumber, userName, loginUrl) => {
  if (!phoneNumber || !loginUrl) {
    console.error("MSG91: Phone number and login URL are required");
    return false;
  }

  if (!MSG91_AUTH_KEY) {
    console.error("MSG91: AUTH_KEY not configured in environment variables");
    return false;
  }

  // Clean phone number - remove any non-digit characters except leading +
  const cleanPhone = phoneNumber.replace(/[^\d]/g, "");

  const payload = {
    integrated_number: MSG91_INTEGRATED_NUMBER,
    content_type: "template",
    payload: {
      messaging_product: "whatsapp",
      type: "template",
      template: {
        name: MSG91_TEMPLATE_NAME,
        language: {
          code: "en",
          policy: "deterministic"
        },
        namespace: MSG91_TEMPLATE_NAMESPACE,
        to_and_components: [
          {
            to: [cleanPhone],
            components: {
              body_1: {
                type: "text",
                value: userName || "there"
              },
              body_2: {
                type: "text",
                value: loginUrl
              }
            }
          }
        ]
      }
    }
  };

  try {
    const response = await fetch(
      "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: MSG91_AUTH_KEY
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log("MSG91: Login link sent successfully to", cleanPhone);
      return true;
    } else {
      console.error("MSG91: Failed to send message", result);
      return false;
    }
  } catch (error) {
    console.error("MSG91: Error sending WhatsApp message:", error);
    return false;
  }
};

/**
 * Send order placement notification via WhatsApp
 * 
 * @param {Object} data - Order data
 * @param {string} data.phone - Customer phone number
 * @param {string} data.name - Customer name
 * @param {string} data.orderDate - Order date
 * @param {string} data.items - Order items summary
 * @param {string} data.totalAmount - Total order amount
 * @returns {Promise<boolean>} - True if message sent successfully
 */
const sendOrderPlaceUpdate = async (data) => {
  // TODO: Implement MSG91 order notification when template is ready
  // For now, this is a placeholder that logs the attempt
  console.log("MSG91: Order notification not yet implemented for:", data.phone);
  return true; // Return true to not break existing flows
};

export default { sendLoginLink, sendOrderPlaceUpdate };
