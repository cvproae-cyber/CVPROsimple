-- جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE,
    lead_stage TEXT DEFAULT 'new',
    ltv_aed DECIMAL DEFAULT 0,
    language TEXT DEFAULT 'ar',
    country TEXT DEFAULT 'AE',
    buying_intent_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المحادثات
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    status TEXT DEFAULT 'open',
    human_takeover BOOLEAN DEFAULT FALSE,
    channel TEXT DEFAULT 'whatsapp',
    last_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الرسائل
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    customer_id UUID REFERENCES customers(id),
    content TEXT NOT NULL,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    is_ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة بيانات تجريبية لاختبار الفرونت إند
INSERT INTO customers (full_name, phone_number, lead_stage, ltv_aed)
VALUES ('Ahmed Test', '+971500000000', 'new', 500)
ON CONFLICT (phone_number) DO NOTHING;

INSERT INTO conversations (customer_id, last_message, status) 
SELECT id, 'Hello, I need help with my CV', 'open' FROM customers 
WHERE phone_number = '+971500000000'
ON CONFLICT DO NOTHING;

-- ملاحظة: تم حذف التكرار في التريجرز والرؤى لضمان نظافة الكود

-- وظيفة تحديث التوقيت تلقائياً
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ربط التريجر بالجداول (نستخدم DROP لتجنب خطأ التكرار)
DROP TRIGGER IF EXISTS update_customers_modtime ON customers;
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_conversations_modtime ON conversations;
CREATE TRIGGER update_conversations_modtime BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- إنشاء View لتلخيص المحادثات مع بيانات العملاء
CREATE OR REPLACE VIEW conversation_summary AS
SELECT 
    conv.id AS conversation_id,
    cust.full_name,
    cust.phone_number,
    conv.status,
    conv.last_message,
    conv.updated_at
FROM conversations conv
JOIN customers cust ON conv.customer_id = cust.id;