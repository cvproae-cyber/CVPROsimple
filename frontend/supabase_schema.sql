-- تفعيل الإضافات اللازمة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector; -- لدعم الذاكرة المتجهة (اختياري)

-- 1. جدول المشتركين (Customers)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone_number TEXT UNIQUE,
  instagram_id TEXT UNIQUE,
  email TEXT,
  language TEXT DEFAULT 'ar',
  country TEXT DEFAULT 'AE',
  lead_stage TEXT DEFAULT 'new', -- matches stages: new, qualified, analysis_done, etc.
  buying_intent_score INT DEFAULT 0,
  ltv_aed DECIMAL(10, 2) DEFAULT 0,
  last_interaction TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. جدول المحادثات (Conversations)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'whatsapp', -- whatsapp, instagram, etc.
  status TEXT DEFAULT 'open', -- open, pending_human, closed
  human_takeover BOOLEAN DEFAULT false,
  assigned_agent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. جدول الرسائل (Messages)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  direction TEXT NOT NULL, -- inbound, outbound
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text',
  is_ai_generated BOOLEAN DEFAULT false,
  channel TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. جدول الحملات (Broadcasts)
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  channel TEXT DEFAULT 'all',
  status TEXT DEFAULT 'draft',
  sent_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  read_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. جدول القوالب (Templates)
CREATE TABLE IF NOT EXISTS templates (
  name TEXT PRIMARY KEY,
  category TEXT,
  content TEXT NOT NULL,
  language TEXT DEFAULT 'ar',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- دالة لتحديث حقل updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تفعيل الـ Triggers
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_conversations_modtime BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- إضافة بيانات تجريبية (اختياري)
INSERT INTO templates (name, category, content, language) VALUES
('welcome_ar', 'welcome', 'أهلاً بك في CVPRO! كيف يمكننا مساعدتك اليوم؟', 'ar'),
('welcome_en', 'welcome', 'Welcome to CVPRO! How can we help you today?', 'en')
ON CONFLICT (name) DO NOTHING;

-- إنشاء View لتسهيل عرض الـ Inbox كما هو مطلوب في fetchConversations
CREATE OR REPLACE VIEW conversation_summary AS
SELECT 
    conv.id,
    conv.customer_id,
    cust.full_name as customer_name,
    conv.channel,
    conv.human_takeover,
    conv.status,
    conv.updated_at,
    (SELECT content FROM messages WHERE conversation_id = conv.id ORDER BY created_at DESC LIMIT 1) as last_message
FROM conversations conv
JOIN customers cust ON conv.customer_id = cust.id;

-- صلاحيات الوصول (RLS - Row Level Security)
-- ملاحظة: للتجربة السريعة يمكنك إيقاف RLS، ولكن للإنتاج يجب تفعيلها.
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- السماح بالوصول الكامل لمفتاح الـ Service Role أو الـ Authenticated Users
CREATE POLICY "Allow full access to authenticated users" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to authenticated users" ON conversations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to authenticated users" ON messages FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to authenticated users" ON broadcasts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to authenticated users" ON templates FOR ALL TO authenticated USING (true);