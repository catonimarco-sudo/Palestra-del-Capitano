import React, { useState, useRef, useEffect } from 'react';
import { Allievo, UserRole } from '../types';
import {
  ChevronDown,
  UserCheck,
  UserPlus,
  Trash2,
  Check,
  Search,
  X,
  Users,
} from 'lucide-react';

interface StudentDropdownProps {
  students: Allievo[];
  currentStudentId: string | null;
  userRole?: UserRole;
  onSelectStudent: (id: string | null) => void;
  onAddStudent: (name: string) => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentDropdown: React.FC<StudentDropdownProps> = ({
  students,
  currentStudentId,
  userRole = 'gestore',
  onSelectStudent,
  onAddStudent,
  onDeleteStudent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isGestore = userRole === 'gestore';
  const currentStudent = students.find((s) => s.id === currentStudentId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setConfirmDeleteId(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddStudent(newName.trim());
    setNewName('');
    setSearchQuery('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteStudent(id);
    setConfirmDeleteId(null);
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={dropdownRef}>
      {/* Main Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
          currentStudent
            ? 'bg-slate-900 hover:bg-slate-800 text-white border-emerald-500/50 ring-1 ring-emerald-500/20'
            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
        }`}
      >
        <UserCheck className={`w-4 h-4 ${currentStudent ? 'text-[#7cb342]' : 'text-slate-400'}`} />
        <div className="flex flex-col text-left">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
            Allievo attivo:
          </span>
          <span className="truncate max-w-[140px] sm:max-w-[180px] font-bold text-white">
            {currentStudent ? currentStudent.name : 'Seleziona Allievo ▼'}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Quick Delete Button for Currently Selected Student */}
      {currentStudent && (
        <button
          type="button"
          onClick={() => onDeleteStudent(currentStudent.id)}
          className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 border border-rose-800/40 text-xs font-bold transition-colors"
          title={`Elimina allievo ${currentStudent.name} dall'elenco`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Elimina</span>
        </button>
      )}

      {/* FLOATING DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700/90 shadow-2xl z-50 p-3 flex flex-col gap-2.5 animate-fadeIn text-slate-200">
          {/* Header of dropdown */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-wide">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Lista Allievi ({students.length})</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Student Quick Form (Solo per Gestore) */}
          {isGestore ? (
            <form onSubmit={handleAddSubmit} className="flex items-center gap-1.5">
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome e cognome allievo..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-[#7cb342] hover:bg-[#689f38] text-slate-950 font-black text-xs flex items-center gap-1 shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Aggiungi</span>
              </button>
            </form>
          ) : (
            <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              🎓 Seleziona il tuo nome dall'elenco per gestire le tue presenze ai corsi.
            </div>
          )}

          {/* Search if more than 3 students */}
          {students.length > 3 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtra allievi per nome..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-slate-700"
              />
            </div>
          )}

          {/* Students List in Dropdown */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-none">
            {filteredStudents.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center italic">
                Nessun allievo trovato. Inserisci un nome sopra per aggiungerlo.
              </p>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = student.id === currentStudentId;
                const isConfirmingDelete = confirmDeleteId === student.id;

                return (
                  <div
                    key={student.id}
                    onClick={() => {
                      onSelectStudent(student.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {/* Left: Name and indicator */}
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold truncate">
                        {student.name}
                      </span>
                    </div>

                    {/* Right: Actions */}
                    <div
                      className="flex items-center gap-1.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isSelected && !isConfirmingDelete && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          Attivo
                        </span>
                      )}

                      {/* Delete confirmation or Delete button (Solo Gestore) */}
                      {isGestore && (
                        <>
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1 animate-fadeIn">
                              <button
                                type="button"
                                onClick={(e) => handleDelete(student.id, e)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] rounded-lg shadow"
                                title="Conferma eliminazione"
                              >
                                Elimina
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(null);
                                }}
                                className="px-1.5 py-1 bg-slate-800 text-slate-400 hover:text-white text-[10px] rounded-lg"
                                title="Annulla"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(student.id);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                              title={`Elimina ${student.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer of dropdown */}
          {currentStudent && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Allievo attivo: {currentStudent.name}</span>
              <button
                type="button"
                onClick={() => {
                  onSelectStudent(null);
                  setIsOpen(false);
                }}
                className="text-slate-400 hover:text-rose-300 font-semibold"
              >
                Deseleziona
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
