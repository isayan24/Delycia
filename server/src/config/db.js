import mySql from "mysql2";
import "dotenv/config";

const pool = mySql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  waitForConnections: true,
  connectionLimit: 50,
  connectTimeout: 30000,
});

const promisePool = pool.promise();

export default promisePool;
