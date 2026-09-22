export type GymCourseCategory = 'posturale' | 'tonificazione' | 'cardio' | 'olistico' | 'funzionale';

export interface GymCategoryMeta {
  key: GymCourseCategory;
  name: string;
  bgColor: string; // Tailwind or Hex
  textColor: string;
  borderColor: string;
  hexColor: string;
  dotColor: string;
}

export const GYM_CATEGORIES: Record<GymCourseCategory, GymCategoryMeta> = {
  posturale: {
    key: 'posturale',
    name: 'Posturale',
    bgColor: 'bg-[#7cb342]', // Vibrant green
    textColor: 'text-white',
    borderColor: 'border-[#689f38]',
    hexColor: '#7cb342',
    dotColor: '#7cb342',
  },
  tonificazione: {
    key: 'tonificazione',
    name: 'Tonificazione',
    bgColor: 'bg-[#0288d1]', // Sky blue
    textColor: 'text-white',
    borderColor: 'border-[#0277bd]',
    hexColor: '#0288d1',
    dotColor: '#0288d1',
  },
  cardio: {
    key: 'cardio',
    name: 'Cardio',
    bgColor: 'bg-[#d81b60]', // Magenta / Hot Pink
    textColor: 'text-white',
    borderColor: 'border-[#c2185b]',
    hexColor: '#d81b60',
    dotColor: '#d81b60',
  },
  olistico: {
    key: 'olistico',
    name: 'Olistico',
    bgColor: 'bg-[#8e24aa]', // Purple / Violet
    textColor: 'text-white',
    borderColor: 'border-[#7b1fa2]',
    hexColor: '#8e24aa',
    dotColor: '#8e24aa',
  },
  funzionale: {
    key: 'funzionale',
    name: 'Funzionale',
    bgColor: 'bg-[#fb8c00]', // Warm Orange
    textColor: 'text-white',
    borderColor: 'border-[#f57c00]',
    hexColor: '#fb8c00',
    dotColor: '#fb8c00',
  },
};

export const AVAILABLE_COLORS = [
  { name: 'Verde Lime (Posturale)', hex: '#7cb342' },
  { name: 'Azzurro Cielo (Tonificazione)', hex: '#0288d1' },
  { name: 'Magenta / Fucsia (Cardio)', hex: '#d81b60' },
  { name: 'Viola Ametista (Olistico)', hex: '#8e24aa' },
  { name: 'Arancio Fuoco (Funzionale)', hex: '#fb8c00' },
  { name: 'Turchese / Ciano', hex: '#00acc1' },
  { name: 'Verde Smeraldo', hex: '#00897b' },
  { name: 'Indaco Profondo', hex: '#3949ab' },
  { name: 'Rosso Corallo', hex: '#e53935' },
  { name: 'Giallo Ambra', hex: '#fdd835' },
  { name: 'Rosa Delicato', hex: '#ec407a' },
  { name: 'Lavanda Chiaro', hex: '#ab47bc' },
  { name: 'Grigio Grafite', hex: '#546e7a' },
  { name: 'Bordeaux Intenso', hex: '#880e4f' },
];

export interface GymScheduleCell {
  id: string;
  name: string;
  category: GymCourseCategory;
  customColor?: string; // Hex color code if customized for this course
  targetAudience?: 'allievi' | 'mister' | 'tutti'; // 'allievi' (default), 'mister' (corsi per mister/staff), 'tutti'
  instructor?: string;
  room?: string;
  duration?: string;
  notes?: string;
  enrolledMemberIds?: string[];
}

export interface GymScheduleRow {
  rowId: string;
  time: string;
  subSlotIndex?: number; // for handling multiple simultaneous sessions at same time
  days: {
    lunedi?: GymScheduleCell;
    martedi?: GymScheduleCell;
    mercoledi?: GymScheduleCell;
    giovedi?: GymScheduleCell;
    venerdi?: GymScheduleCell;
  };
}

export const INITIAL_GYM_SCHEDULE: GymScheduleRow[] = [
  // 1. 09:00 (Slot 1)
  {
    rowId: 'row_9_00_1',
    time: '9:00',
    subSlotIndex: 1,
    days: {
      lunedi: {
        id: 'c_lun_900',
        name: 'PILATES',
        category: 'olistico',
        instructor: 'Chiara',
        room: 'Sala Olistica',
        duration: '50 min',
        notes: 'Controllo del core, respirazione e allungamento della colonna vertebrale.',
        enrolledMemberIds: ['user_1', 'user_4'],
      },
      martedi: {
        id: 'c_mar_900_1',
        name: 'POSTURAL YOGA',
        category: 'olistico',
        instructor: 'Elena',
        room: 'Sala Olistica',
        duration: '55 min',
        notes: 'Miglioramento dell’assetto posturale attraverso asana e respirazione guidata.',
        enrolledMemberIds: ['user_2'],
      },
      mercoledi: {
        id: 'c_mer_900',
        name: 'BODY ENERGY',
        category: 'tonificazione',
        instructor: 'Matteo',
        room: 'Sala Corsi 1',
        duration: '50 min',
        notes: 'Attivazione metabolica, tonificazione dinamica con piccoli carichi.',
        enrolledMemberIds: ['user_3', 'user_1'],
      },
      giovedi: {
        id: 'c_gio_900',
        name: 'PILATES',
        category: 'olistico',
        instructor: 'Chiara',
        room: 'Sala Olistica',
        duration: '50 min',
        notes: 'Rafforzamento profondo del pavimento pelvico e della fascia addominale.',
        enrolledMemberIds: ['user_4'],
      },
      venerdi: {
        id: 'c_ven_900',
        name: 'POSTURAL YOGA',
        category: 'olistico',
        instructor: 'Elena',
        room: 'Sala Olistica',
        duration: '55 min',
        notes: 'Riequilibrio energetico di fine settimana e mobilità articolare.',
        enrolledMemberIds: ['user_2', 'user_1'],
      },
    },
  },

  // 2. 09:00 (Slot 2 - Panca WBS)
  {
    rowId: 'row_9_00_2',
    time: '9:00',
    subSlotIndex: 2,
    days: {
      martedi: {
        id: 'c_mar_900_2',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Esercizi posturali decompressivi su panca specifica WellBackSystem.',
        enrolledMemberIds: ['user_1'],
      },
      mercoledi: {
        id: 'c_mer_900_2',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Scarico vertebrale guidato ed esercizi di decompressione lombare.',
        enrolledMemberIds: [],
      },
      giovedi: {
        id: 'c_gio_900_2',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Esercizi di allungamento miofasciale su panca ergonomica.',
        enrolledMemberIds: ['user_3'],
      },
    },
  },

  // 3. 10:00
  {
    rowId: 'row_10_00',
    time: '10:00',
    days: {
      lunedi: {
        id: 'c_lun_1000',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Sessione di scarico e mobilità su panca WBS.',
        enrolledMemberIds: ['user_2'],
      },
      martedi: {
        id: 'c_mar_1000',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Sessione di scarico e mobilità su panca WBS.',
        enrolledMemberIds: ['user_4'],
      },
      mercoledi: {
        id: 'c_mer_1000',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Sessione di scarico e mobilità su panca WBS.',
        enrolledMemberIds: ['user_1'],
      },
      giovedi: {
        id: 'c_gio_1000',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Sessione di scarico e mobilità su panca WBS.',
        enrolledMemberIds: [],
      },
      venerdi: {
        id: 'c_ven_1000',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Sessione di scarico e mobilità su panca WBS.',
        enrolledMemberIds: ['user_3'],
      },
    },
  },

  // 4. 17:45
  {
    rowId: 'row_17_45',
    time: '17:45',
    days: {
      lunedi: {
        id: 'c_lun_1745',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Decompressione colonna pre-serale su panca WBS.',
        enrolledMemberIds: ['user_1'],
      },
      martedi: {
        id: 'c_mar_1745',
        name: 'POSTURALE',
        category: 'posturale',
        instructor: 'Serena',
        room: 'Sala Olistica',
        duration: '50 min',
        notes: 'Ginnastica posturale a corpo libero ed elastici per correzione cinetica.',
        enrolledMemberIds: ['user_4', 'user_2'],
      },
      mercoledi: {
        id: 'c_mer_1745',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Decompressione e scarico tensioni quotidiane.',
        enrolledMemberIds: [],
      },
      giovedi: {
        id: 'c_gio_1745',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Mobilità miofasciale e allungamento su panca WBS.',
        enrolledMemberIds: ['user_2'],
      },
      venerdi: {
        id: 'c_ven_1745',
        name: 'POSTURALE',
        category: 'posturale',
        instructor: 'Serena',
        room: 'Sala Olistica',
        duration: '50 min',
        notes: 'Correzione posturale e respirazione diaframmatica guidata.',
        enrolledMemberIds: ['user_1', 'user_3'],
      },
    },
  },

  // 5. 18:30 (Spinning)
  {
    rowId: 'row_18_30',
    time: '18:30',
    days: {
      lunedi: {
        id: 'c_lun_1830',
        name: 'SPINNING',
        category: 'cardio',
        instructor: 'Luca',
        room: 'Sala Spin Bike',
        duration: '45 min',
        notes: 'Indoor cycling ad alta intensità a ritmo di musica con cambi di pendenza.',
        enrolledMemberIds: ['user_3', 'user_1'],
      },
      giovedi: {
        id: 'c_gio_1830',
        name: 'SPINNING',
        category: 'cardio',
        instructor: 'Luca',
        room: 'Sala Spin Bike',
        duration: '45 min',
        notes: 'Interval training su bike con percorsi collinari simulati.',
        enrolledMemberIds: ['user_1', 'user_2'],
      },
    },
  },

  // 6. 18:45 (Track 1)
  {
    rowId: 'row_18_45_1',
    time: '18:45',
    subSlotIndex: 1,
    days: {
      lunedi: {
        id: 'c_lun_1845_1',
        name: 'GROUP FUNCTIONAL',
        category: 'tonificazione',
        instructor: 'Alessio',
        room: 'Area Functional',
        duration: '50 min',
        notes: 'Circuito ad alta resa metabolica con kettlebell, sandbag e corpo libero.',
        enrolledMemberIds: ['user_1', 'user_3'],
      },
      martedi: {
        id: 'c_mar_1845_1',
        name: 'SUPER JUMP',
        category: 'cardio',
        instructor: 'Sara',
        room: 'Sala Corsi 1',
        duration: '50 min',
        notes: 'Cardio brucia-grassi su trampolino elastico speciale, zero impatto articolare.',
        enrolledMemberIds: ['user_4'],
      },
      mercoledi: {
        id: 'c_mer_1845_1',
        name: 'ALLENAMENTO FUNZIONALE',
        category: 'funzionale',
        targetAudience: 'allievi',
        instructor: 'Coach Roberto',
        room: 'Area Functional',
        duration: '55 min',
        notes: 'Sessione di condizionamento fisico con sovraccarichi ed esercizi a corpo libero.',
        enrolledMemberIds: [],
      },
      giovedi: {
        id: 'c_gio_1845_1',
        name: 'STEP & TONE',
        category: 'tonificazione',
        instructor: 'Federica',
        room: 'Sala Corsi 1',
        duration: '50 min',
        notes: 'Coreografie sullo step combinate con tonificazione di glutei, gambe e braccia.',
        enrolledMemberIds: ['user_2', 'user_4'],
      },
      venerdi: {
        id: 'c_ven_1845_1',
        name: 'HIIT',
        category: 'tonificazione',
        instructor: 'Alessio',
        room: 'Area Functional',
        duration: '45 min',
        notes: 'High Intensity Interval Training: intervalli ad altissimo dispendio calorico.',
        enrolledMemberIds: ['user_1', 'user_3', 'user_2'],
      },
    },
  },

  // 7. 18:45 (Track 2 - Panca WBS)
  {
    rowId: 'row_18_45_2',
    time: '18:45',
    subSlotIndex: 2,
    days: {
      lunedi: {
        id: 'c_lun_1845_2',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Decompressione serale assistita.',
        enrolledMemberIds: ['user_4'],
      },
      martedi: {
        id: 'c_mar_1845_2',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Decompressione serale assistita.',
        enrolledMemberIds: ['user_3'],
      },
      mercoledi: {
        id: 'c_mer_1845_2',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Decompressione serale assistita.',
        enrolledMemberIds: ['user_2'],
      },
      giovedi: {
        id: 'c_gio_1845_2',
        name: 'PANCA WBS',
        category: 'posturale',
        instructor: 'Marco',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Decompressione serale assistita.',
        enrolledMemberIds: ['user_1'],
      },
    },
  },

  // 8. 18:45 (Track 3 - Pilates)
  {
    rowId: 'row_18_45_3',
    time: '18:45',
    subSlotIndex: 3,
    days: {
      martedi: {
        id: 'c_mar_1845_3',
        name: 'PILATES',
        category: 'posturale',
        instructor: 'Chiara',
        room: 'Sala Olistica',
        duration: '50 min',
        notes: 'Focus allineamento, rinforzo profondo e flessibilità.',
        enrolledMemberIds: ['user_2'],
      },
      venerdi: {
        id: 'c_ven_1845_3',
        name: 'PILATES',
        category: 'posturale',
        instructor: 'Chiara',
        room: 'Sala Olistica',
        duration: '50 min',
        notes: 'Focus allineamento, rinforzo profondo e flessibilità.',
        enrolledMemberIds: ['user_4'],
      },
    },
  },

  // 9. 19:30
  {
    rowId: 'row_19_30',
    time: '19:30',
    days: {
      lunedi: {
        id: 'c_lun_1930',
        name: 'SPINNING',
        category: 'cardio',
        instructor: 'Luca',
        room: 'Sala Spin Bike',
        duration: '45 min',
        notes: 'Corsa serale su bicicletta indoor con musica ed energia massima.',
        enrolledMemberIds: ['user_1'],
      },
      martedi: {
        id: 'c_mar_1930',
        name: 'FAST GYM*',
        category: 'tonificazione',
        instructor: 'Istruttore Sala',
        room: 'Sala Attrezzi / Isola Funzionale',
        duration: '30 min',
        notes: '*Attività funzionale in sala (30 minuti) senza prenotazione aperta a tutti gli iscritti.',
        enrolledMemberIds: ['user_3'],
      },
      giovedi: {
        id: 'c_gio_1930',
        name: 'SPINNING',
        category: 'cardio',
        instructor: 'Luca',
        room: 'Sala Spin Bike',
        duration: '45 min',
        notes: 'Sessione cardiovascolare di gruppo con monitoraggio frequenza cardiaca.',
        enrolledMemberIds: ['user_2'],
      },
      venerdi: {
        id: 'c_ven_1930',
        name: 'CIRCUIT TRAINING',
        category: 'tonificazione',
        targetAudience: 'allievi',
        instructor: 'Coach Alessio',
        room: 'Area Fitness',
        duration: '45 min',
        notes: 'Allenamento a stazioni per potenziamento muscolare e resistenza.',
        enrolledMemberIds: [],
      },
    },
  },

  // 10. 19:45 (Track 1)
  {
    rowId: 'row_19_45_1',
    time: '19:45',
    subSlotIndex: 1,
    days: {
      lunedi: {
        id: 'c_lun_1945_1',
        name: 'ZUMBA',
        category: 'cardio',
        instructor: 'Valentina',
        room: 'Sala Corsi 1',
        duration: '50 min',
        notes: 'Ritmi caraibici travolgenti per un allenamento aerobico divertente ed efficace.',
        enrolledMemberIds: ['user_4', 'user_2'],
      },
      martedi: {
        id: 'c_mar_1945_1',
        name: 'STEP & TONE',
        category: 'tonificazione',
        instructor: 'Federica',
        room: 'Sala Corsi 1',
        duration: '50 min',
        notes: 'Lavoro aerobico e modellamento su gradino step.',
        enrolledMemberIds: ['user_1'],
      },
      mercoledi: {
        id: 'c_mer_1945_1',
        name: 'ZUMBA',
        category: 'cardio',
        instructor: 'Valentina',
        room: 'Sala Corsi 1',
        duration: '50 min',
        notes: 'Festa fitness a ritmo di salsa, reggaeton e merengue.',
        enrolledMemberIds: ['user_4'],
      },
      giovedi: {
        id: 'c_gio_1945_1',
        name: 'SUPER JUMP',
        category: 'cardio',
        instructor: 'Sara',
        room: 'Sala Corsi 1',
        duration: '50 min',
        notes: 'Trampolino elastico dinamico per tonificazione gambe e core.',
        enrolledMemberIds: ['user_3', 'user_1'],
      },
    },
  },

  // 11. 19:45 (Track 2)
  {
    rowId: 'row_19_45_2',
    time: '19:45',
    subSlotIndex: 2,
    days: {
      lunedi: {
        id: 'c_lun_1945_2',
        name: 'FIT COMBAT',
        category: 'cardio',
        instructor: 'Fabio',
        room: 'Area Ring & Combat',
        duration: '50 min',
        notes: 'Tecniche di arti marziali e boxe al sacco a ritmo di musica ad alta energia.',
        enrolledMemberIds: ['user_1', 'user_3'],
      },
      martedi: {
        id: 'c_mar_1945_2',
        name: 'PANCA PILATES',
        category: 'posturale',
        instructor: 'Chiara',
        room: 'Area WellBackSystem',
        duration: '45 min',
        notes: 'Fusione tra i principi del metodo Pilates e l’assistenza della panca WBS.',
        enrolledMemberIds: ['user_2'],
      },
      mercoledi: {
        id: 'c_mer_1945_2',
        name: 'FIT COMBAT',
        category: 'cardio',
        instructor: 'Fabio',
        room: 'Area Ring & Combat',
        duration: '50 min',
        notes: 'Scarico adrenalina e potenziamento cardiovascolare.',
        enrolledMemberIds: ['user_3'],
      },
      giovedi: {
        id: 'c_gio_1945_2',
        name: 'PILATES',
        category: 'posturale',
        instructor: 'Chiara',
        room: 'Sala Olistica',
        duration: '50 min',
        notes: 'Controllo respiratorio, stabilità pelvica e flessibilità generale.',
        enrolledMemberIds: ['user_4', 'user_2'],
      },
    },
  },
];

export interface GymInfoSettings {
  appName: string;
  appSubtitle: string;
  posterTitle: string;
  season: string;
  gymName: string;
  logoAcronym: string;
  logoSubtitle: string;
  phone: string;
  address: string;
  website: string;
  roomHoursTitle: string;
  roomHoursText: string;
  note1: string;
  note2: string;
  appIconUrl?: string;
  appIconType?: string;
  appIconBg?: string;
}

export const DEFAULT_GYM_INFO: GymInfoSettings = {
  appName: 'FitSquad',
  appSubtitle: 'Palestra',
  posterTitle: 'ORARIO CORSI PALESTRA',
  season: '2023/24',
  gymName: 'Centro Sportivo HOF S.S.D. A R.L.',
  logoAcronym: 'HOF',
  logoSubtitle: 'HOUSE OF FITNESS',
  phone: '0422 885466',
  address: 'Via Carrer, 7 - Nervesa della Battaglia (TV)',
  website: 'www.centrosportivohof.it',
  roomHoursTitle: 'Orari di attività in sala',
  roomHoursText: 'Consulta gli orari aggiornati sul nostro sito web o sulla nostra scheda Google',
  note1: '*Attività funzionale in sala (30 minuti) senza prenotazione aperta a tutti gli iscritti.',
  note2: 'Gli orari potrebbero subire variazioni.',
};

export const GYM_INFO = DEFAULT_GYM_INFO;
