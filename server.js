const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database connection check (non‑blocking)
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.warn('⚠️ Server will continue, but database features will not work.');
  } else {
    console.log('✅ Connected to database successfully');
    release();
  }
});

// =============================================
// All API routes have been removed.
// Frontend now calls n8n webhooks exclusively.
// =============================================

// Serve static frontend files (built React app)
const distPath = path.join(__dirname, 'dist');
if (!require('fs').existsSync(distPath)) {
  console.warn('⚠️ dist/ folder not found. Run `npm run build` in frontend directory first.');
}
app.use(express.static(distPath));

// Catch‑all: serve index.html for client‑side routing (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} – serving static frontend only.`);
});