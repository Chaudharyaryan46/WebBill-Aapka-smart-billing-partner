import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function patch() {
  try {
    const res = await pool.query(`UPDATE products SET gst_percent = 5 WHERE gst_percent = 0`);
    console.log(`✅ Patched ${res.rowCount} products → gst_percent = 5`);
  } catch (err) {
    console.error('Patch failed:', err);
  } finally {
    await pool.end();
  }
}

patch();
