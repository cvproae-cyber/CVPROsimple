import { Customer, Conversation, Message, Broadcast, Template } from '../types';

// ============================================
// جميع الدوال تستخدم snake_case كما في الخلفية
// ============================================

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const res = await fetch('/api/customers');
    if (!res.ok) throw new Error('Failed to fetch customers');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function updateCustomerStage(id: string, lead_stage: string): Promise<void> {
  const res = await fetch(`/api/customers/${id}/stage`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lead_stage }),
  });
  if (!res.ok) throw new Error('Failed to update stage');
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch('/api/conversations');
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return await res.json();
}

export async function fetchMessages(conversation_id: string): Promise<Message[]> {
  const res = await fetch(`/api/conversations/${conversation_id}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return await res.json();
}

export async function insertOutboundMessage(
  conversation_id: string,
  customer_id: string,
  content: string
): Promise<void> {
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation_id, customer_id, content }),
  });
  if (!res.ok) throw new Error('Failed to send message');
}

export async function toggleHumanTakeover(conversation_id: string, human_takeover: boolean): Promise<void> {
  const res = await fetch(`/api/conversations/${conversation_id}/takeover`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ human_takeover }),
  });
  if (!res.ok) throw new Error('Failed to toggle takeover');
}

export async function fetchBroadcasts(): Promise<Broadcast[]> {
  const res = await fetch('/api/broadcasts');
  if (!res.ok) return [];
  return await res.json();
}

export async function fetchTemplates(): Promise<Template[]> {
  const res = await fetch('/api/templates');
  if (!res.ok) return [];
  return await res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return await res.json();
}

// (يمكن إضافة دوال أخرى مثل triggerN8nWorkflow إذا احتجتها)