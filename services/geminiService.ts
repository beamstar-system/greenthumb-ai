import { GoogleGenAI, Type, Chat } from "@google/genai";
import { PlantData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-pro-preview';

export const analyzePlantImage = async (base64Image: string, mimeType: string): Promise<PlantData> => {
  const schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Common name of the plant" },
      scientificName: { type: Type.STRING, description: "Scientific Latin name" },
      description: { type: Type.STRING, description: "A brief, engaging description of the plant (max 2 sentences)." },
      care: {
        type: Type.OBJECT,
        properties: {
          water: { type: Type.STRING, description: "Watering frequency and tips" },
          sun: { type: Type.STRING, description: "Light requirements (e.g. Full Sun, Partial Shade)" },
          soil: { type: Type.STRING, description: "Preferred soil type" },
          temperature: { type: Type.STRING, description: "Ideal temperature range" },
          fertilizer: { type: Type.STRING, description: "Fertilizer needs" },
        },
        required: ["water", "sun", "soil", "temperature", "fertilizer"]
      },
      funFact: { type: Type.STRING, description: "One interesting fact about this plant." },
      problems: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of 2-3 common pests or diseases to watch out for."
      }
    },
    required: ["name", "scientificName", "description", "care", "funFact", "problems"]
  };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image
          }
        },
        {
          text: "Identify this plant and provide detailed care instructions. If it is not a plant, return a JSON with empty fields but indicate in the description that it is not a plant."
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are an expert botanist. Be precise, helpful, and encouraging."
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(response.text) as PlantData;
};

let chatSession: Chat | null = null;

export const initializeChat = (plantContext?: PlantData) => {
  const systemInstruction = plantContext 
    ? `You are GreenThumb, a gardening assistant. The user is currently looking at a plant identified as ${plantContext.name} (${plantContext.scientificName}). 
       Here is some context about it: ${plantContext.description}. Care info: Water(${plantContext.care.water}), Sun(${plantContext.care.sun}).
       Answer their questions about this specific plant or general gardening advice. Keep answers concise (under 100 words) unless asked for more detail.`
    : `You are GreenThumb, a helpful gardening assistant. Answer questions about plants, gardening, and botany. Keep answers concise.`;

  chatSession = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: systemInstruction,
    }
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    initializeChat();
  }
  
  if (!chatSession) {
      throw new Error("Chat session failed to initialize");
  }

  const result = await chatSession.sendMessage({ message });
  return result.text || "I'm sorry, I couldn't generate a response.";
};