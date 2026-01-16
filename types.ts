
export enum SubjectType {
  NORMAL = 'Normal',
  ORGANIZATIONAL = 'Organizational',
  EXTENSION = 'Extension',
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
  CANCELED = 'Canceled', 
  SUBSTITUTED = 'Substituted', 
}

export enum TaskType {
  HOMEWORK = 'Lição de Casa',
  EXAM = 'Prova',
  READING = 'Leitura',
  PROJECT = 'Trabalho',
}

export enum TaskStatus {
  PENDING = 'Pendente',
  COMPLETED = 'Concluído',
  LATE = 'Atrasado',
}

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

export interface ClassLog {
  id: string;
  date: string; 
  slotId: string; 
  originalSubjectId: string;
  actualSubjectId: string; 
  status: ClassStatus;
}

export interface DayValidation {
  date: string; 
  isValidated: boolean; 
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

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  value?: number;
  type: TaskType;
  status: TaskStatus;
  members?: string; 
}

export type GradeCalcMethod = 'running' | 'absolute';
export type GradingSystem = 'average' | 'sum' | 'manual';

export interface SystemSettings {
  totalSchoolDays: number; 
  darkMode: boolean;
  notificationsEnabled: boolean;
  passingGrade: number; 
  gradeCalcMethod: GradeCalcMethod;
  gradingSystem: GradingSystem;
  currentYear: number;
}

export interface AppState {
  subjects: Subject[];
  schedule: ScheduleSlot[];
  logs: ClassLog[];
  validations: DayValidation[];
  assessments: Assessment[];
  tasks: Task[];
  settings: SystemSettings;
}

export interface AppContextType extends AppState {
  currentUser: string;
  addSubject: (s: Subject) => void;
  updateSubject: (s: Subject) => void;
  removeSubject: (id: string) => void;
  updateSchedule: (slots: ScheduleSlot[]) => void;
  validateDay: (date: string) => void;
  logClass: (log: ClassLog) => void;
  addAssessment: (a: Assessment) => void;
  removeAssessment: (id: string) => void;
  addTask: (t: Task) => void;
  updateTask: (t: Task) => void;
  deleteTask: (id: string) => void;
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
