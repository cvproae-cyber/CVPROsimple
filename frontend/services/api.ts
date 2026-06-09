import { Customer, Conversation, Message, Broadcast, Template } from '../types';

// Using environment variable for production flexibility
const N8N_URL = import.meta.env.VITE_N8N_URL || 'https://n8n-1046523361460.me-west1.run.app';
const API_BASE = `${N8N_URL}/webhook`;

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
  content: string
): Promise<void> {
  // Aligned with sequential n8n flow: inserts and updates last_message, then triggers WhatsApp
  const res = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId: conversation_id, content }),
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
  const res = await fetch(`${API_BASE}/broadcasts`);
  if (!res.ok) return []; // Fallback to empty
  return res.json();
}

export async function fetchTemplates(): Promise<Template[]> {
  const res = await fetch(`${API_BASE}/templates`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}