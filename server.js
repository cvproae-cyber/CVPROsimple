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
const fs = require('fs');
if (!fs.existsSync(distPath)) {
  console.warn('⚠️ dist/ folder not found. Run `npm run build` in frontend directory first.');
  console.warn('⚠️ Falling back to frontend/ (development mode)');
  // Optionally, for development you could serve from frontend/ directly
  // app.use(express.static(path.join(__dirname, 'frontend')));
} else {
  app.use(express.static(distPath));
}

// Catch‑all: serve index.html for client‑side routing (React Router)
// Using app.use instead of app.get to avoid path-to-regexp issues in Express 5
// This middleware will run for any GET request that didn't match a static file
app.use((req, res, next) => {
  // Only handle GET requests and when dist exists
  if (req.method === 'GET' && fs.existsSync(distPath)) {
    // Check if the request is for a file that exists (like .js, .css)
    // If not, send index.html for SPA routing
    const requestedFile = path.join(distPath, req.path);
    if (fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()) {
      // Let express.static handle it, but since we're after static middleware,
      // we need to serve the file manually or let it pass
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    next();
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} – serving static frontend only.`);
});