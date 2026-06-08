-- جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone_number TEXT,
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
VALUES ('Ahmed Test', '+971500000000', 'new', 500);

INSERT INTO conversations (customer_id, last_message, status) 
SELECT id, 'Hello, I need help with my CV', 'open' FROM customers LIMIT 1;

-- وظيفة تحديث التوقيت تلقائياً (تأكد من تشغيل هذا الجزء في Query Editor)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ربط التريجر بالجداول (لضمان تحديث updated_at يدوياً)
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_conversations_modtime BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- إنشاء View لتلخيص المحادثات (هذا ما سيطلبه الفرونت إند)
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

-- وظيفة تحديث التوقيت تلقائياً
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ربط التريجر بالجداول
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
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