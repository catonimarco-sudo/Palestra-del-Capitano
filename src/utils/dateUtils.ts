import { DayKey } from '../types';

const MONTH_NAMES_IT = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
];

const MONTH_SHORT_IT = [
  'GEN',
  'FEB',
  'MAR',
  'APR',
  'MAG',
  'GIU',
  'LUG',
  'AGO',
  'SET',
  'OTT',
  'NOV',
  'DIC',
];

/**
 * Get Monday for a given date at 00:00:00
 */
export function getMonday(d: Date = new Date()): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get Monday for current week + offset weeks (0 = this week, 1 = next week, -1 = last week)
 */
export function getMondayForOffset(offsetWeeks: number = 0): Date {
  const now = new Date();
  const monday = getMonday(now);
  monday.setDate(monday.getDate() + offsetWeeks * 7);
  return monday;
}

/**
 * Formats a Monday date to a stable week key (e.g. "2026-09-21")
 */
export function getWeekKey(mondayDate: Date): string {
  const year = mondayDate.getFullYear();
  const month = String(mondayDate.getMonth() + 1).padStart(2, '0');
  const day = String(mondayDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface DayDateInfo {
  dayKey: DayKey;
  date: Date;
  dateNum: number;
  monthShort: string;
  monthName: string;
  dateStr: string; // e.g. "21 SET"
  dateFormattedSlash: string; // e.g. "21/09"
  isoDate: string; // e.g. "2026-09-21"
  isToday: boolean;
}

/**
 * Return date information for the 5 working days (Mon-Fri) of a week
 */
export function getWeekDatesInfo(mondayDate: Date): Record<DayKey, DayDateInfo> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const dayKeys: DayKey[] = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi'];
  const result: Partial<Record<DayKey, DayDateInfo>> = {};

  dayKeys.forEach((key, index) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + index);

    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const dateNum = d.getDate();
    const isoDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
    const isToday = isoDate === todayIso;

    result[key] = {
      dayKey: key,
      date: d,
      dateNum,
      monthShort: MONTH_SHORT_IT[monthIndex],
      monthName: MONTH_NAMES_IT[monthIndex],
      dateStr: `${dateNum} ${MONTH_SHORT_IT[monthIndex]}`,
      dateFormattedSlash: `${String(dateNum).padStart(2, '0')}/${String(monthIndex + 1).padStart(2, '0')}`,
      isoDate,
      isToday,
    };
  });

  return result as Record<DayKey, DayDateInfo>;
}

/**
 * Formats a descriptive label for the week
 * e.g. "Settimana dal 21 al 25 Settembre 2026"
 * or "Settimana dal 28 Settembre al 2 Ottobre 2026"
 */
export function formatWeekLabel(mondayDate: Date): string {
  const fridayDate = new Date(mondayDate);
  fridayDate.setDate(mondayDate.getDate() + 4);

  const startDay = mondayDate.getDate();
  const startMonth = MONTH_NAMES_IT[mondayDate.getMonth()];
  const startYear = mondayDate.getFullYear();

  const endDay = fridayDate.getDate();
  const endMonth = MONTH_NAMES_IT[fridayDate.getMonth()];
  const endYear = fridayDate.getFullYear();

  if (mondayDate.getMonth() === fridayDate.getMonth() && startYear === endYear) {
    return `Settimana dal ${startDay} al ${endDay} ${startMonth} ${startYear}`;
  } else if (startYear === endYear) {
    return `Settimana dal ${startDay} ${startMonth} al ${endDay} ${endMonth} ${startYear}`;
  } else {
    return `Settimana dal ${startDay} ${startMonth} ${startYear} al ${endDay} ${endMonth} ${endYear}`;
  }
}
