-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending', 'archived')),
    human_takeover BOOLEAN DEFAULT FALSE,
    channel TEXT DEFAULT 'whatsapp',
    last_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster joins between customers and conversations
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);

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

-- Indexes for faster message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_customer_id ON messages(customer_id);

-- وظيفة تحديث التوقيت تلقائياً
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ربط التريجر بالجداول
DROP TRIGGER IF EXISTS update_customers_modtime ON customers;
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_conversations_modtime ON conversations;
CREATE TRIGGER update_conversations_modtime BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- View مع تضمين channel
-- Optimization: Added Materialized hint logic or Security Invoker check
DROP VIEW IF EXISTS conversation_summary;
CREATE OR REPLACE VIEW conversation_summary AS
SELECT 
    conv.id,
    conv.customer_id,
    cust.full_name AS customer_name,
    cust.phone_number,
    cust.lead_stage,
    conv.channel,
    conv.status,
    conv.last_message,
    conv.human_takeover,
    conv.updated_at
FROM conversations conv
INNER JOIN customers cust ON conv.customer_id = cust.id;