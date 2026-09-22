import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  BellRing,
  Clock,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Play,
  Calendar,
  Sparkles,
  Info,
  User,
  Users,
} from 'lucide-react';
import { Allievo } from '../types';
import { GymScheduleRow } from '../data/gymScheduleData';
import {
  NotificationSettings,
  getStoredNotificationSettings,
  saveStoredNotificationSettings,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  sendBrowserNotification,
  playNotificationChime,
  getTodayUpcomingCourseReminders,
  UpcomingCourseReminder,
} from '../utils/courseNotifications';

interface CourseNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Allievo[];
  currentStudentId?: string | null;
  schedule: GymScheduleRow[];
  onShowToast: (msg: string) => void;
}

export const CourseNotificationModal: React.FC<CourseNotificationModalProps> = ({
  isOpen,
  onClose,
  students,
  currentStudentId,
  schedule,
  onShowToast,
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(getStoredNotificationSettings());
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermissionStatus()
  );
  const [remindersList, setRemindersList] = useState<UpcomingCourseReminder[]>([]);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // Refresh permission and today's reminders on open
  useEffect(() => {
    if (!isOpen) return;
    setPermissionStatus(getNotificationPermissionStatus());
    const stored = getStoredNotificationSettings();

    // If no student configured yet, default to currentStudentId
    if (stored.studentId === 'all' && currentStudentId) {
      stored.studentId = currentStudentId;
    }
    setSettings(stored);

    const list = getTodayUpcomingCourseReminders(
      schedule,
      students,
      stored.studentId,
      stored.leadTimeMinutes
    );
    setRemindersList(list);
  }, [isOpen, schedule, students, currentStudentId]);

  // Recalculate reminders when student filter or timing changes
  useEffect(() => {
    if (!isOpen) return;
    const list = getTodayUpcomingCourseReminders(
      schedule,
      students,
      settings.studentId,
      settings.leadTimeMinutes
    );
    setRemindersList(list);
  }, [settings.studentId, settings.leadTimeMinutes, schedule, students, isOpen]);

  if (!isOpen) return null;

  // Handle toggling notifications
  const handleToggleEnabled = async () => {
    const nextEnabled = !settings.enabled;

    if (nextEnabled && permissionStatus !== 'granted') {
      const granted = await requestNotificationPermission();
      setPermissionStatus(getNotificationPermissionStatus());
      if (!granted) {
        onShowToast('⚠️ Notifiche non autorizzate dal browser.');
      }
    }

    const updated = { ...settings, enabled: nextEnabled };
    setSettings(updated);
    saveStoredNotificationSettings(updated);

    if (nextEnabled) {
      onShowToast('🔔 Promemoria corsi attivo: riceverai una notifica 1h prima della lezione!');
    } else {
      onShowToast('Promemoria corsi disattivato.');
    }
  };

  // Request browser permission explicitly
  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(getNotificationPermissionStatus());
    if (granted) {
      const updated = { ...settings, enabled: true };
      setSettings(updated);
      saveStoredNotificationSettings(updated);
      playNotificationChime();
      sendBrowserNotification('🔔 Notifiche FitSquad Attive!', {
        body: 'Le notifiche per i corsi sono state abilitate con successo.',
      });
      onShowToast('✓ Permesso notifiche concesso dal browser!');
    } else {
      onShowToast('⚠️ Permesso negato nelle impostazioni del browser.');
    }
  };

  // Send an immediate test notification
  const handleSendTestNotification = async () => {
    setIsTesting(true);

    if (permissionStatus !== 'granted') {
      const granted = await requestNotificationPermission();
      setPermissionStatus(getNotificationPermissionStatus());
      if (!granted) {
        setIsTesting(false);
        onShowToast('⚠️ Abilita prima i permessi di notifica nel browser.');
        return;
      }
    }

    if (settings.soundEnabled) {
      playNotificationChime();
    }

    const studentName =
      settings.studentId !== 'all'
        ? students.find((s) => s.id === settings.studentId)?.name || 'Allievo'
        : 'Allievo';

    sendBrowserNotification('⏰ Notifica di Prova FitSquad (1h Prima)', {
      body: `Ciao ${studentName}! Questo è l'avviso che riceverai 1 ora prima dell'inizio del tuo corso. Tutto funziona alla perfezione!`,
    });

    onShowToast('✓ Notifica di prova inviata con successo!');
    setTimeout(() => setIsTesting(false), 1200);
  };

  const handleStudentChange = (id: string) => {
    const updated = { ...settings, studentId: id };
    setSettings(updated);
    saveStoredNotificationSettings(updated);
  };

  const handleLeadTimeChange = (minutes: number) => {
    const updated = { ...settings, leadTimeMinutes: minutes };
    setSettings(updated);
    saveStoredNotificationSettings(updated);
  };

  const handleToggleSound = () => {
    const nextSound = !settings.soundEnabled;
    const updated = { ...settings, soundEnabled: nextSound };
    setSettings(updated);
    saveStoredNotificationSettings(updated);
    if (nextSound) {
      playNotificationChime();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Ambient background glow */}
        <div className="absolute -right-20 -top-20 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-[#7cb342] to-[#0288d1] p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <BellRing className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black font-display text-white">
                  Promemoria Notifiche Corsi (1h Prima)
                </h3>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-black border border-amber-500/40">
                  Locale & PWA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Invia una notifica browser automatica esattamente 1 ora prima dell'inizio delle lezioni
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

        {/* Body Content */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Main Activation Card */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">
                  Notifiche Promemoria Corsi
                </span>
                {permissionStatus === 'granted' ? (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Browser Autorizzato
                  </span>
                ) : permissionStatus === 'denied' ? (
                  <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/30 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Permesso Negato
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                    Da Autorizzare
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Ricevi un avviso sul tuo dispositivo con orario, nome corso, sala e istruttore
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {permissionStatus !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all"
                >
                  Autorizza Notifiche
                </button>
              )}
              <button
                type="button"
                onClick={handleToggleEnabled}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.enabled ? 'bg-[#7cb342]' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Student Filter: For whom are reminders enabled on this device? */}
          <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#7cb342]" />
                <span>Allievo per cui attivare il promemoria:</span>
              </span>
              <span className="text-[11px] text-slate-500">Seleziona il tuo nome</span>
            </label>
            <select
              value={settings.studentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-[#7cb342]"
            >
              <option value="all">👥 Tutti i corsi a cui sono iscritti allievi</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  👤 Solo per: {s.name} {s.phone ? `(${s.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Advance Notice Timing & Sound Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Anticipation Selector */}
            <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0288d1]" />
                <span>Anticipo del Promemoria:</span>
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: '30 min', val: 30 },
                  { label: '1 ora (Default)', val: 60 },
                  { label: '2 ore', val: 120 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => handleLeadTimeChange(item.val)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      settings.leadTimeMinutes === item.val
                        ? 'bg-[#7cb342]/20 border-[#7cb342] text-white font-black'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>Suono Notifica (Chime)</span>
                </span>
                <p className="text-[10px] text-slate-500">Riproduce un segnale sonoro all'arrivo</p>
              </div>

              <button
                type="button"
                onClick={handleToggleSound}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  settings.soundEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.soundEnabled ? 'Attivo' : 'Muto'}
              </button>
            </div>
          </div>

          {/* Real-time Test Notification Button */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Prova subito le notifiche</span>
                <span className="text-[11px] text-slate-400 block">
                  Verifica l'avviso a schermo e il suono sul tuo iPhone, iPad o computer
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendTestNotification}
              disabled={isTesting}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shrink-0 active:scale-95"
            >
              {isTesting ? 'Invio in corso...' : 'Invia Notifica di Prova'}
            </button>
          </div>

          {/* Today's Scheduled Reminders Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#7cb342]" />
                <span>Corsi di Oggi con Promemoria Programmato:</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {remindersList.length} lezioni rilevate
              </span>
            </div>

            {remindersList.length > 0 ? (
              <div className="space-y-2">
                {remindersList.map((item) => (
                  <div
                    key={item.courseId}
                    className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{item.courseName}</span>
                        <span className="text-[11px] font-bold text-[#7cb342] bg-[#7cb342]/15 px-2 py-0.5 rounded">
                          {item.timeStr}
                        </span>
                        {item.instructor && (
                          <span className="text-[11px] text-slate-400">con {item.instructor}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {item.enrolledStudents.length === 1
                          ? `Allievo: ${item.enrolledStudents[0].name}`
                          : `Iscritti: ${item.enrolledStudents.map((s) => s.name).join(', ')}`}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-amber-400 font-bold block">
                        Promemoria 1h prima:
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {item.reminderTimeDate.toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Nessun corso in programma oggi con allievi iscritti per il profilo selezionato.
              </div>
            )}
          </div>

          {/* iOS Note */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-[#7cb342]" />
              Supporto Notifiche su iPhone & iPad:
            </span>
            <p>
              Su iPhone e iPad (iOS 16.4+), per ricevere notifiche di sistema native, aggiungi l'applicazione alla schermata iniziale toccando <strong>Condividi</strong> &gt; <strong>Aggiungi alla schermata Home</strong>. Quando la pagina è aperta nel browser riceverai sempre l'avviso sonoro e visivo.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all ml-auto"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
