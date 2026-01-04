
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ExerciseType } from "../types";

// Inizializziamo l'IA solo quando serve una chiamata
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Chiave API non configurata.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getTheoryExplanation = async (theory: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Spiega questo metodo: ${theory}`,
    config: { systemInstruction: "Sei un coach di mnemotecniche." }
  });
  return response.text || "";
};

export const getSpeechData = async (text: string): Promise<string | undefined> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const getTutorResponse = async (type: ExerciseType, phase: string, userTranscript: string, history: string[]) => {
  const ai = getAI();
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

// Fix: Added the constraints parameter to match the call signature in ActiveExercise.tsx
export const evaluateExercise = async (type: ExerciseType, setupPrompt: string, transcript: string, constraints?: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Valuta l'esercizio di tipo ${type}. 
Prompt originale: ${setupPrompt}
${constraints ? `Vincoli da rispettare: ${constraints}` : ''}
Trascrizione utente: ${transcript}

Fornisci un punteggio da 0 a 100 e un feedback costruttivo sulla performance cognitiva dell'utente.`,
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
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Genera setup per l'esercizio ${type}`,
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
