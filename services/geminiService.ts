
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const analyzeSoraLink = async (url: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this OpenAI Sora video link: ${url}. 
    Based on the URL structure and common Sora patterns, imagine the cinematic prompt that created it. 
    Provide a professional breakdown in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "A one sentence summary of what this video might contain." },
          predictedPrompt: { type: Type.STRING, description: "A cinematic AI prompt for this video." },
          style: { type: Type.STRING, description: "The visual style (e.g., Cyberpunk, Hyper-realistic, 35mm film)." }
        },
        required: ["description", "predictedPrompt", "style"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return null;
  }
};
