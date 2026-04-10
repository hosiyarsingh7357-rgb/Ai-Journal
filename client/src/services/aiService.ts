import { Trade } from "@shared/types";
import { useAppStore } from "../store/useAppStore";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI directly in the frontend as per SKILL.md
// The environment provides GEMINI_API_KEY automatically
const rawKey = process.env.GEMINI_API_KEY || '';
const apiKey = rawKey.replace(/['"]/g, '').trim();

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing! If you are on Vercel, please add GEMINI_API_KEY or VITE_GEMINI_API_KEY to your Vercel Environment Variables and REDEPLOY.");
} else {
  console.log("Gemini API Key loaded successfully. Starts with:", apiKey.substring(0, 4) + "...");
}

const ai = new GoogleGenAI({ 
  apiKey: apiKey || 'missing_key' // Provide a dummy key to prevent crash on init, it will fail on call
});

// Persistent cache for AI reports using localStorage
const CACHE_KEY_PREFIX = 'ai_report_cache_';

const callGeminiAI = async (prompt: string, config?: any) => {
  try {
    if (!apiKey || apiKey === 'missing_key') {
      throw new Error("Gemini API Key is missing. Please configure GEMINI_API_KEY in your Vercel Environment Variables and redeploy.");
    }

    console.log("Calling Gemini AI from frontend. Prompt length:", prompt.length);
    
    // Use gemini-3-flash-preview for general tasks as per SKILL.md
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        ...config
      }
    });

    const text = response.text || "";
    console.log("Gemini AI call successful, response length:", text.length);
    return text;
  } catch (error: any) {
    console.error("Gemini AI Error in Frontend:", error);
    
    // Handle quota errors
    if (error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('quota')) {
      const { setAiBlocked } = useAppStore.getState();
      setAiBlocked(true, Date.now() + 5 * 60 * 1000);
    }
    
    throw error;
  }
};

const getCachedReport = (key: string) => {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache valid for 24 hours
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return data;
      }
    }
  } catch (e) {
    console.error("Cache read error:", e);
  }
  return null;
};

const setCachedReport = (key: string, data: string) => {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error("Cache write error:", e);
  }
};

export const generateAIReport = async (trades: Trade[], fullReport: boolean = false, forceRefresh: boolean = false) => {
  if (!trades || trades.length === 0) return null;

  const { isAiBlocked, aiBlockedUntil, setAiBlocked } = useAppStore.getState();

  // Check if AI is currently blocked due to quota
  if (isAiBlocked && aiBlockedUntil && Date.now() < aiBlockedUntil) {
    const error = new Error('AI Quota Exceeded');
    (error as any).status = 'RESOURCE_EXHAUSTED';
    throw error;
  } else if (isAiBlocked) {
    // Block expired
    setAiBlocked(false);
  }

  const tradeSummary = trades.map(t => ({
    symbol: t.symbol,
    type: t.type,
    pnl: t.pnl,
    isWinner: t.isWinner,
    date: t.exitDate || t.entryDate
  }));

  const cacheKey = btoa(JSON.stringify({ tradeSummary, fullReport })).slice(0, 32);
  if (!forceRefresh) {
    const cached = getCachedReport(cacheKey);
    if (cached) return cached;
  }

  const prompt = fullReport 
    ? `Analyze these trades and provide a detailed psychological performance report.
       CRITICAL: Use very simple, everyday language (Hinglish / aasan bhasha) that a beginner can easily understand.
       CRITICAL: You MUST return ONLY a valid JSON object. DO NOT include any text outside the JSON.
       The JSON MUST have exactly these keys:
       - "sahi": a string describing "KYA SAHI HUAA" (What went right)
       - "galt": a string describing "KYA GALT HUAA" (What went wrong)
       - "dhyan": a string describing "KIS PAR DHYAN DENA CHAHIYE" (What to focus on)
       
       Trades data: ${JSON.stringify(tradeSummary)}`
    : `Analyze these trades and provide a structured AI insight report in JSON format. 
       CRITICAL: Use very simple, normal language (Hinglish) that anyone can understand easily. Avoid complex trading jargon. Write as if you are explaining to a friend.
       CRITICAL: You MUST return ONLY a valid JSON object. DO NOT include any text outside the JSON.
       The JSON MUST have exactly these keys (all lowercase):
       - "summary": a brief 1-sentence overview of performance in simple Hinglish
       - "strengths": an array of objects with a "desc" field (e.g. [{"desc": "Aapne gold me loss kam liya, ye achhi baat hai"}])
       - "weaknesses": an array of objects with a "desc" field (e.g. [{"desc": "Aap jaldi trade close kar rahe hain"}])
       - "actionPlan": an array of objects with "title" and "desc" fields (e.g. [{"title": "Patience", "desc": "Trade ko thoda aur time dein"}])
       
       Example of valid response:
       {
         "summary": "Aapki trading theek chal rahi hai, bas thoda sabar rakhne ki zaroorat hai.",
         "strengths": [{"desc": "Risk management achha hai"}],
         "weaknesses": [{"desc": "Loss wale trades ko lamba hold kar rahe hain"}],
         "actionPlan": [{"title": "Stop Loss", "desc": "Stop loss hit hone par turant exit karein"}]
       }

       Trades data: ${JSON.stringify(tradeSummary)}`;

  try {
    const text = await callGeminiAI(prompt, {
      responseMimeType: "application/json"
    });

    if (text) {
      setCachedReport(cacheKey, text);
    }
    return text;
  } catch (error: any) {
    console.error("AI Generation Error in Service:", error);
    return null;
  }
};

export const analyzeNews = async (news: any[]) => {
  if (!news || news.length === 0) return 'No news to analyze.';

  const prompt = `Analyze this economic news: ${JSON.stringify(news.slice(0, 5))}.
     Provide a summary in natural language (aasan bhasa) using bullet points.
     Structure the summary with these points:
     - Past Context: What happened before this event.
     - Current Situation: What is happening now.
     - Future Implications: What could happen next.
     
     Do NOT return JSON. Return only the bulleted summary.`;

  try {
    const text = await callGeminiAI(prompt);
    return text || "No analysis available.";
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return "An error occurred while analyzing news.";
  }
};

export const generateTradeInsight = async (trade: any) => {
  const { isAiBlocked, aiBlockedUntil } = useAppStore.getState();

  if (isAiBlocked && aiBlockedUntil && Date.now() < aiBlockedUntil) {
    const error = new Error('AI Quota Exceeded');
    (error as any).status = 'RESOURCE_EXHAUSTED';
    throw error;
  }

  const prompt = `
    Analyze this trading performance and provide a very simple, easy-to-understand summary (max 3 sentences). 
    CRITICAL: Use normal, everyday language (Hinglish / aasan bhasha) that a beginner trader would understand easily. Avoid complex financial jargon.
    Explain clearly what went wrong or what was done correctly.
    
    Trade: ${trade.symbol} ${trade.type}
    Result: ${trade.isWinner ? 'WON' : 'LOST'} (${trade.pnl})
    Pre-Trade Analysis: ${trade.journal?.preTradeAnalysis}
    Post-Trade Review: ${trade.journal?.postTradeReview}
    Emotions: ${trade.journal?.emotions}
    Lessons: ${trade.journal?.lessonsLearned}
    
    Focus on execution, psychology, and technical discipline. Provide simple, actionable advice in Hinglish.
  `;

  try {
    const text = await callGeminiAI(prompt);
    return text || "No insights available.";
  } catch (error: any) {
    console.error("AI Insight Error:", error);
    return null;
  }
};

export const chatWithSupportAI = async (message: string, chatHistory: { role: 'user' | 'model', content: string }[], trades: any[] = []) => {
  const tradeSummary = trades.map(t => ({
    date: t.exitDate || t.entryDate,
    symbol: t.symbol,
    type: t.type,
    pnl: t.pnl,
    isWinner: t.isWinner,
    notes: t.journal?.postTradeReview || t.journal?.lessonsLearned || ''
  }));

  const systemInstruction = `You are the Advanced AI Trading Assistant & Support Bot for "AI Journal".
Your goal is to help users with their questions about the website, trading features, AND their personal trading data.

Key information about AI Journal:
- It helps traders track execution history, analyze performance, and provides AI-driven psychological and behavioral insights.
- Contact email: hosiyarsingh7357@gmail.com
- Live chat is available 24/5 during market hours.

USER'S ACTUAL TRADING DATA (JSON):
${JSON.stringify(tradeSummary)}

Instructions for analyzing trades:
- If the user asks about a specific date, check the trading data for that date.
- If they ask how many trades they took, count them from the data.
- If they ask which pairs they traded, list the symbols.
- If they ask about their mistakes or what to improve, analyze their losing trades and their notes, and give them actionable advice (e.g., "You are losing mostly on XAUUSD, you need to work on patience").
- Act as a personal trading coach.
- Be helpful, concise, and friendly. Use Hinglish (Hindi + English) or English based on the user's language.`;

  const contents = chatHistory.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));
  
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: systemInstruction
      }
    });
    return response.text || "Sorry, I couldn't process that.";
  } catch (error) {
    console.error("Support Chat Error:", error);
    throw error;
  }
};
