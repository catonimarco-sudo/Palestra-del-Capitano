import React, { useState, useEffect } from 'react';
import {
  GYM_CATEGORIES,
  GymCourseCategory,
  GymScheduleCell,
  GymScheduleRow,
  INITIAL_GYM_SCHEDULE,
  GymInfoSettings,
  AVAILABLE_COLORS,
} from '../data/gymScheduleData';
import { Allievo, UserRole, TargetAudience } from '../types';
import { GymScheduleModal } from './GymScheduleModal';
import {
  Printer,
  Plus,
  Filter,
  Users,
  Clock,
  MapPin,
  User,
  Pencil,
  Trash2,
  Sparkles,
  Check,
  UserCheck,
  UserPlus,
  UserX,
  Phone,
  Globe,
  Building2,
  CheckCircle2,
  X,
  Palette,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type DayKey = 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi';

interface GymScheduleViewProps {
  students: Allievo[];
  currentStudentId: string | null;
  userRole?: UserRole;
  onSelectCurrentStudent: (id: string | null) => void;
  onAddStudent: (name: string, phone?: string) => Allievo;
  onOpenStudentManager: () => void;
  gymInfo: GymInfoSettings;
  onOpenGymSettings: () => void;
}

const DAY_COLUMNS: { key: DayKey; label: string }[] = [
  { key: 'lunedi', label: 'LUNEDÌ' },
  { key: 'martedi', label: 'MARTEDÌ' },
  { key: 'mercoledi', label: 'MERCOLEDÌ' },
  { key: 'giovedi', label: 'GIOVEDÌ' },
  { key: 'venerdi', label: 'VENERDÌ' },
];

export const GymScheduleView: React.FC<GymScheduleViewProps> = ({
  students,
  currentStudentId,
  userRole = 'gestore',
  onSelectCurrentStudent,
  onAddStudent,
  onOpenStudentManager,
  gymInfo,
  onOpenGymSettings,
}) => {
  const isGestore = userRole === 'gestore';

  // Load schedule from localStorage or default
  const [schedule, setSchedule] = useState<GymScheduleRow[]>(() => {
    try {
      const saved = localStorage.getItem('gym_weekly_schedule');
      return saved ? JSON.parse(saved) : INITIAL_GYM_SCHEDULE;
    } catch {
      return INITIAL_GYM_SCHEDULE;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<GymCourseCategory | 'all'>('all');
  const [selectedAudienceFilter, setSelectedAudienceFilter] = useState<TargetAudience | 'all'>('all');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string | 'all'>('all');
  const [themeMode, setThemeMode] = useState<'poster' | 'dark'>('poster');

  // Category Colors state (persisted in localStorage)
  const [categoryColors, setCategoryColors] = useState<Record<GymCourseCategory, string>>(() => {
    try {
      const saved = localStorage.getItem('gym_category_colors');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      olistico: GYM_CATEGORIES.olistico.hexColor,
      posturale: GYM_CATEGORIES.posturale.hexColor,
      tonificazione: GYM_CATEGORIES.tonificazione.hexColor,
      cardio: GYM_CATEGORIES.cardio.hexColor,
      funzionale: GYM_CATEGORIES.funzionale.hexColor,
    };
  });
  const [isCategoryColorModalOpen, setIsCategoryColorModalOpen] = useState(false);

  // Modal states
  const [activeCourseDetail, setActiveCourseDetail] = useState<{
    cell: GymScheduleCell;
    dayKey: DayKey;
    time: string;
    rowId: string;
  } | null>(null);

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editCourseTarget, setEditCourseTarget] = useState<{
    cell?: GymScheduleCell | null;
    dayKey: DayKey;
    time: string;
  } | null>(null);

  // Quick student add state inside course detail modal
  const [quickNewStudentName, setQuickNewStudentName] = useState('');
  const [selectedExistingToEnroll, setSelectedExistingToEnroll] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Update a category's global color
  const handleUpdateCategoryColor = (cat: GymCourseCategory, hexColor: string) => {
    setCategoryColors((prev) => {
      const updated = { ...prev, [cat]: hexColor };
      try {
        localStorage.setItem('gym_category_colors', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Colore per ${GYM_CATEGORIES[cat].name} aggiornato!`);
  };

  // Reset all category colors to default
  const handleResetCategoryColors = () => {
    const defaults: Record<GymCourseCategory, string> = {
      olistico: GYM_CATEGORIES.olistico.hexColor,
      posturale: GYM_CATEGORIES.posturale.hexColor,
      tonificazione: GYM_CATEGORIES.tonificazione.hexColor,
      cardio: GYM_CATEGORIES.cardio.hexColor,
      funzionale: GYM_CATEGORIES.funzionale.hexColor,
    };
    setCategoryColors(defaults);
    try {
      localStorage.removeItem('gym_category_colors');
    } catch {}
    showToast('Colori categorie ripristinati ai valori originali.');
  };

  // Quick change course color directly from detail view
  const handleQuickChangeCourseColor = (
    rowId: string,
    dayKey: DayKey,
    newHexColor: string | undefined
  ) => {
    const updated = schedule.map((row) => {
      if (row.rowId !== rowId) return row;
      const cell = row.days[dayKey];
      if (!cell) return row;

      const updatedCell: GymScheduleCell = {
        ...cell,
        customColor: newHexColor,
      };

      if (activeCourseDetail && activeCourseDetail.cell.id === cell.id) {
        setActiveCourseDetail({
          ...activeCourseDetail,
          cell: updatedCell,
        });
      }

      return {
        ...row,
        days: {
          ...row.days,
          [dayKey]: updatedCell,
        },
      };
    });

    saveSchedule(updated);
    showToast(newHexColor ? 'Colore corso aggiornato!' : 'Colore ripristinato a quello di categoria.');
  };

  // Save changes to localStorage
  const saveSchedule = (newSchedule: GymScheduleRow[]) => {
    setSchedule(newSchedule);
    try {
      localStorage.setItem('gym_weekly_schedule', JSON.stringify(newSchedule));
    } catch {}
  };

  // Sync schedule if an allievo was deleted or schedule was updated externally
  useEffect(() => {
    const handleExternalUpdate = () => {
      try {
        const saved = localStorage.getItem('gym_weekly_schedule');
        if (saved) {
          setSchedule(JSON.parse(saved));
        }
      } catch {}
    };

    window.addEventListener('gym_schedule_updated', handleExternalUpdate);
    return () => {
      window.removeEventListener('gym_schedule_updated', handleExternalUpdate);
    };
  }, []);

  // Ensure schedule does not keep IDs of deleted students
  useEffect(() => {
    const studentIds = new Set(students.map((s) => s.id));
    setSchedule((prev) => {
      let changed = false;
      const updated = prev.map((row) => {
        const updatedDays = { ...row.days };
        (Object.keys(updatedDays) as DayKey[]).forEach((dayKey) => {
          const cell = updatedDays[dayKey];
          if (cell && cell.enrolledMemberIds) {
            const valid = cell.enrolledMemberIds.filter((id) => studentIds.has(id));
            if (valid.length !== cell.enrolledMemberIds.length) {
              changed = true;
              updatedDays[dayKey] = { ...cell, enrolledMemberIds: valid };
            }
          }
        });
        return { ...row, days: updatedDays };
      });
      if (changed) {
        try {
          localStorage.setItem('gym_weekly_schedule', JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prev;
    });
  }, [students]);

  // Print schedule
  const handlePrint = () => {
    window.print();
  };

  // Toggle/Enroll student into course
  const handleToggleEnrollment = (
    rowId: string,
    dayKey: DayKey,
    studentId: string
  ) => {
    const student = students.find((s) => s.id === studentId);
    const studentName = student?.name || 'Allievo';

    const updated = schedule.map((row) => {
      if (row.rowId !== rowId) return row;

      const cell = row.days[dayKey];
      if (!cell) return row;

      const currentEnrolled = cell.enrolledMemberIds || [];
      const isEnrolled = currentEnrolled.includes(studentId);
      const nextEnrolled = isEnrolled
        ? currentEnrolled.filter((id) => id !== studentId)
        : [...currentEnrolled, studentId];

      if (!isEnrolled) {
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#7cb342', '#0288d1', '#d81b60'],
          });
        } catch {}
        showToast(`✓ ${studentName} iscritto al corso "${cell.name}"!`);
      } else {
        showToast(`${studentName} rimosso dal corso "${cell.name}".`);
      }

      const updatedCell: GymScheduleCell = {
        ...cell,
        enrolledMemberIds: nextEnrolled,
      };

      // update activeCourseDetail if currently open
      if (activeCourseDetail && activeCourseDetail.cell.id === cell.id) {
        setActiveCourseDetail({
          ...activeCourseDetail,
          cell: updatedCell,
        });
      }

      return {
        ...row,
        days: {
          ...row.days,
          [dayKey]: updatedCell,
        },
      };
    });

    saveSchedule(updated);
  };

  // Quick add new student and immediately enroll them into current course
  const handleQuickAddAndEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNewStudentName.trim() || !activeCourseDetail) return;

    const newStudent = onAddStudent(quickNewStudentName.trim());
    setQuickNewStudentName('');

    // Now enroll into course
    handleToggleEnrollment(
      activeCourseDetail.rowId,
      activeCourseDetail.dayKey,
      newStudent.id
    );
  };

  // Enroll an existing student from dropdown
  const handleEnrollExisting = () => {
    if (!selectedExistingToEnroll || !activeCourseDetail) return;
    handleToggleEnrollment(
      activeCourseDetail.rowId,
      activeCourseDetail.dayKey,
      selectedExistingToEnroll
    );
    setSelectedExistingToEnroll('');
  };

  // Save new or edited course
  const handleSaveCourse = (
    courseData: GymScheduleCell,
    dayKey: DayKey,
    time: string
  ) => {
    let targetRowIndex = schedule.findIndex((r) => r.time === time);
    let newSchedule = [...schedule];

    if (targetRowIndex === -1) {
      const newRow: GymScheduleRow = {
        rowId: `row_${Date.now()}`,
        time,
        days: {
          [dayKey]: courseData,
        },
      };
      newSchedule.push(newRow);
      newSchedule.sort((a, b) => a.time.localeCompare(b.time));
    } else {
      const existingRow = newSchedule[targetRowIndex];
      if (
        existingRow.days[dayKey] &&
        existingRow.days[dayKey]?.id !== courseData.id
      ) {
        const parallelRowIndex = newSchedule.findIndex(
          (r) => r.time === time && !r.days[dayKey]
        );
        if (parallelRowIndex !== -1) {
          newSchedule[parallelRowIndex] = {
            ...newSchedule[parallelRowIndex],
            days: {
              ...newSchedule[parallelRowIndex].days,
              [dayKey]: courseData,
            },
          };
        } else {
          const subSlotRow: GymScheduleRow = {
            rowId: `row_${Date.now()}`,
            time,
            subSlotIndex: (existingRow.subSlotIndex || 1) + 1,
            days: {
              [dayKey]: courseData,
            },
          };
          newSchedule.splice(targetRowIndex + 1, 0, subSlotRow);
        }
      } else {
        newSchedule[targetRowIndex] = {
          ...existingRow,
          days: {
            ...existingRow.days,
            [dayKey]: courseData,
          },
        };
      }
    }

    saveSchedule(newSchedule);
    showToast(`✓ Lezione "${courseData.name}" salvata nel calendario!`);
    setIsAddEditModalOpen(false);
  };

  // Delete course
  const handleDeleteCourse = (rowId: string, dayKey: DayKey) => {
    if (!isGestore) {
      showToast('⚠️ Solo il Gestore può eliminare i corsi dal calendario.');
      return;
    }

    const updated = schedule.map((row) => {
      if (row.rowId !== rowId) return row;
      const newDays = { ...row.days };
      delete newDays[dayKey];
      return {
        ...row,
        days: newDays,
      };
    });

    const filtered = updated.filter(
      (r) => Object.keys(r.days).length > 0
    );

    saveSchedule(filtered);
    setActiveCourseDetail(null);
    showToast('Lezione rimossa dal calendario.');
  };

  const currentStudent = students.find((s) => s.id === currentStudentId);

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-bounce print:hidden">
          <Sparkles className="w-5 h-5 text-slate-950 shrink-0" />
          <span className="text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Control Bar: Filters, Student Manager, Add Course & Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-4.5 rounded-2xl shadow-xl print:hidden">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            Categoria:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-white text-slate-950 font-black shadow'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Tutti
          </button>
          {(
            [
              'olistico',
              'posturale',
              'tonificazione',
              'cardio',
              'funzionale',
            ] as GymCourseCategory[]
          ).map((catKey) => {
            const cat = GYM_CATEGORIES[catKey];
            const isSelected = selectedCategory === catKey;
            const currentColor = categoryColors[catKey] || cat.hexColor;
            return (
              <button
                key={catKey}
                onClick={() =>
                  setSelectedCategory(isSelected ? 'all' : catKey)
                }
                style={isSelected ? { backgroundColor: currentColor } : {}}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm ${
                  isSelected
                    ? 'text-white ring-2 ring-white/60 scale-105 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-xs"
                  style={{ backgroundColor: currentColor }}
                />
                <span>{cat.name}</span>
              </button>
            );
          })}

          {/* Button to open Category Colors modal (Solo Gestore) */}
          {isGestore && (
            <button
              onClick={() => setIsCategoryColorModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 text-xs font-bold"
              title="Personalizza i colori di Olistico, Cardio, Posturale, Tonificazione, Funzionale"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Colori Categorie</span>
            </button>
          )}
        </div>

        {/* Member filter & Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Target Audience Filter (Allievi vs Mister) */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setSelectedAudienceFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedAudienceFilter === 'all'
                  ? 'bg-slate-800 text-white font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mostra tutti i corsi (Allievi e Mister)"
            >
              Tutti i Corsi
            </button>
            <button
              type="button"
              onClick={() => setSelectedAudienceFilter('allievi')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedAudienceFilter === 'allievi'
                  ? 'bg-emerald-600 text-white font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualizza solo i corsi per allievi"
            >
              🎓 Corsi Allievi
            </button>
            <button
              type="button"
              onClick={() => setSelectedAudienceFilter('mister')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedAudienceFilter === 'mister'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualizza solo i corsi per Mister"
            >
              🏆 Corsi per Mister
            </button>
          </div>

          {/* Filter by enrolled student */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">Tutti gli Allievi</option>
              {currentStudentId && (
                <option value={currentStudentId} className="bg-slate-900 text-emerald-400">
                  Solo corsi di: {currentStudent?.name}
                </option>
              )}
              {students
                .filter((s) => s.id !== currentStudentId)
                .map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900">
                    Solo corsi di: {s.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Manage Students button */}
          <button
            onClick={onOpenStudentManager}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700 text-xs font-bold"
            title={isGestore ? "Gestisci elenco allievi, profili, schede e presenze" : "Visualizza allievi"}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Allievi ({students.length})</span>
          </button>

          {/* Edit Gym Info Button (Solo Gestore) */}
          {isGestore && (
            <button
              onClick={onOpenGymSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 text-xs font-bold"
              title="Modifica nome centro sportivo HOF, telefono, indirizzo, sito, logo e nome app"
            >
              <Building2 className="w-3.5 h-3.5 text-[#7cb342]" />
              <span>Info Centro</span>
            </button>
          )}

          {/* Theme switch: Poster Style vs Dark Style */}
          <button
            onClick={() => setThemeMode(themeMode === 'poster' ? 'dark' : 'poster')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors border border-slate-700 hidden lg:block"
          >
            {themeMode === 'poster' ? 'Stile Scuro' : 'Stile Tabellone'}
          </button>

          {/* Add Course Button (Solo Gestore) */}
          {isGestore && (
            <button
              onClick={() => {
                setEditCourseTarget(null);
                setIsAddEditModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7cb342] hover:bg-[#689f38] text-slate-950 font-black text-xs transition-transform active:scale-95 shadow-md shadow-[#7cb342]/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Aggiungi Corso</span>
            </button>
          )}

          {/* Print A4 Schedule Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors border border-slate-700"
            title="Stampa tabellone A4"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Stampa</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIMETABLE POSTER CONTAINER (MATCHING THE ORIGINAL CENTRO SPORTIVO HOF SCHEDULE) */}
      {/* ========================================================================= */}
      <div
        id="print-gym-schedule"
        className={`rounded-3xl p-4 sm:p-7 shadow-2xl transition-colors duration-200 ${
          themeMode === 'poster'
            ? 'bg-white text-slate-900 border border-slate-200'
            : 'bg-slate-900 text-white border border-slate-800'
        } print:bg-white print:text-black print:border-none print:p-0 print:m-0 print:shadow-none print:w-full`}
      >
        {/* HEADER: ORARIO CORSI PALESTRA (CUSTOMIZABLE) */}
        <div className="text-center mb-5 sm:mb-7 relative group">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-slate-900 uppercase inline-block print:text-black">
            {gymInfo.posterTitle || 'ORARIO CORSI PALESTRA'}{' '}
            <span className="text-[#7cb342] font-black">
              {gymInfo.season}
            </span>
          </h1>
          <button
            onClick={onOpenGymSettings}
            className="ml-3 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100 print:hidden align-middle inline-flex"
            title="Modifica intestazione e dati centro sportivo"
          >
            <Pencil className="w-4 h-4 text-emerald-600" />
          </button>
        </div>

        {/* TIMETABLE GRID TABLE */}
        <div className="overflow-x-auto print:overflow-visible scrollbar-none">
          <div className="min-w-[760px] select-none">
            {/* Header Row: Time + 5 Days */}
            <div className="grid grid-cols-11 gap-1.5 sm:gap-2 mb-2">
              <div className="col-span-1" />
              {DAY_COLUMNS.map((day) => (
                <div
                  key={day.key}
                  className={`col-span-2 text-center py-2 px-1 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase border ${
                    themeMode === 'poster'
                      ? 'bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
                      : 'bg-slate-950 text-slate-200 border-slate-800'
                  } print:bg-gray-100 print:text-black print:border-gray-400`}
                >
                  {day.label}
                </div>
              ))}
            </div>

            {/* Timetable Rows */}
            <div className="space-y-1.5 sm:space-y-2">
              {schedule.map((row) => (
                <div
                  key={row.rowId}
                  className="grid grid-cols-11 gap-1.5 sm:gap-2 items-stretch"
                >
                  {/* Time Cell (Column 1) */}
                  <div
                    className={`col-span-1 flex items-center justify-center rounded-xl font-bold text-xs sm:text-sm font-mono border ${
                      themeMode === 'poster'
                        ? 'bg-white text-slate-800 border-slate-300'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800'
                    } print:bg-white print:text-black print:border-gray-400 py-2`}
                  >
                    {row.time}
                  </div>

                  {/* 5 Day Cells */}
                  {DAY_COLUMNS.map((day) => {
                    const cell = row.days[day.key];

                    if (!cell) {
                      // Empty slot cell
                      return (
                        <div
                          key={day.key}
                          onClick={
                            isGestore
                              ? () => {
                                  setEditCourseTarget({
                                    dayKey: day.key,
                                    time: row.time,
                                    cell: null,
                                  });
                                  setIsAddEditModalOpen(true);
                                }
                              : undefined
                          }
                          className={`col-span-2 rounded-xl border border-dashed flex items-center justify-center p-2 min-h-[44px] transition-colors ${
                            isGestore ? 'cursor-pointer group' : 'cursor-default opacity-40'
                          } ${
                            themeMode === 'poster'
                              ? 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/60'
                              : 'border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/40'
                          } print:border-gray-200 print:bg-white`}
                          title={isGestore ? "Clicca per aggiungere corso in questo orario" : undefined}
                        >
                          {isGestore && (
                            <span className="text-[11px] text-slate-300 group-hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity font-semibold print:hidden">
                              + Aggiungi
                            </span>
                          )}
                        </div>
                      );
                    }

                    // Active course cell
                    const catMeta = GYM_CATEGORIES[cell.category] || GYM_CATEGORIES.posturale;
                    const effectiveCellColor =
                      cell.customColor ||
                      categoryColors[cell.category] ||
                      catMeta.hexColor;
                    const isCategoryFiltered =
                      selectedCategory !== 'all' && cell.category !== selectedCategory;
                    const isAudienceFiltered =
                      selectedAudienceFilter !== 'all' &&
                      (cell.targetAudience || 'allievi') !== selectedAudienceFilter &&
                      cell.targetAudience !== 'tutti';
                    const enrolledCount = (cell.enrolledMemberIds || []).length;
                    const isCurrentStudentEnrolled = currentStudentId
                      ? (cell.enrolledMemberIds || []).includes(currentStudentId)
                      : false;
                    const isFilterStudentEnrolled =
                      selectedStudentFilter !== 'all'
                        ? (cell.enrolledMemberIds || []).includes(selectedStudentFilter)
                        : true;

                    const opacityClass =
                      isCategoryFiltered || !isFilterStudentEnrolled || isAudienceFiltered
                        ? 'opacity-20 grayscale scale-[0.98]'
                        : 'opacity-100 scale-100';

                    return (
                      <div
                        key={day.key}
                        onClick={() =>
                          setActiveCourseDetail({
                            cell,
                            dayKey: day.key,
                            time: row.time,
                            rowId: row.rowId,
                          })
                        }
                        style={{ backgroundColor: effectiveCellColor }}
                        className={`col-span-2 rounded-xl p-2 min-h-[44px] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md relative group select-none text-white ${opacityClass} print:opacity-100 print:shadow-none`}
                        title="Clicca per iscriverti, toglierti o visualizzare i dettagli"
                      >
                        {/* Course Name in clean bold uppercase font as in the image */}
                        <span className="font-black text-xs sm:text-sm tracking-wide leading-tight px-1 uppercase drop-shadow-sm">
                          {cell.name}
                        </span>

                        {/* Badges container */}
                        <div className="flex flex-wrap items-center justify-center gap-1 mt-1 print:hidden">
                          {/* Mister badge */}
                          {cell.targetAudience === 'mister' && (
                            <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow-sm uppercase tracking-wider">
                              <span>🏆 MISTER</span>
                            </span>
                          )}

                          {/* If current selected student is enrolled */}
                          {isCurrentStudentEnrolled && (
                            <span className="bg-emerald-950/80 text-emerald-200 border border-emerald-400/50 rounded-full text-[9px] font-black px-1.5 py-0.2 flex items-center gap-0.5 shadow-sm">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              <span>Tu iscritto</span>
                            </span>
                          )}

                          {/* Enrolled count pill badge */}
                          {enrolledCount > 0 && (
                            <div className="bg-black/40 text-white rounded-full text-[9px] font-black px-1.5 py-0.2 backdrop-blur-xs flex items-center gap-0.5">
                              <Users className="w-2.5 h-2.5" />
                              <span>{enrolledCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTNOTES UNDER TABLE (EXACT PHRASING FROM IMAGE) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-6 pt-2 text-[11px] sm:text-xs text-slate-600 font-medium print:text-gray-700">
          <p className="italic">{gymInfo.note1}</p>
          <p className="text-right italic">{gymInfo.note2}</p>
        </div>

        {/* FOOTER BAR (EXACT REPLICA OF THE IMAGE FOOTER BANNER) */}
        <div className="mt-4 rounded-2xl bg-[#1e232a] text-white p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative overflow-hidden shadow-xl border border-slate-800 print:border print:border-gray-800 group">
          {/* Vertical Lime Green Accent Bar on the far left */}
          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#7cb342]" />

          {/* Quick edit button for footer details (hidden in print) */}
          <button
            onClick={onOpenGymSettings}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 print:hidden flex items-center gap-1 text-[11px] font-bold"
            title="Modifica recapiti centro sportivo (telefono, indirizzo, sito web, logo)"
          >
            <Pencil className="w-3.5 h-3.5 text-[#7cb342]" />
            <span>Modifica</span>
          </button>

          {/* Left Block: Gym name & contacts */}
          <div className="pl-3 sm:pl-4 space-y-1">
            <h3 className="font-black text-sm sm:text-base tracking-tight text-white">
              {gymInfo.gymName || 'Centro Sportivo HOF'}
            </h3>
            <div className="text-xs text-slate-300 flex flex-col gap-0.5">
              {gymInfo.phone && (
                <a
                  href={`tel:${gymInfo.phone}`}
                  className="hover:text-emerald-400 font-semibold flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3 text-[#7cb342]" />
                  <span>{gymInfo.phone}</span>
                </a>
              )}
              {gymInfo.address && (
                <p className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{gymInfo.address}</span>
                </p>
              )}
              {gymInfo.website && (
                <a
                  href={gymInfo.website.startsWith('http') ? gymInfo.website : `https://${gymInfo.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 hover:text-emerald-400 flex items-center gap-1.5"
                >
                  <Globe className="w-3 h-3 text-cyan-400" />
                  <span>{gymInfo.website}</span>
                </a>
              )}
            </div>
          </div>

          {/* Center Block: Room activity hours */}
          <div className="text-xs text-slate-400 max-w-xs border-t md:border-t-0 md:border-l border-slate-700/80 pt-3 md:pt-0 md:pl-5">
            <p className="font-bold text-slate-200">{gymInfo.roomHoursTitle || 'Orari di attività in sala'}</p>
            <p className="text-[11px] leading-relaxed mt-0.5">
              {gymInfo.roomHoursText || 'Consulta gli orari aggiornati sul nostro sito web o sulla nostra scheda Google'}
            </p>
          </div>

          {/* Categories Legend (Centered) */}
          <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-700/80 pt-3 md:pt-0 md:pl-5">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Legenda Attività
              </span>
              <button
                type="button"
                onClick={() => setIsCategoryColorModalOpen(true)}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 print:hidden"
                title="Personalizza i colori delle attività"
              >
                <Palette className="w-3 h-3" />
                <span>Colori</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-sm shrink-0"
                  style={{
                    backgroundColor:
                      categoryColors.olistico || GYM_CATEGORIES.olistico.hexColor,
                  }}
                />
                <span className="font-bold text-slate-200">OLISTICO</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-sm shrink-0"
                  style={{
                    backgroundColor:
                      categoryColors.posturale || GYM_CATEGORIES.posturale.hexColor,
                  }}
                />
                <span className="font-bold text-slate-200">POSTURALE</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-sm shrink-0"
                  style={{
                    backgroundColor:
                      categoryColors.tonificazione ||
                      GYM_CATEGORIES.tonificazione.hexColor,
                  }}
                />
                <span className="font-bold text-slate-200">TONIFICAZIONE</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shadow-sm shrink-0"
                  style={{
                    backgroundColor:
                      categoryColors.cardio || GYM_CATEGORIES.cardio.hexColor,
                  }}
                />
                <span className="font-bold text-slate-200">CARDIO</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <span
                  className="w-3 h-3 rounded-full shadow-sm shrink-0"
                  style={{
                    backgroundColor:
                      categoryColors.funzionale ||
                      GYM_CATEGORIES.funzionale.hexColor,
                  }}
                />
                <span className="font-bold text-slate-200">FUNZIONALE</span>
              </div>
            </div>
          </div>

          {/* Right Block: Logo replica (dynamic acronym & subtitle) */}
          <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-700/80 pt-3 md:pt-0 md:pl-6">
            <div className="text-2xl sm:text-3xl font-black font-display tracking-widest flex items-center leading-none">
              {gymInfo.logoAcronym?.length === 3 ? (
                <>
                  <span className="text-[#7cb342]">{gymInfo.logoAcronym[0]}</span>
                  <span className="text-white">{gymInfo.logoAcronym[1]}</span>
                  <span className="text-[#d81b60]">{gymInfo.logoAcronym[2]}</span>
                </>
              ) : (
                <span className="text-white">
                  <span className="text-[#7cb342]">{gymInfo.logoAcronym?.slice(0, 1) || 'H'}</span>
                  {gymInfo.logoAcronym?.slice(1) || 'OF'}
                </span>
              )}
            </div>
            {gymInfo.logoSubtitle && (
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-1 whitespace-nowrap">
                {gymInfo.logoSubtitle}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: DETTAGLIO CORSO & ISCRIZIONE / RIMOZIONE ALLIEVI */}
      {/* ========================================================================= */}
      {activeCourseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn print:hidden">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
            {/* Ambient category glow */}
            <div
              className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none"
              style={{
                backgroundColor:
                  activeCourseDetail.cell.customColor ||
                  categoryColors[activeCourseDetail.cell.category] ||
                  GYM_CATEGORIES[activeCourseDetail.cell.category]?.hexColor ||
                  '#8e24aa',
              }}
            />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="text-[10px] font-black px-2.5 py-0.5 rounded-full text-white uppercase tracking-wider"
                    style={{
                      backgroundColor:
                        activeCourseDetail.cell.customColor ||
                        categoryColors[activeCourseDetail.cell.category] ||
                        GYM_CATEGORIES[activeCourseDetail.cell.category]?.hexColor ||
                        '#8e24aa',
                    }}
                  >
                    {GYM_CATEGORIES[activeCourseDetail.cell.category]?.name || 'Corso'}
                  </span>
                  {/* Target Audience Badge */}
                  {activeCourseDetail.cell.targetAudience === 'mister' ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider">
                      🏆 Per Mister
                    </span>
                  ) : activeCourseDetail.cell.targetAudience === 'tutti' ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                      👥 Allievi & Mister
                    </span>
                  ) : (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                      🎓 Corso Allievi
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-bold uppercase">
                    {activeCourseDetail.dayKey} • h {activeCourseDetail.time}
                  </span>
                </div>
                <h3 className="text-2xl font-black font-display text-white tracking-tight">
                  {activeCourseDetail.cell.name}
                </h3>
              </div>

              {/* Action icons */}
              <div className="flex items-center gap-1.5">
                {isGestore && (
                  <>
                    <button
                      onClick={() => {
                        const target = {
                          cell: activeCourseDetail.cell,
                          dayKey: activeCourseDetail.dayKey,
                          time: activeCourseDetail.time,
                        };
                        setActiveCourseDetail(null);
                        setEditCourseTarget(target);
                        setIsAddEditModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Modifica Dati Corso (Solo Gestore)"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteCourse(
                          activeCourseDetail.rowId,
                          activeCourseDetail.dayKey
                        )
                      }
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400 transition-colors"
                      title="Elimina Corso (Solo Gestore)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActiveCourseDetail(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto space-y-4 py-4 pr-1 scrollbar-none flex-1 text-sm text-slate-300">
              {/* If targetAudience === 'mister' Banner */}
              {activeCourseDetail.cell.targetAudience === 'mister' && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-300">Corso Riservato a Mister / Staff Tecnico</div>
                    <p className="text-[11px] text-amber-200/90 mt-0.5">
                      Questo corso è consultabile da tutti nel calendario. {!isGestore && 'Le iscrizioni e modifiche per questa sessione sono gestite dal Gestore o dal Mister responsabile.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-medium text-[11px]">Istruttore</span>
                  <span className="text-white font-bold">
                    {activeCourseDetail.cell.instructor || 'Staff HOF'}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-medium text-[11px]">Sala / Area</span>
                  <span className="text-white font-bold">
                    {activeCourseDetail.cell.room || 'Area Fitness'}
                  </span>
                </div>
              </div>

              {/* Quick Color Selector for this specific Course (Solo Gestore) */}
              {isGestore && (
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      Colore di questo Corso (Solo Gestore)
                    </span>
                    {activeCourseDetail.cell.customColor && (
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickChangeCourseColor(
                            activeCourseDetail.rowId,
                            activeCourseDetail.dayKey,
                            undefined
                          )
                        }
                        className="text-[11px] text-slate-400 hover:text-white underline flex items-center gap-1 transition-colors"
                        title="Torna al colore della categoria"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Ripristina colore categoria
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {AVAILABLE_COLORS.map((col) => {
                      const activeColor =
                        activeCourseDetail.cell.customColor ||
                        categoryColors[activeCourseDetail.cell.category] ||
                        GYM_CATEGORIES[activeCourseDetail.cell.category]?.hexColor;
                      const isPicked =
                        activeColor?.toLowerCase() === col.hex.toLowerCase();

                      return (
                        <button
                          key={col.hex}
                          type="button"
                          onClick={() =>
                            handleQuickChangeCourseColor(
                              activeCourseDetail.rowId,
                              activeCourseDetail.dayKey,
                              col.hex
                            )
                          }
                          style={{ backgroundColor: col.hex }}
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg transition-transform flex items-center justify-center shadow-sm ${
                            isPicked
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110'
                              : 'hover:scale-105 opacity-85 hover:opacity-100'
                          }`}
                          title={col.name}
                        >
                          {isPicked && (
                            <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 1. SEZIONE AZIONE ALLIEVO ATTIVO (INSERIRSI O TOGLIERSI) */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-700/80 shadow-md">
                <span className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-2">
                  La tua presenza a questo corso:
                </span>

                {currentStudent ? (
                  /* Case A: An allievo is active/selected */
                  (() => {
                    const isEnrolled = (
                      activeCourseDetail.cell.enrolledMemberIds || []
                    ).includes(currentStudent.id);

                    // If it's a Mister course and not Gestore, student cannot add themselves unless already enrolled (they can unenroll)
                    const isMisterCourse = activeCourseDetail.cell.targetAudience === 'mister';
                    const canStudentEnroll = isGestore || !isMisterCourse;

                    return (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                              {currentStudent.name.charAt(0)}
                            </div>
                            <span className="font-bold text-sm text-white">
                              {currentStudent.name}
                            </span>
                          </div>
                          {isEnrolled ? (
                            <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              Presente / Iscritto
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Non inserito
                            </span>
                          )}
                        </div>

                        {/* Button logic */}
                        {isEnrolled ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleEnrollment(
                                activeCourseDetail.rowId,
                                activeCourseDetail.dayKey,
                                currentStudent.id
                              )
                            }
                            className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 active:scale-98"
                          >
                            <UserX className="w-4 h-4" />
                            <span>❌ Elimina la tua presenza da questo corso</span>
                          </button>
                        ) : canStudentEnroll ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleEnrollment(
                                activeCourseDetail.rowId,
                                activeCourseDetail.dayKey,
                                currentStudent.id
                              )
                            }
                            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>➕ Inserisci la tua presenza a questo corso</span>
                          </button>
                        ) : (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                            🔒 Corso riservato ai Mister. Non è possibile inserire presenze per allievi in questa sessione.
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  /* Case B: No allievo currently selected -> allow selecting one right here */
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400">
                      Seleziona il tuo profilo allievo per inserire o rimuovere la tua presenza:
                    </p>
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            onSelectCurrentStudent(e.target.value);
                          }
                        }}
                        defaultValue=""
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none"
                      >
                        <option value="" disabled>
                          -- Seleziona il tuo Profilo Allievo --
                        </option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. SEZIONE INSERISCI NOME NUOVO ALLIEVO & ISCRIVILO (Solo Gestore) */}
              {isGestore && (
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    Inserisci Nuovo Allievo e Registra Presenza (Solo Gestore)
                  </span>
                  <form onSubmit={handleQuickAddAndEnroll} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={quickNewStudentName}
                      onChange={(e) => setQuickNewStudentName(e.target.value)}
                      placeholder="Nome e Cognome allievo..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-[#7cb342] hover:bg-[#689f38] text-slate-950 font-black text-xs shrink-0 flex items-center gap-1 shadow-md shadow-[#7cb342]/20"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Iscrivi</span>
                    </button>
                  </form>
                </div>
              )}

              {/* 3. LISTA DI TUTTI GLI ALLIEVI ISCRITTI A QUESTA LEZIONE */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    Allievi Iscritti a questa lezione (
                    {(activeCourseDetail.cell.enrolledMemberIds || []).length})
                  </span>
                </div>

                {/* List of enrolled students */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-none">
                  {(activeCourseDetail.cell.enrolledMemberIds || []).length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2 text-center">
                      Nessun allievo ancora iscritto a questa lezione.
                    </p>
                  ) : (
                    (activeCourseDetail.cell.enrolledMemberIds || []).map((studentId) => {
                      const student = students.find((s) => s.id === studentId);
                      const isCurrent = studentId === currentStudentId;
                      const canRemove = isGestore || isCurrent;

                      return (
                        <div
                          key={studentId}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                            isCurrent
                              ? 'bg-emerald-500/10 border-emerald-500/40'
                              : 'bg-slate-900 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs">
                              {student?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <span className="font-bold text-xs text-white block">
                                {student?.name || 'Allievo rimosso'}{' '}
                                {isCurrent && (
                                  <span className="text-[10px] text-emerald-400 font-semibold">
                                    (Tu)
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Button to remove/disenroll this student */}
                          {canRemove && (
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleEnrollment(
                                  activeCourseDetail.rowId,
                                  activeCourseDetail.dayKey,
                                  studentId
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-rose-900/30 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-[11px] font-bold flex items-center gap-1 transition-colors"
                              title={isGestore ? "Togli allievo da questo corso" : "Elimina la tua presenza da questo corso"}
                            >
                              <X className="w-3 h-3" />
                              <span>{isCurrent ? 'Elimina la mia presenza' : 'Togli'}</span>
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Enroll another existing student dropdown (Solo Gestore) */}
                {isGestore && students.filter(
                  (s) => !(activeCourseDetail.cell.enrolledMemberIds || []).includes(s.id)
                ).length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                    <select
                      value={selectedExistingToEnroll}
                      onChange={(e) => setSelectedExistingToEnroll(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none"
                    >
                      <option value="">Iscrivi un altro allievo...</option>
                      {students
                        .filter(
                          (s) =>
                            !(activeCourseDetail.cell.enrolledMemberIds || []).includes(s.id)
                        )
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      disabled={!selectedExistingToEnroll}
                      onClick={handleEnrollExisting}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-emerald-400 font-bold text-xs"
                    >
                      + Iscrivi
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setActiveCourseDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT COURSE */}
      <GymScheduleModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveCourse}
        initialCell={editCourseTarget?.cell}
        initialDay={editCourseTarget?.dayKey}
        initialTime={editCourseTarget?.time}
      />

      {/* MODAL: PERSONALIZZA COLORI CATEGORIE */}
      {isCategoryColorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn print:hidden">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black font-display text-white">
                    Personalizza Colori Categorie
                  </h3>
                  <p className="text-xs text-slate-400">
                    Scegli i colori per Olistico, Cardio, Posturale, Tonificazione, Funzionale
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCategoryColorModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto space-y-4 py-4 pr-1 scrollbar-none flex-1">
              {(
                [
                  'olistico',
                  'posturale',
                  'tonificazione',
                  'cardio',
                  'funzionale',
                ] as GymCourseCategory[]
              ).map((catKey) => {
                const cat = GYM_CATEGORIES[catKey];
                const currentColor = categoryColors[catKey] || cat.hexColor;

                return (
                  <div
                    key={catKey}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: currentColor }}
                        />
                        <span className="font-bold text-sm text-white">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`color-input-${catKey}`}
                          className="flex items-center gap-1.5 cursor-pointer text-xs font-mono text-slate-300 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700 hover:border-slate-500"
                          title="Clicca per aprire la tavolozza libera"
                        >
                          <input
                            id={`color-input-${catKey}`}
                            type="color"
                            value={currentColor}
                            onChange={(e) =>
                              handleUpdateCategoryColor(catKey, e.target.value)
                            }
                            className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
                          />
                          <span>{currentColor.toUpperCase()}</span>
                        </label>
                        {currentColor.toLowerCase() !== cat.hexColor.toLowerCase() && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateCategoryColor(catKey, cat.hexColor)
                            }
                            className="text-[11px] text-slate-400 hover:text-white p-1"
                            title="Ripristina colore originale"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Predefined Palette Swatches */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {AVAILABLE_COLORS.map((col) => {
                        const isPicked =
                          currentColor.toLowerCase() === col.hex.toLowerCase();
                        return (
                          <button
                            key={col.hex}
                            type="button"
                            onClick={() =>
                              handleUpdateCategoryColor(catKey, col.hex)
                            }
                            style={{ backgroundColor: col.hex }}
                            className={`w-6 h-6 rounded-lg transition-transform flex items-center justify-center ${
                              isPicked
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110'
                                : 'hover:scale-105 opacity-80 hover:opacity-100'
                            }`}
                            title={col.name}
                          >
                            {isPicked && (
                              <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleResetCategoryColors}
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ripristina colori originali</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCategoryColorModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors"
              >
                Fatto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
