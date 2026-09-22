import React, { useState, useMemo } from 'react';
import {
  X,
  Users,
  Calendar,
  Clock,
  User,
  Copy,
  Check,
  Search,
  Printer,
  ChevronLeft,
  ChevronRight,
  Phone,
  Filter,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { GymScheduleRow, GymScheduleCell, GymInfoSettings, GYM_CATEGORIES } from '../data/gymScheduleData';
import { Allievo, DayKey } from '../types';
import { DayDateInfo } from '../utils/dateUtils';

interface DailyAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: GymScheduleRow[];
  students: Allievo[];
  gymInfo: GymInfoSettings;
  weekLabel: string;
  weekDates: Record<DayKey, DayDateInfo>;
  onOpenCourseDetail: (cell: GymScheduleCell, dayKey: DayKey, time: string, rowId: string) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onCurrentWeek?: () => void;
  isCurrentWeek?: boolean;
}

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'lunedi', label: 'Lunedì', short: 'LUN' },
  { key: 'martedi', label: 'Martedì', short: 'MAR' },
  { key: 'mercoledi', label: 'Mercoledì', short: 'MER' },
  { key: 'giovedi', label: 'Giovedì', short: 'GIO' },
  { key: 'venerdi', label: 'Venerdì', short: 'VEN' },
];

export const DailyAttendanceModal: React.FC<DailyAttendanceModalProps> = ({
  isOpen,
  onClose,
  schedule,
  students,
  gymInfo,
  weekLabel,
  weekDates,
  onOpenCourseDetail,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  isCurrentWeek = true,
}) => {
  // Determine initial day based on today
  const getInitialDay = (): DayKey | 'all' => {
    const dayOfWeek = new Date().getDay(); // 0 is Sun, 1 is Mon, 5 is Fri
    if (dayOfWeek === 1) return 'lunedi';
    if (dayOfWeek === 2) return 'martedi';
    if (dayOfWeek === 3) return 'mercoledi';
    if (dayOfWeek === 4) return 'giovedi';
    if (dayOfWeek === 5) return 'venerdi';
    return 'lunedi';
  };

  const [selectedDay, setSelectedDay] = useState<DayKey | 'all'>(getInitialDay);
  const [selectedCourseName, setSelectedCourseName] = useState<string>('all');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCourseId, setCopiedCourseId] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  // Extract all distinct course names from the entire schedule
  const availableCourseNames = useMemo(() => {
    const namesSet = new Set<string>();
    schedule.forEach((row) => {
      Object.values(row.days).forEach((cell) => {
        if (cell && cell.name) {
          namesSet.add(cell.name);
        }
      });
    });
    return Array.from(namesSet).sort((a, b) => a.localeCompare(b));
  }, [schedule]);

  // Extract all distinct instructors
  const availableInstructors = useMemo(() => {
    const instructorsSet = new Set<string>();
    schedule.forEach((row) => {
      Object.values(row.days).forEach((cell) => {
        if (cell && cell.instructor) {
          instructorsSet.add(cell.instructor);
        }
      });
    });
    return Array.from(instructorsSet).sort((a, b) => a.localeCompare(b));
  }, [schedule]);

  if (!isOpen) return null;

  // Flatten all scheduled sessions with day and student objects
  const allSessions: {
    cell: GymScheduleCell;
    dayKey: DayKey;
    dayLabel: string;
    dayDateInfo?: DayDateInfo;
    time: string;
    rowId: string;
    enrolledStudents: Allievo[];
  }[] = [];

  schedule.forEach((row) => {
    (Object.keys(row.days) as DayKey[]).forEach((dayKey) => {
      const cell = row.days[dayKey];
      if (cell && cell.name) {
        const enrolled = (cell.enrolledMemberIds || [])
          .map((id: string) => students.find((s: Allievo) => s.id === id))
          .filter((s: Allievo | undefined): s is Allievo => Boolean(s));

        const dayConfig = DAYS.find((d) => d.key === dayKey);
        allSessions.push({
          cell,
          dayKey,
          dayLabel: dayConfig ? dayConfig.label : dayKey,
          dayDateInfo: weekDates ? weekDates[dayKey] : undefined,
          time: row.time,
          rowId: row.rowId,
          enrolledStudents: enrolled,
        });
      }
    });
  });

  // Apply User Filters
  const filteredSessions = allSessions.filter((session) => {
    // 1. Day Filter
    if (selectedDay !== 'all' && session.dayKey !== selectedDay) {
      return false;
    }

    // 2. Course Name Filter
    if (selectedCourseName !== 'all' && session.cell.name.toLowerCase() !== selectedCourseName.toLowerCase()) {
      return false;
    }

    // 3. Instructor Filter
    if (selectedInstructor !== 'all' && session.cell.instructor !== selectedInstructor) {
      return false;
    }

    // 4. Text Search (matches course, instructor, or student name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCourse = session.cell.name.toLowerCase().includes(q);
      const matchInstructor = (session.cell.instructor || '').toLowerCase().includes(q);
      const matchStudent = session.enrolledStudents.some((s) => s.name.toLowerCase().includes(q));
      if (!matchCourse && !matchInstructor && !matchStudent) {
        return false;
      }
    }

    return true;
  });

  // Sort sessions: by Day order (Mon -> Fri) then by time
  const dayOrder: Record<DayKey, number> = {
    lunedi: 1,
    martedi: 2,
    mercoledi: 3,
    giovedi: 4,
    venerdi: 5,
  };

  filteredSessions.sort((a, b) => {
    if (dayOrder[a.dayKey] !== dayOrder[b.dayKey]) {
      return dayOrder[a.dayKey] - dayOrder[b.dayKey];
    }
    return a.time.localeCompare(b.time);
  });

  // Total attendee count across filtered sessions
  const totalFilteredPresences = filteredSessions.reduce(
    (sum, s) => sum + s.enrolledStudents.length,
    0
  );

  // Active filters count for reset button
  const hasActiveFilters =
    selectedDay !== 'all' || selectedCourseName !== 'all' || selectedInstructor !== 'all' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSelectedDay('all');
    setSelectedCourseName('all');
    setSelectedInstructor('all');
    setSearchQuery('');
  };

  // Copy single course attendee list
  const handleCopyCourseAttendees = (
    courseName: string,
    dayLabel: string,
    dateStr: string,
    time: string,
    enrolled: Allievo[],
    id: string
  ) => {
    const names = enrolled.map((s) => s.name).join(', ');
    const textToCopy = `Presenti a ${courseName} (${dayLabel} ${dateStr} ore ${time}): ${
      names || 'Nessun allievo iscritto'
    }`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedCourseId(id);
    setTimeout(() => setCopiedCourseId(null), 2000);
  };

  // Copy complete filtered report
  const handleCopyReport = () => {
    const gymTitle = gymInfo.gymName || gymInfo.appName || 'CENTRO SPORTIVO';
    let report = `📋 ELENCO PRESENZE CORSI - ${gymTitle.toUpperCase()}\n`;
    report += `${weekLabel}\n`;
    if (selectedDay !== 'all') {
      const d = DAYS.find((item) => item.key === selectedDay);
      report += `Giorno: ${d?.label || selectedDay} ${weekDates[selectedDay]?.dateStr || ''}\n`;
    }
    if (selectedCourseName !== 'all') {
      report += `Corso: ${selectedCourseName}\n`;
    }
    report += `Totale persone presenti: ${totalFilteredPresences}\n\n`;

    filteredSessions.forEach(({ cell, dayLabel, dayDateInfo, time, enrolledStudents }) => {
      const names = enrolledStudents.map((s) => s.name).join(', ');
      report += `• ${dayLabel.toUpperCase()} ${dayDateInfo?.dateStr || ''} ore ${time} - ${cell.name} (Istruttore: ${
        cell.instructor || 'Staff'
      }) [${enrolledStudents.length} presenti]:\n  ${names || 'Nessun allievo registrato'}\n\n`;
    });

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Specialized Print trigger
  const handlePrintAttendanceSheet = () => {
    document.body.classList.add('printing-attendance');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-attendance');
    }, 1200);
  };

  return (
    <>
      {/* SCREEN MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn print:hidden">
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
          
          {/* Top Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#7cb342]/20 text-[#7cb342] flex items-center justify-center border border-[#7cb342]/30 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>Elenco e Stampa Presenze Corsi</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#7cb342]/20 text-[#7cb342] border border-[#7cb342]/30">
                    {totalFilteredPresences} presenti
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {weekLabel} • Filtra per corso e giorno per vedere o stampare chi parteciperà
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintAttendanceSheet}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
                title="Stampa foglio presenze per la palestra"
              >
                <Printer className="w-4 h-4" />
                <span>Stampa Foglio Presenze</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* FILTERS PANEL */}
          <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/40 space-y-3 shrink-0">
            {/* Week navigation row if provided */}
            {onPrevWeek && onNextWeek && (
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onPrevWeek}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 font-bold"
                    title="Settimana precedente"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-[#7cb342]" />
                    <span className="hidden sm:inline">Prec.</span>
                  </button>
                  <button
                    type="button"
                    onClick={onNextWeek}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 font-bold"
                    title="Settimana successiva"
                  >
                    <span className="hidden sm:inline">Succ.</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#7cb342]" />
                  </button>
                </div>
                <div className="flex items-center gap-2 font-black text-white">
                  <Calendar className="w-3.5 h-3.5 text-[#7cb342]" />
                  <span>{weekLabel}</span>
                </div>
                <div>
                  {!isCurrentWeek && onCurrentWeek ? (
                    <button
                      type="button"
                      onClick={onCurrentWeek}
                      className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-bold transition-colors"
                    >
                      Oggi
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      Corrente
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Day Selector with Dates */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7cb342]" />
                  <span>Scegli Giorno:</span>
                </span>
                {selectedDay !== 'all' && (
                  <button
                    onClick={() => setSelectedDay('all')}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    Mostra tutti i giorni
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedDay('all')}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all shrink-0 ${
                    selectedDay === 'all'
                      ? 'bg-white text-slate-950 shadow-md scale-105'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  Tutti i Giorni (Lun-Ven)
                </button>

                {DAYS.map((day) => {
                  const isSelected = selectedDay === day.key;
                  const dateInfo = weekDates?.[day.key];

                  // Count attendees on this day
                  let dayCount = 0;
                  allSessions
                    .filter((s) => s.dayKey === day.key)
                    .forEach((s) => {
                      dayCount += s.enrolledStudents.length;
                    });

                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setSelectedDay(day.key)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? 'bg-[#7cb342] text-slate-950 shadow-md shadow-[#7cb342]/20 scale-105'
                          : dateInfo?.isToday
                            ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>{day.label}</span>
                      {dateInfo && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                            isSelected ? 'bg-slate-950 text-[#7cb342]' : 'bg-slate-900 text-slate-300'
                          }`}
                        >
                          {dateInfo.dateStr}
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSelected ? 'bg-slate-950/40 text-slate-950' : 'bg-slate-950 text-slate-400'
                        }`}
                      >
                        {dayCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dropdown Filters: Corso, Istruttore & Ricerca Allievo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Corso Filter */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#7cb342]" />
                  <span>Scegli Corso:</span>
                </label>
                <select
                  value={selectedCourseName}
                  onChange={(e) => setSelectedCourseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Tutti i Corsi ({availableCourseNames.length})</option>
                  {availableCourseNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Istruttore Filter */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <User className="w-3 h-3 text-[#7cb342]" />
                  <span>Istruttore:</span>
                </label>
                <select
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Tutti gli Istruttori</option>
                  {availableInstructors.map((inst) => (
                    <option key={inst} value={inst}>
                      {inst}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Allievo */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Search className="w-3 h-3 text-[#7cb342]" />
                  <span>Cerca Persona o Corso:</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Es: Marco, Naomi, Pilates..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
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
              </div>
            </div>

            {/* Quick Actions & Reset Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">
                  Lezioni trovate: <strong className="text-white font-bold">{filteredSessions.length}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">
                  Allievi presenti:{' '}
                  <strong className="text-emerald-400 font-bold">{totalFilteredPresences} persone</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Azzera Filtri</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyReport}
                  disabled={filteredSessions.length === 0}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-[11px] transition-all flex items-center gap-1.5 disabled:opacity-40"
                  title="Copia l'elenco filtrato per WhatsApp o appunti"
                >
                  {copiedReport ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                      <span>Copiato negli appunti!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copia Elenco Filtrato</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* SESSIONS / ATTENDANCE LIST */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 scrollbar-none">
            {filteredSessions.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 space-y-3">
                <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="font-black text-white text-base">Nessuna lezione trovata con questi filtri</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Prova a selezionare "Tutti i Corsi" o a cambiare giorno per visualizzare i partecipanti.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Azzera tutti i filtri</span>
                </button>
              </div>
            ) : (
              filteredSessions.map(({ cell, dayKey, dayLabel, dayDateInfo, time, rowId, enrolledStudents }) => {
                const catMeta = GYM_CATEGORIES[cell.category] || GYM_CATEGORIES.posturale;
                const courseColor = cell.customColor || catMeta.hexColor;
                const isCopied = copiedCourseId === cell.id;

                return (
                  <div
                    key={`${dayKey}_${rowId}_${cell.id}`}
                    className="rounded-2xl bg-slate-950/85 border border-slate-800 hover:border-slate-700 transition-all space-y-3 p-4 sm:p-5 shadow-sm"
                  >
                    {/* Course Header Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 pb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: courseColor }}
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-xs uppercase px-2 py-0.5 rounded-md bg-[#7cb342] text-slate-950">
                              {dayLabel} {dayDateInfo?.dateStr}
                            </span>
                            <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                              ore {time}
                            </span>
                          </div>
                          <h4 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-1">
                            {cell.name}
                          </h4>
                        </div>
                      </div>

                      {/* Instructor and Room info */}
                      <div className="flex items-center gap-3 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
                          <User className="w-3.5 h-3.5 text-[#7cb342]" />
                          <span>
                            Istruttore: <strong className="text-white font-bold">{cell.instructor || 'Staff'}</strong>
                          </span>
                        </div>
                        {cell.room && (
                          <span className="bg-slate-900/80 px-2.5 py-1 rounded-xl text-slate-400 border border-slate-800">
                            {cell.room}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ATTENDEES LIST - EXACT USER SPECIFICATION */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-black text-[#7cb342] uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[#7cb342]" />
                          <span>
                            Chi ci sarà a questa lezione ({enrolledStudents.length}{' '}
                            {enrolledStudents.length === 1 ? 'persona' : 'persone'}):
                          </span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyCourseAttendees(
                                cell.name,
                                dayLabel,
                                dayDateInfo?.dateStr || '',
                                time,
                                enrolledStudents,
                                cell.id
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                            title="Copia l'elenco dei presenti a questa lezione"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                                <span className="text-emerald-400">Copiato</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copia lista</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenCourseDetail(cell, dayKey, time, rowId);
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Aggiungi o rimuovi allievi da questo corso"
                          >
                            <span>Iscrivi / Gestisci</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Display Presenti */}
                      {enrolledStudents.length > 0 ? (
                        <div className="space-y-2.5">
                          {/* Highlighted text list for immediate reading */}
                          <div className="text-sm font-medium text-white leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2">
                            <span className="text-slate-400 shrink-0 font-normal">Presenti:</span>
                            <span className="text-white font-bold">
                              {enrolledStudents.map((s, idx) => (
                                <span key={s.id}>
                                  <span className="text-[#7cb342] font-black">{s.name}</span>
                                  {idx < enrolledStudents.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </span>
                          </div>

                          {/* Individual Attendee Cards with Phone */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                            {enrolledStudents.map((student, idx) => (
                              <div
                                key={student.id}
                                className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] flex items-center justify-center font-black shrink-0 border border-emerald-500/30">
                                    {idx + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-black text-white truncate">{student.name}</p>
                                    {student.phone ? (
                                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Phone className="w-2.5 h-2.5 text-emerald-400" />
                                        <span>{student.phone}</span>
                                      </p>
                                    ) : (
                                      <p className="text-[10px] text-slate-500">Iscritto</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic py-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex items-center justify-between gap-2">
                          <span>
                            Nessuna persona ancora registrata a questa lezione di <strong>{cell.name}</strong> del{' '}
                            {dayLabel}.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenCourseDetail(cell, dayKey, time, rowId);
                            }}
                            className="text-emerald-400 hover:text-emerald-300 font-bold not-italic underline shrink-0"
                          >
                            + Aggiungi Allievo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <p className="text-xs text-slate-400">
              💡 Suggerimento: Usa il pulsante verde <strong>"Stampa Foglio Presenze"</strong> in alto per stampare il foglio firme per l'istruttore.
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

      {/* DEDICATED PRINTABLE DOCUMENT (Visible only when printing attendance) */}
      <div id="attendance-print-document" className="bg-white text-black p-8 max-w-4xl mx-auto font-sans">
        {/* Gym Header */}
        <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-black">{gymInfo.gymName || gymInfo.appName}</h1>
            <p className="text-sm font-semibold text-gray-700">{gymInfo.appSubtitle || 'CENTRO FITNESS & BENESSERE'}</p>
            <p className="text-xs text-gray-600 mt-1">{gymInfo.address}</p>
            <p className="text-xs text-gray-600">Tel: {gymInfo.phone} • {gymInfo.website}</p>
          </div>
          <div className="text-right">
            <span className="inline-block border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider">
              FOGLIO PRESENZE CORSI
            </span>
            <p className="text-xs font-bold text-gray-800 mt-2">{weekLabel}</p>
            <p className="text-[10px] text-gray-500">
              Stampato il {new Date().toLocaleDateString('it-IT')} alle {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Filters Summary */}
        <div className="bg-gray-100 p-3 rounded border border-gray-300 mb-5 text-xs flex flex-wrap justify-between items-center gap-2">
          <div>
            <span className="font-bold">Filtri applicati: </span>
            <span>
              Giorno:{' '}
              <strong>
                {selectedDay === 'all'
                  ? 'Tutti i Giorni (Lun-Ven)'
                  : `${DAYS.find((d) => d.key === selectedDay)?.label} ${weekDates?.[selectedDay]?.dateStr || ''}`}
              </strong>{' '}
              • Corso: <strong>{selectedCourseName === 'all' ? 'Tutti i Corsi' : selectedCourseName}</strong>
              {selectedInstructor !== 'all' && (
                <> • Istruttore: <strong>{selectedInstructor}</strong></>
              )}
            </span>
          </div>
          <div className="font-bold">
            Totale Allievi Registrati: <span className="text-base font-black">{totalFilteredPresences}</span>
          </div>
        </div>

        {/* Sessions & Attendees Tables */}
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center border border-gray-300 text-gray-500">
            Nessun allievo o corso trovato con i filtri selezionati.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSessions.map(({ cell, dayLabel, dayDateInfo, time, enrolledStudents }) => (
              <div key={`print_${dayLabel}_${time}_${cell.id}`} className="border border-black rounded-sm overflow-hidden break-inside-avoid mb-4">
                {/* Session Title */}
                <div className="bg-gray-200 border-b border-black p-2 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm uppercase bg-black text-white px-2 py-0.5">
                      {dayLabel} {dayDateInfo?.dateStr}
                    </span>
                    <span className="font-bold text-sm">
                      ore {time} - {cell.name}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-gray-800">
                    Istruttore: <strong>{cell.instructor || 'Staff'}</strong> | Sala: {cell.room || 'Principale'}
                  </div>
                </div>

                {/* Table of students */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50 text-[11px] font-bold">
                      <th className="py-1.5 px-3 w-10 border-r border-gray-200 text-center">N°</th>
                      <th className="py-1.5 px-3 border-r border-gray-200">Nome e Cognome Allievo</th>
                      <th className="py-1.5 px-3 border-r border-gray-200 w-36">Telefono</th>
                      <th className="py-1.5 px-3 w-40 text-center">Firma Presenza</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.length > 0 ? (
                      enrolledStudents.map((student, idx) => (
                        <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-2 px-3 text-center border-r border-gray-200 font-bold">{idx + 1}</td>
                          <td className="py-2 px-3 border-r border-gray-200 font-bold">{student.name}</td>
                          <td className="py-2 px-3 border-r border-gray-200 font-mono text-gray-700">
                            {student.phone || '—'}
                          </td>
                          <td className="py-2 px-3 text-center text-gray-300">
                            _____________________
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-2 px-3 text-center italic text-gray-500 border-b border-gray-200">
                          Nessun allievo ancora registrato in anticipo per questo orario.
                        </td>
                      </tr>
                    )}

                    {/* Extra empty lines for walk-ins / manual signatures */}
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <td className="py-2 px-3 text-center border-r border-gray-200 text-gray-400">+</td>
                      <td className="py-2 px-3 border-r border-gray-200 text-gray-400 italic">Presenza extra:</td>
                      <td className="py-2 px-3 border-r border-gray-200"></td>
                      <td className="py-2 px-3 text-center text-gray-300">_____________________</td>
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td className="py-2 px-3 text-center border-r border-gray-200 text-gray-400">+</td>
                      <td className="py-2 px-3 border-r border-gray-200 text-gray-400 italic">Presenza extra:</td>
                      <td className="py-2 px-3 border-r border-gray-200"></td>
                      <td className="py-2 px-3 text-center text-gray-300">_____________________</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* Signatures footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between text-xs text-gray-700">
          <div>Firma Responsabile Palestra: _______________________</div>
          <div>Firma Istruttore del Corso: _______________________</div>
        </div>
      </div>
    </>
  );
};
