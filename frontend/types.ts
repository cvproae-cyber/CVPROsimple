export type Channel = 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'telegram' | 'email';

export interface Customer {
  id: string;
  full_name: string;
  phone_number: string;
  lead_stage: 'new' | 'qualified' | 'analysis_done' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
  buying_intent_score: number;
  language: string;
  country: string;
  ltv_aed: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  customer_name: string;
  channel: Channel;
  human_takeover: boolean;   // true = تدخل بشري, false = AI نشط
  last_message: string;
  updated_at: string;
  status: 'open' | 'closed' | 'pending_human';
}

export interface Message {
  id: string;
  conversation_id: string;
  customer_id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  is_ai_generated: boolean;
  created_at: string;
}

export interface Broadcast {
  id: string;
  name: string;
  channel: Channel | 'all';
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  language: string;
  category: string;
  content: string;
}

export interface CVAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  sales_pitch: string;
  personalized_offer: string;
}