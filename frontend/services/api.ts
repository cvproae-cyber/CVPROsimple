import { Customer, Conversation, Message, Channel, Broadcast, Template } from '../types';

// دالة للاستماع للتغييرات الفورية (Realtime)
// TODO: Migration to WebSockets or Polling via Node.js Backend
export function subscribeToMessages(callback: (payload: any) => void) {
  console.warn('Realtime subscription currently disabled - pending backend migration');
}

// ==========================================
// SUPABASE DATABASE FUNCTIONS
// ==========================================

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const response = await fetch('/api/customers'); // Example path for new backend
    if (!response.ok) throw new Error('Failed to fetch customers');
    return await response.json();
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

export async function updateCustomerStage(id: string, stage: string): Promise<void> {
  try {
    const response = await fetch(`/api/customers/${id}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage })
    });
    if (!response.ok) throw new Error('Failed to update stage');
  } catch (error) {
    console.error('Error updating customer stage:', error);
    throw error;
  }
}

export async function fetchConversations(): Promise<Conversation[]> {
  try {
    const response = await fetch('/api/conversations');
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return await response.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  try {
    const response = await fetch(`/api/conversations/${conversationId}/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function insertOutboundMessage(conversationId: string, customerId: string, content: string): Promise<void> {
  try {
    const response = await fetch(`/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, customerId, content })
    });
    if (!response.ok) throw new Error('Failed to send message');
  } catch (error) {
    console.error('Error inserting message:', error);
    throw error;
  }
}

export async function toggleHumanTakeover(conversationId: string, humanTakeover: boolean): Promise<void> {
  try {
    const response = await fetch(`/api/conversations/${conversationId}/ai-toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ humanTakeover })
    });
    if (!response.ok) throw new Error('Failed to toggle AI');
  } catch (error) {
    console.error('Error toggling AI:', error);
    throw error;
  }
}

export async function fetchBroadcasts(): Promise<Broadcast[]> {
  try {
    const response = await fetch('/api/broadcasts');
    if (!response.ok) throw new Error('Failed to fetch broadcasts');
    return await response.json();
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    return [];
  }
}

export async function fetchTemplates(): Promise<Template[]> {
  try {
    const response = await fetch('/api/templates');
    if (!response.ok) throw new Error('Failed to fetch templates');
    return await response.json();
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}

export async function fetchDashboardStats() {
  try {
    const response = await fetch('/api/dashboard/stats');
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

    // Mock chart data for now (in a real app, this would come from daily_analytics table)
    const chartData = [
      { date: "Mon", leads: 45, conversions: 12, revenue: 4788 },
      { date: "Tue", leads: 52, conversions: 15, revenue: 5985 },
      { date: "Wed", leads: 38, conversions: 10, revenue: 3990 },
      { date: "Thu", leads: 65, conversions: 22, revenue: 8778 },
      { date: "Fri", leads: 48, conversions: 14, revenue: 5586 },
      { date: "Sat", leads: 25, conversions: 5, revenue: 1995 },
      { date: "Sun", leads: 30, conversions: 8, revenue: 3192 },
    ];

    return {
      totalLeads: leadsCount || 0,
      activeChats: activeChats || 0,
      revenue: revenue || 0,
      aiResolutionRate: 84.5, // Mocked percentage
      chartData
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

// ==========================================
// N8N WEBHOOK FUNCTIONS
// ==========================================

/**
 * Triggers an n8n webhook to start an automation workflow.
 * @param webhookUrl The full URL of the n8n webhook (e.g., https://n8n.yourdomain.com/webhook/broadcast)
 * @param payload The data to send to n8n
 */
export async function triggerN8nWorkflow(webhookUrl: string, payload: any): Promise<any> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error triggering n8n workflow:', error);
    throw error;
  }
}
