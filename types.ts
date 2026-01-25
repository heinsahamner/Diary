
export enum SubjectType {
  NORMAL = 'Normal', // Counts grade and absence
  ORGANIZATIONAL = 'Organizational', // Visual only (Lunch, Break)
  EXTENSION = 'Extension', // Counts presence, no global average
}

export enum SubjectCategory {
  EXACT_SCIENCES = 'Ciências Exatas & Natureza',
  HUMAN_SCIENCES = 'Ciências Humanas',
  LANGUAGES = 'Linguagens',
  ARTS = 'Artes',
  SPORTS = 'Esportes',
  OTHER = 'Outros'
}

export enum ClassStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  CANCELED = 'Canceled', // Does not count towards total
  SUBSTITUTED = 'Substituted', // Logic handled by swap
}

export enum TaskType {
  HOMEWORK = 'Lição de Casa',
  EXAM = 'Prova',
  READING = 'Leitura',
  PROJECT = 'Trabalho',
}

export enum TaskStatus {
  PENDING = 'Pendente',
  IN_PROGRESS = 'Em Andamento',
  COMPLETED = 'Concluído',
  LATE = 'Atrasado',
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Subject {
  id: string;
  name: string;
  color: string;
  teacher?: string;
  totalClasses: number;
  type: SubjectType;
  category?: SubjectCategory;
  gradingMethod?: GradingSystem;
}

export interface ScheduleSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectId: string;
}

export interface SpecialDay {
    id: string;
    date: string;
    description: string;
    customSlots: ScheduleSlot[];
}

export interface ClassLog {
  id: string;
  date: string;
  slotId: string;
  originalSubjectId: string;
  actualSubjectId: string;
  status: ClassStatus;
  note?: string;
}

export interface DayValidation {
  date: string;
  isValidated: boolean;
  isLocked?: boolean;
  archivedSchedule?: ScheduleSlot[];
}

export interface Assessment {
  id: string;
  subjectId: string;
  trimester: 1 | 2 | 3;
  name: string;
  value: number;
  weight: number;
  date: string;
  isExtra?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  value?: number;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  members?: string;
  description?: string;
  subtasks?: Subtask[];
  timeSpent?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  lastModified: string;
  isPinned: boolean;
}

export type GradeCalcMethod = 'running' | 'absolute';
export type GradingSystem = 'average' | 'sum' | 'manual';

export interface SystemSettings {
  totalSchoolDays: number;
  darkMode: boolean;
  compactMode: boolean;
  notificationsEnabled: boolean;
  passingGrade: number;
  gradeCalcMethod: GradeCalcMethod;
  gradingSystem: GradingSystem;
  currentYear: number;
  lastModified?: string;
}

export interface AppState {
  subjects: Subject[];
  schedule: ScheduleSlot[];
  specialDays: SpecialDay[];
  logs: ClassLog[];
  validations: DayValidation[];
  assessments: Assessment[];
  tasks: Task[];
  notes: Note[];
  settings: SystemSettings;
}

export interface AppContextType extends AppState {
  currentUser: string;
  addSubject: (s: Subject) => void;
  updateSubject: (s: Subject) => void;
  removeSubject: (id: string) => void;
  updateSchedule: (slots: ScheduleSlot[]) => void;
  addSpecialDay: (d: SpecialDay) => void;
  removeSpecialDay: (date: string) => void;
  validateDay: (date: string) => void;
  lockDay: (date: string) => void;
  invalidateDay: (date: string) => void; 
  logClass: (log: ClassLog) => void;
  addAssessment: (a: Assessment) => void;
  removeAssessment: (id: string) => void;
  updateAssessment: (a: Assessment) => void;
  addTask: (t: Task) => void;
  updateTask: (t: Task) => void;
  deleteTask: (id: string) => void;
  addNote: (n: Note) => void;
  updateNote: (n: Note) => void;
  deleteNote: (id: string) => void;
  updateSettings: (s: SystemSettings) => void;
  importData: (data: AppState) => void;
  resetData: () => void;
  logout: () => void;
}

export interface UserCredentials {
  username: string;
  passwordHash: string;
  salt: string;
}
