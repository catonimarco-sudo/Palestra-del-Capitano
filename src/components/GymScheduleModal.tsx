import React, { useState, useEffect } from 'react';
import {
  GymCourseCategory,
  GymScheduleCell,
  GYM_CATEGORIES,
  AVAILABLE_COLORS,
} from '../data/gymScheduleData';
import { Dumbbell, X, Check, Palette, Sparkles } from 'lucide-react';

interface GymScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    courseData: GymScheduleCell,
    dayKey: 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi',
    time: string
  ) => void;
  initialCell?: GymScheduleCell | null;
  initialDay?: 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi';
  initialTime?: string;
}

export const GymScheduleModal: React.FC<GymScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCell,
  initialDay = 'lunedi',
  initialTime = '18:45',
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GymCourseCategory>('posturale');
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [targetAudience, setTargetAudience] = useState<'allievi' | 'mister' | 'tutti'>('allievi');
  const [day, setDay] = useState<
    'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi'
  >('lunedi');
  const [time, setTime] = useState('18:45');
  const [instructor, setInstructor] = useState('Marco');
  const [room, setRoom] = useState('Sala Corsi');
  const [duration, setDuration] = useState('50 min');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialCell) {
      setName(initialCell.name || '');
      setCategory(initialCell.category || 'posturale');
      setTargetAudience(initialCell.targetAudience || 'allievi');
      if (initialCell.customColor) {
        setCustomColor(initialCell.customColor);
        setUseCustomColor(true);
      } else {
        setCustomColor(null);
        setUseCustomColor(false);
      }
      setInstructor(initialCell.instructor || 'Staff HOF');
      setRoom(initialCell.room || 'Sala Corsi');
      setDuration(initialCell.duration || '50 min');
      setNotes(initialCell.notes || '');
    } else {
      setName('PILATES');
      setCategory('olistico');
      setTargetAudience('allievi');
      setCustomColor(null);
      setUseCustomColor(false);
      setInstructor('Chiara');
      setRoom('Sala Olistica');
      setDuration('50 min');
      setNotes('Sessione di allenamento con focus su respirazione, core e flessibilità.');
    }
    if (initialDay) setDay(initialDay);
    if (initialTime) setTime(initialTime);
  }, [initialCell, initialDay, initialTime, isOpen]);

  if (!isOpen) return null;

  const selectedCat = GYM_CATEGORIES[category] || GYM_CATEGORIES.posturale;
  const effectiveColor = useCustomColor && customColor ? customColor : selectedCat.hexColor;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cellData: GymScheduleCell = {
      id: initialCell?.id || `course_${Date.now()}`,
      name: name.trim().toUpperCase(),
      category,
      customColor: useCustomColor && customColor ? customColor : undefined,
      targetAudience,
      instructor: instructor.trim() || 'Staff Palestra',
      room: room.trim() || 'Sala Corsi',
      duration: duration.trim() || '50 min',
      notes: notes.trim(),
      enrolledMemberIds: initialCell?.enrolledMemberIds || [],
    };

    onSave(cellData, day, time);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Color accent glow */}
        <div
          className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-35 pointer-events-none transition-colors duration-300"
          style={{ backgroundColor: effectiveColor }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black shadow-md transition-colors duration-200"
              style={{ backgroundColor: effectiveColor }}
            >
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black font-display text-white">
                {initialCell ? 'Modifica Lezione Corso' : 'Aggiungi Lezione al Calendario'}
              </h3>
              <p className="text-xs text-slate-400">
                Imposta orario, categoria (Posturale, Tonificazione, Cardio, Olistico) e colore
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto space-y-4 py-4 pr-1 scrollbar-none flex-1 text-slate-200"
        >
          {/* Nome Corso & Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Nome Corso *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="es. PILATES, YOGA, SPINNING"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Tipo / Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GymCourseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none"
              >
                <option value="olistico">🪻 OLISTICO (Viola / Benessere)</option>
                <option value="posturale">🟩 POSTURALE (Verde Lime)</option>
                <option value="tonificazione">🟦 TONIFICAZIONE (Azzurro / Blu)</option>
                <option value="cardio">🟪 CARDIO (Magenta / Fucsia)</option>
                <option value="funzionale">🟧 FUNZIONALE (Arancio)</option>
              </select>
            </div>
          </div>



          {/* SCELTA COLORI */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-400" />
                Colore Grafico nel Tabellone
              </span>

              {/* Mode switch: Default Category vs Custom */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setUseCustomColor(false)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    !useCustomColor
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Colore Categoria
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomColor(true);
                    if (!customColor) setCustomColor(selectedCat.hexColor);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    useCustomColor
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Personalizzato
                </button>
              </div>
            </div>

            {/* Visual Color Swatches Palette */}
            <div>
              <p className="text-[11px] text-slate-400 mb-2">
                {useCustomColor
                  ? 'Scegli uno dei colori pronti o usa il selettore esadecimale:'
                  : `Usa il colore associato alla categoria ${selectedCat.name}:`}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {AVAILABLE_COLORS.map((col) => {
                  const isPicked =
                    useCustomColor && (customColor || '').toLowerCase() === col.hex.toLowerCase();
                  const isCatDefault =
                    !useCustomColor && selectedCat.hexColor.toLowerCase() === col.hex.toLowerCase();

                  return (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => {
                        setUseCustomColor(true);
                        setCustomColor(col.hex);
                      }}
                      style={{ backgroundColor: col.hex }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl transition-all relative flex items-center justify-center shadow-md ${
                        isPicked || isCatDefault
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110'
                          : 'hover:scale-105 opacity-85 hover:opacity-100'
                      }`}
                      title={`${col.name} (${col.hex})`}
                    >
                      {(isPicked || isCatDefault) && (
                        <Check className="w-4 h-4 text-white stroke-[3] drop-shadow" />
                      )}
                    </button>
                  );
                })}

                {/* Free Custom Color Picker (input type="color") */}
                <div className="flex items-center gap-1.5 ml-1">
                  <label
                    htmlFor="course-color-picker"
                    className="relative cursor-pointer group"
                    title="Scegli qualsiasi colore con la tavolozza libera"
                  >
                    <input
                      id="course-color-picker"
                      type="color"
                      value={effectiveColor}
                      onChange={(e) => {
                        setUseCustomColor(true);
                        setCustomColor(e.target.value);
                      }}
                      className="sr-only"
                    />
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border-2 border-dashed border-slate-600 group-hover:border-white flex items-center justify-center text-slate-300 group-hover:text-white transition-all overflow-hidden"
                      style={{ backgroundColor: useCustomColor ? effectiveColor : 'transparent' }}
                    >
                      <Palette className="w-3.5 h-3.5 drop-shadow" />
                    </div>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {effectiveColor.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-semibold">
                Anteprima casella sul tabellone:
              </span>
              <div
                style={{ backgroundColor: effectiveColor }}
                className="px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-wide shadow-md transition-colors duration-200"
              >
                {name.trim() || 'NOME CORSO'}
              </div>
            </div>
          </div>

          {/* Giorno & Orario */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Giorno
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-semibold focus:border-emerald-500 focus:outline-none"
              >
                <option value="lunedi">LUNEDÌ</option>
                <option value="martedi">MARTEDÌ</option>
                <option value="mercoledi">MERCOLEDÌ</option>
                <option value="giovedi">GIOVEDÌ</option>
                <option value="venerdi">VENERDÌ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Orario
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="es. 18:45"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Durata
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="es. 50 min"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Istruttore & Sala */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Istruttore / Trainer
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="es. Chiara, Marco, Luca, Serena"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Sala / Area
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="es. Sala Olistica, Area WBS, Sala Corsi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Note / Dettagli */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Descrizione & Indicazioni
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Spiega gli obiettivi, il tipo di intensità o le attrezzature richieste..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-white font-black text-sm transition-transform active:scale-95 shadow-lg flex items-center gap-1.5"
              style={{ backgroundColor: effectiveColor }}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{initialCell ? 'Salva Modifiche' : 'Aggiungi al Calendario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
