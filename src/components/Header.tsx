import React from 'react';
import { Dumbbell, Settings, ShieldCheck, GraduationCap, Users } from 'lucide-react';
import { GymInfoSettings } from '../data/gymScheduleData';
import { Allievo, UserRole } from '../types';
import { StudentDropdown } from './StudentDropdown';

interface HeaderProps {
  gymInfo: GymInfoSettings;
  userRole: UserRole;
  onSelectUserRole: (role: UserRole) => void;
  onOpenGymSettings: () => void;
  students: Allievo[];
  currentStudentId: string | null;
  onSelectStudent: (id: string | null) => void;
  onAddStudent: (name: string) => void;
  onDeleteStudent: (id: string) => void;
  onOpenStudentManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gymInfo,
  userRole,
  onSelectUserRole,
  onOpenGymSettings,
  students,
  currentStudentId,
  onSelectStudent,
  onAddStudent,
  onDeleteStudent,
  onOpenStudentManager,
}) => {
  const currentStudent = students.find((s) => s.id === currentStudentId);
  const isGestore = userRole === 'gestore';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#7cb342] via-[#0288d1] to-[#d81b60] p-0.5 shadow-lg shadow-emerald-900/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-[#7cb342] -rotate-45" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                  {gymInfo.appName || 'FitSquad'}{' '}
                  {gymInfo.appSubtitle && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#7cb342]/15 text-[#7cb342] border border-[#7cb342]/30 font-mono font-bold">
                      {gymInfo.appSubtitle}
                    </span>
                  )}
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium hidden sm:block">
                {gymInfo.gymName || 'Centro Sportivo'} • Orario Corsi Palestra & Gestione Allievi
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-stretch lg:self-auto">
            {/* ROLE SWITCHER: Gestore/Mister vs Allievo */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => onSelectUserRole('gestore')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  isGestore
                    ? 'bg-[#7cb342] text-slate-950 font-black shadow-md shadow-[#7cb342]/20'
                    : 'text-slate-400 hover:text-white font-bold'
                }`}
                title="Modalità Gestore / Mister: Puoi vedere e modificare tutto (corsi, orari, profili allievi e impostazioni)"
              >
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Gestore / Mister</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectUserRole('allievo')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  !isGestore
                    ? 'bg-[#0288d1] text-white font-black shadow-md shadow-[#0288d1]/25'
                    : 'text-slate-400 hover:text-white font-bold'
                }`}
                title="Modalità Allievo: Visualizza tutti i corsi (compresi i corsi per Mister) e inserisci/elimina esclusivamente la tua presenza"
              >
                <GraduationCap className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Allievo</span>
              </button>
            </div>

            {/* Interactive Student Dropdown */}
            <StudentDropdown
              students={students}
              currentStudentId={currentStudentId}
              userRole={userRole}
              onSelectStudent={onSelectStudent}
              onAddStudent={onAddStudent}
              onDeleteStudent={onDeleteStudent}
            />

            {/* Open Student Profiles Manager */}
            {onOpenStudentManager && (
              <button
                onClick={onOpenStudentManager}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all shadow-sm active:scale-95"
                title={isGestore ? 'Gestisci profili allievi, contatti e visite mediche' : 'Visualizza allievi'}
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">{isGestore ? 'Profili Allievi' : 'Allievi'}</span>
              </button>
            )}

            {/* Gym Info Settings Button (Only for Gestore) */}
            {isGestore && (
              <button
                onClick={onOpenGymSettings}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all shadow-sm active:scale-95"
                title="Modifica nome centro, telefono, indirizzo e orari"
              >
                <Settings className="w-4 h-4 text-[#7cb342]" />
                <span className="hidden sm:inline">Info Centro</span>
              </button>
            )}
          </div>
        </div>

        {/* Role & Active Student Status Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isGestore ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400 animate-pulse'
              }`}
            />
            {isGestore ? (
              <span className="text-slate-300 font-medium">
                Modalità <strong className="text-emerald-400 font-bold">Gestore / Mister</strong>:
                hai accesso completo per visualizzare e modificare tutto (corsi, orari, profili allievi, impostazioni).
              </span>
            ) : (
              <span className="text-slate-300 font-medium">
                Modalità <strong className="text-cyan-400 font-bold">Allievo</strong>:
                puoi visualizzare tutti i corsi (compresi i corsi per Mister) e inserire o eliminare la tua presenza.
              </span>
            )}
          </div>

          {currentStudent && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
              <span>Allievo attivo:</span>
              <strong className="text-white font-bold">{currentStudent.name}</strong>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
