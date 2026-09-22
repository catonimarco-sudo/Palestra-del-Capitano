import React from 'react';
import { Dumbbell, Settings } from 'lucide-react';
import { GymInfoSettings } from '../data/gymScheduleData';

interface HeaderProps {
  gymInfo: GymInfoSettings;
  isCloudConnected?: boolean;
  onOpenGymSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gymInfo,
  isCloudConnected = false,
  onOpenGymSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
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
                {gymInfo.gymName || 'Centro Sportivo'} • Orario Corsi & Iscrizione Diretta
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time Cloud Connection Badge */}
            {isCloudConnected ? (
              <div
                className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-bold"
                title="Connessione cloud attiva: le modifiche si sincronizzano in tempo reale tra AI Studio, Vercel e smartphone"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloud Live</span>
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-500/30 font-bold"
                title="Connessione cloud in corso..."
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Connessione Cloud...</span>
              </div>
            )}

            {/* Gym Info Settings Button */}
            <button
              onClick={onOpenGymSettings}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Modifica nome centro, telefono, indirizzo e orari"
            >
              <Settings className="w-4 h-4 text-[#7cb342]" />
              <span className="hidden sm:inline">Info Centro</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
