import { Customer, Conversation, Message, Broadcast, Template } from '../types';

// Using environment variable for production flexibility
const N8N_URL = import.meta.env.VITE_N8N_URL || 'https://n8n-1046523361460.me-west1.run.app';
// Note: n8n webhooks are defined with paths like /api/customers, not /webhook/api/...
const API_BASE = `${N8N_URL}`;

// ----------------------------------------------
// 1. العملاء
// ----------------------------------------------
export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_BASE}/api/customers`);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export async function updateCustomerStage(id: string, lead_stage: string): Promise<void> {
  const url = `${API_BASE}/api/customers/stage?customerId=${id}&leadStage=${lead_stage}`;
  const res = await fetch(url, { method: 'PUT' });
  if (!res.ok) throw new Error('Failed to update stage');
}

// ----------------------------------------------
// 2. المحادثات
// ----------------------------------------------
export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/api/conversations`);
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
}

export async function fetchMessages(conversation_id: string): Promise<Message[]> {
  const url = `${API_BASE}/api/conversations/messages?conversationId=${conversation_id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function toggleHumanTakeover(conversation_id: string, human_takeover: boolean): Promise<void> {
  const url = `${API_BASE}/api/conversations/takeover?conversationId=${conversation_id}&humanTakeover=${human_takeover}`;
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
  const res = await fetch(`${API_BASE}/api/messages`, {
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
// 5. البث والقوالب والإحصائيات
// ----------------------------------------------
export async function fetchBroadcasts(): Promise<Broadcast[]> {
  const res = await fetch(`${API_BASE}/api/broadcasts`);
  if (!res.ok) return []; // Fallback to empty array, but we'll handle error in component
  return res.json();
}

export async function fetchTemplates(): Promise<Template[]> {
  const res = await fetch(`${API_BASE}/api/templates`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/api/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}