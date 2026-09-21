import React, { useState, useEffect } from 'react';
import { SquadMember } from '../types';
import { User, Shield, Flame, Coffee, Sparkles, X, Check } from 'lucide-react';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: Omit<SquadMember, 'id'>, existingId?: string) => void;
  memberToEdit?: SquadMember | null;
}

const PRESET_AVATAR_COLORS = [
  { name: 'Smeraldo', hex: '#10b981' },
  { name: 'Ciano', hex: '#06b6d4' },
  { name: 'Blu Elettrico', hex: '#3b82f6' },
  { name: 'Viola Power', hex: '#8b5cf6' },
  { name: 'Rosa Shock', hex: '#ec4899' },
  { name: 'Arancio Fiamma', hex: '#f97316' },
  { name: 'Giallo Oro', hex: '#eab308' },
  { name: 'Rosso Fury', hex: '#ef4444' },
];

const PRESET_HEADBAND_COLORS = [
  { name: 'Rosso Fuoco', hex: '#ef4444' },
  { name: 'Blu Notte', hex: '#1d4ed8' },
  { name: 'Nero Blackout', hex: '#0f172a' },
  { name: 'Oro Vincitore', hex: '#f59e0b' },
  { name: 'Verde Lime', hex: '#84cc16' },
  { name: 'Bianco Puro', hex: '#ffffff' },
];

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  memberToEdit,
}) => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState('Allievo Palestra');
  const [motto, setMotto] = useState('');
  const [avatarColor, setAvatarColor] = useState('#10b981');
  const [headbandColor, setHeadbandColor] = useState('#ef4444');
  const [streakDays, setStreakDays] = useState(1);
  const [totalWorkouts, setTotalWorkouts] = useState(1);
  const [proteinShakesOwed, setProteinShakesOwed] = useState(0);

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name || '');
      setNickname(memberToEdit.nickname || '');
      setRole(memberToEdit.role || 'Allievo Palestra');
      setMotto(memberToEdit.motto || '');
      setAvatarColor(memberToEdit.avatarColor || '#10b981');
      setHeadbandColor(memberToEdit.headbandColor || '#ef4444');
      setStreakDays(memberToEdit.streakDays || 0);
      setTotalWorkouts(memberToEdit.totalWorkouts || 0);
      setProteinShakesOwed(memberToEdit.proteinShakesOwed || 0);
    } else {
      setName('');
      setNickname('');
      setRole('Allievo Palestra');
      setMotto('Massima concentrazione e costanza!');
      setAvatarColor('#10b981');
      setHeadbandColor('#ef4444');
      setStreakDays(1);
      setTotalWorkouts(1);
      setProteinShakesOwed(0);
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      {
        name: name.trim(),
        nickname: nickname.trim() || `${name.trim()} 💪`,
        role: role.trim() || 'Allievo Palestra',
        motto: motto.trim() || 'Non si molla mai!',
        avatarColor,
        headbandColor,
        streakDays: Math.max(0, Number(streakDays) || 0),
        totalWorkouts: Math.max(0, Number(totalWorkouts) || 0),
        proteinShakesOwed: Math.max(0, Number(proteinShakesOwed) || 0),
        favoriteExercise: 'ex_squat',
      },
      memberToEdit?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow accent */}
        <div
          className="absolute -right-16 -top-16 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: avatarColor }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-md"
              style={{ backgroundColor: avatarColor }}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black font-display text-white">
                {memberToEdit ? 'Modifica Allievo' : 'Nuovo Allievo Palestra'}
              </h3>
              <p className="text-xs text-slate-400">
                {memberToEdit
                  ? 'Aggiorna dati anagrafici, personalizzazione avatar e presenze'
                  : 'Aggiungi un nuovo allievo al gruppo o corsi'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 py-4 pr-1 scrollbar-none flex-1">
          {/* Nome e Nickname */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Nome e Cognome *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="es. Marco Rossi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Nickname / Titolo
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="es. Il Guerriero ⚡"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Ruolo & Motto */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Livello / Obiettivo Corso
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="es. Funzionale & Cardio, Posturale Base, Panca WBS"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Motto o Obiettivo
            </label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              placeholder="es. Sempre presente alle 18:45!"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Avatar Color Selection */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Colore Canotta Avatar 3D
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_AVATAR_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setAvatarColor(col.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      avatarColor === col.hex ? 'scale-110 border-white ring-2 ring-emerald-400' : 'border-slate-800 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Colore Fascia Capelli Avatar 3D
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_HEADBAND_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setHeadbandColor(col.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      headbandColor === col.hex ? 'scale-110 border-white ring-2 ring-emerald-400' : 'border-slate-800 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> Streak gg
              </label>
              <input
                type="number"
                min="0"
                value={streakDays}
                onChange={(e) => setStreakDays(Number(e.target.value))}
                className="w-full bg-transparent text-white font-black text-sm focus:outline-none"
              />
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Shield className="w-3 h-3 text-cyan-400" /> Corsi Fatti
              </label>
              <input
                type="number"
                min="0"
                value={totalWorkouts}
                onChange={(e) => setTotalWorkouts(Number(e.target.value))}
                className="w-full bg-transparent text-white font-black text-sm focus:outline-none"
              />
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Coffee className="w-3 h-3 text-rose-400" /> Frullati Penitenza
              </label>
              <input
                type="number"
                min="0"
                value={proteinShakesOwed}
                onChange={(e) => setProteinShakesOwed(Number(e.target.value))}
                className="w-full bg-transparent text-white font-black text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-transform active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{memberToEdit ? 'Salva Modifiche' : 'Crea Allievo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
