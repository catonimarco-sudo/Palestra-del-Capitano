export type AttendanceStatus = 'present' | 'maybe' | 'skipping' | 'pending';
export type DayKey = 'lunedi' | 'martedi' | 'mercoledi' | 'giovedi' | 'venerdi';

export type UserRole = 'gestore' | 'allievo';
export type TargetAudience = 'allievi' | 'mister' | 'tutti';

export interface Allievo {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  medicalCertExpiry?: string;
  joinedDate?: string;
  isCurrentUser?: boolean;
}

export interface SquadMember extends Allievo {
  nickname: string;
  role: string;
  avatarColor: string;
  headbandColor: string;
  streakDays: number;
  totalWorkouts: number;
  proteinShakesOwed: number;
  motto: string;
  favoriteExercise: string;
  isCurrentUser?: boolean;
}

export interface WorkoutAttendeeStatus {
  memberId: string;
  status: AttendanceStatus;
  updatedAt: string;
  note?: string;
}

export interface WorkoutSession {
  id: string;
  dayName: string;
  dateStr: string;
  time: string;
  title: string;
  muscleFocus: string[];
  location: string;
  plannedExercises: string[]; // exercise ids
  attendees: Record<string, WorkoutAttendeeStatus>;
  notes?: string;
}

export type ExerciseAnimationType = 'squat' | 'bench_press' | 'deadlift' | 'pull_up' | 'shoulder_press' | 'bicep_curl';

export interface Exercise {
  id: string;
  name: string;
  category: 'Gambe' | 'Petto' | 'Dorso' | 'Spalle' | 'Braccia' | 'Core';
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzato';
  targetMuscles: string[];
  secondaryMuscles: string[];
  animationType: ExerciseAnimationType;
  description: string;
  keyCues: string[];
  commonMistakes: string[];
  suggestedSetsReps: string;
  restTime: string;
}
