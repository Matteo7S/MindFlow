
import React from 'react';
import { ExerciseConfig } from '../types';

interface ExerciseCardProps {
  exercise: ExerciseConfig;
  onClick: (exercise: ExerciseConfig) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onClick }) => {
  return (
    <button 
      onClick={() => onClick(exercise)}
      className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left flex flex-col h-full group"
    >
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{exercise.icon}</div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{exercise.title}</h3>
      <p className="text-slate-500 text-sm flex-1">{exercise.description}</p>
      <div className="mt-4 flex items-center text-indigo-600 font-semibold text-sm">
        Inizia Esercizio 
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};

export default ExerciseCard;
