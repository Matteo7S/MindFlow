
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
  categoryMastery: Object.values(ExerciseType).reduce((acc, type) => ({ ...acc, [type]: 0 }), {} as Record<ExerciseType, number>)
};

const XP_PER_LEVEL = 1000;

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('FLUENCY');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseConfig | null>(null);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);

  useEffect(() => {
    const savedResults = localStorage.getItem('mindflow_results');
    const savedStats = localStorage.getItem('mindflow_stats');
    if (savedResults) setResults(JSON.parse(savedResults));
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  useEffect(() => {
    localStorage.setItem('mindflow_results', JSON.stringify(results));
    localStorage.setItem('mindflow_stats', JSON.stringify(stats));
  }, [results, stats]);

  const handleExerciseFinished = (evaluation: any) => {
    if (!selectedExercise) return;
    const baseXP = selectedExercise.id.toString().startsWith('MNEMONIC') ? 500 : selectedExercise.defaultTime;
    const scoreMultiplier = (evaluation.score || 80) / 100;
    const xpEarned = Math.round(baseXP * scoreMultiplier * 1.5);

    const newResult: ExerciseResult = {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedExercise.id,
      date: new Date(),
      score: evaluation.score || 80,
      xpEarned,
      details: evaluation.feedback,
      validWords: evaluation.validWords || [],
      invalidWords: evaluation.invalidWords || []
    };

    setResults(prev => [newResult, ...prev]);
    setStats(prev => {
      const newXP = prev.xp + xpEarned;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      const currentMastery = prev.categoryMastery[selectedExercise.id] || 0;
      const newMastery = Math.round((currentMastery * 0.7) + ((evaluation.score || 80) * 0.3));
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        sessionsCount: prev.sessionsCount + 1,
        bestScore: Math.max(prev.bestScore, (evaluation.score || 0)),
        categoryMastery: { ...prev.categoryMastery, [selectedExercise.id]: newMastery }
      };
    });
  };

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
          {/* Dashboard Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-700 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-yellow-400 text-indigo-900 font-black px-3 py-1 rounded-lg text-sm">LVL {stats.level}</div>
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">MindFlow Academy</h2>
                <p className="text-indigo-100 text-lg max-w-lg mb-8 opacity-80">La tua palestra cerebrale quotidiana potenziata dall'intelligenza artificiale.</p>
                <div className="max-w-md">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Progressi Livello</span>
                    <span className="text-[10px] font-black text-white">{currentLevelXP} / {XP_PER_LEVEL} XP</span>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                    <div className="h-full bg-yellow-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(250,204,21,0.5)]" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
            </div>
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
              <h3 className="text-slate-800 font-black text-xs uppercase tracking-widest mb-6">Profilo Atleta</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500 font-medium">XP Totali</span>
                  <span className="font-black text-indigo-600">{stats.xp}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500 font-medium">Sessioni Completate</span>
                  <span className="font-black text-slate-800">{stats.sessionsCount}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-500 font-medium">Miglior Punteggio</span>
                  <span className="font-black text-green-500">{stats.bestScore}%</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-50 text-center">
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Rank: {stats.level < 5 ? 'Novizio' : 'Esperto'}</span>
              </div>
            </div>
          </div>

          {/* Module Selector (Desktop Only visible tabs, mobile sidebar) */}
          <div className="flex gap-4 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveModule('FLUENCY')}
              className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeModule === 'FLUENCY' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Fluenza Verbale
            </button>
            <button 
              onClick={() => setActiveModule('MNEMONICS')}
              className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeModule === 'MNEMONICS' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Mnemotecniche
            </button>
          </div>

          {/* Module Grid */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-end gap-3 mb-8">
              <h3 className="text-2xl font-black text-slate-800">
                {activeModule === 'FLUENCY' ? 'Allenamento Fluenza' : 'Libreria Mnemotecniche'}
              </h3>
              <span className="text-slate-400 text-sm font-bold pb-0.5">• {activeModule === 'FLUENCY' ? FLUENCY_EXERCISES.length : MNEMONIC_EXERCISES.length} esercizi</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(activeModule === 'FLUENCY' ? FLUENCY_EXERCISES : MNEMONIC_EXERCISES).map((exercise) => (
                <div key={exercise.id} className="relative group">
                  <ExerciseCard exercise={exercise} onClick={setSelectedExercise} />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-xl text-[10px] font-black text-slate-500 shadow-sm border border-slate-100 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                    {stats.categoryMastery[exercise.id] || 0}% Mastery
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* History */}
          {results.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-800">Diario di Bordo</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ultime 6 sessioni</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.slice(0, 6).map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 hover:bg-white transition-all hover:shadow-md group">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">{ALL_EXERCISES.find(e => e.id === result.type)?.icon}</span>
                      <div>
                        <span className="block font-black text-slate-800 text-sm leading-tight">{ALL_EXERCISES.find(e => e.id === result.type)?.title}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(result.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`block font-black text-lg ${result.score > 80 ? 'text-green-500' : 'text-indigo-600'}`}>{result.score}%</span>
                      <span className="text-[10px] font-black text-slate-300">+{result.xpEarned} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        selectedExercise.id.toString().startsWith('MNEMONIC') ? (
          <MnemonicSession 
            exercise={selectedExercise} 
            onFinished={handleExerciseFinished} 
            onClose={() => setSelectedExercise(null)} 
          />
        ) : (
          <ActiveExercise 
            exercise={selectedExercise} 
            onFinished={handleExerciseFinished} 
            onClose={() => setSelectedExercise(null)} 
          />
        )
      )}
    </Layout>
  );
};

export default App;
