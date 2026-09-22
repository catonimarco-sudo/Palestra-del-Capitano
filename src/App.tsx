import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GymScheduleView } from './components/GymScheduleView';
import { GymSettingsModal } from './components/GymSettingsModal';
import { AppIconModal } from './components/AppIconModal';
import { CourseNotificationModal } from './components/CourseNotificationModal';
import { DEFAULT_GYM_INFO, GymInfoSettings, INITIAL_GYM_SCHEDULE, GymScheduleRow } from './data/gymScheduleData';
import { Allievo, UserRole } from './types';
import confetti from 'canvas-confetti';
import { Dumbbell, BellRing, X } from 'lucide-react';
import { applyAppIconToDOM } from './utils/appIcon';
import {
  checkAndTriggerCourseReminders,
  getStoredNotificationSettings,
} from './utils/courseNotifications';
import {
  initAuth,
  testFirestoreConnection,
  onCloudConnectionChange,
  subscribeToGymInfo,
  saveGymInfoToCloud,
  subscribeToStudents,
  saveStudentToCloud,
  deleteStudentFromCloud,
  saveScheduleToCloud,
} from './lib/firebase';

const DEFAULT_STUDENTS: Allievo[] = [
  { id: 'allievo_1', name: 'Marco Rossi', phone: '340 1234567', isCurrentUser: true },
  { id: 'allievo_2', name: 'Giulia Bianchi', phone: '348 7654321' },
  { id: 'allievo_3', name: 'Matteo Verdi', phone: '333 9988776' },
  { id: 'allievo_4', name: 'Sofia Neri', phone: '345 5544332' },
  { id: 'allievo_5', name: 'Leo Galli', phone: '320 1122334' },
];

export default function App() {
  // Cloud real-time connection status
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // User role: 'gestore' | 'allievo'
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('gym_user_role');
      if (saved === 'gestore' || saved === 'allievo') return saved;
    } catch {}
    return 'gestore';
  });

  // Gym branding and center details (FitSquad, HOF, phone, address, etc.)
  const [gymInfo, setGymInfo] = useState<GymInfoSettings>(() => {
    try {
      const saved = localStorage.getItem('gym_info_settings');
      return saved ? { ...DEFAULT_GYM_INFO, ...JSON.parse(saved) } : DEFAULT_GYM_INFO;
    } catch {
      return DEFAULT_GYM_INFO;
    }
  });

  // Students list
  const [students, setStudents] = useState<Allievo[]>(() => {
    try {
      const saved = localStorage.getItem('gym_allievi_list');
      if (saved) return JSON.parse(saved);
      // fallback to previous fitsquad_members if present
      const oldSaved = localStorage.getItem('fitsquad_members');
      if (oldSaved) {
        const parsed = JSON.parse(oldSaved);
        return parsed.map((m: any) => ({
          id: m.id,
          name: m.name,
          phone: m.phone || '',
          isCurrentUser: m.isCurrentUser,
        }));
      }
      return DEFAULT_STUDENTS;
    } catch {
      return DEFAULT_STUDENTS;
    }
  });

  // Currently selected student
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('gym_current_student_id');
      if (saved && students.some((s) => s.id === saved)) return saved;
      return students[0]?.id || null;
    } catch {
      return students[0]?.id || null;
    }
  });

  // Modal open states
  const [isGymSettingsModalOpen, setIsGymSettingsModalOpen] = useState<boolean>(false);
  const [isStudentManagerOpen, setIsStudentManagerOpen] = useState<boolean>(false);
  const [isAppIconModalOpen, setIsAppIconModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [reminderAlert, setReminderAlert] = useState<{ title: string; body: string } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return getStoredNotificationSettings().enabled;
  });
  const [toastMessage, setToastMessage] = useState<string>('');

  // Apply custom app icon to DOM on mount or when gymInfo updates
  useEffect(() => {
    const savedIcon = localStorage.getItem('gym_custom_app_icon') || gymInfo.appIconUrl;
    if (savedIcon) {
      applyAppIconToDOM(savedIcon, gymInfo.appName || 'FitSquad');
    }
  }, [gymInfo.appIconUrl, gymInfo.appName]);

  // Periodic check (every 30 seconds) for upcoming courses starting in 1 hour
  useEffect(() => {
    const runCourseReminderCheck = () => {
      const currentSchedule = getCurrentSchedule();
      checkAndTriggerCourseReminders(currentSchedule, students);
      setNotificationsEnabled(getStoredNotificationSettings().enabled);
    };

    runCourseReminderCheck();
    const intervalId = setInterval(runCourseReminderCheck, 30000);

    // In-app alert banner listener for course reminders
    const handleReminderEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; body: string }>;
      if (customEvent.detail) {
        setReminderAlert(customEvent.detail);
        setTimeout(() => {
          setReminderAlert((prev) => (prev?.title === customEvent.detail.title ? null : prev));
        }, 10000);
      }
    };

    window.addEventListener('gym_course_reminder_alert', handleReminderEvent);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('gym_course_reminder_alert', handleReminderEvent);
    };
  }, [students]);

  // Auto-connect to Firebase and subscribe to Real-Time Cloud updates
  useEffect(() => {
    // 1. Connection listener & Auth
    const unsubConn = onCloudConnectionChange((connected) => {
      setIsCloudConnected(connected);
    });

    const unsubAuth = initAuth();

    testFirestoreConnection();

    // 2. Real-time subscription to Gym Info
    const unsubInfo = subscribeToGymInfo((cloudInfo) => {
      setGymInfo(cloudInfo);
    }, gymInfo);

    // 3. Real-time subscription to Students
    const unsubStudents = subscribeToStudents((cloudStudents) => {
      setStudents(cloudStudents);
      setCurrentStudentId((prev) => {
        if (!prev || !cloudStudents.some((s) => s.id === prev)) {
          return cloudStudents[0]?.id || null;
        }
        return prev;
      });
    }, students);

    return () => {
      unsubConn();
      unsubAuth();
      unsubInfo();
      unsubStudents();
    };
  }, []);

  // Persist user role
  useEffect(() => {
    try {
      localStorage.setItem('gym_user_role', userRole);
    } catch {}
  }, [userRole]);

  // Persist active student ID locally
  useEffect(() => {
    try {
      if (currentStudentId) {
        localStorage.setItem('gym_current_student_id', currentStudentId);
      } else {
        localStorage.removeItem('gym_current_student_id');
      }
    } catch {}
  }, [currentStudentId]);

  // Show celebratory toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSaveGymInfo = async (updatedInfo: GymInfoSettings) => {
    setGymInfo(updatedInfo);
    try {
      await saveGymInfoToCloud(updatedInfo);
    } catch (e) {
      console.error('Error saving gym info to cloud:', e);
    }
    showToast('✨ Dati del centro sportivo salvati in tempo reale nel Cloud!');
  };

  // Add new student with full profile support and Cloud sync
  const handleAddStudent = (
    name: string,
    phone?: string,
    email?: string,
    notes?: string,
    medicalCertExpiry?: string
  ): Allievo => {
    const newStudent: Allievo = {
      id: `allievo_${Date.now()}`,
      name: name.trim(),
      phone: phone?.trim(),
      email: email?.trim(),
      notes: notes?.trim(),
      medicalCertExpiry: medicalCertExpiry?.trim(),
      joinedDate: new Date().toLocaleDateString('it-IT'),
    };

    setStudents((prev) => [...prev, newStudent]);
    setCurrentStudentId(newStudent.id);

    // Save to Firestore in real time
    saveStudentToCloud(newStudent).catch((err) => {
      console.error('Error saving student to cloud:', err);
    });

    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch {}

    showToast(`✓ Allievo "${newStudent.name}" salvato nel Cloud!`);
    return newStudent;
  };

  // Edit existing student with full profile updates and Cloud sync
  const handleEditStudent = (
    id: string,
    updates: {
      name: string;
      phone?: string;
      email?: string;
      notes?: string;
      medicalCertExpiry?: string;
    }
  ) => {
    let updatedStudentObj: Allievo | undefined;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          updatedStudentObj = {
            ...s,
            ...updates,
            name: updates.name.trim(),
            phone: updates.phone?.trim(),
            email: updates.email?.trim(),
            notes: updates.notes?.trim(),
            medicalCertExpiry: updates.medicalCertExpiry?.trim(),
          };
          return updatedStudentObj;
        }
        return s;
      })
    );

    if (updatedStudentObj) {
      saveStudentToCloud(updatedStudentObj).catch((err) => {
        console.error('Error updating student in cloud:', err);
      });
    }

    showToast('✓ Profilo allievo aggiornato in tempo reale!');
  };

  // Delete student directly and sync with Cloud
  const handleDeleteStudent = (id: string) => {
    const studentToDelete = students.find((s) => s.id === id);
    if (!studentToDelete) return;

    // 1. Remove from students list and delete from Cloud
    setStudents((prev) => prev.filter((s) => s.id !== id));
    deleteStudentFromCloud(id).catch((err) => {
      console.error('Error deleting student from cloud:', err);
    });

    // 2. Remove student ID from all courses in gym_weekly_schedule and sync to Cloud
    try {
      const saved = localStorage.getItem('gym_weekly_schedule');
      if (saved) {
        const scheduleData: GymScheduleRow[] = JSON.parse(saved);
        const dayKeys = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi'] as const;
        const cleaned = scheduleData.map((row) => {
          const updatedDays = { ...row.days };
          dayKeys.forEach((d) => {
            const cell = updatedDays[d];
            if (cell && cell.enrolledMemberIds?.includes(id)) {
              updatedDays[d] = {
                ...cell,
                enrolledMemberIds: cell.enrolledMemberIds.filter((mId) => mId !== id),
              };
            }
          });
          return { ...row, days: updatedDays };
        });
        saveScheduleToCloud(cleaned).catch(() => {});
        window.dispatchEvent(new Event('gym_schedule_updated'));
      }
    } catch {}

    // 3. Reset selected student if it was this student
    if (currentStudentId === id) {
      const remaining = students.filter((s) => s.id !== id);
      setCurrentStudentId(remaining[0]?.id || null);
    }

    showToast(`🗑️ Allievo "${studentToDelete.name}" eliminato.`);
  };

  // Get current schedule rows for StudentManager modal
  const getCurrentSchedule = (): GymScheduleRow[] => {
    try {
      const saved = localStorage.getItem('gym_weekly_schedule');
      return saved ? JSON.parse(saved) : INITIAL_GYM_SCHEDULE;
    } catch {
      return INITIAL_GYM_SCHEDULE;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-[#7cb342] selection:text-slate-950 print:min-h-0 print:h-auto print:bg-white print:text-black print:p-0 print:m-0 print:block">
      {/* Navigation Header */}
      <Header
        gymInfo={gymInfo}
        isCloudConnected={isCloudConnected}
        onOpenGymSettings={() => setIsGymSettingsModalOpen(true)}
        onOpenAppIconModal={() => setIsAppIconModalOpen(true)}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        notificationsEnabled={notificationsEnabled}
      />

      {/* Real-time In-App Reminder Alert Banner (1h Before Course) */}
      {reminderAlert && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-[calc(100%-2rem)] bg-slate-900/95 backdrop-blur-md border-2 border-amber-400 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-slideDown">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black">
                Promemoria 1h
              </span>
            </div>
            <h4 className="text-sm font-black text-amber-300 mt-1">{reminderAlert.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{reminderAlert.body}</p>
          </div>
          <button
            type="button"
            onClick={() => setReminderAlert(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content: Timetable View & Direct Course Self-Enrollment */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 print:p-0 print:m-0 print:max-w-none print:w-full print:bg-white">
        <GymScheduleView
          students={students}
          onAddStudent={handleAddStudent}
          gymInfo={gymInfo}
          onOpenGymSettings={() => setIsGymSettingsModalOpen(true)}
        />
      </main>

      {/* Gym Settings & Branding Modal */}
      <GymSettingsModal
        isOpen={isGymSettingsModalOpen}
        onClose={() => setIsGymSettingsModalOpen(false)}
        gymInfo={gymInfo}
        onSave={handleSaveGymInfo}
        onOpenAppIconModal={() => setIsAppIconModalOpen(true)}
      />

      {/* App Icon Customization Modal (iPhone, iPad & Tablet) */}
      <AppIconModal
        isOpen={isAppIconModalOpen}
        onClose={() => setIsAppIconModalOpen(false)}
        gymInfo={gymInfo}
        onSaveGymInfo={handleSaveGymInfo}
        onShowToast={showToast}
      />

      {/* Course Notification Reminders Modal (1 Hour Before) */}
      <CourseNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        students={students}
        currentStudentId={currentStudentId}
        schedule={getCurrentSchedule()}
        onShowToast={showToast}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-[#7cb342] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp">
          <div className="w-2.5 h-2.5 rounded-full bg-[#7cb342] animate-ping" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Clean Minimalist Footer */}
      <footer className="mt-auto border-t border-slate-900 py-4 px-4 bg-slate-950 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-display font-bold text-slate-400">
            <Dumbbell className="w-4 h-4 text-[#7cb342]" />
            <span>
              {gymInfo.appName} • {gymInfo.gymName}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Tabellone orari stampabile A4 • Inserimento nomi allievi & iscrizione ai corsi
          </p>
        </div>
      </footer>
    </div>
  );
}
