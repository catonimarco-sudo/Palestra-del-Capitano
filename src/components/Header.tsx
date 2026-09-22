import React from 'react';
import { Dumbbell, Settings, Smartphone, BellRing } from 'lucide-react';
import { GymInfoSettings } from '../data/gymScheduleData';

interface HeaderProps {
  gymInfo: GymInfoSettings;
  isCloudConnected?: boolean;
  onOpenGymSettings: () => void;
  onOpenAppIconModal: () => void;
  onOpenNotificationModal: () => void;
  notificationsEnabled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  gymInfo,
  isCloudConnected = false,
  onOpenGymSettings,
  onOpenAppIconModal,
  onOpenNotificationModal,
  notificationsEnabled = true,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onOpenAppIconModal}
              title="Tocca per cambiare l'icona dell'app per iPhone e iPad"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#7cb342] via-[#0288d1] to-[#d81b60] p-0.5 shadow-lg shadow-emerald-900/20 flex items-center justify-center shrink-0 hover:scale-105 transition-transform active:scale-95 group relative"
            >
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                {gymInfo.appIconUrl ? (
                  <img
                    src={gymInfo.appIconUrl}
                    alt="App Icon"
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                ) : (
                  <Dumbbell className="w-5 h-5 text-[#7cb342] -rotate-45" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                <Smartphone className="w-2.5 h-2.5 text-[#7cb342]" />
              </div>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black font-display tracking-tight text-white">
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
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Notification Reminders 1h Before Button */}
            <button
              type="button"
              onClick={onOpenNotificationModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm active:scale-95 relative"
              title="Promemoria notifiche nel browser 1 ora prima dei corsi"
            >
              <BellRing className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Promemoria 1h</span>
              {notificationsEnabled && (
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-1 -right-1 ring-2 ring-slate-950 animate-pulse" />
              )}
            </button>

            {/* Custom Icon for iPhone & iPad Button */}
            <button
              type="button"
              onClick={onOpenAppIconModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Cambia l'icona dell'app per iPhone, iPad e tablet"
            >
              <Smartphone className="w-4 h-4 text-[#7cb342]" />
              <span className="hidden sm:inline">Icona iPhone</span>
            </button>

            {/* Real-time Cloud Connection Badge */}
            {isCloudConnected ? (
              <div
                className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-bold"
                title="Connessione cloud attiva: sincronizzazione in tempo reale"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cloud Live</span>
              </div>
            ) : null}

            {/* Gym Info Settings Button */}
            <button
              type="button"
              onClick={onOpenGymSettings}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Modifica nome centro, telefono, indirizzo e orari"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Info Centro</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
