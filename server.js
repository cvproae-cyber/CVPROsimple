const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// فحص الاتصال الذكي عند بدء التشغيل دون تدمير الـ Cloud Run Instance
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ فشل الاتصال المبدئي بقاعدة البيانات:', err.message);
    console.warn('⚠️ سيستمر السيرفر في العمل، وسيتم إعادة المحاولة تلقائياً عند طلب البيانات.');
  } else {
    console.log('✅ متصل بقاعدة البيانات بنجاح عبر الـ Configuration المحدثة');
    release();
  }
});

// ---------- العملاء (Customers) ----------
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name, phone_number, lead_stage, buying_intent_score, language, country, ltv_aed, created_at
      FROM customers ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'فشل جلب العملاء من قاعدة البيانات' });
  }
});

app.put('/api/customers/:id/stage', async (req, res) => {
  const { id } = req.params;
  const { lead_stage } = req.body;
  try {
    await pool.query('UPDATE customers SET lead_stage = $1, updated_at = NOW() WHERE id = $2', [lead_stage, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating stage:', err);
    res.status(500).json({ error: 'فشل تحديث مرحلة العميل' });
  }
});

// ---------- المحادثات (Conversations) ----------
app.get('/api/conversations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, customer_id, customer_name, channel, status, human_takeover, last_message, updated_at
      FROM conversation_summary ORDER BY updated_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'فشل جلب المحادثات' });
  }
});

app.get('/api/conversations/:id/messages', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT id, conversation_id, customer_id, content, direction, is_ai_generated, created_at
      FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'فشل جلب رسائل المحادثة' });
  }
});

app.post('/api/messages', async (req, res) => {
  const { conversation_id, customer_id, content } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO messages (conversation_id, customer_id, content, direction, is_ai_generated)
      VALUES ($1, $2, $3, 'outbound', false) RETURNING *
    `, [conversation_id, customer_id, content]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting message:', err);
    res.status(500).json({ error: 'فشل حفظ وإرسال الرسالة' });
  }
});

app.put('/api/conversations/:id/takeover', async (req, res) => {
  const { id } = req.params;
  const { human_takeover } = req.body;
  try {
    await pool.query('UPDATE conversations SET human_takeover = $1, updated_at = NOW() WHERE id = $2', [human_takeover, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error toggling takeover:', err);
    res.status(500).json({ error: 'فشل تبديل وضع المساعد الذكي / البشري' });
  }
});

// ---------- الإحصائيات (Dashboard Stats) ----------
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalLeadsRes = await pool.query('SELECT COUNT(*) FROM customers');
    const activeChatsRes = await pool.query("SELECT COUNT(*) FROM conversations WHERE status = 'open'");
    const revenueRes = await pool.query("SELECT COALESCE(SUM(ltv_aed), 0) FROM customers WHERE lead_stage = 'won'");
    
    const chartData = [
      { date: "Mon", leads: 45, conversions: 12, revenue: 4788 },
      { date: "Tue", leads: 52, conversions: 15, revenue: 5985 },
      { date: "Wed", leads: 38, conversions: 10, revenue: 3990 },
      { date: "Thu", leads: 65, conversions: 22, revenue: 8778 },
      { date: "Fri", leads: 48, conversions: 14, revenue: 5586 },
      { date: "Sat", leads: 25, conversions: 5, revenue: 1995 },
      { date: "Sun", leads: 30, conversions: 8, revenue: 3192 },
    ];

    const totalLeads = totalLeadsRes.rows[0] ? parseInt(totalLeadsRes.rows[0].count, 10) : 0;
    const activeChats = activeChatsRes.rows[0] ? parseInt(activeChatsRes.rows[0].count, 10) : 0;
    const rawRevenue = revenueRes.rows[0] ? (revenueRes.rows[0].coalesce || revenueRes.rows[0].sum || 0) : 0;
    const revenue = parseFloat(rawRevenue);

    res.json({ totalLeads, activeChats, revenue, aiResolutionRate: 84.5, chartData });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'فشل جلب إحصائيات لوحة التحكم' });
  }
});

// ---------- مسارات احتياطية ----------
app.get('/api/templates', async (req, res) => {
  try { const result = await pool.query('SELECT * FROM templates ORDER BY created_at DESC'); res.json(result.rows); } 
  catch (err) { res.json([]); }
});

app.get('/api/broadcasts', async (req, res) => {
  try { const result = await pool.query('SELECT * FROM broadcasts ORDER BY created_at DESC'); res.json(result.rows); } 
  catch (err) { res.json([]); }
});

// ---------- خدمة الـ Frontend (SPA Settings) ----------
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 السيرفر الموحد يعمل بنجاح وكفاءة على بورت ${PORT}`);
});