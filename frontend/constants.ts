import { Customer, Conversation, Message, Broadcast, Template } from './types';

// ============================================================================
// 1. روابط الـ API الأساسية (بناءً على نظام الحاوية الواحدة المدمجة)
// ============================================================================
// نستخدم مسار نسبي لأن الفرونت إند والباك إند يخرجان من نفس رابط الـ Cloud Run
export const API_BASE_URL = '/api';

export const API_ENDPOINTS = {
  DASHBOARD_STATS: `${API_BASE_URL}/stats`,
  CUSTOMERS: `${API_BASE_URL}/customers`,
  CONVERSATIONS: `${API_BASE_URL}/conversations`,
  MESSAGES: (conversationId: string) => `${API_BASE_URL}/conversations/${conversationId}/messages`,
  TEMPLATES: `${API_BASE_URL}/templates`,
};

// ============================================================================
// 2. البيانات الاحتياطية (Mock Data Fallbacks) للبيئة المحلية والتطوير
// ============================================================================

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
  },
  {
    id: '2',
    full_name: 'سارة سميث',
    phone_number: '+971509876543',
    lead_stage: 'new',
    buying_intent_score: 45,
    language: 'en',
    country: 'AE',
    ltv_aed: 0,
    created_at: '2026-03-02T14:30:00Z',
  },
  {
    id: '3',
    full_name: 'عمر الشمري',
    phone_number: '+966551122334',
    lead_stage: 'analysis_done',
    buying_intent_score: 92,
    language: 'ar',
    country: 'SA',
    ltv_aed: 0,
    created_at: '2026-03-03T09:15:00Z',
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    customer_id: '1',
    customer_name: 'أحمد المنصوري',
    channel: 'whatsapp',
    human_takeover: false,
    last_message: 'أحتاج مساعدة في سيرتي الذاتية',
    updated_at: new Date().toISOString(),
    status: 'open',
  },
  {
    id: 'c2',
    customer_id: '2',
    customer_name: 'سارة سميث',
    channel: 'instagram',
    human_takeover: true,
    last_message: 'What are your prices?',
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    status: 'pending_human',
  },
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
      created_at: new Date(Date.now() - 60000).toISOString(),
    },
  ],
  c2: [
    {
      id: 'm2',
      conversation_id: 'c2',
      customer_id: '2',
      content: 'What are your prices?',
      direction: 'inbound',
      is_ai_generated: false,
      created_at: new Date(Date.now() - 4000000).toISOString(),
    },
    {
      id: 'm3',
      conversation_id: 'c2',
      customer_id: '2',
      content: 'Our executive package is 599 AED. Would you like a free assessment?',
      direction: 'outbound',
      is_ai_generated: true,
      created_at: new Date(Date.now() - 3900000).toISOString(),
    },
  ],
};

export const MOCK_BROADCASTS: Broadcast[] = [
  {
    id: 'b1',
    name: 'UAE National Day Offer',
    channel: 'whatsapp',
    status: 'completed',
    sentCount: 4500,
    deliveredCount: 4420,
    readCount: 3800,
    createdAt: '2026-02-28T10:00:00Z',
  },
];

export const MOCK_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'welcome_ar',
    language: 'ar',
    category: 'welcome',
    content: 'هلا بك {{full_name}} في CVPRO! كيف نقدر نساعدك اليوم؟',
  },
  {
    id: 't2',
    name: 'welcome_en',
    language: 'en',
    category: 'welcome',
    content: 'Welcome {{full_name}}! How can we help you today?',
  },
];

// ============================================================================
// 3. دوال مساعدة لجلب البيانات (API Fetchers)
// ============================================================================

export async function fetchFromAPI(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(endpoint, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`⚠️ Failed to fetch from API (${endpoint}), using local fallback data.`, error);
    return null;
  }
}