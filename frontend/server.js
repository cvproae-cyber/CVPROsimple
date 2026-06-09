const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// خدمة ملفات الفرونت إند المترجمة من مجلد dist
app.use(express.static(path.join(__dirname, 'dist')));

// تحويل طلبات الـ API تلقائياً للباك إند
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  logLevel: 'warn',
}));

// تحويل خطوط الـ WebSockets إذا وجدت
app.use('/ws-proxy', createProxyMiddleware({
  target: BACKEND_URL.replace('http', 'ws'),
  ws: true,
  changeOrigin: true,
}));

// توجيه أي مسار آخر لـ index.html لدعم React Router (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Frontend production server is running on port ${PORT}`);
  console.log(`🔁 Proxying all /api requests straight to: ${BACKEND_URL}`);
});