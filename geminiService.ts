
import { GoogleGenAI, Type } from "@google/genai";

// Gemini API key - will be injected by Vite
// @ts-ignore
const apiKey = typeof __VITE_GEMINI_API_KEY__ !== 'undefined' ? __VITE_GEMINI_API_KEY__ : '';

console.log('🤖 Gemini API Key status:', apiKey ? '✓ Loaded' : '✗ Not configured (AI features disabled)');

let ai: any = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn('⚠️ Failed to initialize Gemini:', error);
  }
}

export async function suggestFieldsForWorkType(workTypeName: string) {
  // Return empty array if Gemini is not configured
  if (!ai) {
    console.warn('⚠️ Gemini API not configured. AI field suggestions disabled.');
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `I am building a database table for a professional office task called "${workTypeName}". 
      Suggest a JSON list of 5-8 essential fields needed for this.
      Focus on things like Customer Name, ID numbers (PAN, GSTIN), Dates (Issue Date, Expiry Date), and Status.
      Mark one as 'isPrimary' (true for things like Customer Name) and one as 'isExpiry' (true for deadline dates).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['text', 'number', 'date', 'select'] },
              required: { type: Type.BOOLEAN },
              isExpiry: { type: Type.BOOLEAN },
              isPrimary: { type: Type.BOOLEAN }
            },
            required: ['label', 'type', 'required', 'isExpiry', 'isPrimary']
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return [];
  }
}
