import React, { useState } from 'react';
import { WorkoutSession, SquadMember, AttendanceStatus } from '../types';
import { Avatar3DViewer } from './Avatar3DViewer';
import {
  Calendar,
  Clock,
  MapPin,
  Flame,
  HelpCircle,
  Moon,
  Plus,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  Sparkles,
} from 'lucide-react';

interface ScheduleViewProps {
  sessions: WorkoutSession[];
  members: SquadMember[];
  selectedSessionId: string;
  onSelectSession: (id: string) => void;
  onUpdateStatus: (sessionId: string, memberId: string, newStatus: AttendanceStatus) => void;
  onOpenNewWorkoutModal: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  sessions,
  members,
  selectedSessionId,
  onSelectSession,
  onUpdateStatus,
  onOpenNewWorkoutModal,
}) => {
  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const currentUser = members.find((m) => m.isCurrentUser) || members[0];
  
  // Which member's 3D avatar is currently spotlighted
  const [spotlightMemberId, setSpotlightMemberId] = useState<string>(currentUser.id);
  const spotlightMember = members.find((m) => m.id === spotlightMemberId) || currentUser;

  // Status of the spotlighted member in current session
  const spotlightStatus = currentSession?.attendees[spotlightMember.id]?.status || 'pending';

  // Counts for current session
  const attendeeEntries = Object.values(currentSession?.attendees || {});
  const presentCount = attendeeEntries.filter((a) => a.status === 'present').length;
  const maybeCount = attendeeEntries.filter((a) => a.status === 'maybe').length;
  const skipCount = attendeeEntries.filter((a) => a.status === 'skipping').length;

  return (
    <div className="space-y-6">
      {/* 1. Week Days Quick Tabs Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2">
          {sessions.map((session) => {
            const isSelected = session.id === currentSession.id;
            const userStatus = session.attendees[currentUser.id]?.status;

            return (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`flex flex-col items-start px-4 py-2.5 rounded-2xl border text-left transition-all min-w-[140px] shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {session.dayName}
                  </span>
                  {userStatus === 'present' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  {userStatus === 'skipping' && (
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[120px]">
                  {session.time}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 mt-1 truncate max-w-[120px]">
                  {session.muscleFocus.join(', ')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Add Session Button */}
        <button
          onClick={onOpenNewWorkoutModal}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all shrink-0 active:scale-95"
          title="Pianifica un altro giorno"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nuova Sessione</span>
        </button>
      </div>

      {/* 2. Main Workout Interactive Card with 3D Avatar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Column: 3D Avatar Spotlight & Interactive Reaction */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 relative">
          <div className="w-full flex items-center justify-between mb-2 z-10">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: spotlightMember.avatarColor }}
              />
              <span className="text-sm font-bold text-white">{spotlightMember.name}</span>
              {spotlightMember.isCurrentUser && (
                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.5 rounded-md border border-slate-700">
                  Tu
                </span>
              )}
            </div>
            {/* Status indicator tag */}
            {spotlightStatus === 'present' && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <Flame className="w-3.5 h-3.5 fill-current" />
                Confermato!
              </span>
            )}
            {spotlightStatus === 'maybe' && (
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                <HelpCircle className="w-3.5 h-3.5" />
                In Forse
              </span>
            )}
            {spotlightStatus === 'skipping' && (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30">
                <Moon className="w-3.5 h-3.5" />
                Oggi Salta
              </span>
            )}
          </div>

          {/* Real Three.js Avatar */}
          <Avatar3DViewer
            status={spotlightStatus}
            avatarColor={spotlightMember.avatarColor}
            headbandColor={spotlightMember.headbandColor}
            memberName={spotlightMember.name}
            interactive={true}
            size="md"
          />

          {/* Member Motto / Motivation speech bubble */}
          <div className="w-full mt-2 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-center">
            <p className="text-xs text-slate-300 italic font-medium">
              "{spotlightMember.motto}"
            </p>
          </div>
        </div>

        {/* Right Column: Workout Details & Group Attendance Control */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs font-bold">
                {currentSession.dayName} • {currentSession.dateStr}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                {currentSession.time}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              {currentSession.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{currentSession.location}</span>
            </div>

            {/* Muscle Targets */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              <span className="text-xs text-slate-400 font-semibold mr-1">Muscoli:</span>
              {currentSession.muscleFocus.map((muscle) => (
                <span
                  key={muscle}
                  className="px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-200"
                >
                  {muscle}
                </span>
              ))}
            </div>

            {currentSession.notes && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Nota del Gruppo:</strong> {currentSession.notes}</span>
              </div>
            )}
          </div>

          {/* Attendance Action Box for Current User */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                La Tua Presenza per questa sessione:
              </span>
              <span className="text-[11px] text-slate-400">
                L'avatar 3D cambierà reazione all'istante!
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Presenza: Ci sono */}
              <button
                onClick={() => {
                  onUpdateStatus(currentSession.id, currentUser.id, 'present');
                  setSpotlightMemberId(currentUser.id);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  currentSession.attendees[currentUser.id]?.status === 'present'
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800/80'
                }`}
              >
                <Flame className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold leading-tight">Ci sono! 🔥</span>
                <span className="text-[10px] opacity-80 mt-0.5">Carico a mille</span>
              </button>

              {/* In forse */}
              <button
                onClick={() => {
                  onUpdateStatus(currentSession.id, currentUser.id, 'maybe');
                  setSpotlightMemberId(currentUser.id);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  currentSession.attendees[currentUser.id]?.status === 'maybe'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:bg-slate-800/80'
                }`}
              >
                <HelpCircle className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold leading-tight">Forse 🤔</span>
                <span className="text-[10px] opacity-80 mt-0.5">In dubbio</span>
              </button>

              {/* Salta */}
              <button
                onClick={() => {
                  onUpdateStatus(currentSession.id, currentUser.id, 'skipping');
                  setSpotlightMemberId(currentUser.id);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  currentSession.attendees[currentUser.id]?.status === 'skipping'
                    ? 'bg-rose-500 text-white font-bold border-rose-400 shadow-lg shadow-rose-500/25 scale-[1.02]'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-rose-500/50 hover:bg-slate-800/80'
                }`}
              >
                <Moon className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold leading-tight">Oggi salto 😴</span>
                <span className="text-[10px] opacity-80 mt-0.5">+1 Frullato</span>
              </button>
            </div>

            {currentSession.attendees[currentUser.id]?.status === 'skipping' && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium animate-in fade-in">
                <Coffee className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Hai saltato! Regolamento FitSquad: offri il frullato proteico a chi si allena! 🥤</span>
              </div>
            )}
          </div>

          {/* Squad Roster & Live Attendee Badges */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>Presenze della Squad ({presentCount}/{members.length})</span>
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="text-emerald-400 font-semibold">{presentCount} Ci sono</span>
                <span className="text-amber-400 font-semibold">{maybeCount} Forse</span>
                <span className="text-rose-400 font-semibold">{skipCount} Assenti</span>
              </div>
            </div>

            {/* Member Attendance Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {members.map((member) => {
                const status = currentSession.attendees[member.id]?.status || 'pending';
                const isSpotlight = spotlightMember.id === member.id;

                return (
                  <div
                    key={member.id}
                    onClick={() => setSpotlightMemberId(member.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSpotlight
                        ? 'bg-slate-800/90 border-emerald-500 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/50'
                    }`}
                    title="Clicca per visualizzare l'avatar 3D di questo amico"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-slate-950 shrink-0"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{member.name}</span>
                          {member.isCurrentUser && (
                            <span className="text-[9px] text-slate-400 font-bold">(Tu)</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate">{member.nickname}</span>
                      </div>
                    </div>

                    {/* Interactive dropdown/status selector for this member */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(currentSession.id, member.id, 'present');
                          setSpotlightMemberId(member.id);
                        }}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                          status === 'present'
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : 'text-slate-500 hover:text-emerald-400 bg-slate-900'
                        }`}
                        title="Conferma presenza"
                      >
                        🔥
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(currentSession.id, member.id, 'maybe');
                          setSpotlightMemberId(member.id);
                        }}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                          status === 'maybe'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-500 hover:text-amber-400 bg-slate-900'
                        }`}
                        title="In forse"
                      >
                        🤔
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateStatus(currentSession.id, member.id, 'skipping');
                          setSpotlightMemberId(member.id);
                        }}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                          status === 'skipping'
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'text-slate-500 hover:text-rose-400 bg-slate-900'
                        }`}
                        title="Segna assente"
                      >
                        😴
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Funny Squad Penalty Box ("Chi offre il frullato") */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Coffee className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base font-display flex items-center gap-2">
              <span>Classifica Frullati di Debito</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold">
                Penalità
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Chi salta gli allenamenti di gruppo offre le proteine post-workout a tutti i presenti!
            </p>
          </div>
        </div>

        {/* Member with highest debt */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">In debito questa settimana</span>
            <span className="text-xs font-bold text-amber-300">Matteo Verdi (Gambe di Cristallo)</span>
          </div>
          <div className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-sm">
            4 🥤
          </div>
        </div>
      </div>
    </div>
  );
};
