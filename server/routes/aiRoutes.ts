import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// Initialize Gemini AI lazily on the server
let genAI: any = null;

const getAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set on the server.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

router.post("/analyze", async (req, res) => {
  try {
    const { prompt, config } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAI();
    // Use gemini-3-flash-preview as per SKILL.md
    const model = ai.getGenerativeModel({ model: "gemini-3-flash-preview" });

    console.log("Server: Calling Gemini AI. Prompt length:", prompt.length);
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: config
    });

    const text = result.response.text();
    console.log("Server: Gemini AI call successful. Response length:", text.length);
    
    res.json({ text });
  } catch (error: any) {
    console.error("Server AI Error:", error);
    
    const status = error?.status === 'RESOURCE_EXHAUSTED' ? 429 : 500;
    const message = error?.message || "Internal server error during AI generation";
    
    res.status(status).json({ 
      error: message,
      status: error?.status
    });
  }
});

export default router;
