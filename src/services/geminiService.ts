import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getPackingSuggestions(destination: string, tripType: string, weather: string) {
  try {
    const prompt = `Act as a travel expert. My family is going to ${destination} for a ${tripType} trip. 
    The expected weather is ${weather}. 
    Suggest 5 unique, must-have items for our packing list that are specific to this destination and trip type. 
    Provide the response as a JSON array of strings. 
    Example format: ["Waterproof phone pouch", "Portable solar charger", "Compact travel umbrella"]`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return [];
  }
}
