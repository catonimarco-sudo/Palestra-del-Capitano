import React, { useState } from 'react';
import { Exercise } from '../types';
import { Exercise3DViewer } from './Exercise3DViewer';
import {
  Search,
  Dumbbell,
  CheckCircle,
  AlertTriangle,
  Clock,
  Repeat,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface ExerciseLibraryViewProps {
  exercises: Exercise[];
}

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({ exercises }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tutti');
  const [activeExercise, setActiveExercise] = useState<Exercise>(exercises[0]);

  const categories = ['Tutti', 'Gambe', 'Petto', 'Dorso', 'Spalle', 'Braccia'];

  const filteredExercises = exercises.filter((ex) => {
    const matchesCat = selectedCategory === 'Tutti' || ex.category === selectedCategory;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.targetMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Category Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cerca esercizio o muscolo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* 2. Spotlight 3D Exercise Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* 3D Simulation Column */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs font-bold">
                  {activeExercise.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold">
                  {activeExercise.difficulty}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
                {activeExercise.name}
              </h2>
            </div>
          </div>

          {/* Real Three.js Exercise Model */}
          <Exercise3DViewer
            key={activeExercise.id}
            animationType={activeExercise.animationType}
            exerciseName={activeExercise.name}
            targetMuscles={activeExercise.targetMuscles}
          />

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {activeExercise.description}
          </p>
        </div>

        {/* Biomechanics & Coaching Guide Column */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5">
          {/* Sets, Reps & Rest Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                <Repeat className="w-3.5 h-3.5 text-emerald-400" />
                <span>Serie & Ripetizioni</span>
              </div>
              <span className="text-xs font-bold text-white block">
                {activeExercise.suggestedSetsReps}
              </span>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Recupero Consigliato</span>
              </div>
              <span className="text-xs font-bold text-white block">
                {activeExercise.restTime}
              </span>
            </div>
          </div>

          {/* Key Cues (Cosa fare) */}
          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Punti Chiave di Esecuzione (Biomeccanica)</span>
            </h4>
            <ul className="space-y-2">
              {activeExercise.keyCues.map((cue, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Common Mistakes (Errori da evitare) */}
          <div>
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Errori Comuni da Evitare</span>
            </h4>
            <ul className="space-y-2">
              {activeExercise.commonMistakes.map((mistake, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-rose-300/90 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                  <span className="text-rose-400 font-bold shrink-0">✕</span>
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Target Muscles Badges */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
              Tutti i Muscoli Coinvolti:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeExercise.targetMuscles.map((m) => (
                <span key={m} className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[11px] font-bold">
                  {m} (Target)
                </span>
              ))}
              {activeExercise.secondaryMuscles.map((m) => (
                <span key={m} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[11px]">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Exercise Grid Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Tutti gli Esercizi della Libreria 3D ({filteredExercises.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            Seleziona una scheda per caricare l'animazione 3D
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => {
            const isActive = exercise.id === activeExercise.id;

            return (
              <div
                key={exercise.id}
                onClick={() => {
                  setActiveExercise(exercise);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-bold">
                      {exercise.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {exercise.difficulty}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-base mb-1 flex items-center justify-between">
                    <span>{exercise.name}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-emerald-400 translate-x-1' : 'text-slate-600'}`} />
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {exercise.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    {exercise.targetMuscles[0]}
                  </span>
                  <span className={`font-bold flex items-center gap-1 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Sparkles className="w-3 h-3" />
                    Visualizza 3D
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
