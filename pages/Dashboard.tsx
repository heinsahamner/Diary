import React, { useMemo } from 'react';
import { useStore } from '../services/store';
import { format, isSameDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarCheck, AlertCircle, Clock } from 'lucide-react';
import { TaskStatus } from '../types';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { tasks, validations, schedule, subjects } = useStore();
  const today = new Date();
  
  const formattedDate = format(today, "EEEE, d 'de' MMMM", { locale: ptBR });
  const dateKey = format(today, 'yyyy-MM-dd');

  const isDayValidated = validations.some(v => v.date === dateKey);

  const urgentTasks = useMemo(() => {
    return tasks.filter(t => {
        if (t.status === TaskStatus.COMPLETED) return false;
        const due = new Date(t.dueDate);
        return isSameDay(due, today) || isSameDay(due, addDays(today, 1));
    });
  }, [tasks, today]);

  const nextClass = useMemo(() => {
     const dayIndex = today.getDay();
     const todaysSlots = schedule.filter(s => s.dayOfWeek === dayIndex).sort((a,b) => a.startTime.localeCompare(b.startTime));
     
     const nowTime = format(today, 'HH:mm');
     const upcoming = todaysSlots.find(s => s.endTime > nowTime);

     if (!upcoming) return null;
     
     const subject = subjects.find(s => s.id === upcoming.subjectId);
     return { slot: upcoming, subject };
  }, [schedule, subjects, today]);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">Olá, Estudante</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">{formattedDate}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Widget de Status */}
        <div className={`p-5 rounded-2xl border ${isDayValidated ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium opacity-80 mb-1 text-gray-600 dark:text-gray-300">Status do Dia</p>
              <h3 className={`text-lg font-bold ${isDayValidated ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'}`}>
                {isDayValidated ? 'Validado' : 'Ação Pendente'}
              </h3>
            </div>
            <div className={`p-2 rounded-full ${isDayValidated ? 'bg-green-200 dark:bg-green-900/50 text-green-700 dark:text-green-400' : 'bg-orange-200 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400'}`}>
              <CalendarCheck size={20} />
            </div>
          </div>
          {!isDayValidated && (
             <Link to="/diary" className="mt-4 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline block">
               Ir para o Diário &rarr;
             </Link>
          )}
        </div>

        {/* Widget de Próxima aula */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Próxima Aula</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {nextClass ? nextClass.subject?.name : 'Sem aulas agora'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{nextClass ? nextClass.slot.startTime : '--:--'}</p>
            </div>
            <div className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
              <Clock size={20} />
            </div>
          </div>
        </div>

         {/* Prévia das Tarefas */}
         <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Para Entregar</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {urgentTasks.length} Urgentes
              </h3>
            </div>
            <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
              <AlertCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de tarefas urgentes */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Tarefas Urgentes</h2>
        {urgentTasks.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-400">Nenhuma tarefa urgente. Relaxe! 🌴</p>
          </div>
        ) : (
          <div className="space-y-3">
             {urgentTasks.map(task => {
               const sub = subjects.find(s => s.id === task.subjectId);
               return (
                 <div key={task.id} className="flex items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold mr-4 shrink-0"
                         style={{ backgroundColor: sub?.color || '#ccc' }}>
                        {sub?.name.substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-white">{task.title}</h4>
                      <p className="text-xs text-red-500 dark:text-red-400 font-medium">Entrega: {format(new Date(task.dueDate), "d 'de' MMM", { locale: ptBR })}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                      {task.type}
                    </span>
                 </div>
               )
             })}
          </div>
        )}
      </section>
    </div>
  );
};