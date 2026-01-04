
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ExerciseCard from './components/ExerciseCard';
import ActiveExercise from './components/ActiveExercise';
import MnemonicSession from './components/MnemonicSession';
import { FLUENCY_EXERCISES, MNEMONIC_EXERCISES, ALL_EXERCISES } from './constants';
import { ExerciseConfig, ExerciseResult, UserStats, ExerciseType, ModuleType } from './types';

const INITIAL_STATS: UserStats = {
  xp: 0,
  level: 1,
  sessionsCount: 0,
  bestScore: 0,
  categoryMastery: {} as any
};

const XP_PER_LEVEL = 1000;

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('FLUENCY');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseConfig | null>(null);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        // 1. Verifica Sandbox AI Studio (Metodo preferito per anteprime)
        const aiStudio = (window as any).aistudio;
        if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
          const isSelected = await aiStudio.hasSelectedApiKey();
          if (isSelected) {
            setHasApiKey(true);
            return;
          }
        }

        // 2. Verifica process.env (Vercel Build-time o Proxy injection)
        // @ts-ignore
        const envKey = typeof process !== 'undefined' ? process.env.API_KEY : null;
        if (envKey && envKey !== "undefined" && envKey !== "") {
          setHasApiKey(true);
          return;
        }

        // 3. Verifica se abbiamo una chiave salvata in questa sessione (fallback)
        if ((window as any).GEMINI_API_KEY) {
          setHasApiKey(true);
          return;
        }

        setHasApiKey(false);
      } catch (e) {
        console.warn("Key check failed, defaulting to false", e);
        setHasApiKey(false);
      }
    };
    
    checkKey();

    const savedStats = localStorage.getItem('mindflow_stats');
    if (savedStats) setStats(JSON.parse(savedStats));
    const savedResults = localStorage.getItem('mindflow_results');
    if (savedResults) setResults(JSON.parse(savedResults));
  }, []);

  const handleSelectKey = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio && typeof aiStudio.openSelectKey === 'function') {
      await aiStudio.openSelectKey();
      setHasApiKey(true);
    } else {
      // Se siamo su Vercel fuori da AI Studio, chiediamo all'utente di inserirla manualmente per questa sessione
      const manualKey = prompt("⚠️ API_KEY non rilevata automaticamente dal browser.\n\nPer usare l'app fuori da AI Studio, incolla qui la tua chiave Gemini (verrà usata solo per questa sessione):");
      if (manualKey) {
        (window as any).GEMINI_API_KEY = manualKey;
        setHasApiKey(true);
      }
    }
  };

  if (hasApiKey === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] shadow-2xl">
          <div className="text-7xl mb-8 animate-pulse">🧠</div>
          <h1 className="text-3xl font-black mb-4 tracking-tighter">MindFlow Academy</h1>
          <p className="text-slate-400 mb-10 leading-relaxed">
            Non abbiamo rilevato una chiave API attiva nel tuo browser.
          </p>
          <button 
            onClick={handleSelectKey} 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl"
          >
            Configura Chiave API
          </button>
          <p className="mt-6 text-[9px] text-slate-500 uppercase tracking-widest leading-loose">
            Se sei su Vercel, assicurati di usare l'anteprima di AI Studio o di inserire la chiave manualmente cliccando il tasto sopra.
          </p>
        </div>
      </div>
    );
  }

  if (hasApiKey === null) return <div className="min-h-screen bg-slate-950"></div>;

  const currentLevelXP = stats.xp % XP_PER_LEVEL;
  const progressPercent = (currentLevelXP / XP_PER_LEVEL) * 100;

  return (
    <Layout 
      activeExerciseTitle={selectedExercise?.title}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      onBack={() => setSelectedExercise(null)}
    >
      {!selectedExercise ? (
        <div className="space-y-12 pb-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <span className="bg-yellow-400 text-indigo-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Lv. {stats.level}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Benvenuto, Trainer.</h2>
                <div className="max-w-sm">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-3">
                    <span>Progresso XP</span>
                    <span>{currentLevelXP} / {XP_PER_LEVEL}</span>
                  </div>
                  <div className="h-3 bg-black/30 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-yellow-400 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-100 rounded-[3.5rem] p-10 shadow-sm flex flex-col justify-center text-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Stato Sistema</h3>
              <div className="flex items-center justify-center gap-2 text-green-500 font-bold">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                IA ONLINE
              </div>
            </div>
          </div>

          <div className="flex gap-4">
             <button onClick={() => setActiveModule('FLUENCY')} className={`px-10 py-4 rounded-2xl font-black text-sm transition-all ${activeModule === 'FLUENCY' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-200/50 text-slate-500'}`}>Fluenza</button>
             <button onClick={() => setActiveModule('MNEMONICS')} className={`px-10 py-4 rounded-2xl font-black text-sm transition-all ${activeModule === 'MNEMONICS' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-200/50 text-slate-500'}`}>Memoria</button>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeModule === 'FLUENCY' ? FLUENCY_EXERCISES : MNEMONIC_EXERCISES).map(ex => (
              <ExerciseCard key={ex.id} exercise={ex} onClick={setSelectedExercise} />
            ))}
          </section>
        </div>
      ) : (
        selectedExercise.id.toString().startsWith('MNEMONIC') ? (
          <MnemonicSession exercise={selectedExercise} onFinished={(res) => { setSelectedExercise(null); }} onClose={() => setSelectedExercise(null)} />
        ) : (
          <ActiveExercise exercise={selectedExercise} onFinished={(res) => { setSelectedExercise(null); }} onClose={() => setSelectedExercise(null)} />
        )
      )}
    </Layout>
  );
};

export default App;
