import React, { useState } from 'react';
import {
  X,
  Users,
  Calendar,
  Clock,
  User,
  Copy,
  Check,
  Search,
  ExternalLink,
  Printer,
  ChevronRight,
  Phone,
} from 'lucide-react';
import { GymScheduleRow, GymScheduleCell, GYM_CATEGORIES } from '../data/gymScheduleData';
import { Allievo, DayKey } from '../types';

interface DailyAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: GymScheduleRow[];
  students: Allievo[];
  onOpenCourseDetail: (cell: GymScheduleCell, dayKey: DayKey, time: string, rowId: string) => void;
}

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'lunedi', label: 'Lunedì' },
  { key: 'martedi', label: 'Martedì' },
  { key: 'mercoledi', label: 'Mercoledì' },
  { key: 'giovedi', label: 'Giovedì' },
  { key: 'venerdi', label: 'Venerdì' },
];

export const DailyAttendanceModal: React.FC<DailyAttendanceModalProps> = ({
  isOpen,
  onClose,
  schedule,
  students,
  onOpenCourseDetail,
}) => {
  // Determine current day of week if Monday-Friday, else default to 'lunedi'
  const getInitialDay = (): DayKey => {
    const dayOfWeek = new Date().getDay(); // 0 is Sun, 1 is Mon, 5 is Fri, 6 is Sat
    if (dayOfWeek === 1) return 'lunedi';
    if (dayOfWeek === 2) return 'martedi';
    if (dayOfWeek === 3) return 'mercoledi';
    if (dayOfWeek === 4) return 'giovedi';
    if (dayOfWeek === 5) return 'venerdi';
    return 'mercoledi';
  };

  const [selectedDay, setSelectedDay] = useState<DayKey>(getInitialDay);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCourseId, setCopiedCourseId] = useState<string | null>(null);
  const [copiedAllDay, setCopiedAllDay] = useState(false);

  if (!isOpen) return null;

  // Extract all courses scheduled on the selected day
  const coursesForDay: {
    cell: GymScheduleCell;
    time: string;
    rowId: string;
    enrolledStudents: Allievo[];
  }[] = [];

  schedule.forEach((row) => {
    const cell = row.days[selectedDay as keyof typeof row.days];
    if (cell && cell.name) {
      const enrolled = (cell.enrolledMemberIds || [])
        .map((id: string) => students.find((s: Allievo) => s.id === id))
        .filter((s: Allievo | undefined): s is Allievo => Boolean(s));

      coursesForDay.push({
        cell,
        time: row.time,
        rowId: row.rowId,
        enrolledStudents: enrolled,
      });
    }
  });

  // Sort by time
  coursesForDay.sort((a, b) => a.time.localeCompare(b.time));

  // Count total presences on this day
  const totalDayPresences = coursesForDay.reduce(
    (sum, c) => sum + c.enrolledStudents.length,
    0
  );

  // Filtered by search query (course name, instructor, or student name)
  const filteredCourses = coursesForDay.filter(({ cell, enrolledStudents }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = cell.name.toLowerCase().includes(q);
    const matchInstructor = (cell.instructor || '').toLowerCase().includes(q);
    const matchStudent = enrolledStudents.some((s) =>
      s.name.toLowerCase().includes(q)
    );
    return matchName || matchInstructor || matchStudent;
  });

  // Copy single course attendee list
  const handleCopyCourseAttendees = (
    courseName: string,
    time: string,
    enrolled: Allievo[],
    id: string
  ) => {
    const dayLabel = DAYS.find((d) => d.key === selectedDay)?.label || selectedDay;
    const names = enrolled.map((s) => s.name).join(', ');
    const textToCopy = `Presenti al corso di ${courseName} (${dayLabel} ore ${time}): ${
      names || 'Nessuno'
    }`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedCourseId(id);
    setTimeout(() => setCopiedCourseId(null), 2000);
  };

  // Copy all day attendees report
  const handleCopyDayReport = () => {
    const dayLabel = DAYS.find((d) => d.key === selectedDay)?.label || selectedDay;
    let report = `📋 RIEPILOGO PRESENZE - ${dayLabel.toUpperCase()}\n`;
    report += `Totale presenze registrate: ${totalDayPresences}\n\n`;

    coursesForDay.forEach(({ cell, time, enrolledStudents }) => {
      const names = enrolledStudents.map((s) => s.name).join(', ');
      report += `• Ore ${time} - ${cell.name} (${enrolledStudents.length} presenti):\n  ${
        names || 'Nessun allievo registrato'
      }\n\n`;
    });

    navigator.clipboard.writeText(report);
    setCopiedAllDay(true);
    setTimeout(() => setCopiedAllDay(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Presenze Giornaliere ai Corsi</span>
              </h3>
              <p className="text-xs text-slate-400">
                Visualizza la lista degli allievi presenti per ciascun corso della giornata
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Stampa foglio presenze"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Stampa</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day Selector Tabs & Actions */}
        <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-slate-800 bg-slate-950/40 space-y-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Days buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {DAYS.map((day) => {
                const isSelected = selectedDay === day.key;
                // Count presences for this tab
                let dayPresences = 0;
                schedule.forEach((row) => {
                  const c = row.days[day.key as keyof typeof row.days];
                  if (c?.enrolledMemberIds) {
                    dayPresences += c.enrolledMemberIds.length;
                  }
                });

                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => {
                      setSelectedDay(day.key);
                      setSearchQuery('');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#7cb342] text-slate-950 shadow-md shadow-[#7cb342]/20 scale-105'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{day.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-slate-950 text-[#7cb342]'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {dayPresences}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick copy day report */}
            <button
              type="button"
              onClick={handleCopyDayReport}
              disabled={coursesForDay.length === 0}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
              title="Copia l'intero riepilogo presenze del giorno per WhatsApp o appunti"
            >
              {copiedAllDay ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span>Copiato negli appunti!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copia Riepilogo Giornata</span>
                </>
              )}
            </button>
          </div>

          {/* Search bar & info banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca corso, allievo o istruttore..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>
                Corsi: <strong className="text-white font-bold">{coursesForDay.length}</strong>
              </span>
              <span>•</span>
              <span>
                Presenze totali:{' '}
                <strong className="text-emerald-400 font-bold">{totalDayPresences} allievi</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body: Course Attendance Cards List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1 scrollbar-none">
          {filteredCourses.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 space-y-2">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-bold text-sm">
                {searchQuery
                  ? 'Nessun corso o allievo trovato con questo filtro.'
                  : 'Nessun corso in programma per questa giornata.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Azzera filtro di ricerca
                </button>
              )}
            </div>
          ) : (
            filteredCourses.map(({ cell, time, rowId, enrolledStudents }) => {
              const catMeta = GYM_CATEGORIES[cell.category] || GYM_CATEGORIES.posturale;
              const courseColor = cell.customColor || catMeta.hexColor;
              const isCopied = copiedCourseId === cell.id;

              return (
                <div
                  key={`${rowId}_${cell.id}`}
                  className="rounded-2xl bg-slate-950/80 border border-slate-800/90 overflow-hidden shadow-sm hover:border-slate-700 transition-all space-y-3 p-4 sm:p-5"
                >
                  {/* Top line of course card */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: courseColor }}
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                          ore {time}
                        </span>
                        <h4 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                          {cell.name}
                        </h4>
                      </div>
                    </div>

                    {/* Instructor and Room info */}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#7cb342]" />
                        <span>
                          Istruttore:{' '}
                          <strong className="text-white font-bold">
                            {cell.instructor || 'Staff Palestra'}
                          </strong>
                        </span>
                      </div>
                      {cell.room && (
                        <span className="hidden sm:inline bg-slate-900 px-2 py-0.5 rounded-md text-[11px] text-slate-300 border border-slate-800">
                          {cell.room}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Presence Section: "presenti al corso di i-pilates: marco, francesco etc" */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-400" />
                        Presenti al corso di {cell.name} ({enrolledStudents.length}):
                      </span>

                      {/* Action buttons: copy or view details */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyCourseAttendees(cell.name, time, enrolledStudents, cell.id)
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="Copia l'elenco dei presenti"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                              <span className="text-emerald-400">Copiato</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copia elenco</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenCourseDetail(cell, selectedDay, time, rowId);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="Apri corso per iscrivere o togliere allievi"
                        >
                          <span>Iscriviti / Gestisci</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* The readable attendees list */}
                    {enrolledStudents.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        {/* Text string matching user's requested example: "Presenti: Marco, Francesco, etc." */}
                        <p className="text-sm font-semibold text-white leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                          <span className="text-slate-400 font-normal">Presenti: </span>
                          <span className="text-[#7cb342] font-black">
                            {enrolledStudents.map((s) => s.name).join(', ')}
                          </span>
                        </p>

                        {/* Badges for each student */}
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {enrolledStudents.map((student) => (
                            <span
                              key={student.id}
                              className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
                            >
                              <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-center font-black">
                                {student.name.charAt(0)}
                              </span>
                              <span>{student.name}</span>
                              {student.phone && (
                                <span className="text-[10px] text-slate-400 font-normal flex items-center gap-0.5">
                                  <Phone className="w-2.5 h-2.5 opacity-70" />
                                  <span>{student.phone}</span>
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-1">
                        Nessun allievo ancora registrato come presente a questo orario. Clicca su{' '}
                        <strong className="text-emerald-400 font-bold">"Iscriviti / Gestisci"</strong>{' '}
                        per registrare la presenza.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400">
            Suggerimento: Clicca su <strong>"Copia elenco"</strong> per inviare i presenti agli istruttori su WhatsApp.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
