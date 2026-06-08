import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// خدمة الملفات الثابتة (بناء React)
app.use(express.static(path.join(__dirname, 'dist')));

// بروكسي لجميع طلبات API إلى الخادم الخلفي
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: { '^/api': '/api' },
  logLevel: 'warn',
}));

// بروكسي لـ WebSocket إذا لزم الأمر (مثل Vertex AI Live)
app.use('/ws-proxy', createProxyMiddleware({
  target: BACKEND_URL.replace('http', 'ws'),
  ws: true,
  changeOrigin: true,
}));

// أي مسار آخر → إرجاع index.html (لـ React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ خادم الواجهة يعمل على المنفذ ${PORT}`);
  console.log(`🔁 توجيه API إلى ${BACKEND_URL}`);
});