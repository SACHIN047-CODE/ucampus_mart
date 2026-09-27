import mysql from 'mysql2/promise';
import { config } from '../config/index.js';

let pool = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      connectionLimit: config.db.connectionLimit,
      waitForConnections: config.db.waitForConnections,
      queueLimit: config.db.queueLimit,
      charset: 'utf8mb4',
      dateStrings: true,
    });
  }
  return pool;
}

/**
 * Execute a query with parameters
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Promise<[Array, Object]>}
 */
export async function query(sql, params = []) {
  const p = getPool();
  return p.query(sql, params);
}

/**
 * Execute an atomic transaction
 * @param {Function} callback (connection) => Promise<result>
 */
export async function withTransaction(callback) {
  const p = getPool();
  const connection = await p.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Test connectivity to MySQL server
 */
export async function testConnection() {
  try {
    const p = getPool();
    const [rows] = await p.query('SELECT 1 + 1 AS result');
    return { ok: true, rows };
  } catch (error) {
    return { ok: false, error: error.message, code: error.code };
  }
}
