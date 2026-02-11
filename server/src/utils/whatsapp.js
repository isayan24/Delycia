/**
 * WhatsApp Messaging Utility
 * 
 * Previously used Twilio, now migrated to MSG91 for login links.
 * Order notifications are handled separately (to be migrated).
 */

import msg91 from "./msg91.js";
import "dotenv/config";

/**
 * Send a login link via WhatsApp
 * Delegates to MSG91 utility
 * 
 * @param {string} phone_number - Full phone number with country code
 * @param {string} userName - User's name or "there"
 * @param {string} loginUrl - The magic link URL
 * @returns {Promise<boolean>}
 */
const sendLoginLink = async (phone_number, userName, loginUrl) => {
  console.log(phone_number, "Got phone number in whatsapp.js")
  return await msg91.sendLoginLink(phone_number, userName, loginUrl);
};

/**
 * Send order placement notification via WhatsApp
 * 
 * TODO: Migrate to MSG91 when template is ready
 * Currently returns true to not break existing flows
 * 
 * @param {Object} data - Order data
 * @returns {Promise<boolean>}
 */
const sendOrderPlaceUpdate = async (data) => {
  // TODO: Implement MSG91 order notification
  // For now, log and return success to not break flows
  console.log("WhatsApp order notification pending migration:", data.phone);
  return true;
};

export default { sendLoginLink, sendOrderPlaceUpdate };
