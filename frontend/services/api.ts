import { Customer, Conversation, Message, Broadcast, Template } from '../types';

// PRODUCTION URL: Replace with your actual n8n instance URL
// Ensure it ends with /webhook so that paths like /api/customers work correctly.
const N8N_INSTANCE_URL = 'https://n8n.yourdomain.com'; 
const API_BASE = `${N8N_INSTANCE_URL}/webhook`;

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
  const res = await fetch(url, { method: 'PUT' }); // n8n expects PUT with query params
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
  // Aligned with n8n "Extract Message Params" node
  
  const res = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId: conversation_id, customerId: customer_id, content }),
  });
  if (!res.ok) throw new Error('Failed to send message');
}

// ----------------------------------------------
// 4. n8n Workflow Triggers
// ----------------------------------------------
export async function triggerN8nWorkflow(webhookUrl: string, data: any): Promise<any> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Workflow trigger failed');
  return res.json();
}

// ----------------------------------------------
// 5. مؤقتاً: البث والقوالب والإحصائيات
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