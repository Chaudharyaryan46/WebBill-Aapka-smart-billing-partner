import express from 'express';
import cors from 'cors';
import { query } from './db';
import { authenticate, AuthRequest } from './middleware/auth';

const app = express();

app.use(cors());
app.use(express.json());

// ─── Health Check ───
app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.json({ status: 'ok', db: 'disconnected' });
  }
});

// ─── Multi-Tenant APIs (Stubbed for now) ───

// Auth
app.post('/auth/signup', (req, res) => res.json({ message: 'Signup stub' }));
app.post('/auth/login', (req, res) => res.json({ token: 'mock-jwt-token' }));

// Products
app.get('/products', async (req, res) => {
  try {
    const shopRes = await query('SELECT id FROM shops LIMIT 1');
    if (!shopRes.rows.length) return res.json([]);
    const shopId = shopRes.rows[0].id;

    const result = await query('SELECT * FROM products WHERE shop_id = $1', [shopId]);
    
    const products = result.rows.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      emoji: p.emoji,
      category: p.category,
      stock: p.stock_quantity,
      gstPercent: parseFloat(p.gst_percent || 5),
      lowStockThreshold: 10
    }));
    
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Bills
app.post('/bills', async (req, res) => {
  const { bill } = req.body;

  // Validate payload
  if (!bill || typeof bill.grandTotal === 'undefined') {
    return res.status(400).json({ error: 'Invalid bill payload — grandTotal required' });
  }

  try {
    const shopRes = await query('SELECT id FROM shops LIMIT 1');
    if (!shopRes.rows.length) {
      return res.status(404).json({ error: 'No shop found in database. Please run the seed script first.' });
    }
    const shopId = shopRes.rows[0].id;

    // Insert Bill
    const billRes = await query(
      `INSERT INTO bills (shop_id, total_amount, tax_amount, payment_mode) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [shopId, bill.grandTotal, bill.totalGST || 0, bill.paymentMode || 'Cash']
    );
    const dbBillId = billRes.rows[0].id;

    // Deduct stock only for UUID product IDs (cloud products)
    if (Array.isArray(bill.items)) {
      for (const item of bill.items) {
        const isUUID = item.productId && /^[0-9a-f-]{36}$/i.test(item.productId);
        if (isUUID) {
          await query(
            `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND shop_id = $3`,
            [item.qty, item.productId, shopId]
          );
        }
      }
    }

    res.json({ message: 'Bill saved to Cloud DB!', dbBillId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 SaaS Backend running on http://localhost:${PORT}`);
  console.log(`Database Status: Waiting for connection...`);
});
