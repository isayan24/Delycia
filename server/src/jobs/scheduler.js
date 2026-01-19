import pool from "../config/db.connection.js";

// ===============================================
// SCHEDULED JOBS
// ===============================================

let resetTablesInterval = null;

/**
 * AUTO-RESET TABLES JOB
 * Runs every 5 minutes to reset occupied tables
 */
const resetTablesJob = async () => {
  try {
    await pool.query(`CALL sp_reset_occupied_tables()`);
  } catch (error) {
    console.error('❌ Table reset failed:', error.message);
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
};

/**
 * Gracefully stop all scheduled jobs
 */
export const shutdownScheduler = () => {
  if (resetTablesInterval) {
    clearInterval(resetTablesInterval);
    resetTablesInterval = null;
  }
  console.log('🛑 All scheduled jobs stopped');
};
