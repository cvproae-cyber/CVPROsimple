const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// إعداد الاتصال بقاعدة البيانات بناءً على الجدول المزود
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'cvpro_db',
  password: process.env.DB_PASSWORD, // يتم جلبها من Secret Manager أو .env
  port: 9470,
});

// نقطة نهاية لجلب ملخص المحادثات من الـ View التي أنشأناها
app.get('/api/conversations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM conversation_summary ORDER BY updated_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});