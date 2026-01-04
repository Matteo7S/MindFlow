
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
const DAILY_GOALS = [
  "Completa 3 sessioni di Fluenza Semantica",
  "Raggiungi l'80% nel Ping-Pong Mentale",
  "Impara 5 nuovi suoni della conversione fonetica",
  "Descrivi una stanza usando il Palazzo della Memoria",
  "Esegui 2 minuti di Shadowing senza interruzioni"
];

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('FLUENCY');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseConfig | null>(null);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [dailyGoal, setDailyGoal] = useState("");

  useEffect(() => {
    const checkKey = async () => {
      // Priorità 1: Variabile d'ambiente (Vercel)
      const envKey = process.env.API_KEY;
      if (envKey && envKey.trim() !== "") {
        setHasApiKey(true);
        return;
      }

      // Priorità 2: Sandbox AI Studio
      const aiStudio = (window as any).aistudio;
      if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
        const isSelected = await aiStudio.hasSelectedApiKey();
        setHasApiKey(isSelected);
      } else {
        setHasApiKey(false);
      }
    };
    
    checkKey();
    setDailyGoal(DAILY_GOALS[Math.floor(Math.random() * DAILY_GOALS.length)]);

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
      alert("⚠️ Attenzione: Non sei nell'anteprima di AI Studio.\n\nPer usare MindFlow su Vercel:\n1. Vai su Vercel Dashboard\n2. Settings -> Environment Variables\n3. Aggiungi API_KEY con la tua chiave Gemini.");
    }
  };

  const handleFinish = (evaluation: any) => {
    const xpEarned = Math.round((evaluation.score || 70) * 5.5);
    const newStats = {
      ...stats,
      xp: stats.xp + xpEarned,
      level: Math.floor((stats.xp + xpEarned) / XP_PER_LEVEL) + 1,
      sessionsCount: stats.sessionsCount + 1,
      bestScore: Math.max(stats.bestScore, evaluation.score || 0)
    };
    setStats(newStats);
    localStorage.setItem('mindflow_stats', JSON.stringify(newStats));
    
    const newResult: ExerciseResult = {
      id: Date.now().toString(),
      type: selectedExercise!.id,
      date: new Date(),
      score: evaluation.score || 0,
      xpEarned,
      details: evaluation.feedback || ""
    };
    setResults(prev => [newResult, ...prev].slice(0, 20));
  };

  if (hasApiKey === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center text-white font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] shadow-2xl">
          <div className="text-7xl mb-8 animate-bounce">🧠</div>
          <h1 className="text-3xl font-black mb-4 tracking-tighter">MindFlow Academy</h1>
          <p className="text-slate-400 mb-10 leading-relaxed font-medium">L'intelligenza artificiale di Gemini non è ancora configurata.</p>
          <button 
            onClick={handleSelectKey} 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
          >
            Configura Chiave API
          </button>
          <div className="mt-8 pt-8 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Ambiente: {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}</p>
          </div>
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
                  <span className="text-indigo-200 text-xs font-bold">{stats.sessionsCount} Sessioni</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Potenzia la tua mente.</h2>
                <div className="max-w-sm">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-3">
                    <span>Prossimo Livello</span>
                    <span>{currentLevelXP} / {XP_PER_LEVEL} XP</span>
                  </div>
                  <div className="h-4 bg-black/30 rounded-full overflow-hidden p-1 border border-white/10">
                    <div className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(250,204,21,0.5)]" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[3.5rem] p-10 shadow-sm flex flex-col justify-center text-center">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Missione Odierna</h3>
              <p className="text-slate-800 font-extrabold text-xl leading-snug">"{dailyGoal}"</p>
              <div className="mt-8 flex justify-center">
                <div className="w-12 h-1 bg-indigo-100 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
             <button onClick={() => setActiveModule('FLUENCY')} className={`px-10 py-4 rounded-2xl font-black text-sm transition-all ${activeModule === 'FLUENCY' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-200/50 text-slate-500 hover:bg-slate-200'}`}>Fluenza Verbale</button>
             <button onClick={() => setActiveModule('MNEMONICS')} className={`px-10 py-4 rounded-2xl font-black text-sm transition-all ${activeModule === 'MNEMONICS' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-200/50 text-slate-500 hover:bg-slate-200'}`}>Mnemotecniche</button>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {(activeModule === 'FLUENCY' ? FLUENCY_EXERCISES : MNEMONIC_EXERCISES).map(ex => (
              <ExerciseCard key={ex.id} exercise={ex} onClick={setSelectedExercise} />
            ))}
          </section>

          {results.length > 0 && (
            <div className="pt-16 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Cronologia Recente</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {results.slice(0, 3).map(res => (
                  <div key={res.id} className="bg-white p-6 rounded-[2rem] border border-slate-50 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{ALL_EXERCISES.find(e => e.id === res.type)?.icon}</div>
                      <div>
                        <span className="block font-bold text-slate-800 text-sm truncate max-w-[120px]">{ALL_EXERCISES.find(e => e.id === res.type)?.title}</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">{new Date(res.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-indigo-600 text-xl">{res.score}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        selectedExercise.id.toString().startsWith('MNEMONIC') ? (
          <MnemonicSession exercise={selectedExercise} onFinished={handleFinish} onClose={() => setSelectedExercise(null)} />
        ) : (
          <ActiveExercise exercise={selectedExercise} onFinished={handleFinish} onClose={() => setSelectedExercise(null)} />
        )
      )}
    </Layout>
  );
};

export default App;
