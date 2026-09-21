import React, { useState } from 'react';
import { Allievo, DayKey, UserRole } from '../types';
import { GymScheduleRow } from '../data/gymScheduleData';
import {
  X,
  UserPlus,
  Users,
  Trash2,
  Edit3,
  Check,
  Calendar,
  Phone,
  Mail,
  FileText,
  ShieldAlert,
  Search,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface StudentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Allievo[];
  userRole?: UserRole;
  onAddStudent: (
    name: string,
    phone?: string,
    email?: string,
    notes?: string,
    medicalCertExpiry?: string
  ) => void;
  onEditStudent: (
    id: string,
    updates: {
      name: string;
      phone?: string;
      email?: string;
      notes?: string;
      medicalCertExpiry?: string;
    }
  ) => void;
  onDeleteStudent: (id: string) => void;
  currentStudentId: string | null;
  onSelectCurrentStudent: (id: string) => void;
  schedule: GymScheduleRow[];
  onRemoveEnrollment?: (rowId: string, dayKey: DayKey, studentId: string) => void;
}

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  isOpen,
  onClose,
  students,
  userRole = 'gestore',
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  currentStudentId,
  onSelectCurrentStudent,
  schedule,
  onRemoveEnrollment,
}) => {
  // New student form state
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentNotes, setNewStudentNotes] = useState('');
  const [newStudentCert, setNewStudentCert] = useState('');
  const [showAdvancedAdd, setShowAdvancedAdd] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Detailed profile edit state
  const [editingStudent, setEditingStudent] = useState<Allievo | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    medicalCertExpiry: '',
  });

  const [confirmDeleteStudentId, setConfirmDeleteStudentId] = useState<string | null>(null);

  if (!isOpen) return null;

  const isGestore = userRole === 'gestore';

  // Calculate enrolled courses for each student
  const getEnrolledCourses = (studentId: string) => {
    const courses: { rowId: string; dayKey: DayKey; day: string; time: string; name: string }[] = [];
    const dayKeys: DayKey[] = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi'];
    schedule.forEach((row) => {
      dayKeys.forEach((dayKey) => {
        const cell = row.days[dayKey];
        if (cell && cell.enrolledMemberIds?.includes(studentId)) {
          courses.push({
            rowId: row.rowId,
            dayKey,
            day: dayKey.charAt(0).toUpperCase() + dayKey.slice(1),
            time: row.time,
            name: cell.name,
          });
        }
      });
    });
    return courses;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    onAddStudent(
      newStudentName.trim(),
      newStudentPhone.trim() || undefined,
      newStudentEmail.trim() || undefined,
      newStudentNotes.trim() || undefined,
      newStudentCert.trim() || undefined
    );
    setNewStudentName('');
    setNewStudentPhone('');
    setNewStudentEmail('');
    setNewStudentNotes('');
    setNewStudentCert('');
    setShowAdvancedAdd(false);
  };

  const handleOpenEditProfile = (student: Allievo) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name || '',
      phone: student.phone || '',
      email: student.email || '',
      notes: student.notes || '',
      medicalCertExpiry: student.medicalCertExpiry || '',
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editForm.name.trim()) return;
    onEditStudent(editingStudent.id, {
      name: editForm.name.trim(),
      phone: editForm.phone.trim() || undefined,
      email: editForm.email.trim() || undefined,
      notes: editForm.notes.trim() || undefined,
      medicalCertExpiry: editForm.medicalCertExpiry.trim() || undefined,
    });
    setEditingStudent(null);
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.phone && s.phone.includes(searchQuery)) ||
    (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn print:hidden">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-display text-white">
                  {isGestore ? 'Gestione Profili Allievi' : 'Elenco Allievi'}
                </h3>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                    isGestore
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-[#0288d1]/20 text-cyan-300 border-[#0288d1]/30'
                  }`}
                >
                  {isGestore ? '🛡️ Gestore' : '🎓 Allievo'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isGestore
                  ? 'Inserisci e modifica i profili allievi (scheda, contatti, visite mediche) e gestisci le presenze.'
                  : 'Visualizza gli allievi della palestra e seleziona il tuo profilo attivo.'}
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

        {/* PROFILE EDIT MODAL POPUP (OVERLAY) */}
        {editingStudent && (
          <div className="absolute inset-0 z-30 bg-slate-900/95 backdrop-blur-md p-5 sm:p-6 overflow-y-auto flex flex-col justify-between animate-fadeIn">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-lg font-black text-white font-display">
                    Modifica Profilo Allievo
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Nome e Cognome *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Telefono / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="es. 340 1234567"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Indirizzo Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="es. allievo@email.it"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Scadenza Certificato Medico
                    </label>
                    <input
                      type="date"
                      value={editForm.medicalCertExpiry}
                      onChange={(e) => setEditForm({ ...editForm, medicalCertExpiry: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Note Profilo / Scheda Anamnestica / Obiettivi
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Note su esigenze motorie, obiettivi fitness, scheda o preferenze orari..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Presenze settimanali di questo allievo */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Corsi Iscritti questa settimana ({getEnrolledCourses(editingStudent.id).length})
                  </span>
                  {getEnrolledCourses(editingStudent.id).length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      Nessun corso iscritto questa settimana.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {getEnrolledCourses(editingStudent.id).map((c, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-bold flex items-center gap-1.5"
                        >
                          <span>
                            {c.day} {c.time}: {c.name}
                          </span>
                          {onRemoveEnrollment && (
                            <button
                              type="button"
                              onClick={() => onRemoveEnrollment(c.rowId, c.dayKey, editingStudent.id)}
                              className="text-rose-400 hover:text-rose-300 ml-1"
                              title="Rimuovi da questo corso"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteStudent(editingStudent.id);
                      setEditingStudent(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Elimina Allievo</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingStudent(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                      Annulla
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/25"
                    >
                      <Check className="w-4 h-4" />
                      <span>Salva Profilo</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Inserimento Nuovo Allievo (Solo per Gestore) */}
        {isGestore && (
          <div className="pt-4 pb-3 border-b border-slate-800/80 shrink-0">
            <form
              onSubmit={handleAddSubmit}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  Inserisci Nuovo Allievo
                </span>
                <button
                  type="button"
                  onClick={() => setShowAdvancedAdd(!showAdvancedAdd)}
                  className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-semibold"
                >
                  <span>{showAdvancedAdd ? 'Campi Base' : 'Dettagli Completi (Email, Scheda)'}</span>
                  {showAdvancedAdd ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className={showAdvancedAdd ? 'sm:col-span-6' : 'sm:col-span-7'}>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Nome e Cognome allievo *"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className={showAdvancedAdd ? 'sm:col-span-6' : 'sm:col-span-5'}>
                  <input
                    type="tel"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    placeholder="Telefono / WhatsApp"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {showAdvancedAdd && (
                <div className="space-y-2 pt-1 border-t border-slate-800/80 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="email"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      placeholder="Email allievo..."
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="date"
                      value={newStudentCert}
                      onChange={(e) => setNewStudentCert(e.target.value)}
                      title="Scadenza Certificato Medico"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={newStudentNotes}
                    onChange={(e) => setNewStudentNotes(e.target.value)}
                    placeholder="Note scheda, anamnesi motoria o obiettivi..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#7cb342] hover:bg-[#689f38] text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#7cb342]/20 transition-all active:scale-95"
                >
                  <UserPlus className="w-4 h-4 stroke-[3]" />
                  <span>Crea Profilo Allievo</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca allievo per nome, telefono o email..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* List of Students */}
        <div className="overflow-y-auto space-y-2 py-2 pr-1 scrollbar-none flex-1">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              {searchQuery ? 'Nessun allievo trovato per questa ricerca.' : 'Nessun allievo registrato.'}
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isCurrent = student.id === currentStudentId;
              const enrolledCourses = getEnrolledCourses(student.id);

              return (
                <div
                  key={student.id}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-black text-sm shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{student.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              Attivo
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-slate-400">
                          {student.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {student.phone}
                            </span>
                          )}
                          {student.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" />
                              {student.email}
                            </span>
                          )}
                          {student.medicalCertExpiry && (
                            <span className="text-[11px] text-amber-300 font-medium">
                              Cert. Medico: {student.medicalCertExpiry}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => onSelectCurrentStudent(student.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          isCurrent
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                        }`}
                        title="Seleziona questo allievo"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{isCurrent ? 'Selezionato' : 'Seleziona'}</span>
                      </button>

                      {isGestore && (
                        <button
                          onClick={() => handleOpenEditProfile(student)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Modifica profilo completo (scheda, contatti, visite mediche)"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="hidden sm:inline">Modifica Profilo</span>
                        </button>
                      )}

                      {isGestore && (
                        <>
                          {confirmDeleteStudentId === student.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  onDeleteStudent(student.id);
                                  setConfirmDeleteStudentId(null);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs"
                              >
                                Conferma
                              </button>
                              <button
                                onClick={() => setConfirmDeleteStudentId(null)}
                                className="p-1 rounded-lg bg-slate-800 text-slate-400 text-xs"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteStudentId(student.id)}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Elimina allievo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Notes snippet if exists */}
                  {student.notes && (
                    <p className="mt-2 text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60 flex items-start gap-1.5">
                      <FileText className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                      <span>{student.notes}</span>
                    </p>
                  )}

                  {/* Enrolled Courses Badges */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      {enrolledCourses.length} {enrolledCourses.length === 1 ? 'corso' : 'corsi'}:
                    </span>
                    {enrolledCourses.length === 0 ? (
                      <span className="text-[11px] text-slate-500 italic">Nessuna presenza registrata</span>
                    ) : (
                      enrolledCourses.map((course, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200"
                        >
                          {course.day} {course.time}: {course.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Totale: <strong className="text-white">{students.length}</strong> allievi registrati</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
