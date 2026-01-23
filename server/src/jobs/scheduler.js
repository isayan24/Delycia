import pool from "../config/db.connection.js";

// ===============================================
// SCHEDULED JOBS
// ===============================================

let resetTablesInterval = null;
let inventoryStatsInterval = null;

/**
 * AUTO-RESET TABLES JOB
 * Runs every 5 minutes to reset occupied tables
 */
const resetTablesJob = async () => {
  try {
    await pool.query(`CALL sp_reset_occupied_tables()`);
    console.log('✅ Tables auto-reset completed at', new Date().toISOString());
  } catch (error) {
    console.error('❌ Table reset failed:', error.message);
  }
};

/**
 * REFRESH INVENTORY STATS JOB
 * Runs every 10 minutes to refresh inventory statistics
 */
const refreshInventoryStatsJob = async () => {
  try {
    await pool.query('CALL sp_refresh_inventory_stats(?)', [null]);
    console.log('✅ Inventory stats refreshed at', new Date().toISOString());
  } catch (error) {
    console.error('❌ Inventory stats refresh failed:', error.message);
  }
};

// ===============================================
// SCHEDULER LIFECYCLE
// ===============================================

/**
 * Initialize all scheduled jobs
 */
export const initScheduler = () => {
  // Start table reset job (every 5 minutes)
  resetTablesInterval = setInterval(resetTablesJob, 5 * 60 * 1000);

  // Start inventory stats refresh job (every 10 minutes)
  inventoryStatsInterval = setInterval(refreshInventoryStatsJob, 5 * 60 * 1000);

  console.log('🔄 Scheduler initialized:');
  console.log('   ├─ Table auto-reset: Every 5 minutes');
  console.log('   ├─ Inventory stats refresh: Every 5 minutes');
  console.log('   └─ Ready to run');
};

/**
 * Gracefully stop all scheduled jobs
 */
export const shutdownScheduler = () => {
  if (resetTablesInterval) {
    clearInterval(resetTablesInterval);
    resetTablesInterval = null;
  }

  if (inventoryStatsInterval) {
    clearInterval(inventoryStatsInterval);
    inventoryStatsInterval = null;
  }

  console.log('🛑 All scheduled jobs stopped');
};
