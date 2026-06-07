-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUMS
CREATE TYPE channel_type AS ENUM ('whatsapp', 'instagram', 'facebook', 'tiktok', 'telegram', 'email', 'web');
CREATE TYPE lead_stage AS ENUM ('new', 'qualified', 'analysis_done', 'proposal_sent', 'negotiation', 'won', 'lost');
CREATE TYPE user_role AS ENUM ('admin', 'sales_manager', 'agent', 'ai_agent');

-- USERS (Agents)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'agent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOMERS (Leads)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    country VARCHAR(2) DEFAULT 'AE',
    language VARCHAR(2) DEFAULT 'ar',
    lead_stage lead_stage DEFAULT 'new',
    intent_score INT DEFAULT 0 CHECK (intent_score BETWEEN 0 AND 100),
    ltv_aed DECIMAL(10,2) DEFAULT 0.00,
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONVERSATIONS
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    channel channel_type NOT NULL,
    channel_id TEXT, -- e.g., WhatsApp Phone ID or IG Thread ID
    ai_enabled BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id), -- NULL if customer or AI
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    content TEXT,
    media_url TEXT,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VECTOR MEMORY (RAG)
CREATE TABLE vector_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON vector_memory USING hnsw (embedding vector_cosine_ops);

-- CV ANALYSES
CREATE TABLE cv_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    file_url TEXT,
    ats_score INT,
    linkedin_score INT,
    strengths TEXT[],
    weaknesses TEXT[],
    ai_sales_pitch TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Admins see all, Agents see assigned
CREATE POLICY agent_customer_access ON customers 
    FOR ALL USING (auth.uid() = assigned_to OR (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'sales_manager'));
