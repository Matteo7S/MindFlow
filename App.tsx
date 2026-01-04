
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
      // Verifica se siamo in un ambiente che supporta aistudio o se la chiave è già in process.env
      const isSelected = (window as any).aistudio ? await (window as any).aistudio.hasSelectedApiKey() : false;
      const keyAvailable = isSelected || (!!process.env.API_KEY && process.env.API_KEY !== "");
      setHasApiKey(keyAvailable);
    };
    checkKey();
    setDailyGoal(DAILY_GOALS[Math.floor(Math.random() * DAILY_GOALS.length)]);

    const savedStats = localStorage.getItem('mindflow_stats');
    if (savedStats) setStats(JSON.parse(savedStats));
    const savedResults = localStorage.getItem('mindflow_results');
    if (savedResults) setResults(JSON.parse(savedResults));
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      // Dopo l'apertura forziamo lo stato a true come da linee guida per mitigare race conditions
      setHasApiKey(true);
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
    const updatedResults = [newResult, ...results].slice(0, 20);
    setResults(updatedResults);
    localStorage.setItem('mindflow_results', JSON.stringify(updatedResults));
  };

  if (hasApiKey === false) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center text-white">
        <div className="max-w-md bg-white/10 p-10 rounded-[3rem] backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="text-6xl mb-6">🧠</div>
          <h1 className="text-3xl font-black mb-4 tracking-tight">MindFlow Academy</h1>
          <p className="opacity-70 mb-8 leading-relaxed">Configura la tua API Key Gemini per iniziare.</p>
          <button onClick={handleSelectKey} className="w-full bg-indigo-600 py-4 rounded-2xl font-black text-lg hover:bg-indigo-500 transition-all">
            Configura Chiave API
          </button>
          <p className="mt-4 text-[10px] opacity-40 uppercase tracking-widest">
            Richiede un progetto GCP con fatturazione attiva (piano gratuito disponibile)
          </p>
        </div>
      </div>
    );
  }

  // Se hasApiKey è null, stiamo ancora caricando il controllo
  if (hasApiKey === null) return <div className="min-h-screen bg-slate-900"></div>;

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
        <div className="space-y-12 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-800 to-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-yellow-400 text-indigo-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Level {stats.level}</span>
                  <span className="text-indigo-200 text-xs font-bold">{stats.sessionsCount} Sessioni Totali</span>
                </div>
                <h2 className="text-4xl font-black mb-4">La tua mente è un muscolo.</h2>
                <div className="max-w-sm">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-2">
                    <span>Progresso Livello</span>
                    <span>{currentLevelXP} / {XP_PER_LEVEL} XP</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div className="h-full bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.6)] transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm flex flex-col justify-center space-y-6">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Obiettivo del Giorno</h3>
                <p className="text-slate-800 font-bold text-lg leading-tight">"{dailyGoal}"</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
             <button onClick={() => setActiveModule('FLUENCY')} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${activeModule === 'FLUENCY' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200/50 text-slate-500'}`}>Fluenza Verbale</button>
             <button onClick={() => setActiveModule('MNEMONICS')} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${activeModule === 'MNEMONICS' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200/50 text-slate-500'}`}>Mnemotecniche</button>
          </div>

          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(activeModule === 'FLUENCY' ? FLUENCY_EXERCISES : MNEMONIC_EXERCISES).map(ex => (
                <ExerciseCard key={ex.id} exercise={ex} onClick={setSelectedExercise} />
              ))}
            </div>
          </section>

          {results.length > 0 && (
            <div className="pt-10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Attività Recente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.slice(0, 3).map(res => (
                  <div key={res.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{ALL_EXERCISES.find(e => e.id === res.type)?.icon}</div>
                      <div>
                        <span className="block font-bold text-slate-800 text-sm">{ALL_EXERCISES.find(e => e.id === res.type)?.title}</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(res.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right font-black text-indigo-600">{res.score}%</div>
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
