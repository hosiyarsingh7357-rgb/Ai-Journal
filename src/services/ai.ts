import { GoogleGenAI, Type } from "@google/genai";

// Minimum time between actual API calls (5 minutes)
const MIN_API_INTERVAL = 5 * 60 * 1000;

// Simple hash function to create a cache key from trades
const getTradesHash = (trades: any[]) => {
  if (!trades || trades.length === 0) return "empty";
  // Use a combination of trade IDs and their P&L to detect changes
  const str = trades.map(t => `${t.id || ''}-${t.pnl || ''}-${t.isWinner || ''}`).join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `ai_report_cache_${hash}`;
};

export const generateAIReport = async (trades: any[], forceRefresh = false) => {
  if (!trades || trades.length === 0) return null;

  const cacheKey = getTradesHash(trades);
  const cachedReport = localStorage.getItem(cacheKey);
  const lastCallTime = parseInt(localStorage.getItem('ai_report_last_call') || '0');
  const now = Date.now();
  
  // Return cached report if available and not forcing refresh
  if (cachedReport && !forceRefresh) {
    console.log("Using cached AI report");
    return cachedReport;
  }

  // If we're not forcing refresh, check if we're in the cooldown period
  if (!forceRefresh && (now - lastCallTime < MIN_API_INTERVAL)) {
    console.log("AI report cooldown active. Using last available report if any.");
    const latest = localStorage.getItem('ai_report_latest');
    if (latest) return latest;
    return null;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }
  
  const maxRetries = 2;
  let retryCount = 0;

  const attemptCall = async (): Promise<string | null> => {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
    You are an elite quantitative trading psychologist and risk management expert at a top-tier proprietary trading firm.
    Analyze the provided trading history and generate a comprehensive, brutal, and highly actionable performance report.
    
    Trading Data:
    ${JSON.stringify(trades)}
    
    Your analysis must go beyond basic metrics. Focus on:
    1. Identifying the core edge: What specific setups, times, or assets are actually generating alpha?
    2. Pinpointing exact leaks: Where is the trader bleeding capital? Is it revenge trading, poor position sizing, or holding losers too long?
    3. Psychological profiling: What behavioral biases are evident in the data?
    4. Actionable Intelligence: Provide highly specific, rule-based adjustments to implement immediately. No generic advice.
    
    Format the response strictly according to the requested JSON schema.
    `;

      // Use gemini-3-flash-preview for much better rate limits (15 RPM vs 2 RPM for Pro)
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              grade: { type: Type.STRING, description: "Performance grade (e.g., A, B+, C-)" },
              summary: { type: Type.STRING, description: "A brutal, honest 2-sentence summary of their trading." },
              strengths: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    desc: { type: Type.STRING }
                  }
                }
              },
              weaknesses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    desc: { type: Type.STRING }
                  }
                }
              },
              actionPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    desc: { type: Type.STRING },
                    priority: { type: Type.STRING, description: "e.g., Immediate Priority, Strategic Shift, Behavioral Goal" }
                  }
                }
              }
            },
            required: ["grade", "summary", "strengths", "weaknesses", "actionPlan"]
          }
        }
      });
      
      const text = response.text;
      if (text) {
        localStorage.setItem('ai_report_last_call', Date.now().toString());
        localStorage.setItem(cacheKey, text);
        localStorage.setItem('ai_report_latest', text);
        
        const keys = Object.keys(localStorage).filter(k => k.startsWith('ai_report_cache_'));
        if (keys.length > 5) {
          keys.sort().slice(0, keys.length - 5).forEach(k => localStorage.removeItem(k));
        }
      }
      
      return text;
    } catch (error: any) {
      console.error(`AI Report Generation Error (Attempt ${retryCount + 1}):`, error);
      
      if ((error.message?.includes("429") || error.status === 429 || error.message?.includes("quota")) && retryCount < maxRetries) {
        retryCount++;
        const waitTime = retryCount * 2000; // Exponential-ish backoff
        console.log(`Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return attemptCall();
      }
      
      const latest = localStorage.getItem('ai_report_latest');
      if (latest) {
        const parsed = JSON.parse(latest);
        parsed.summary = "(Quota Reached) " + parsed.summary;
        return JSON.stringify(parsed);
      }

      return JSON.stringify({
        grade: "N/A",
        summary: "AI Intelligence is currently at capacity. Please try again in a few minutes.",
        strengths: [],
        weaknesses: [],
        actionPlan: []
      });
    }
  };

  return attemptCall();
};
