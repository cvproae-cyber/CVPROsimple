export type Channel = 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'telegram' | 'email';

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  channel: Channel;
  stage: 'new' | 'qualified' | 'analysis_done' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
  intentScore: number;
  language: string;
  country: string;
  ltvAED: number;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  isAiGenerated: boolean;
  timestamp: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  channel: Channel;
  aiEnabled: boolean;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
  status: 'open' | 'closed' | 'pending_human';
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
  linkedin_score: number;
  strengths: string[];
  weaknesses: string[];
  sales_pitch: string;
  personalized_offer: string;
}
