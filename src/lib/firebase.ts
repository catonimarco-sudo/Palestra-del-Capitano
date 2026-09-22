import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDoc,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import { Allievo } from '../types';
import { GymInfoSettings, GymScheduleRow, GymCourseCategory } from '../data/gymScheduleData';

// Config sourced from firebase-applet-config.json for seamless execution across AI Studio & Vercel
export const firebaseConfig = {
  projectId: "central-passkey-jdw77",
  appId: "1:765906178486:web:1ccc1d6a894f4ffa9f3117",
  apiKey: "AIzaSyA4g3jQ5eb0bjGGqq7yu5xgqOblTzwALig",
  authDomain: "central-passkey-jdw77.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-fitsquad3d-7e20b1cd-e4f8-4b4a-b3e1-00d0af224039",
  storageBucket: "central-passkey-jdw77.firebasestorage.app",
  messagingSenderId: "765906178486",
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with specific database ID
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Connection state listeners
type ConnectionListener = (connected: boolean) => void;
const connectionListeners: Set<ConnectionListener> = new Set();
let isCurrentlyConnected = false;

export function onCloudConnectionChange(listener: ConnectionListener) {
  connectionListeners.add(listener);
  listener(isCurrentlyConnected);
  return () => {
    connectionListeners.delete(listener);
  };
}

function setCloudConnected(status: boolean) {
  if (isCurrentlyConnected !== status) {
    isCurrentlyConnected = status;
    connectionListeners.forEach((fn) => fn(status));
  }
}

// Test connection on boot as required by guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    setCloudConnected(true);
    return true;
  } catch {
    // Attempt local ping / fallback
    return isCurrentlyConnected;
  }
}

// Attempt anonymous auth if enabled, but operate gracefully without auth
export function initAuth(onUserReady?: (user: User | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      try {
        const cred = await signInAnonymously(auth);
        onUserReady?.(cred.user);
      } catch {
        // Anonymous auth provider might be disabled in Firebase console, public rules allow direct access
        onUserReady?.(null);
      }
    } else {
      onUserReady?.(user);
    }
  });
}

// ==========================================
// REAL-TIME FIRESTORE SERVICES
// ==========================================

// Helper to recursively strip undefined properties since Firestore setDoc rejects undefined
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// 1. Weekly Schedule
export function subscribeToSchedule(
  onData: (schedule: GymScheduleRow[]) => void,
  initialFallback: GymScheduleRow[]
) {
  const scheduleDocRef = doc(db, 'gym_schedule', 'weekly');

  return onSnapshot(
    scheduleDocRef,
    async (snap) => {
      setCloudConnected(true);
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.rows) && data.rows.length > 0) {
          onData(data.rows);
          try {
            localStorage.setItem('gym_weekly_schedule', JSON.stringify(data.rows));
          } catch {}
          return;
        }
      }
      // If not in cloud yet, seed with initial data from local/props
      try {
        await setDoc(scheduleDocRef, {
          rows: sanitizeForFirestore(initialFallback),
          updatedAt: new Date().toISOString(),
        });
        onData(initialFallback);
      } catch (err) {
        console.warn('Could not auto-seed schedule to Firestore:', err);
        onData(initialFallback);
      }
    },
    (err) => {
      console.error('Firestore schedule subscription error:', err);
      onData(initialFallback);
    }
  );
}

export async function saveScheduleToCloud(schedule: GymScheduleRow[]) {
  // Always update localStorage first for instantaneous optimistic UI
  try {
    localStorage.setItem('gym_weekly_schedule', JSON.stringify(schedule));
  } catch {}

  const scheduleDocRef = doc(db, 'gym_schedule', 'weekly');
  const sanitizedRows = sanitizeForFirestore(schedule);
  await setDoc(
    scheduleDocRef,
    {
      rows: sanitizedRows,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  setCloudConnected(true);
}

// 2. Students / Allievi List
export function subscribeToStudents(
  onData: (students: Allievo[]) => void,
  initialFallback: Allievo[]
) {
  const studentsColRef = collection(db, 'gym_students');

  return onSnapshot(
    studentsColRef,
    async (snap) => {
      setCloudConnected(true);
      if (!snap.empty) {
        const list: Allievo[] = [];
        snap.forEach((d) => {
          list.push(d.data() as Allievo);
        });
        // Sort by joinedDate or ID
        onData(list);
        try {
          localStorage.setItem('gym_allievi_list', JSON.stringify(list));
        } catch {}
      } else {
        // First boot: seed fallback students to Firestore
        try {
          for (const s of initialFallback) {
            await setDoc(doc(db, 'gym_students', s.id), s);
          }
          onData(initialFallback);
        } catch (err) {
          console.warn('Could not auto-seed students to Firestore:', err);
          onData(initialFallback);
        }
      }
    },
    (err) => {
      console.error('Firestore students subscription error:', err);
      onData(initialFallback);
    }
  );
}

export async function saveStudentToCloud(student: Allievo) {
  await setDoc(doc(db, 'gym_students', student.id), sanitizeForFirestore(student), { merge: true });
}

export async function deleteStudentFromCloud(studentId: string) {
  await deleteDoc(doc(db, 'gym_students', studentId));
}

// 3. Gym Settings (Center Info & Category Colors)
export function subscribeToGymInfo(
  onData: (info: GymInfoSettings) => void,
  initialFallback: GymInfoSettings
) {
  const infoDocRef = doc(db, 'gym_settings', 'info');

  return onSnapshot(
    infoDocRef,
    async (snap) => {
      setCloudConnected(true);
      if (snap.exists()) {
        const data = snap.data();
        if (data?.info) {
          onData(data.info as GymInfoSettings);
          try {
            localStorage.setItem('gym_info_settings', JSON.stringify(data.info));
          } catch {}
          return;
        }
      }
      // Seed if not present
      try {
        await setDoc(infoDocRef, {
          info: sanitizeForFirestore(initialFallback),
          updatedAt: new Date().toISOString(),
        });
        onData(initialFallback);
      } catch (err) {
        onData(initialFallback);
      }
    },
    (err) => {
      console.error('Firestore gym info subscription error:', err);
      onData(initialFallback);
    }
  );
}

export async function saveGymInfoToCloud(info: GymInfoSettings) {
  try {
    localStorage.setItem('gym_info_settings', JSON.stringify(info));
  } catch {}

  const infoDocRef = doc(db, 'gym_settings', 'info');
  await setDoc(
    infoDocRef,
    {
      info: sanitizeForFirestore(info),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  setCloudConnected(true);
}

// 4. Category Colors
export function subscribeToCategoryColors(
  onData: (colors: Record<GymCourseCategory, string>) => void,
  initialFallback: Record<GymCourseCategory, string>
) {
  const colorsDocRef = doc(db, 'gym_settings', 'colors');

  return onSnapshot(
    colorsDocRef,
    async (snap) => {
      setCloudConnected(true);
      if (snap.exists()) {
        const data = snap.data();
        if (data?.colors) {
          onData(data.colors as Record<GymCourseCategory, string>);
          try {
            localStorage.setItem('gym_category_colors', JSON.stringify(data.colors));
          } catch {}
          return;
        }
      }
      // Seed if not present
      try {
        await setDoc(colorsDocRef, {
          colors: sanitizeForFirestore(initialFallback),
          updatedAt: new Date().toISOString(),
        });
        onData(initialFallback);
      } catch (err) {
        onData(initialFallback);
      }
    },
    (err) => {
      console.error('Firestore colors subscription error:', err);
      onData(initialFallback);
    }
  );
}

export async function saveCategoryColorsToCloud(colors: Record<GymCourseCategory, string>) {
  try {
    localStorage.setItem('gym_category_colors', JSON.stringify(colors));
  } catch {}

  const colorsDocRef = doc(db, 'gym_settings', 'colors');
  await setDoc(
    colorsDocRef,
    {
      colors: sanitizeForFirestore(colors),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  setCloudConnected(true);
}
