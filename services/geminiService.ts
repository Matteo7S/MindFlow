
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ExerciseType } from "../types";

/**
 * REQUISITO: GoogleGenAI deve essere istanziato solo quando necessario.
 */
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("API_KEY_NOT_FOUND");
  }
  return new GoogleGenAI({ apiKey });
};

export const getTheoryExplanation = async (theory: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Spiega questo metodo di apprendimento: ${theory}`,
      config: { systemInstruction: "Sei un coach esperto in neuroscienze." }
    });
    return response.text || "";
  } catch (e) {
    console.error("AI Error:", e);
    throw e;
  }
};

export const getSpeechData = async (text: string): Promise<string | undefined> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (e) {
    console.error("TTS Error:", e);
    return undefined;
  }
};

export const getTutorResponse = async (type: ExerciseType, phase: string, userTranscript: string, history: string[]) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Esercizio: ${type}, Fase: ${phase}, Input: ${userTranscript}, Storia: ${history.join('|')}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          nextPhase: { type: Type.STRING },
          isComplete: { type: Type.BOOLEAN },
          feedback: { type: Type.STRING }
        },
        required: ["text", "nextPhase", "isComplete", "feedback"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const evaluateExercise = async (type: ExerciseType, setupPrompt: string, transcript: string, constraints?: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Valuta ${type}. Prompt: ${setupPrompt}. ${constraints ? `Vincoli: ${constraints}.` : ''} Input: ${transcript}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          validWords: { type: Type.ARRAY, items: { type: Type.STRING } },
          invalidWords: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["score", "feedback", "validWords", "invalidWords"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getExerciseSetup = async (type: ExerciseType) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Genera un setup per ${type}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prompt: { type: Type.STRING },
          constraints: { type: Type.STRING }
        },
        required: ["prompt"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};
