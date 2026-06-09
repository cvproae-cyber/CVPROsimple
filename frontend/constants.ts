import { Customer, Conversation, Message, Broadcast, Template } from './types';

// The frontend now uses n8n webhooks exclusively via api.ts.
// API_BASE_URL is defined in api.ts using VITE_N8N_URL.
// This file only contains mock data for development/fallback.

export const API_BASE_URL = '/api'; // kept for reference only, not used

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    full_name: 'أحمد المنصوري',
    phone_number: '+971501234567',
    lead_stage: 'qualified',
    buying_intent_score: 85,
    language: 'ar',
    country: 'AE',
    ltv_aed: 0,
    created_at: '2026-03-01T10:00:00Z',
  }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    customer_id: '1',
    customer_name: 'أحمد هاشم',
    channel: 'whatsapp',
    human_takeover: false,
    last_message: 'أحتاج مساعدة في سيرتي الذاتية',
    updated_at: new Date().toISOString(),
    status: 'open',
  }
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  c1: [
    {
      id: 'm1',
      conversation_id: 'c1',
      customer_id: '1',
      content: 'أحتاج مساعدة في سيرتي الذاتية',
      direction: 'inbound',
      is_ai_generated: false,
      created_at: new Date().toISOString(),
    },
  ],
};

export const MOCK_BROADCASTS: Broadcast[] = [];
export const MOCK_TEMPLATES: Template[] = [];