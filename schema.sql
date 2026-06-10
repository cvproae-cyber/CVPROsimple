-- =============================================
-- CVPRO AI CRM - Complete Database Schema
-- PostgreSQL 14+
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- Tables
-- =============================================

-- Customers table (leads)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    lead_stage TEXT NOT NULL DEFAULT 'new' CHECK (lead_stage IN ('new', 'qualified', 'analysis_done', 'proposal_sent', 'negotiation', 'won', 'lost')),
    buying_intent_score INTEGER DEFAULT 0 CHECK (buying_intent_score BETWEEN 0 AND 100),
    language TEXT DEFAULT 'ar',
    country TEXT DEFAULT 'AE',
    ltv_aed NUMERIC(10,2) DEFAULT 0,
    opted_in BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'instagram', 'facebook', 'tiktok', 'telegram', 'email')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending_human')),
    human_takeover BOOLEAN DEFAULT FALSE,
    last_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    content TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    is_ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table (for message templates)
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    language TEXT DEFAULT 'ar',
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Broadcasts table
CREATE TABLE IF NOT EXISTS broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'instagram', 'facebook', 'all')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed')),
    sentCount INTEGER DEFAULT 0,
    deliveredCount INTEGER DEFAULT 0,
    readCount INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat memory table for n8n LangChain (auto-created by n8n, but included for clarity)
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
    id SERIAL PRIMARY KEY,
    session_key TEXT NOT NULL,
    context TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Views
-- =============================================

CREATE OR REPLACE VIEW conversation_summary AS
SELECT 
    c.id,
    c.customer_id,
    cust.full_name AS customer_name,
    c.channel,
    c.status,
    c.human_takeover,
    c.last_message,
    c.updated_at
FROM conversations c
JOIN customers cust ON cust.id = c.customer_id;

-- =============================================
-- Indexes for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_customers_phone_number ON customers(phone_number);
CREATE INDEX IF NOT EXISTS idx_customers_lead_stage ON customers(lead_stage);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session ON n8n_chat_histories(session_key);

-- =============================================
-- Sample data (optional – for development)
-- =============================================

-- Insert sample customers with fixed UUIDs (or leave id out to auto-generate)
INSERT INTO customers (id, full_name, phone_number, lead_stage, buying_intent_score, language, country, ltv_aed)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'أحمد المنصوري', '+971501234567', 'qualified', 85, 'ar', 'AE', 0),
    ('22222222-2222-2222-2222-222222222222', 'Fatima Al Shehhi', '+971502345678', 'new', 60, 'en', 'AE', 0)
ON CONFLICT (phone_number) DO NOTHING;

-- Insert sample conversations
INSERT INTO conversations (id, customer_id, channel, status, human_takeover, last_message)
VALUES 
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'whatsapp', 'open', false, 'مرحباً، أحتاج مساعدة في سيرتي الذاتية'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'whatsapp', 'open', true, 'هل يمكنكم مساعدتي؟')
ON CONFLICT (id) DO NOTHING;

-- Insert sample templates using valid UUIDs (not custom strings)
INSERT INTO templates (id, name, language, category, content)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'welcome_ar', 'ar', 'greeting', 'مرحباً {{customer_name}}! 👋\nأنا المساعد الذكي لـ CVPro. كيف يمكنني مساعدتك اليوم؟'),
    ('550e8400-e29b-41d4-a716-446655440002', 'cv_analysis_complete', 'en', 'update', 'Dear {{customer_name}},\n\nWe have completed the analysis of your CV. Your ATS score is {{score}}%.')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Optional: Auto-update updated_at column
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();