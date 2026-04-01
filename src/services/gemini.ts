import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please ensure it's configured in the environment.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getTravelAdvice(prompt: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a professional travel consultant for Zayan Travels. Your goal is to help users find the perfect travel package based on their interests, budget, and preferred climate. Be enthusiastic, helpful, and concise. Suggest destinations like Bali, Swiss Alps, Kyoto, Santorini, or Safari in Kenya.",
    },
  });
  return response.text;
}
