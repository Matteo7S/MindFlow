
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ExerciseType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Genera una spiegazione colloquiale, esaustiva e strutturata della teoria fornita.
 */
export const getTheoryExplanation = async (theory: string): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  const systemInstruction = `
    Sei il "MindFlow Senior Coach". Trasforma il testo in una lezione magistrale audio.
    Usa un tono da mentore, chiaro e appassionato. Lunghezza: 180-250 parole.
  `;
  
  const response = await ai.models.generateContent({
    model,
    contents: `Testo Sorgente della Teoria: ${theory}`,
    config: { systemInstruction }
  });
  
  return response.text || "Ecco la lezione completa sul metodo.";
};

/**
 * Trasforma il testo in audio PCM raw tramite Gemini TTS.
 */
export const getSpeechData = async (text: string): Promise<string | undefined> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Spiega questo metodo in modo chiaro, scandito e professionale: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const getTutorResponse = async (
  type: ExerciseType,
  phase: string,
  userTranscript: string,
  history: string[]
): Promise<{ text: string; nextPhase: string; isComplete: boolean; feedback: string }> => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    Sei il "MindFlow Tutor". Stai guidando l'utente in uno specifico esercizio di mnemotecnica.
    
    TIPO ESERCIZIO: ${type}

    LOGICA PER ESERCIZIO:
    
    1. SE MNEMONIC_NUMBERS_LEARN:
       - Fase INTRO: "Impareremo i 10 numeri base. Sei pronto? Cominciamo dall'1." (Passa a LEARN_1)
       - Fasi LEARN_1 a LEARN_0: Spiega ogni numero ESATTAMENTE come richiesto (es. 1=candela/T-D, 2=due gambette/N...).
       - Chiedi sempre "Ripeti ad alta voce: [X] è [Suono]". Passa al numero successivo solo dopo che l'utente ha ripetuto correttamente.
       - Dopo lo 0, l'esercizio è completo.

    2. SE MNEMONIC_NUMBERS_PINGPONG:
       - Fase INTRO: "Ora facciamo un test rapido. Io dico il numero, tu dici il suono. Poi invertiamo. Pronto?" (Passa a PING_PONG)
       - Fase PING_PONG: Fai 8 scambi rapidi. Alterna "Numero -> Suono" e "Suono -> Numero". 
       - Sii dinamico. Se l'utente sbaglia, correggilo subito.

    3. SE MNEMONIC_NUMBERS_TARGHE:
       - Fase INTRO: "Convertiremo numeri in parole P.A.V. Iniziamo con 2 cifre." (Passa a TARGHE_2)
       - Fase TARGHE_2: Primi 3 tentativi guidati: "Targa [35]. Suoni [M... L...]. Che parola crei?"
       - Dopo 3 successi a 2 cifre, passa a TARGHE_3. Dopo altri 3, a TARGHE_4.
       - Valuta la correttezza fonetica della parola.

    LOGICA PER ALTRI ESERCIZI (LOCI, NAMES):
       - Guida l'utente attraverso i livelli descritti nella teoria.

    REGOLE GENERALI:
    - Rispondi SEMPRE in JSON.
    - Sii un coach incoraggiante e tecnico.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: `Cronologia: ${history.join('|')} | Input Utente: "${userTranscript}" | Fase Attuale: ${phase}`,
    config: {
      systemInstruction,
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

export const evaluateExercise = async (
  type: ExerciseType,
  setupPrompt: string,
  transcript: string,
  constraints?: string
): Promise<{ score: number; feedback: string; validWords: string[]; invalidWords: string[] }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Valuta ${type}. Prompt: ${setupPrompt}. Input: ${transcript}`,
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
        required: ["score", "feedback", "validWords", "invalidWords"],
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getExerciseSetup = async (type: ExerciseType): Promise<{ prompt: string; constraints?: string }> => {
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
