import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Target, Sparkles } from 'lucide-react';
import { WorkoutSession } from '../types';

interface NewWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSession: (newSession: Omit<WorkoutSession, 'id' | 'attendees'>) => void;
}

export const NewWorkoutModal: React.FC<NewWorkoutModalProps> = ({
  isOpen,
  onClose,
  onAddSession,
}) => {
  const [dayName, setDayName] = useState('Sabato');
  const [dateStr, setDateStr] = useState('23 Settembre');
  const [time, setTime] = useState('11:00 - 12:30');
  const [title, setTitle] = useState('Sessione Spalle & Addome Killer 🚀');
  const [location, setLocation] = useState('Iron Gym Club - Sala Pesi');
  const [focusStr, setFocusStr] = useState('Spalle, Addome');
  const [notes, setNotes] = useState('Portate borraccia e asciugamano grande!');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const muscleFocus = focusStr.split(',').map((s) => s.trim()).filter(Boolean);

    onAddSession({
      dayName,
      dateStr,
      time,
      title,
      location,
      muscleFocus: muscleFocus.length > 0 ? muscleFocus : ['Full Body'],
      plannedExercises: ['ex_press'],
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white font-display">Pianifica Nuovo Allenamento</h3>
              <p className="text-xs text-slate-400">Invita il gruppo e fissa l'orario</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Titolo Allenamento
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="es. Heavy Leg Day & Squat PR"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Giorno della Settimana
              </label>
              <select
                value={dayName}
                onChange={(e) => setDayName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="Lunedì">Lunedì</option>
                <option value="Martedì">Martedì</option>
                <option value="Mercoledì">Mercoledì</option>
                <option value="Giovedì">Giovedì</option>
                <option value="Venerdì">Venerdì</option>
                <option value="Sabato">Sabato</option>
                <option value="Domenica">Domenica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Data (o testo)
              </label>
              <input
                type="text"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="23 Settembre"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Orario
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="18:30 - 20:00"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Focus Muscolare
              </label>
              <input
                type="text"
                value={focusStr}
                onChange={(e) => setFocusStr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Gambe, Glutei, Core"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Luogo / Palestra
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Iron Gym Club - Pedana Squat"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Note per il gruppo / Sfida
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              placeholder="Chi salta paga il frullato a tutti!"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs font-bold"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-transform active:scale-95 text-xs shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pubblica nel Calendario</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
