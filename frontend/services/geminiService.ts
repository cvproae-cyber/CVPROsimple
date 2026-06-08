import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { CVAnalysisResult } from '../types';

// Initialize the SDK. Assumes process.env.API_KEY is available in the environment.
const API_KEY = process.env.API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function analyzeCVText(cvText: string): Promise<CVAnalysisResult> {
  if (!API_KEY) {
    throw new Error("Gemini API Key is missing. Please check your environment variables.");
  }

  const prompt = `
    You are an expert ATS and HR professional for the UAE/Gulf market.
    Analyze the following CV text and provide a structured evaluation.
    
    CV Text:
    ${cvText}
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            score: {
              type: SchemaType.INTEGER,
              description: 'Overall ATS compatibility score from 0 to 100.',
            },
            strengths: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: 'List of key strengths found in the CV.',
            },
            weaknesses: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: 'List of weaknesses or areas for improvement.',
            },
            sales_pitch: {
              type: SchemaType.STRING,
              description: 'A short, persuasive pitch (max 50 words) to convince the candidate to buy a CV writing service based on their weaknesses.',
            },
            personalized_offer: {
              type: SchemaType.STRING,
              description: 'A personalized discount code or offer (e.g., "USE CODE PRO20 for 20% off").',
            },
          },
          required: ['score', 'strengths', 'weaknesses', 'sales_pitch', 'personalized_offer'],
        },
      },
    });

    const responseText = result.response.text();
    if (responseText) {
      return JSON.parse(responseText) as CVAnalysisResult;
    }
    throw new Error("Empty response from model");
  } catch (error) {
    console.error("Error analyzing CV:", error);
    throw error;
  }
}

export async function generateChatReply(historyText: string, userMessage: string): Promise<string> {
  const systemInstruction = `
    You are a professional and friendly sales assistant for CVPro.ae, operating in the UAE/Gulf market.
    Your goal is to help users understand the value of a professional CV and guide them towards purchasing a package.
    Keep responses concise, helpful, and persuasive. Do not invent prices unless asked, standard package is 399 AED.
    If the user asks to speak to a human, acknowledge it politely.
  `;

  const prompt = `
    Conversation History:
    ${historyText}
    
    User: ${userMessage}
    AI Agent:
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });
    return result.response.text() || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Error generating chat reply:", error);
    return "Sorry, I am having trouble connecting to my brain right now.";
  }
}
