import React, { useState } from 'react';
import { SquadMember, AttendanceStatus } from '../types';
import { Avatar3DViewer } from './Avatar3DViewer';
import { MemberModal } from './MemberModal';
import {
  Trophy,
  Flame,
  Coffee,
  Sparkles,
  Dumbbell,
  Palette,
  Heart,
  Check,
  UserPlus,
  Pencil,
  Trash2,
  AlertTriangle,
  Users,
} from 'lucide-react';

interface SquadMembersViewProps {
  members: SquadMember[];
  onUpdateMemberColor: (memberId: string, avatarColor: string, headbandColor: string) => void;
  onAddMember?: (memberData: Omit<SquadMember, 'id'>) => void;
  onEditMember?: (memberId: string, memberData: Omit<SquadMember, 'id'>) => void;
  onDeleteMember?: (memberId: string) => void;
}

export const SquadMembersView: React.FC<SquadMembersViewProps> = ({
  members,
  onUpdateMemberColor,
  onAddMember,
  onEditMember,
  onDeleteMember,
}) => {
  const [selectedMember, setSelectedMember] = useState<SquadMember>(members[0] || {
    id: 'user_1',
    name: 'Marco',
    nickname: 'Iron Marco ⚡',
    role: 'Caposquadra',
    avatarColor: '#10b981',
    headbandColor: '#ef4444',
    streakDays: 14,
    totalWorkouts: 42,
    proteinShakesOwed: 0,
    motto: 'Nessuna scusa!',
    favoriteExercise: 'ex_squat',
    isCurrentUser: true,
  });

  const [demoStatus, setDemoStatus] = useState<AttendanceStatus>('present');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<SquadMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<SquadMember | null>(null);

  // Customization color options
  const tankColors = ['#10b981', '#3b82f6', '#ec4899', '#f97316', '#8b5cf6', '#eab308'];
  const headbandColors = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ffffff'];

  // Total protein shakes owed
  const totalSmoothiesOwed = members.reduce((sum, m) => sum + m.proteinShakesOwed, 0);

  const handleOpenAdd = () => {
    setMemberToEdit(null);
    setIsMemberModalOpen(true);
  };

  const handleOpenEdit = (member: SquadMember, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMemberToEdit(member);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (memberData: Omit<SquadMember, 'id'>, existingId?: string) => {
    if (existingId) {
      onEditMember?.(existingId, memberData);
      if (selectedMember.id === existingId) {
        setSelectedMember({ ...memberData, id: existingId });
      }
    } else {
      onAddMember?.(memberData);
    }
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      onDeleteMember?.(memberToDelete.id);
      if (selectedMember.id === memberToDelete.id) {
        const remaining = members.filter((m) => m.id !== memberToDelete.id);
        if (remaining.length > 0) {
          setSelectedMember(remaining[0]);
        }
      }
      setMemberToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Allievi Counter & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              REGISTRO ALLIEVI & SQUADRA
            </span>
            <span className="text-xs text-slate-400 font-bold">
              {members.length} Allievi Totali
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
            GESTIONE ALLIEVI & AVATAR 3D
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Aggiungi, modifica ed elimina allievi. Seleziona un allievo per vederne l'avatar 3D in tempo reale.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuovo Allievo</span>
          </button>

          <div className="flex items-center gap-2.5 bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-slate-800">
            <Coffee className="w-4 h-4 text-rose-400" />
            <div>
              <span className="text-xs font-black text-rose-400 block leading-tight">
                {totalSmoothiesOwed}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Frullati</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Main 3D Avatar Showcase & Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Left: 3D Animated Avatar Interactive Stage */}
        <div className="lg:col-span-6 flex flex-col items-center justify-between bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 relative">
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: selectedMember.avatarColor }}
              />
              <span className="font-bold text-base text-white">{selectedMember.name}</span>
              <span className="text-xs text-emerald-400 font-semibold">({selectedMember.nickname})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEdit(selectedMember)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-bold flex items-center gap-1"
                title="Modifica dati allievo"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Modifica</span>
              </button>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>{selectedMember.streakDays} gg</span>
              </div>
            </div>
          </div>

          {/* 3D WebGL Avatar */}
          <Avatar3DViewer
            key={`${selectedMember.id}-${demoStatus}-${selectedMember.avatarColor}-${selectedMember.headbandColor}`}
            status={demoStatus}
            avatarColor={selectedMember.avatarColor}
            headbandColor={selectedMember.headbandColor}
            memberName={selectedMember.name}
            interactive={true}
            size="lg"
          />

          {/* Live Reaction Test Switcher */}
          <div className="w-full mt-4 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Simula Reazione 3D dell'Avatar:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setDemoStatus('present')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  demoStatus === 'present'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                🔥 Festeggia
              </button>
              <button
                onClick={() => setDemoStatus('maybe')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  demoStatus === 'maybe'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                🤔 Dubbioso
              </button>
              <button
                onClick={() => setDemoStatus('skipping')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  demoStatus === 'skipping'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                😴 Stanco / Salta
              </button>
            </div>
          </div>
        </div>

        {/* Right: Member Details, Motto & Avatar Customizer */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-bold">
                {selectedMember.role}
              </span>
              {selectedMember.isCurrentUser && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold">
                  Il Tuo Profilo
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
              {selectedMember.name}
            </h2>
            <p className="text-sm text-slate-400 font-medium italic mt-1">
              "{selectedMember.motto}"
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 text-center">
              <span className="text-xs text-slate-400 block mb-1">Streak</span>
              <span className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-current" />
                {selectedMember.streakDays}
              </span>
              <span className="text-[10px] text-slate-500">giorni consecutivi</span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 text-center">
              <span className="text-xs text-slate-400 block mb-1">Sessioni</span>
              <span className="text-xl font-black text-emerald-400 flex items-center justify-center gap-1">
                <Dumbbell className="w-4 h-4" />
                {selectedMember.totalWorkouts}
              </span>
              <span className="text-[10px] text-slate-500">totali col gruppo</span>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 text-center">
              <span className="text-xs text-slate-400 block mb-1">Frullati Dovuti</span>
              <span className="text-xl font-black text-rose-400 flex items-center justify-center gap-1">
                <Coffee className="w-4 h-4" />
                {selectedMember.proteinShakesOwed}
              </span>
              <span className="text-[10px] text-slate-500">penalità assenze</span>
            </div>
          </div>

          {/* Avatar Color Customizer */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Palette className="w-4 h-4 text-emerald-400" />
              <span>Personalizza Colori dell'Avatar 3D</span>
            </div>

            {/* Tank Top Color */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                Colore Canotta Palestra:
              </span>
              <div className="flex items-center gap-2">
                {tankColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onUpdateMemberColor(selectedMember.id, color, selectedMember.headbandColor);
                      setSelectedMember({ ...selectedMember, avatarColor: color });
                    }}
                    className={`w-8 h-8 rounded-xl transition-transform flex items-center justify-center ${
                      selectedMember.avatarColor === color
                        ? 'ring-2 ring-white scale-110'
                        : 'hover:scale-105 opacity-80'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedMember.avatarColor === color && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Headband Color */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                Colore Fascia per Capelli:
              </span>
              <div className="flex items-center gap-2">
                {headbandColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onUpdateMemberColor(selectedMember.id, selectedMember.avatarColor, color);
                      setSelectedMember({ ...selectedMember, headbandColor: color });
                    }}
                    className={`w-8 h-8 rounded-xl transition-transform flex items-center justify-center ${
                      selectedMember.headbandColor === color
                        ? 'ring-2 ring-white scale-110'
                        : 'hover:scale-105 opacity-80'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedMember.headbandColor === color && <Check className="w-4 h-4 text-slate-950 drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Squad Roster Selector & Management Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Elenco Allievi Palestra ({members.length})</span>
          </h3>
          <span className="text-xs text-slate-500">
            Clicca per selezionare l'avatar 3D
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map((member) => {
            const isSelected = member.id === selectedMember.id;

            return (
              <div
                key={member.id}
                onClick={() => {
                  setSelectedMember(member);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-slate-950 shadow"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span>{member.name}</span>
                        {member.isCurrentUser && (
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 rounded">Tu</span>
                        )}
                      </h4>
                      <span className="text-xs text-slate-400 block">{member.nickname}</span>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleOpenEdit(member, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Modifica Allievo"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMemberToDelete(member);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Elimina Allievo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-xs">
                  <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                    {member.role}
                  </span>

                  <div className="flex items-center gap-1 font-bold text-amber-400">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>{member.streakDays} gg</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member Modal for Add/Edit */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSave={handleSaveMember}
        memberToEdit={memberToEdit}
      />

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-lg font-black text-white">Eliminare Allievo?</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Sei sicuro di voler eliminare <strong>{memberToDelete.name}</strong> dal gruppo?
                Le sue statistiche e avatar associati verranno rimossi.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Annulla
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs shadow-md"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
