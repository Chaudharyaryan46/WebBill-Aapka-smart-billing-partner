import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const DEFAULT_PRODUCTS = [
  { name: 'Masala Chai',       price: 20,  emoji: '☕', category: 'Beverages', stock_quantity: 999, gst_percent: 5 },
  { name: 'Cold Coffee',       price: 80,  emoji: '🧋', category: 'Beverages', stock_quantity: 100, gst_percent: 5 },
  { name: 'Veg Burger',        price: 90,  emoji: '🍔', category: 'Snacks',    stock_quantity: 50,  gst_percent: 5 },
  { name: 'Samosa (2pc)',      price: 30,  emoji: '🥟', category: 'Snacks',    stock_quantity: 200, gst_percent: 5 },
  { name: 'Paneer Roll',       price: 70,  emoji: '🌯', category: 'Snacks',    stock_quantity: 80,  gst_percent: 5 },
  { name: 'Margherita Pizza',  price: 220, emoji: '🍕', category: 'Food',      stock_quantity: 40,  gst_percent: 5 },
  { name: 'Dal Tadka',         price: 120, emoji: '🍲', category: 'Food',      stock_quantity: 60,  gst_percent: 5 },
  { name: 'Gulab Jamun (2pc)', price: 40,  emoji: '🍮', category: 'Desserts',  stock_quantity: 150, gst_percent: 5 },
  { name: 'Mango Lassi',       price: 60,  emoji: '🥛', category: 'Beverages', stock_quantity: 100, gst_percent: 5 },
  { name: 'Veg Thali',         price: 180, emoji: '🍱', category: 'Food',      stock_quantity: 30,  gst_percent: 5 },
  { name: 'Pav Bhaji',         price: 100, emoji: '🍛', category: 'Food',      stock_quantity: 45,  gst_percent: 5 },
  { name: 'Lemon Soda',        price: 35,  emoji: '🍋', category: 'Beverages', stock_quantity: 200, gst_percent: 5 },
];

async function seed() {
  try {
    // 1. Create a dummy user
    const userRes = await pool.query(
      `INSERT INTO users (name, email, password_hash) VALUES ('Demo Owner', 'demo@webbill.com', 'hashedpassword123') RETURNING id`
    );
    const userId = userRes.rows[0].id;

    // 2. Create a dummy shop
    const shopRes = await pool.query(
      `INSERT INTO shops (name, owner_id) VALUES ('Demo Shop', $1) RETURNING id`,
      [userId]
    );
    const shopId = shopRes.rows[0].id;
    
    // Update user with shop_id
    await pool.query(`UPDATE users SET shop_id = $1 WHERE id = $2`, [shopId, userId]);

    console.log('✅ Created User and Shop:', shopId);

    // 3. Insert Products
    for (const p of DEFAULT_PRODUCTS) {
      await pool.query(
        `INSERT INTO products (shop_id, name, price, stock_quantity, emoji, category, gst_percent) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [shopId, p.name, p.price, p.stock_quantity, p.emoji, p.category, p.gst_percent]
      );
    }
    console.log('✅ Inserted Default Products!');

  } catch (err) {
    console.error('Error seeding:', err);
  } finally {
    await pool.end();
  }
}

seed();
