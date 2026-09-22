// Local Browser Notification Service for Gym Courses
// Sends reminder notifications 1 hour before scheduled courses

import { GymScheduleRow, GymScheduleCell } from '../data/gymScheduleData';
import { Allievo } from '../types';

export type DayKey = 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi';

export interface NotificationSettings {
  enabled: boolean;
  leadTimeMinutes: number; // default 60 (1 hour before)
  soundEnabled: boolean;
  studentId: string | 'all';
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  leadTimeMinutes: 60,
  soundEnabled: true,
  studentId: 'all',
};

// Map JS day (1..5) to schedule DayKey
export function getTodayDayKey(): DayKey | null {
  const day = new Date().getDay();
  switch (day) {
    case 1:
      return 'lunedi';
    case 2:
      return 'martedi';
    case 3:
      return 'mercoledi';
    case 4:
      return 'giovedi';
    case 5:
      return 'venerdi';
    default:
      return null; // Weekend
  }
}

// Parse time string e.g. "9:00", "09:00", "18.30", "18:30 - 19:30" into { hours, minutes }
export function parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{1,2})[:.](\d{2})/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return { hours, minutes };
}

// Play pleasant web-audio chime for notifications
export function playNotificationChime() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(523.25, now, 0.25); // C5
    playTone(659.25, now + 0.12, 0.25); // E5
    playTone(783.99, now + 0.24, 0.4); // G5
  } catch (e) {
    console.debug('Audio chime could not play:', e);
  }
}

// Load notification settings from localStorage
export function getStoredNotificationSettings(): NotificationSettings {
  try {
    const saved = localStorage.getItem('gym_course_notification_settings');
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_SETTINGS;
}

// Save notification settings
export function saveStoredNotificationSettings(settings: NotificationSettings) {
  try {
    localStorage.setItem('gym_course_notification_settings', JSON.stringify(settings));
  } catch {}
}

// Check notification permission
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Request permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
}

// Send actual native browser notification
export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const icon =
      options?.icon ||
      localStorage.getItem('gym_custom_app_icon') ||
      '/apple-touch-icon.png';

    const notif = new Notification(title, {
      ...options,
      icon,
      badge: '/apple-touch-icon.png',
      requireInteraction: false,
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (err) {
    console.debug('Could not show browser notification:', err);
  }
}

export interface UpcomingCourseReminder {
  courseId: string;
  courseName: string;
  instructor?: string;
  timeStr: string;
  dayKey: DayKey;
  startTimeDate: Date;
  reminderTimeDate: Date;
  minutesUntilStart: number;
  minutesUntilReminder: number;
  isAlreadyNotified: boolean;
  enrolledStudents: Allievo[];
}

/**
 * Finds all courses scheduled for today that match enrolled students
 * and calculates when the 1-hour reminder should be triggered.
 */
export function getTodayUpcomingCourseReminders(
  schedule: GymScheduleRow[],
  students: Allievo[],
  activeStudentId?: string | null,
  leadTimeMinutes: number = 60
): UpcomingCourseReminder[] {
  const todayKey = getTodayDayKey();
  if (!todayKey) return []; // weekend

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const reminders: UpcomingCourseReminder[] = [];

  schedule.forEach((row) => {
    const cell = row.days[todayKey];
    if (!cell) return;

    const enrolledIds = cell.enrolledMemberIds || [];
    if (enrolledIds.length === 0) return;

    // Filter enrolled students matching active selection
    const enrolledStudents = students.filter((s) => enrolledIds.includes(s.id));
    if (activeStudentId && activeStudentId !== 'all') {
      if (!enrolledIds.includes(activeStudentId)) return;
    }

    // Parse course start time
    const parsedTime = parseTimeString(row.time);
    if (!parsedTime) return;

    const courseStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parsedTime.hours, parsedTime.minutes, 0);
    const reminderDate = new Date(courseStartDate.getTime() - leadTimeMinutes * 60 * 1000);

    const minutesUntilStart = Math.round((courseStartDate.getTime() - now.getTime()) / (60 * 1000));
    const minutesUntilReminder = Math.round((reminderDate.getTime() - now.getTime()) / (60 * 1000));

    const storageKey = `gym_reminder_sent_${cell.id}_${dateStr}_${leadTimeMinutes}`;
    const isAlreadyNotified = !!localStorage.getItem(storageKey);

    reminders.push({
      courseId: cell.id,
      courseName: cell.name,
      instructor: cell.instructor,
      timeStr: row.time,
      dayKey: todayKey,
      startTimeDate: courseStartDate,
      reminderTimeDate: reminderDate,
      minutesUntilStart,
      minutesUntilReminder,
      isAlreadyNotified,
      enrolledStudents,
    });
  });

  // Sort by start time ascending
  return reminders.sort((a, b) => a.startTimeDate.getTime() - b.startTimeDate.getTime());
}

/**
 * Main checking routine: runs periodically in the background.
 * Triggers notification if course is within the 1-hour reminder window.
 */
export function checkAndTriggerCourseReminders(
  schedule: GymScheduleRow[],
  students: Allievo[],
  onReminderTriggered?: (reminder: UpcomingCourseReminder) => void
): number {
  const settings = getStoredNotificationSettings();
  if (!settings.enabled) return 0;

  const reminders = getTodayUpcomingCourseReminders(
    schedule,
    students,
    settings.studentId,
    settings.leadTimeMinutes
  );

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  let triggeredCount = 0;

  reminders.forEach((r) => {
    // If course hasn't started yet, and we are within 1 hour before start
    // (i.e. minutesUntilStart <= leadTimeMinutes and minutesUntilStart > -15)
    // and reminder has not yet been dispatched today
    if (r.minutesUntilStart <= settings.leadTimeMinutes && r.minutesUntilStart > -15 && !r.isAlreadyNotified) {
      const storageKey = `gym_reminder_sent_${r.courseId}_${dateStr}_${settings.leadTimeMinutes}`;
      try {
        localStorage.setItem(storageKey, new Date().toISOString());
      } catch {}

      // Play audio chime if enabled
      if (settings.soundEnabled) {
        playNotificationChime();
      }

      // Format student names
      const namesStr =
        r.enrolledStudents.length === 1
          ? r.enrolledStudents[0].name
          : `${r.enrolledStudents.length} allievi`;

      const title = `⏰ Promemoria: ${r.courseName} alle ${r.timeStr}!`;
      const body =
        r.minutesUntilStart > 0
          ? `Ciao ${namesStr}! Il tuo corso di ${r.courseName} inizia tra circa ${r.minutesUntilStart} minuti (${r.timeStr}) con ${r.instructor || 'l\'istruttore'}. Prepara la borsa!`
          : `La lezione di ${r.courseName} è iniziata adesso alle ${r.timeStr}!`;

      sendBrowserNotification(title, {
        body,
        tag: `gym-reminder-${r.courseId}`,
      });

      if (onReminderTriggered) {
        onReminderTriggered(r);
      }

      // Dispatch global window event for in-app toasts
      window.dispatchEvent(
        new CustomEvent('gym_course_reminder_alert', {
          detail: {
            title,
            body,
            courseName: r.courseName,
            timeStr: r.timeStr,
            instructor: r.instructor,
          },
        })
      );

      triggeredCount++;
    }
  });

  return triggeredCount;
}
