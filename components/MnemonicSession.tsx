
import React, { useState, useEffect, useRef } from 'react';
import { ExerciseConfig, ExerciseType } from '../types';
import { getTutorResponse, getTheoryExplanation, getSpeechData } from '../services/geminiService';

interface MnemonicSessionProps {
  exercise: ExerciseConfig;
  onFinished: (result: any) => void;
  onClose: () => void;
}

const MnemonicSession: React.FC<MnemonicSessionProps> = ({ exercise, onFinished, onClose }) => {
  const [view, setView] = useState<'learning' | 'practicing'>('learning');
  const [phase, setPhase] = useState('INTRO');
  const [tutorText, setTutorText] = useState('Benvenuto! Sei pronto per iniziare questa sessione interattiva?');
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [theoryExplanation, setTheoryExplanation] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Auto-init practice session when entering 'practicing' view
  useEffect(() => {
    if (view === 'practicing' && phase === 'INTRO' && history.length === 0) {
      handleSendResponse();
    }
  }, [view]);

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch(e) {}
      setIsSpeaking(false);
    }
  };

  const playAudio = async (text: string) => {
    stopAudio();
    setIsLoading(true);
    try {
      const base64Audio = await getSpeechData(text);
      if (!base64Audio) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setIsSpeaking(false);
        // Se siamo in pratica, riattiva il microfono automaticamente dopo che il tutor ha parlato
        if (view === 'practicing' && !isLoading) {
          startListening();
        }
      };
      sourceRef.current = source;
      source.start();
      setIsSpeaking(true);
    } catch (error) {
      console.error("Audio Error:", error);
      setIsSpeaking(false);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    if (isSpeaking) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Microfono non supportato.");
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'it-IT';
    recognitionRef.current.onresult = (e: any) => setTranscript(e.results[0][0].transcript);
    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.start();
  };

  const handleSendResponse = async () => {
    if (!transcript && phase !== 'INTRO') return;
    setIsLoading(true);
    stopAudio();
    
    try {
      const response = await getTutorResponse(exercise.id, phase, transcript, history);
      setTutorText(response.text);
      setPhase(response.nextPhase);
      setHistory(prev => [...prev, `Utente: ${transcript}`, `Tutor: ${response.text}`]);
      setTranscript('');
      
      // Il tutor risponde vocalmente
      await playAudio(response.text);

      if (response.isComplete) {
        onFinished({ score: 95, feedback: response.feedback });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className="text-5xl bg-indigo-50 p-4 rounded-3xl">{exercise.icon}</div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800">{exercise.title}</h2>
              <div className="flex gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${view === 'learning' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {view === 'learning' ? 'Teoria & Metodo' : 'Addestramento Attivo'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => { stopAudio(); onClose(); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {view === 'learning' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-50 p-6 md:p-10 rounded-[2rem] border border-slate-100 h-fit max-h-[500px] overflow-y-auto">
                <div className="prose prose-slate max-w-none">
                  <div className="text-slate-700 text-lg leading-relaxed space-y-4 whitespace-pre-wrap">
                    {exercise.theory?.split('**').map((part, i) => 
                      i % 2 === 1 ? <strong key={i} className="text-indigo-700">{part}</strong> : part
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 flex flex-col min-h-[450px] shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v10a3 3 0 003 3 3 3 0 003-3V5a3 3 0 00-3-3z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Lezione del Coach</span>
                  </div>
                  
                  {theoryExplanation ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-inner max-h-[280px] overflow-y-auto custom-scrollbar">
                        <p className="text-indigo-900 font-medium italic leading-relaxed text-sm">"{theoryExplanation}"</p>
                      </div>
                      {isSpeaking && (
                        <div className="flex justify-center gap-1.5 h-6 items-end py-2">
                          {[1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} className="w-1.5 bg-indigo-600 animate-pulse rounded-full" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i*0.1}s`, animationDuration: '0.6s' }}></div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">👨‍🏫</div>
                      <p className="text-slate-500 text-sm italic px-4">Vuoi ascoltare la spiegazione completa del metodo prima di iniziare?</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-6">
                  <button 
                    onClick={() => {
                      if (theoryExplanation) playAudio(theoryExplanation);
                      else {
                        setIsLoading(true);
                        getTheoryExplanation(exercise.theory || "").then(exp => {
                          setTheoryExplanation(exp);
                          playAudio(exp);
                        });
                      }
                    }}
                    disabled={isLoading}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isSpeaking ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'}`}
                  >
                    {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (isSpeaking ? 'Ferma' : 'Ascolta Lezione')}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button 
                onClick={() => { stopAudio(); setView('practicing'); }}
                className="bg-slate-900 hover:bg-black text-white font-black py-5 px-16 rounded-2xl transition-all shadow-xl active:scale-95 text-xl"
              >
                Inizia Addestramento
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="bg-indigo-600 text-white p-8 rounded-t-[2.5rem] rounded-br-[2.5rem] shadow-xl relative overflow-hidden min-h-[160px] flex flex-col justify-center">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Tutor MindFlow</h4>
                  {isSpeaking && (
                    <div className="flex gap-1 items-end h-4">
                      {[1,2,3,4].map(i => <div key={i} className="w-1 bg-white animate-pulse rounded-full" style={{ height: `${40 + Math.random() * 60}%`, animationDelay: `${i*0.1}s` }}></div>)}
                    </div>
                  )}
                </div>
                <p className="text-xl md:text-2xl font-bold leading-tight">{tutorText}</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            </div>

            <div className="space-y-6">
              <div className={`bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed transition-all min-h-[140px] flex items-center justify-center relative ${isListening ? 'border-red-400 bg-red-50/10' : 'border-indigo-200'}`}>
                {isListening && <div className="absolute top-4 right-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">In Ascolto...</span>
                </div>}
                <p className="text-xl italic text-slate-600 text-center">
                  {transcript || (isLoading ? "..." : (isSpeaking ? "Ascolta il Tutor..." : "Tocca 'Parla' per rispondere"))}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={startListening}
                  disabled={isLoading || isSpeaking}
                  className={`flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-lg transition-all ${isListening ? 'bg-red-500 text-white shadow-red-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-sm'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v10a3 3 0 003 3 3 3 0 003-3V5a3 3 0 00-3-3z" />
                  </svg>
                  {isListening ? "Parla ora" : "Premi per Parlare"}
                </button>
                <button 
                  onClick={handleSendResponse}
                  disabled={isLoading || isSpeaking || (!transcript && phase !== 'INTRO')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl transition-all shadow-lg active:scale-95 text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? "Analisi..." : "Invia Risposta"}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex justify-center">
               <button 
                onClick={() => { stopAudio(); setView('learning'); setPhase('INTRO'); setHistory([]); setTranscript(''); setTutorText('Benvenuto! Sei pronto per iniziare questa sessione interattiva?'); }}
                className="text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                Abbandona e Rivedi Teoria
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MnemonicSession;
