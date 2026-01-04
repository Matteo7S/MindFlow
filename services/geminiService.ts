
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ExerciseType } from "../types";

/**
 * REQUISITO: GoogleGenAI deve essere istanziato solo quando necessario.
 */
const getAIClient = () => {
  // @ts-ignore
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : (window as any).GEMINI_API_KEY;
  
  if (!apiKey || apiKey.trim() === "" || apiKey === "undefined") {
    throw new Error("API_KEY_NOT_FOUND");
  }
  return new GoogleGenAI({ apiKey });
};

// Mappa interna per spiegare al modello cosa deve generare per ogni tipo
const EXERCISE_DESCRIPTIONS: Record<string, string> = {
  [ExerciseType.PHONEMIC]: "Sfida di fluenza fonemica: l'utente deve dire quante più parole possibile che iniziano con una specifica LETTERA (es. 'Parole che iniziano con la P').",
  [ExerciseType.SEMANTIC]: "Sfida di fluenza semantica: l'utente deve dire parole appartenenti a una CATEGORIA specifica (es. 'Animali della savana').",
  [ExerciseType.CHAIN_ASSOCIATION]: "Sfida di associazioni a catena: l'utente deve dire una parola, poi una associata alla precedente, creando un ponte logico continuo.",
  [ExerciseType.SPIDER_ASSOCIATION]: "Sfida del ragno: l'utente deve dire quante più parole associate a un CONCETTO CENTRALE (es. 'Mare').",
  [ExerciseType.PERIPHRASIS]: "Sfida di perifrasi: l'utente deve descrivere un oggetto comune SENZA mai dire il suo nome o tre parole proibite correlate.",
  [ExerciseType.FLASH_DESCRIPTION]: "Sfida di descrizione flash: genera una scena o un oggetto insolito che l'utente deve descrivere nei minimi dettagli.",
  [ExerciseType.SYNONYMS]: "Sfida dei sinonimi: dai una parola complessa e chiedi all'utente di fornire quanti più sinonimi o termini correlati per registro linguistico.",
  [ExerciseType.SHADOWING]: "Sfida di shadowing: genera un breve testo (3-4 frasi) con un ritmo interessante che l'utente dovrà ripetere mentre lo legge."
};

export const getTheoryExplanation = async (theory: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Spiega questo metodo di apprendimento: ${theory}`,
      config: { systemInstruction: "Sei un coach esperto in neuroscienze. Spiega in modo motivante e chiaro." }
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
    contents: `Esercizio: ${type}, Fase: ${phase}, Input Utente: ${userTranscript}, Storia: ${history.join('|')}`,
    config: {
      systemInstruction: "Sei un tutor interattivo di MindFlow. Aiuta l'utente a praticare mnemotecniche. Sii breve, incoraggiante e guida l'utente passo dopo passo.",
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
    contents: `Tipo: ${type}. Sfida assegnata: ${setupPrompt}. Vincoli: ${constraints || 'Nessuno'}. Trascrizione utente: ${transcript}`,
    config: {
      systemInstruction: "Sei un valutatore di fluenza verbale. Analizza la trascrizione. Conta le parole valide che rispettano la sfida. Identifica errori o ripetizioni. Fornisci un punteggio da 0 a 100.",
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
  const description = EXERCISE_DESCRIPTIONS[type] || "Esercizio cognitivo di fluenza.";
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Genera una sfida specifica per questo esercizio: ${description}`,
    config: {
      systemInstruction: "Sei un trainer cognitivo. Genera sfide in ITALIANO. La 'prompt' deve essere l'istruzione diretta per l'utente (es. 'Dimmi tutti i frutti che iniziano con la S'). I 'constraints' sono regole aggiuntive (es. 'Non usare nomi propri'). Sii creativo e varia le sfide ogni volta.",
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
