import { SubjectType } from './types';

export const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const TRIMESTERS = [1, 2, 3];

export const MOCK_SUBJECTS = [
  { id: '1', name: 'Matemática', color: '#6366f1', totalClasses: 200, type: SubjectType.NORMAL, teacher: 'Prof. Silva' },
  { id: '2', name: 'História', color: '#f59e0b', totalClasses: 80, type: SubjectType.NORMAL, teacher: 'Prof. Santos' },
  { id: '3', name: 'Física', color: '#10b981', totalClasses: 120, type: SubjectType.NORMAL, teacher: 'Dra. Oliveira' },
  { id: '4', name: 'Intervalo', color: '#94a3b8', totalClasses: 0, type: SubjectType.ORGANIZATIONAL },
  { id: '5', name: 'Português', color: '#ec4899', totalClasses: 160, type: SubjectType.NORMAL, teacher: 'Prof. Souza' },
];

export const DEFAULT_SCHEDULE_SLOTS = [
  { id: 's1', dayOfWeek: 1, startTime: '07:00', endTime: '07:50', subjectId: '1' },
  { id: 's2', dayOfWeek: 1, startTime: '07:50', endTime: '08:40', subjectId: '2' },
  { id: 's3', dayOfWeek: 1, startTime: '08:40', endTime: '09:30', subjectId: '3' },
  { id: 's4', dayOfWeek: 1, startTime: '09:50', endTime: '10:40', subjectId: '4' },
  { id: 's5', dayOfWeek: 1, startTime: '10:40', endTime: '11:30', subjectId: '5' },
  
  { id: 's6', dayOfWeek: 2, startTime: '07:00', endTime: '07:50', subjectId: '5' },
  { id: 's7', dayOfWeek: 2, startTime: '07:50', endTime: '08:40', subjectId: '1' },
  { id: 's8', dayOfWeek: 3, startTime: '07:00', endTime: '08:40', subjectId: '3' }, 
];