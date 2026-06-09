import { Customer, Conversation, Message, Broadcast, Template } from '../types';

const API_BASE = '/api'; // سيتحول إلى n8n لاحقاً

// ----------------------------------------------
// 1. العملاء
// ----------------------------------------------
export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_BASE}/customers`);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export async function updateCustomerStage(id: string, lead_stage: string): Promise<void> {
  const url = `${API_BASE}/customers/stage?customerId=${id}&leadStage=${lead_stage}`;
  const res = await fetch(url, { method: 'PUT' });
  if (!res.ok) throw new Error('Failed to update stage');
}

// ----------------------------------------------
// 2. المحادثات
// ----------------------------------------------
export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/conversations`);
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
}

export async function fetchMessages(conversation_id: string): Promise<Message[]> {
  const url = `${API_BASE}/conversations/messages?conversationId=${conversation_id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function toggleHumanTakeover(conversation_id: string, human_takeover: boolean): Promise<void> {
  const url = `${API_BASE}/conversations/takeover?conversationId=${conversation_id}&humanTakeover=${human_takeover}`;
  const res = await fetch(url, { method: 'PUT' });
  if (!res.ok) throw new Error('Failed to toggle takeover');
}

// ----------------------------------------------
// 3. إرسال رسالة (من الداشبورد)
// ----------------------------------------------
export async function insertOutboundMessage(
  conversation_id: string,
  customer_id: string,
  content: string
): Promise<void> {
  // أولاً نستخرج رقم الهاتف من الـ customer (لكن n8n يحتاج رقم الهاتف في body)
  // الطريقة الأسهل: نطلب من n8n أن يستقبل conversationId فقط ويجد رقم العميل بنفسه
  // لكن workflow الحالي يتوقع phoneNumber في الـ body.
  // لذلك نعدل الـ Code node قليلاً (سنفعلها لاحقاً) – لكن حالياً نرسل phoneNumber.
  // لتبسيط الأمر: سنطلب من n8n أن يقبل conversationId ويجلب رقم الهاتف تلقائياً.
  // سأعطيك تعديل بسيط في n8n بعد هذا الكود.
  // مؤقتاً: سأستخدم conversationId فقط وسأعدل n8n.
  
  const res = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId: conversation_id, content }),
  });
  if (!res.ok) throw new Error('Failed to send message');
}

// ----------------------------------------------
// 4. مؤقتاً: البث والقوالب والإحصائيات (تعيد بيانات وهمية حتى نضيفها في n8n)
// ----------------------------------------------
export async function fetchBroadcasts(): Promise<Broadcast[]> {
  // مؤقتاً نعيد مصفوفة فارغة
  return [];
}

export async function fetchTemplates(): Promise<Template[]> {
  return [];
}

export async function fetchDashboardStats() {
  // مؤقتاً نعيد إحصائيات وهمية
  return {
    totalLeads: 12484,
    activeChats: 142,
    revenue: 34314,
    aiResolutionRate: 84.5,
    chartData: [
      { date: "Mon", leads: 45, conversions: 12, revenue: 4788 },
      { date: "Tue", leads: 52, conversions: 15, revenue: 5985 },
      { date: "Wed", leads: 38, conversions: 10, revenue: 3990 },
      { date: "Thu", leads: 65, conversions: 22, revenue: 8778 },
      { date: "Fri", leads: 48, conversions: 14, revenue: 5586 },
      { date: "Sat", leads: 25, conversions: 5, revenue: 1995 },
      { date: "Sun", leads: 30, conversions: 8, revenue: 3192 },
    ]
  };
}