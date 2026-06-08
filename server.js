const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ============================================
// إعداد Connection Pool لقاعدة البيانات (Google Cloud SQL)
// ============================================
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: parseInt(process.env.POOL_MAX) || 10,
  idleTimeoutMillis: parseInt(process.env.POOL_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: 2000,
});

// اختبار الاتصال عند بدء التشغيل
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', err.stack);
    process.exit(1);
  } else {
    console.log('✅ متصل بـ Google Cloud SQL بنجاح');
    release();
  }
});

// إغلاق الاتصالات بشكل آمن عند إيقاف الخادم
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('📦 تم إغلاق pool قاعدة البيانات');
    process.exit(0);
  });
});

// ============================================
// جميع نقاط النهاية (Endpoints) تستخدم snake_case
// ============================================

// ---------- العملاء (Customers) ----------
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        full_name, 
        phone_number, 
        lead_stage, 
        buying_intent_score,
        language, 
        country, 
        ltv_aed, 
        created_at
      FROM customers
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'فشل جلب العملاء' });
  }
});

app.put('/api/customers/:id/stage', async (req, res) => {
  const { id } = req.params;
  const { lead_stage } = req.body;
  try {
    await pool.query(
      'UPDATE customers SET lead_stage = $1, updated_at = NOW() WHERE id = $2',
      [lead_stage, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'فشل تحديث المرحلة' });
  }
});

// ---------- المحادثات (Conversations) ----------
app.get('/api/conversations', async (req, res) => {
  try {
    // استخدام view conversation_summary التي تحتوي على customer_name و channel وغيرها
    const result = await pool.query(`
      SELECT 
        id, 
        customer_id, 
        customer_name, 
        channel, 
        status,
        human_takeover, 
        last_message, 
        updated_at
      FROM conversation_summary
      ORDER BY updated_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'فشل جلب المحادثات' });
  }
});

app.get('/api/conversations/:id/messages', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        conversation_id, 
        customer_id, 
        content, 
        direction, 
        is_ai_generated, 
        created_at
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'فشل جلب الرسائل' });
  }
});

app.post('/api/messages', async (req, res) => {
  const { conversation_id, customer_id, content } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO messages 
        (conversation_id, customer_id, content, direction, is_ai_generated)
       VALUES ($1, $2, $3, 'outbound', false)
       RETURNING *`,
      [conversation_id, customer_id, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'فشل إرسال الرسالة' });
  }
});

app.put('/api/conversations/:id/takeover', async (req, res) => {
  const { id } = req.params;
  const { human_takeover } = req.body;
  try {
    await pool.query(
      'UPDATE conversations SET human_takeover = $1, updated_at = NOW() WHERE id = $2',
      [human_takeover, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'فشل تبديل وضع AI' });
  }
});

// ---------- الإحصائيات (Dashboard) ----------
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalLeadsRes = await pool.query('SELECT COUNT(*) FROM customers');
    const activeChatsRes = await pool.query("SELECT COUNT(*) FROM conversations WHERE status = 'open'");
    const revenueRes = await pool.query("SELECT COALESCE(SUM(ltv_aed), 0) FROM customers WHERE lead_stage = 'won'");
    
    // بيانات تجريبية للرسم البياني (يمكن جلبها من جدول analytics لاحقاً)
    const chartData = [
      { date: "Mon", leads: 45, conversions: 12, revenue: 4788 },
      { date: "Tue", leads: 52, conversions: 15, revenue: 5985 },
      { date: "Wed", leads: 38, conversions: 10, revenue: 3990 },
      { date: "Thu", leads: 65, conversions: 22, revenue: 8778 },
      { date: "Fri", leads: 48, conversions: 14, revenue: 5586 },
      { date: "Sat", leads: 25, conversions: 5, revenue: 1995 },
      { date: "Sun", leads: 30, conversions: 8, revenue: 3192 },
    ];

    res.json({
      totalLeads: parseInt(totalLeadsRes.rows[0].count),
      activeChats: parseInt(activeChatsRes.rows[0].count),
      revenue: parseFloat(revenueRes.rows[0].sum),
      aiResolutionRate: 84.5,
      chartData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'فشل جلب الإحصائيات' });
  }
});

// ---------- القوالب (Templates) - اختياري ----------
app.get('/api/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM templates ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    // إذا لم يكن الجدول موجوداً، نعيد مصفوفة فارغة
    res.json([]);
  }
});

app.get('/api/broadcasts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM broadcasts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.json([]);
  }
});

// ---------- تشغيل الخادم ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 خادم الخلفية يعمل على المنفذ ${PORT}`);
});