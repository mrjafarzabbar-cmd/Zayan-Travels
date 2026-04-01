import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getTravelAdvice(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a professional travel consultant for Zayan Travels. Your goal is to help users find the perfect travel package based on their interests, budget, and preferred climate. Be enthusiastic, helpful, and concise. Suggest destinations like Bali, Swiss Alps, Kyoto, Santorini, or Safari in Kenya.",
    },
  });
  return response.text;
}
