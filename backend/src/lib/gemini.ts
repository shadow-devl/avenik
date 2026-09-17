import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is not set. AI features will fail.");
}

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key_to_prevent_crash_at_boot'
});
