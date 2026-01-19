import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { AppState, AppContextType, Subject, ScheduleSlot, ClassLog, DayValidation, Assessment, Task, SystemSettings, SubjectType, SubjectCategory, SpecialDay } from '../types';
import { DBService } from './db';
import { Loader2 } from 'lucide-react';

const StoreContext = createContext<AppContextType | undefined>(undefined);

const cleanState: AppState = {
  subjects: [
    { 
        id: 'reposicao', 
        name: 'Reposição', 
        color: '#8b5cf6',
        totalClasses: 0, 
        type: SubjectType.ORGANIZATIONAL, 
        category: SubjectCategory.OTHER 
    },
    { 
        id: 'vago', 
        name: 'Horário Vago', 
        color: '#9ca3af',
        totalClasses: 0, 
        type: SubjectType.ORGANIZATIONAL, 
        category: SubjectCategory.OTHER 
    }
  ],
  schedule: [],
  specialDays: [],
  logs: [],
  validations: [],
  assessments: [],
  tasks: [],
  settings: {
    totalSchoolDays: 200,
    darkMode: false,
    compactMode: false,
    notificationsEnabled: true,
    passingGrade: 6.0,
    gradeCalcMethod: 'absolute',
    gradingSystem: 'average',
    currentYear: new Date().getFullYear()
  }
};

interface StoreProviderProps {
    children: ReactNode;
    user: string;
    onLogout: () => void;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children, user, onLogout }) => {
  const currentYear = new Date().getFullYear();
  const [activeYear, setActiveYear] = useState<number>(() => {
      const stored = localStorage.getItem(`diary_meta_year_${user}`);
      return stored ? parseInt(stored) : currentYear;
  });

  const [state, setState] = useState<AppState>(cleanState);
  const [loading, setLoading] = useState(true);
  const isLoaded = useRef(false);

  useEffect(() => {
    const load = async () => {
        setLoading(true);
        isLoaded.current = false;
        try {
            const data = await DBService.loadState(user, activeYear);
            if (data) {
                const mergedSubjects = [...data.subjects];
                
                if (!mergedSubjects.find(s => s.id === 'reposicao')) {
                    mergedSubjects.push(cleanState.subjects[0]);
                }
                if (!mergedSubjects.find(s => s.id === 'vago')) {
                    mergedSubjects.push(cleanState.subjects[1]);
                }

                setState({
                    ...cleanState,
                    ...data,
                    subjects: mergedSubjects,
                    specialDays: data.specialDays || [],
                    settings: { ...cleanState.settings, ...(data.settings || {}), currentYear: activeYear }
                });
            } else {
                setState({ ...cleanState, settings: { ...cleanState.settings, currentYear: activeYear } });
            }
        } catch (error) {
            console.error("Failed to load DB:", error);
            setState({ ...cleanState, settings: { ...cleanState.settings, currentYear: activeYear } });
        } finally {
            setLoading(false);
            isLoaded.current = true;
        }
    };
    load();
  }, [user, activeYear]);

  useEffect(() => {
    if (!isLoaded.current || loading) return;

    if (state.settings.currentYear === activeYear) {
        DBService.saveState(user, activeYear, state).catch(err => 
            console.error("Failed to auto-save to DB", err)
        );
    }
  }, [state, user, activeYear, loading]);

  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  const addSubject = (subject: Subject) => setState(prev => ({ ...prev, subjects: [...prev.subjects, subject] }));
  
  const updateSubject = (subject: Subject) => setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === subject.id ? subject : s)
  }));

  const removeSubject = (id: string) => setState(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      schedule: prev.schedule.filter(s => s.subjectId !== id)
  }));

  const updateSchedule = (slots: ScheduleSlot[]) => setState(prev => ({ ...prev, schedule: slots }));

  const addSpecialDay = (day: SpecialDay) => setState(prev => ({ ...prev, specialDays: [...prev.specialDays.filter(d => d.date !== day.date), day] }));
  const removeSpecialDay = (date: string) => setState(prev => ({ ...prev, specialDays: prev.specialDays.filter(d => d.date !== date) }));

  const validateDay = (date: string) => setState(prev => {
      const existing = prev.validations.find(v => v.date === date);
      if (existing) {
          return {
              ...prev,
              validations: prev.validations.map(v => v.date === date ? { ...v, isLocked: false } : v)
          };
      }
      return { ...prev, validations: [...prev.validations, { date, isValidated: true, isLocked: false }] };
  });

  const lockDay = (date: string) => setState(prev => ({
      ...prev,
      validations: prev.validations.map(v => v.date === date ? { ...v, isLocked: true } : v)
  }));

  const invalidateDay = (date: string) => setState(prev => ({
      ...prev,
      validations: prev.validations.filter(v => v.date !== date)
  }));

  const logClass = (log: ClassLog) => setState(prev => {
      const existingIndex = prev.logs.findIndex(l => l.date === log.date && l.slotId === log.slotId);
      let newLogs = [...prev.logs];
      if (existingIndex >= 0) newLogs[existingIndex] = log;
      else newLogs.push(log);
      return { ...prev, logs: newLogs };
  });

  const addAssessment = (assessment: Assessment) => setState(prev => ({ ...prev, assessments: [...prev.assessments, assessment] }));

  const removeAssessment = (id: string) => setState(prev => ({ ...prev, assessments: prev.assessments.filter(a => a.id !== id) }));

  const updateAssessment = (assessment: Assessment) => setState(prev => ({
      ...prev,
      assessments: prev.assessments.map(a => a.id === assessment.id ? assessment : a)
  }));

  const addTask = (task: Task) => setState(prev => ({ ...prev, tasks: [...prev.tasks, task] }));

  const updateTask = (task: Task) => setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === task.id ? task : t)
  }));

  const deleteTask = (id: string) => setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));

  const updateSettings = (settings: SystemSettings) => {
      if (settings.currentYear !== activeYear) {
          localStorage.setItem(`diary_meta_year_${user}`, settings.currentYear.toString());
          setActiveYear(settings.currentYear);
      }
      setState(prev => ({ ...prev, settings }));
  };

  const importData = (data: AppState) => {
      setState(data);
      DBService.saveState(user, activeYear, data);
  };

  const resetData = () => setState({ ...cleanState, settings: { ...cleanState.settings, currentYear: activeYear } });

  if (loading) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <p className="text-gray-500 font-medium animate-pulse">Carregando Diário...</p>
          </div>
      )
  }

  return (
    <StoreContext.Provider value={{
      ...state,
      currentUser: user,
      addSubject,
      updateSubject,
      removeSubject,
      updateSchedule,
      addSpecialDay,
      removeSpecialDay,
      validateDay,
      lockDay,
      invalidateDay,
      logClass,
      addAssessment,
      removeAssessment,
      updateAssessment,
      addTask,
      updateTask,
      deleteTask,
      updateSettings,
      importData,
      resetData,
      logout: onLogout
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
