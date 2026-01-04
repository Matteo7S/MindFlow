
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

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('FLUENCY');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseConfig | null>(null);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      const isSelected = (window as any).aistudio ? await (window as any).aistudio.hasSelectedApiKey() : false;
      setHasApiKey(isSelected || !!process.env.API_KEY);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  if (hasApiKey === false) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center text-white">
        <div className="max-w-md bg-white/10 p-10 rounded-[3rem] backdrop-blur-xl border border-white/10">
          <div className="text-6xl mb-6">🧠</div>
          <h1 className="text-3xl font-black mb-4">MindFlow Academy</h1>
          <p className="opacity-70 mb-8">Per iniziare il tuo potenziamento cognitivo, seleziona una Chiave API Gemini.</p>
          <button onClick={handleSelectKey} className="w-full bg-indigo-600 py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-colors">
            Configura Chiave API
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeExerciseTitle={selectedExercise?.title}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      onBack={() => setSelectedExercise(null)}
    >
      {!selectedExercise ? (
        <div className="space-y-12">
          <div className="bg-indigo-700 rounded-[2.5rem] p-10 text-white shadow-xl">
             <h2 className="text-4xl font-black mb-2">Benvenuto, Atleta.</h2>
             <p className="opacity-80">Scegli un modulo per iniziare l'allenamento.</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setActiveModule('FLUENCY')} className={`px-6 py-2 rounded-xl font-bold ${activeModule === 'FLUENCY' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>Fluenza Verbale</button>
             <button onClick={() => setActiveModule('MNEMONICS')} className={`px-6 py-2 rounded-xl font-bold ${activeModule === 'MNEMONICS' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>Mnemotecniche</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeModule === 'FLUENCY' ? FLUENCY_EXERCISES : MNEMONIC_EXERCISES).map(ex => (
              <ExerciseCard key={ex.id} exercise={ex} onClick={setSelectedExercise} />
            ))}
          </div>
        </div>
      ) : (
        selectedExercise.id.toString().startsWith('MNEMONIC') ? (
          <MnemonicSession exercise={selectedExercise} onFinished={() => setSelectedExercise(null)} onClose={() => setSelectedExercise(null)} />
        ) : (
          <ActiveExercise exercise={selectedExercise} onFinished={() => setSelectedExercise(null)} onClose={() => setSelectedExercise(null)} />
        )
      )}
    </Layout>
  );
};

export default App;
