
import React, { useState, useEffect, useRef } from 'react';
import { ExerciseConfig, ExerciseType } from '../types';
import { getExerciseSetup, evaluateExercise } from '../services/geminiService';

interface ActiveExerciseProps {
  exercise: ExerciseConfig;
  onFinished: (result: any) => void;
  onClose: () => void;
}

const ActiveExercise: React.FC<ActiveExerciseProps> = ({ exercise, onFinished, onClose }) => {
  const [setup, setSetup] = useState<{ prompt: string; constraints?: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(exercise.defaultTime);
  const [sessionDuration, setSessionDuration] = useState(exercise.defaultTime);
  const [status, setStatus] = useState<'loading' | 'preparing' | 'running' | 'evaluating' | 'result'>('loading');
  const [transcript, setTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    loadSetup();
  }, [exercise]);

  const loadSetup = async () => {
    setStatus('loading');
    try {
      const data = await getExerciseSetup(exercise.id);
      setSetup(data);
      setStatus('preparing');
    } catch (error) {
      console.error("Setup error:", error);
      alert("Errore nel caricamento. Riprova.");
      onClose();
    }
  };

  useEffect(() => {
    let timer: any;
    if (status === 'running' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && status === 'running') {
      handleAutoFinish();
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  const startExercise = () => {
    setTranscript('');
    transcriptRef.current = '';
    // Use the currently selected time for the session
    setStatus('running');
    startListening();
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser non supportato per il riconoscimento vocale.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'it-IT';

    recognitionRef.current.onresult = (event: any) => {
      let current = '';
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setTranscript(current);
      transcriptRef.current = current;
    };

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (status === 'running' && timeLeft > 0) {
        try { recognitionRef.current.start(); } catch(e) {}
      }
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleAutoFinish = async () => {
    stopListening();
    setStatus('evaluating');
    await handleEvaluate();
  };

  const handleEvaluate = async () => {
    const finalTranscript = transcriptRef.current;
    try {
      const result = await evaluateExercise(exercise.id, setup?.prompt || '', finalTranscript, setup?.constraints);
      setEvaluation(result);
      setStatus('result');
      onFinished(result);
    } catch (error) {
      console.error("Evaluation error:", error);
      alert("Errore nell'analisi. Assicurati di aver parlato durante la sessione.");
      setStatus('preparing');
      setTimeLeft(sessionDuration);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setTimeLeft(val);
    setSessionDuration(val);
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-slate-600 font-medium">L'IA sta elaborando la sfida...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-5">
            <div className="text-5xl bg-slate-50 p-4 rounded-3xl">{exercise.icon}</div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">{exercise.title}</h2>
              <p className="text-slate-500 text-sm font-medium">{exercise.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Phase: Preparing */}
        {status === 'preparing' && (
          <div className="space-y-8 animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-[2rem] border border-indigo-100 shadow-sm">
              <h3 className="text-indigo-600 text-xs font-black uppercase tracking-widest mb-4">La tua sfida</h3>
              <p className="text-slate-800 text-2xl font-bold leading-tight mb-6">{setup?.prompt}</p>
              
              {setup?.constraints && (
                <div className="p-5 bg-white rounded-2xl border border-indigo-200 shadow-sm">
                  <span className="font-black text-red-500 uppercase text-[10px] tracking-widest block mb-2">Da ricordare:</span>
                  <p className="text-slate-700 italic font-medium">{setup.constraints}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 text-center md:text-left">Durata Sessione (15-180s)</label>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <input 
                    type="range" min="15" max="180" step="15"
                    value={sessionDuration} 
                    onChange={handleTimeChange}
                    className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="font-black text-indigo-600 text-xl w-14 text-right">{sessionDuration}s</span>
                </div>
              </div>
              <button 
                onClick={startExercise}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-12 rounded-2xl transition-all shadow-lg shadow-indigo-100 active:scale-95 text-lg"
              >
                Inizia Registrazione
              </button>
            </div>
          </div>
        )}

        {/* Phase: Running */}
        {status === 'running' && (
          <div className="space-y-10 py-4">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Radial Progress */}
              <div className="relative shrink-0">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                    strokeDasharray={552.9} 
                    strokeDashoffset={552.9 - (timeLeft / sessionDuration) * 552.9} 
                    className="text-indigo-600 transition-all duration-1000 ease-linear stroke-round" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-black text-slate-800 tabular-nums">{timeLeft}</span>
                </div>
              </div>

              {/* Active Context */}
              <div className="flex-1 space-y-4 w-full">
                <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl">
                  <h4 className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-2">Comando IA:</h4>
                  <p className="text-lg font-bold">{setup?.prompt}</p>
                  {setup?.constraints && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-red-400 font-bold uppercase tracking-tighter mb-1">Vincoli:</p>
                      <p className="text-sm italic text-slate-300">{setup.constraints}</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 relative">
                  <div className="absolute top-4 right-6 flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-black text-red-500 tracking-widest uppercase">Live Voice</span>
                  </div>
                  <p className="text-slate-700 text-lg italic leading-relaxed min-h-[80px]">
                    {transcript || "Ti stiamo ascoltando..."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={handleAutoFinish}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                Termina e Analizza
              </button>
            </div>
          </div>
        )}

        {/* Phase: Evaluating */}
        {status === 'evaluating' && (
          <div className="text-center py-20 space-y-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 border-8 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center font-black text-indigo-600">AI</div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800">Analisi Cognitiva in corso</h3>
              <p className="text-slate-500">Gemini sta valutando fluidità, precisione e registro...</p>
            </div>
          </div>
        )}

        {/* Phase: Result */}
        {status === 'result' && evaluation && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border-4 border-indigo-50 p-10 rounded-[3rem] shadow-sm text-center flex flex-col justify-center">
                <div className="text-7xl font-black text-indigo-600 mb-2">{evaluation.score}</div>
                <div className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">Punteggio</div>
              </div>
              
              <div className="lg:col-span-2 bg-indigo-600 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="font-black text-xl">Feedback MindFlow</h4>
                  </div>
                  <p className="text-indigo-50 text-lg leading-relaxed italic opacity-90">{evaluation.feedback}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-8 rounded-[2.5rem] border border-green-100 shadow-sm">
                <h4 className="text-green-800 font-black text-xs uppercase tracking-widest mb-6">Punti di forza ({evaluation.validWords.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {evaluation.validWords.map((word: string, i: number) => (
                    <span key={i} className="bg-white px-4 py-2 rounded-2xl text-green-700 text-sm font-bold border border-green-200 shadow-sm">{word}</span>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 shadow-sm">
                <h4 className="text-red-800 font-black text-xs uppercase tracking-widest mb-6">Aree di miglioramento ({evaluation.invalidWords.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {evaluation.invalidWords.map((word: string, i: number) => (
                    <span key={i} className="bg-white px-4 py-2 rounded-2xl text-red-700 text-sm font-bold border border-red-200 shadow-sm">{word}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
              <button 
                onClick={() => { setEvaluation(null); setTranscript(''); setTimeLeft(sessionDuration); loadSetup(); }}
                className="bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-700 font-black py-4 px-12 rounded-2xl transition-all"
              >
                Riprova
              </button>
              <button 
                onClick={onClose}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-12 rounded-2xl transition-all shadow-lg active:scale-95"
              >
                Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveExercise;
