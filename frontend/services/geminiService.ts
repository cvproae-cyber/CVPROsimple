import { CVAnalysisResult } from '../types';
import { triggerN8nWorkflow } from './api';

// Use the same n8n base URL as in api.ts
const N8N_URL = import.meta.env.VITE_N8N_URL || 'https://n8n-1046523361460.me-west1.run.app';
const N8N_ANALYZE_WEBHOOK = `${N8N_URL}/webhook/api/analyze-cv`;

export async function analyzeCVText(cvText: string): Promise<CVAnalysisResult> {
  if (!cvText.trim()) throw new Error("CV text is empty");
  
  try {
    // Delegate the work to n8n, which uses Vertex AI with the JSON Service Account
    return await triggerN8nWorkflow(N8N_ANALYZE_WEBHOOK, { cvText });
  } catch (error) {
    console.error("Error analyzing CV:", error);
    throw new Error("The AI backend is currently unavailable.");
  }
}

export async function generateChatReply(historyText: string, userMessage: string): Promise<string> {
  // Chat replies are handled by the n8n WhatsApp workflow automatically.
  // This function can be used for the internal dashboard chat if needed.
  try {
    const data = await triggerN8nWorkflow('/api/chat/reply', { historyText, userMessage });
    return data.reply;
  } catch (error) {
    console.error("Error generating chat reply:", error);
    return "Sorry, I am having trouble connecting to my brain right now.";
  }
}