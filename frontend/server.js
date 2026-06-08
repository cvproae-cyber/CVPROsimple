import 'dotenv/config';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import pg from 'pg';
import fs from 'fs';

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

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

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

// مسار مؤقت للتأكد من الجداول المنشأة
app.get('/api/check-tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    res.json({ status: 'success', tables: result.rows.map(r => r.table_name) });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// جلب قائمة العملاء
app.get('/api/customers', async (req, res) => {
  try {
    // استخدام SQL Aliases لتحويل أسماء الحقول من snake_case إلى camelCase مباشرة
    const query = `
      SELECT 
        id, 
        full_name AS "fullName", 
        phone_number AS "phone", 
        lead_stage AS "stage", 
        ltv_aed AS "ltvAED", 
        buying_intent_score AS "intentScore", 
        language, country, created_at AS "createdAt"
      FROM customers 
      ORDER BY created_at DESC`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('DATABASE_ERROR_REPORT:', {
      message: error.message,
      stack: error.stack,
      config: { host: process.env.DB_HOST, user: process.env.DB_USER, db: process.env.DB_NAME }
    });
    res.status(500).json({ error: error.message });
  }
});

// جلب المحادثات
app.get('/api/conversations', async (req, res) => {
  try {
    // استعلام يجلب المحادثات مع بيانات العميل المرتبط بها
    const query = `
      SELECT conv.*, cust.full_name as customer_name 
      FROM conversations conv
      JOIN customers cust ON conv.customer_id = cust.id
      ORDER BY conv.updated_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

// جلب رسائل محادثة معينة
app.get('/api/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// جلب القوالب (Templates)
app.get('/api/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM templates ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// جلب الرسائل الجماعية (Broadcasts)
app.get('/api/broadcasts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM broadcasts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// إرسال رسالة جديدة (Outbound)
app.post('/api/messages', async (req, res) => {
  try {
    const { conversationId, customerId, content } = req.body;
    const result = await pool.query(
      'INSERT INTO messages (conversation_id, customer_id, content, direction, is_ai_generated) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [conversationId, customerId, content, 'outbound', false]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// إحصائيات لوحة التحكم
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const leadsCount = await pool.query('SELECT COUNT(*) FROM customers');
    const activeChats = await pool.query("SELECT COUNT(*) FROM conversations WHERE status = 'open'");
    const revenue = await pool.query("SELECT SUM(ltv_aed) FROM customers WHERE lead_stage = 'won'");

    res.json({
      totalLeads: parseInt(leadsCount.rows[0].count),
      activeChats: parseInt(activeChats.rows[0].count),
      revenue: parseFloat(revenue.rows[0].sum || 0),
      aiResolutionRate: 84.5,
      chartData: [
        { date: "Mon", leads: 45, conversions: 12, revenue: 4788 },
        { date: "Tue", leads: 52, conversions: 15, revenue: 5985 },
        { date: "Wed", leads: 38, conversions: 10, revenue: 3990 },
        { date: "Thu", leads: 65, conversions: 22, revenue: 8778 },
        { date: "Fri", leads: 48, conversions: 14, revenue: 5586 },
        { date: "Sat", leads: 25, conversions: 5, revenue: 1995 },
        { date: "Sun", leads: 30, conversions: 8, revenue: 3192 },
      ]
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// تفعيل/تعطيل التدخل البشري (Human Takeover)
app.put('/api/conversations/:id/ai-toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { humanTakeover } = req.body;
    await pool.query(
      'UPDATE conversations SET human_takeover = $1, updated_at = NOW() WHERE id = $2',
      [humanTakeover, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// تحديث حالة العميل (Pipeline)
app.put('/api/customers/:id/stage', async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    await pool.query(
      'UPDATE customers SET lead_stage = $1, updated_at = NOW() WHERE id = $2',
      [stage, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating stage:', error);
    res.status(500).json({ error: error.message });
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
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build not found. Please run "npm run build" first.');
  }
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});