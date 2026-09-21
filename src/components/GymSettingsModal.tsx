import React, { useState, useEffect } from 'react';
import { GymInfoSettings, DEFAULT_GYM_INFO } from '../data/gymScheduleData';
import {
  X,
  Check,
  RotateCcw,
  Building2,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Sparkles,
  Info,
  Type,
  FileText,
  Clock,
} from 'lucide-react';

interface GymSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymInfo: GymInfoSettings;
  onSave: (updatedInfo: GymInfoSettings) => void;
}

export const GymSettingsModal: React.FC<GymSettingsModalProps> = ({
  isOpen,
  onClose,
  gymInfo,
  onSave,
}) => {
  const [formData, setFormData] = useState<GymInfoSettings>(gymInfo);
  const [activeSection, setActiveSection] = useState<'centro' | 'brand' | 'notes'>('centro');

  useEffect(() => {
    setFormData(gymInfo);
  }, [gymInfo, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof GymInfoSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    if (window.confirm('Vuoi ripristinare le informazioni predefinite del Centro Sportivo HOF e FitSquad?')) {
      setFormData(DEFAULT_GYM_INFO);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Decorative glow */}
        <div className="absolute -right-20 -top-20 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-52 h-52 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7cb342] via-[#0288d1] to-[#d81b60] p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white">
                <Building2 className="w-5 h-5 text-[#7cb342]" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black font-display text-white">
                Personalizza Centro Sportivo & App
              </h3>
              <p className="text-xs text-slate-400">
                Modifica nome app (FitSquad), nome palestra (HOF), recapiti, logo e note
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-3 pb-2 border-b border-slate-800/80 shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSection('centro')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeSection === 'centro'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Centro Sportivo & Contatti</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('brand')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeSection === 'brand'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Nome App & Titolo Tabella</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('notes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeSection === 'notes'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Note & Orari Sala</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 py-4 pr-1 scrollbar-none flex-1">
          {/* SECTION 1: CENTRO SPORTIVO & CONTATTI */}
          {activeSection === 'centro' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Nome Palestra / Centro Sportivo */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  Nome Centro Sportivo / Palestra *
                </label>
                <input
                  type="text"
                  required
                  value={formData.gymName}
                  onChange={(e) => handleChange('gymName', e.target.value)}
                  placeholder="es. Centro Sportivo HOF S.S.D. A R.L."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Telefono & Sito Web */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#7cb342]" />
                    Telefono Contatto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="es. 0422 885466"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    Sito Web Ufficiale
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="es. www.centrosportivohof.it"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-semibold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Indirizzo Completo */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Indirizzo & Sede Palestra
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="es. Via Carrer, 7 - Nervesa della Battaglia (TV)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Sigla Logo e Sottotitolo Logo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Sigla Logo (es. HOF)
                  </label>
                  <input
                    type="text"
                    value={formData.logoAcronym}
                    onChange={(e) => handleChange('logoAcronym', e.target.value.toUpperCase())}
                    placeholder="HOF"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-black tracking-widest uppercase focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Sottotitolo Logo (es. HOUSE OF FITNESS)
                  </label>
                  <input
                    type="text"
                    value={formData.logoSubtitle}
                    onChange={(e) => handleChange('logoSubtitle', e.target.value.toUpperCase())}
                    placeholder="HOUSE OF FITNESS"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold uppercase focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: NOME APP & TITOLO TABELLONE */}
          {activeSection === 'brand' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Nome App & Sottotitolo Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nome App / Brand (Attuale: FitSquad) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.appName}
                    onChange={(e) => handleChange('appName', e.target.value)}
                    placeholder="es. FitSquad, MyGym, HOF App..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-black focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Etichetta Header (Attuale: Palestra)
                  </label>
                  <input
                    type="text"
                    value={formData.appSubtitle}
                    onChange={(e) => handleChange('appSubtitle', e.target.value)}
                    placeholder="es. Palestra, Club, Fitness..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Titolo Principale Tabellone & Stagione/Anno */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Titolo Tabellone Corsi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.posterTitle}
                    onChange={(e) => handleChange('posterTitle', e.target.value.toUpperCase())}
                    placeholder="ORARIO CORSI PALESTRA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-black uppercase tracking-wide focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Stagione / Anno
                  </label>
                  <input
                    type="text"
                    value={formData.season}
                    onChange={(e) => handleChange('season', e.target.value)}
                    placeholder="2023/24"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 mt-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Anteprima Intestazione Tabella:
                </span>
                <div className="text-center py-2">
                  <h1 className="text-2xl font-black font-display tracking-tight text-white uppercase inline-block">
                    {formData.posterTitle}{' '}
                    <span className="text-[#7cb342] font-black">
                      {formData.season}
                    </span>
                  </h1>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: NOTE & ORARI SALA */}
          {activeSection === 'notes' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Titolo Orari Sala */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Titolo Riquadro Orari Sala
                </label>
                <input
                  type="text"
                  value={formData.roomHoursTitle}
                  onChange={(e) => handleChange('roomHoursTitle', e.target.value)}
                  placeholder="Orari di attività in sala"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Testo Orari Sala */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Testo / Istruzioni Orari Sala
                </label>
                <textarea
                  rows={2}
                  value={formData.roomHoursText}
                  onChange={(e) => handleChange('roomHoursText', e.target.value)}
                  placeholder="Consulta gli orari aggiornati sul nostro sito web o sulla nostra scheda Google"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Note a piè di tabella */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nota 1 (Sinistra)
                </label>
                <input
                  type="text"
                  value={formData.note1}
                  onChange={(e) => handleChange('note1', e.target.value)}
                  placeholder="*Attività funzionale in sala (30 minuti) senza prenotazione aperta a tutti gli iscritti."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none italic"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nota 2 (Destra)
                </label>
                <input
                  type="text"
                  value={formData.note2}
                  onChange={(e) => handleChange('note2', e.target.value)}
                  placeholder="Gli orari potrebbero subire variazioni."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none italic"
                />
              </div>
            </div>
          )}

          {/* Actions & Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ripristina Originali (HOF / FitSquad)</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-transform active:scale-95 shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Salva Dati Centro</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
