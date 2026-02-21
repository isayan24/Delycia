/**
 * Restaurant Status Helper
 *
 * Utility to determine if today is a scheduled operating day
 * based on the active_days bitmask.
 *
 * All time calculations use IST (Asia/Kolkata, UTC+5:30)
 * since stored open_time/close_time are in IST.
 *
 * Bitmask mapping:
 *   1 = Sunday,  2 = Monday,  4 = Tuesday,   8 = Wednesday,
 *   16 = Thursday, 32 = Friday, 64 = Saturday
 */

// JS getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const DAY_BITS = [1, 2, 4, 8, 16, 32, 64]; // indexed by JS getDay()

/**
 * Get current Date in IST timezone.
 * @returns {Date} Date object representing current IST time
 */
function getNowIST() {
  // Create a formatter that outputs IST components
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;

  return new Date(
    `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`
  );
}

/**
 * Check if today (IST) is a scheduled operating day for a restaurant.
 * @param {number} activeDays - Bitmask (0–127)
 * @returns {boolean}
 */
export function isTodayScheduled(activeDays) {
  if (activeDays === undefined || activeDays === null) return true; // Default: all days
  const todayBit = DAY_BITS[getNowIST().getDay()];
  return (activeDays & todayBit) !== 0;
}

/**
 * Get today's date string in YYYY-MM-DD format (IST).
 * @returns {string}
 */
export function getTodayIST() {
  const now = getNowIST();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Check if a given date string (YYYY-MM-DD) is today (IST).
 * @param {string|Date|null} dateStr
 * @returns {boolean}
 */
export function isOverrideActiveToday(dateStr) {
  if (!dateStr) return false;
  const todayStr = getTodayIST();
  const overrideStr =
    dateStr instanceof Date ? dateStr.toISOString().split("T")[0] : String(dateStr).split("T")[0];
  return todayStr === overrideStr;
}

export default { isTodayScheduled, isOverrideActiveToday, getTodayIST };
