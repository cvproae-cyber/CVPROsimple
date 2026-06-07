import express from 'express';
import http from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// زيادة حجم الطلب المسموح به لاستقبال ملفات الـ CV إذا لزم الأمر
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// Vertex AI Proxy Endpoint
app.post('/api-proxy', async (req, res) => {
  const { originalUrl, headers, method, body } = req.body;
  
  // التأكد من أن الطلب قادم من تطبيقنا عبر الهيدر السري
  if (req.headers['x-app-proxy'] !== 'ga7BzVOhKQgwlfxUM51ZE_CdKBB2EBlS') {
    return res.status(403).send('Forbidden');
  }

  try {
    const response = await axios({
      url: originalUrl,
      method: method,
      headers: {
        ...headers,
        'Host': 'aiplatform.googleapis.com'
      },
      data: body,
      responseType: 'stream'
    });

    response.data.pipe(res);
  } catch (error) {
    console.error('API Proxy Error:', error.message);
    res.status(error.response?.status || 500).send(error.response?.data || 'Proxy Error');
  }
});

// WebSocket Proxy for Vertex AI Live API
const wsProxy = createProxyMiddleware({
  target: 'wss://aiplatform.googleapis.com',
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/ws-proxy': '/ws/google.cloud.aiplatform.v1beta1.LlmBidiService/BidiGenerateContent',
  },
  logLevel: 'debug',
});

app.use('/ws-proxy', wsProxy);

// معالجة مسارات React (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});