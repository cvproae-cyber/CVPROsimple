import 'dotenv/config';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 8080;

// تأكيد قراءة المتغيرات البيئية عند التشغيل
if (!process.env.DB_HOST) {
  console.error('CRITICAL ERROR: Database environment variables are missing!');
  process.exit(1);
}

// Middleware configuration
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// Cloud SQL Connection Configuration
const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Export pool for use in other routes later
export { pool };

// Test Database Connection Endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, 1 as test_connection');
    res.json({
      status: 'success',
      message: 'Connected to Google Cloud SQL successfully!',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database Connection Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Vertex AI Proxy Endpoint
app.post('/api-proxy', async (req, res) => {
  const { originalUrl, headers, method, body } = req.body;
  
  // استخدام متغير بيئة للمفتاح السري لتعزيز الأمان
  const PROXY_SECRET = process.env.PROXY_SECRET || 'ga7BzVOhKQgwlfxUM51ZE_CdKBB2EBlS';
  if (req.headers['x-app-proxy'] !== PROXY_SECRET) {
    return res.status(403).send('Forbidden');
  }

  try {
    const response = await fetch(originalUrl, {
      method: method,
      headers: {
        ...headers,
        'Host': 'aiplatform.googleapis.com'
      },
      body: method !== 'GET' && method !== 'HEAD' ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      return res.status(response.status).send(await response.text());
    }

    // التأكد من وجود محتوى قبل البدء في الـ piping
    if (!response.body) {
      return res.status(response.status).end();
    }

    Readable.fromWeb(response.body).pipe(res);
  } catch (error) {
    console.error('API Proxy Error:', {
      message: error.message,
      url: originalUrl
    });
    
    res.status(500).json({ error: 'Internal Proxy Error', message: error.message });
  }
});

// n8n Proxy Endpoint - لربط الفرونت اند بـ n8n بأمان
app.post('/api/n8n', async (req, res) => {
  const { workflowId, data } = req.body;
  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL; // تأكد من إضافته في ملف .env

  if (!N8N_WEBHOOK_URL) {
    return res.status(500).json({ error: 'n8n Webhook URL is not configured' });
  }

  try {
    const response = await fetch(`${N8N_WEBHOOK_URL}/${workflowId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    res.status(response.status).json(result);
  } catch (error) {
    console.error('n8n Proxy Error:', error);
    res.status(500).json({ error: 'Failed to trigger n8n workflow' });
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

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});