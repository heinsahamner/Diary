import React, { useState, useMemo } from 'react';
import { useStore } from '../services/store';
import { Task, TaskStatus, TaskType } from '../types';
import { Check, CheckCircle, Circle, Trash2, Calendar, Clock, AlertCircle, Users } from 'lucide-react';
import { format, isBefore, isSameDay, startOfToday, addDays, isWithinInterval, endOfWeek, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Tasks: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, subjects } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTaskType, setNewTaskType] = useState<TaskType>(TaskType.HOMEWORK);
  const [newTaskSubject, setNewTaskSubject] = useState(subjects[0]?.id || '');
  const [newTaskMembers, setNewTaskMembers] = useState('');

  const today = startOfToday();

  const categorizedTasks = useMemo(() => {
    const late: Task[] = [];
    const thisWeek: Task[] = [];
    const upcoming: Task[] = [];
    const completed: Task[] = [];

    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });

    tasks.forEach(t => {
        if (t.status === TaskStatus.COMPLETED) {
            completed.push(t);
            return;
        }

        const due = new Date(t.dueDate);
        
        if (isBefore(due, today)) {
            late.push({ ...t, status: TaskStatus.LATE });
        } 
        else if (isWithinInterval(due, { start: today, end: weekEnd })) {
            thisWeek.push(t);
        } 
        else {
            upcoming.push(t);
        }
    });

    return { late, thisWeek, upcoming, completed };
  }, [tasks, today]);

  const handleAddTask = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTaskTitle) return;
      
      const task: Task = {
          id: Date.now().toString(),
          title: newTaskTitle,
          subjectId: newTaskSubject || subjects[0]?.id,
          dueDate: newTaskDate,
          type: newTaskType,
          status: TaskStatus.PENDING,
          members: newTaskMembers
      };
      addTask(task);
      setNewTaskTitle('');
      setNewTaskMembers('');
  };

  const toggleTask = (task: Task) => {
      updateTask({
          ...task,
          status: task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED
      });
  };

  const TaskCard: React.FC<{ task: Task, isLate?: boolean }> = ({ task, isLate }) => {
      const sub = subjects.find(s => s.id === task.subjectId);
      const date = new Date(task.dueDate);

      return (
          <div className={`group flex items-start p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all ${task.status === TaskStatus.COMPLETED ? 'opacity-60 grayscale' : ''}`}
               style={{ borderLeftColor: sub?.color || '#ccc' }}>
              
              <button 
                onClick={() => toggleTask(task)}
                className={`mt-0.5 mr-3 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.status === TaskStatus.COMPLETED 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-purple-500'
                }`}
              >
                  {task.status === TaskStatus.COMPLETED && <Check size={14} strokeWidth={3} />}
              </button>

              <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                      <h4 className={`font-semibold text-gray-800 dark:text-white leading-tight ${task.status === TaskStatus.COMPLETED ? 'line-through' : ''}`}>
                          {task.title}
                      </h4>
                      <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={16} />
                      </button>
                  </div>
                  
                  {task.members && (
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <Users size={12} className="mr-1" />
                          <span>{task.members}</span>
                      </div>
                  )}
                  
                  <div className="flex flex-wrap items-center mt-2 gap-2 text-xs">
                      <span className="font-bold px-2 py-0.5 rounded text-white" style={{backgroundColor: sub?.color}}>{sub?.name}</span>
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">{task.type}</span>
                      <span className={`flex items-center gap-1 ${isLate ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                          <Calendar size={12} />
                          {format(date, "d 'de' MMM", {locale: ptBR})}
                      </span>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tarefas e Entregas</h1>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleAddTask} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <input 
                type="text" 
                placeholder="Nova tarefa..."
                className="flex-grow p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 outline-none transition-all dark:text-white"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
            />
            <select 
                className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm outline-none dark:text-white"
                value={newTaskSubject}
                onChange={e => setNewTaskSubject(e.target.value)}
            >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select 
                className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm outline-none dark:text-white"
                value={newTaskType}
                onChange={e => setNewTaskType(e.target.value as TaskType)}
            >
                <option value={TaskType.HOMEWORK}>Lição</option>
                <option value={TaskType.EXAM}>Prova</option>
                <option value={TaskType.PROJECT}>Trabalho</option>
            </select>
            <input 
                type="date"
                className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm outline-none dark:text-white"
                value={newTaskDate}
                onChange={e => setNewTaskDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
               <input 
                type="text" 
                placeholder="Integrantes (Opcional, separada por vírgula)"
                className="w-full md:flex-grow p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm border-transparent focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 outline-none dark:text-white"
                value={newTaskMembers}
                onChange={e => setNewTaskMembers(e.target.value)}
            />
            <button 
                type="submit"
                className="w-full md:w-auto bg-indigo-600 dark:bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-purple-700 transition-colors"
            >
                Adicionar
            </button>
          </div>
      </form>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Late Column */}
          <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold border-b border-red-100 dark:border-red-900/50 pb-2">
                  <AlertCircle size={20} />
                  <h2>Atrasado</h2>
                  <span className="ml-auto bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full text-xs">{categorizedTasks.late.length}</span>
              </div>
              <div className="space-y-3">
                  {categorizedTasks.late.map(t => <TaskCard key={t.id} task={t} isLate />)}
                  {categorizedTasks.late.length === 0 && <p className="text-sm text-gray-400 italic">Nada atrasado.</p>}
              </div>
          </div>

          {/* This Week Column */}
          <div className="space-y-4">
               <div className="flex items-center gap-2 text-indigo-600 dark:text-purple-400 font-bold border-b border-indigo-100 dark:border-purple-900/50 pb-2">
                  <Calendar size={20} />
                  <h2>Esta Semana</h2>
                  <span className="ml-auto bg-indigo-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full text-xs">{categorizedTasks.thisWeek.length}</span>
              </div>
              <div className="space-y-3">
                  {categorizedTasks.thisWeek.map(t => <TaskCard key={t.id} task={t} />)}
                  {categorizedTasks.thisWeek.length === 0 && <p className="text-sm text-gray-400 italic">Livre por enquanto.</p>}
              </div>
          </div>

           {/* Upcoming Column */}
           <div className="space-y-4">
               <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700 pb-2">
                  <Clock size={20} />
                  <h2>Próximas</h2>
                  <span className="ml-auto bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs">{categorizedTasks.upcoming.length}</span>
              </div>
              <div className="space-y-3">
                  {categorizedTasks.upcoming.map(t => <TaskCard key={t.id} task={t} />)}
                  {categorizedTasks.completed.length > 0 && (
                      <>
                        <div className="border-t border-gray-100 dark:border-gray-700 my-4"></div>
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Concluídas Recentemente</h3>
                        {categorizedTasks.completed.slice(0, 3).map(t => <TaskCard key={t.id} task={t} />)}
                      </>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};