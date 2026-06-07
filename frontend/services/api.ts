import { supabase } from './supabaseClient';
import { Customer, Conversation, Message, Channel, Broadcast, Template } from '../types';

// دالة للاستماع للتغييرات الفورية (Realtime)
export function subscribeToMessages(callback: (payload: any) => void) {
  return supabase
    .channel('public:messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => callback(payload)
    )
    .subscribe();
}

// ==========================================
// SUPABASE DATABASE FUNCTIONS
// ==========================================

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    fullName: d.full_name || 'Unknown',
    phone: d.phone_number || '',
    channel: 'whatsapp' as Channel, // Defaulting for UI mapping
    stage: d.lead_stage || 'new',
    intentScore: d.buying_intent_score || 0,
    language: d.language || 'ar',
    country: d.country || 'AE',
    ltvAED: d.ltv_aed || 0,
    createdAt: d.created_at
  }));
}

export async function updateCustomerStage(id: string, stage: string): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .update({ lead_stage: stage, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating customer stage:', error);
    throw error;
  }
}

export async function fetchConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversation_summary') // القراءة من الـ View الذكي
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    customerId: d.customer_id,
    customerName: d.customer_name || 'Unknown',
    channel: (d.channel as Channel) || 'whatsapp',
    aiEnabled: !d.human_takeover,
    lastMessage: d.last_message || 'No messages yet', // الآن تظهر آخر رسالة حقيقية!
    updatedAt: d.updated_at,
    unreadCount: 0,
    status: d.status || 'open'
  }));
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    conversationId: d.conversation_id,
    content: d.content,
    direction: d.direction as 'inbound' | 'outbound',
    isAiGenerated: d.is_ai_generated,
    timestamp: d.created_at
  }));
}

export async function insertOutboundMessage(conversationId: string, customerId: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      customer_id: customerId,
      direction: 'outbound',
      content: content,
      is_ai_generated: false,
      channel: 'web'
    });

  if (error) {
    console.error('Error inserting message:', error);
    throw error;
  }
}

export async function toggleHumanTakeover(conversationId: string, humanTakeover: boolean): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ human_takeover: humanTakeover, updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (error) {
    console.error('Error toggling AI:', error);
    throw error;
  }
}

export async function fetchBroadcasts(): Promise<Broadcast[]> {
  const { data, error } = await supabase
    .from('broadcasts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching broadcasts:', error);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    name: d.name,
    channel: d.channel as Channel | 'all',
    status: d.status,
    sentCount: d.sent_count || 0,
    deliveredCount: d.delivered_count || 0,
    readCount: d.read_count || 0,
    createdAt: d.created_at
  }));
}

export async function fetchTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return data.map((d: any) => ({
    id: d.name, // Using name as ID since it's the primary key in the schema
    name: d.name,
    language: d.language,
    category: d.category,
    content: d.content
  }));
}

export async function fetchDashboardStats() {
  try {
    // Fetch aggregate counts
    const { count: leadsCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    const { count: activeChats } = await supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('status', 'open');
    
    // Calculate revenue from won customers
    const { data: wonCustomers } = await supabase.from('customers').select('ltv_aed').eq('lead_stage', 'won');
    const revenue = wonCustomers?.reduce((sum, c) => sum + (Number(c.ltv_aed) || 0), 0) || 0;

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
