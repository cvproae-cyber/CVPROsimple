import { Customer, Conversation, Message, Broadcast, Template } from './types';

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'u1', fullName: 'Ahmed Al Mansoori', phone: '+971501234567', channel: 'whatsapp', stage: 'new', intentScore: 45, language: 'ar', country: 'AE', ltvAED: 0, createdAt: '2023-10-27T10:00:00Z' },
  { id: 'u2', fullName: 'Sarah Smith', phone: '+971509876543', channel: 'instagram', stage: 'qualified', intentScore: 85, language: 'en', country: 'AE', ltvAED: 0, createdAt: '2023-10-26T14:30:00Z' },
  { id: 'u3', fullName: 'Omar Al Shammari', phone: '+966551122334', channel: 'tiktok', stage: 'analysis_done', intentScore: 92, language: 'ar', country: 'SA', ltvAED: 0, createdAt: '2023-10-27T09:15:00Z' },
  { id: 'u4', fullName: 'Fatima Al Zahra', phone: '+974562233445', channel: 'telegram', stage: 'proposal_sent', intentScore: 78, language: 'ar', country: 'QA', ltvAED: 0, createdAt: '2023-10-25T11:20:00Z' },
  { id: 'u5', fullName: 'John Doe', phone: '+971543344556', channel: 'facebook', stage: 'won', intentScore: 100, language: 'en', country: 'AE', ltvAED: 599, createdAt: '2023-10-20T16:45:00Z' },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 'c1', customerId: 'u1', customerName: 'Ahmed Al Mansoori', channel: 'whatsapp', aiEnabled: true, lastMessage: 'هلا، محتاج مساعدة في السيرة الذاتية', updatedAt: new Date().toISOString(), unreadCount: 1, status: 'open' },
  { id: 'c2', customerId: 'u2', customerName: 'Sarah Smith', channel: 'instagram', aiEnabled: false, lastMessage: 'What are your prices for the Executive package?', updatedAt: new Date(Date.now() - 3600000).toISOString(), unreadCount: 0, status: 'pending_human' },
  { id: 'c3', customerId: 'u3', customerName: 'Omar Al Shammari', channel: 'tiktok', aiEnabled: true, lastMessage: 'يعطيكم العافية على التحليل', updatedAt: new Date(Date.now() - 7200000).toISOString(), unreadCount: 0, status: 'open' },
  { id: 'c4', customerId: 'u4', customerName: 'Fatima Al Zahra', channel: 'telegram', aiEnabled: true, lastMessage: 'هل يوجد خصم لليوم الوطني؟', updatedAt: new Date(Date.now() - 86400000).toISOString(), unreadCount: 2, status: 'open' },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'c1': [
    { id: 'm1', conversationId: 'c1', content: 'هلا، محتاج مساعدة في السيرة الذاتية', direction: 'inbound', isAiGenerated: false, timestamp: new Date(Date.now() - 60000).toISOString() },
  ],
  'c2': [
    { id: 'm2', conversationId: 'c2', content: 'Hi there!', direction: 'inbound', isAiGenerated: false, timestamp: new Date(Date.now() - 4000000).toISOString() },
    { id: 'm3', conversationId: 'c2', content: 'Hello! How can CVPRO help you today?', direction: 'outbound', isAiGenerated: true, timestamp: new Date(Date.now() - 3900000).toISOString() },
    { id: 'm4', conversationId: 'c2', content: 'What are your prices for the Executive package?', direction: 'inbound', isAiGenerated: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
  ],
  'c3': [
    { id: 'm5', conversationId: 'c3', content: 'مرفق سيرتي الذاتية', direction: 'inbound', isAiGenerated: false, timestamp: new Date(Date.now() - 8000000).toISOString() },
    { id: 'm6', conversationId: 'c3', content: 'تم تحليل سيرتك. النسبة 75/100. ينقصك بعض الكلمات المفتاحية.', direction: 'outbound', isAiGenerated: true, timestamp: new Date(Date.now() - 7500000).toISOString() },
    { id: 'm7', conversationId: 'c3', content: 'يعطيكم العافية على التحليل', direction: 'inbound', isAiGenerated: false, timestamp: new Date(Date.now() - 7200000).toISOString() },
  ]
};

export const MOCK_BROADCASTS: Broadcast[] = [
  { id: 'b1', name: 'UAE National Day Offer', channel: 'whatsapp', status: 'completed', sentCount: 4500, deliveredCount: 4420, readCount: 3800, createdAt: '2023-11-28T10:00:00Z' },
  { id: 'b2', name: 'TikTok Lead Gen Follow-up', channel: 'tiktok', status: 'sending', sentCount: 450, deliveredCount: 400, readCount: 120, createdAt: new Date().toISOString() },
  { id: 'b3', name: 'Abandoned Cart Recovery', channel: 'email', status: 'scheduled', sentCount: 0, deliveredCount: 0, readCount: 0, createdAt: new Date().toISOString() },
];

export const MOCK_TEMPLATES: Template[] = [
  { id: 't1', name: 'welcome_ar_ae', language: 'ar', category: 'welcome', content: 'هلا بك {{name}} في CVPRO 🇦🇪! الذكاء الاصطناعي حقنا جاهز يحلل سيرتك الذاتية مجاناً. تبغي نبدأ؟' },
  { id: 't2', name: 'welcome_en', language: 'en', category: 'welcome', content: 'Hello {{name}}! I\'m the AI assistant for CVPRO. We specialize in professional CVs for the GCC market. Would you like a FREE CV assessment?' },
  { id: 't3', name: 'followup_offer_sa', language: 'ar', category: 'followup', content: 'يا هلا {{name}} 👋 فرصة تحسين سيرتك لسه موجودة. استخدم كود KSA20 لخصم 20% اليوم بس!' },
  { id: 't4', name: 'human_handoff', language: 'en', category: 'support', content: 'Thanks for reaching out! I am transferring you to one of our human career experts who will be with you shortly. 😊' },
];
