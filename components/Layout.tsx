
import React from 'react';
import { ModuleType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeExerciseTitle?: string;
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
  onBack: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeExerciseTitle, 
  activeModule,
  onModuleChange,
  onBack 
}) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      {/* Sidebar / Header */}
      <aside className="w-full md:w-64 bg-indigo-700 text-white p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => { onBack(); }}>
          <div className="bg-white/20 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">MindFlow</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => { onBack(); }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${!activeExerciseTitle ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10 opacity-70'}`}
          >
            <svg xmlns="http://www.w3.org/2000/min" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>

          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] opacity-60">
            Percorsi di Studio
          </div>
          
          <button 
            onClick={() => { onModuleChange('FLUENCY'); onBack(); }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${activeModule === 'FLUENCY' && !activeExerciseTitle ? 'bg-white/10 font-bold border-l-4 border-white' : 'hover:bg-white/5 opacity-80'}`}
          >
            <span className="text-sm">Modulo 1: Fluenza</span>
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>

          <button 
            onClick={() => { onModuleChange('MNEMONICS'); onBack(); }}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${activeModule === 'MNEMONICS' && !activeExerciseTitle ? 'bg-white/10 font-bold border-l-4 border-white' : 'hover:bg-white/5 opacity-80'}`}
          >
            <span className="text-sm">Modulo 2: Mnemotecniche</span>
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>

          {/* Active indicator */}
          {activeExerciseTitle && (
            <div className="mt-8 bg-indigo-600/50 px-4 py-4 rounded-2xl border border-white/10 animate-pulse shadow-lg">
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Sessione in corso</p>
              <p className="text-white font-bold text-sm leading-tight">{activeExerciseTitle}</p>
            </div>
          )}
        </nav>

        <div className="mt-auto pt-6 text-[10px] text-indigo-300 font-bold uppercase tracking-tighter opacity-50">
          MindFlow v1.0.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen bg-slate-50">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-5 sticky top-0 z-10 flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">
              {activeExerciseTitle || (activeModule === 'FLUENCY' ? "Allenamento Fluenza" : "Accademia Mnemotecniche")}
            </h2>
            {!activeExerciseTitle && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {activeModule === 'FLUENCY' ? "Linguaggio & Accesso Lessicale" : "Memoria & Visualizzazione"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">IA Active</span>
             </div>
          </div>
        </header>
        <div className="p-4 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
