import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async generateInsights(tradeData: any) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    // TODO: Call Gemini API
    console.log('Generating insights for:', tradeData);
    return { insights: 'Mock insights' };
  }
};
