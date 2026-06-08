const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection configuration
let dbConfig = {
  user: process.env.DB_USER || 'postgres',
  database: process.env.DB_NAME || 'cvpro_db',
  password: process.env.DB_PASSWORD,
};

if (process.env.INSTANCE_CONNECTION_NAME) {
  dbConfig.host = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
} else {
  dbConfig.host = '127.0.0.1';
  dbConfig.port = 9470;
}

const pool = new Pool(dbConfig);

// Graceful shutdown for Cloud Run
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
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