
import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { DeepLinkService } from '../services/deepLink';
import { format, isSameDay, addDays, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
    CalendarCheck, AlertCircle, Clock, CheckCircle, XCircle, 
    ArrowRight, TrendingUp, BookOpen, MoreHorizontal, MapPin, 
    Sun, Moon, Sunrise, HelpCircle
} from 'lucide-react';
import { TaskStatus, ClassStatus, SubjectType } from '../types';
// @ts-ignore
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Tutorial } from '../components/Tutorial';

export const Dashboard: React.FC = () => {
  const { tasks, validations, schedule, subjects, logs, logClass, assessments, settings, currentUser } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 60000);
      return () => clearInterval(timer);
  }, []);

  const dateKey = format(currentTime, 'yyyy-MM-dd');
  const dayOfWeek = getDay(currentTime);

  const greeting = useMemo(() => {
      const hour = currentTime.getHours();
      if (hour < 5) return { text: 'Boa madrugada', icon: <Moon size={28} /> };
      if (hour < 12) return { text: 'Bom dia', icon: <Sunrise size={28} /> };
      if (hour < 18) return { text: 'Boa tarde', icon: <Sun size={28} /> };
      return { text: 'Boa noite', icon: <Moon size={28} /> };
  }, [currentTime]);

  const dailyProgress = useMemo(() => {
      const todaysClasses = schedule.filter(s => s.dayOfWeek === dayOfWeek);
      const todaysTasks = tasks.filter(t => isSameDay(new Date(t.dueDate), currentTime));
      
      const totalItems = todaysClasses.length + todaysTasks.length;
      if (totalItems === 0) return 100;

      let completed = 0;
      
      todaysClasses.forEach(slot => {
          const log = logs.find(l => l.date === dateKey && l.slotId === slot.id);
          if (log) completed++;
      });

      todaysTasks.forEach(t => {
          if (t.status === TaskStatus.COMPLETED) completed++;
      });

      return Math.round((completed / totalItems) * 100);
  }, [schedule, tasks, logs, dateKey, dayOfWeek]);

  const timelineData = useMemo(() => {
      const nowStr = format(currentTime, 'HH:mm');
      
      return schedule
        .filter(s => s.dayOfWeek === dayOfWeek)
        .sort((a,b) => a.startTime.localeCompare(b.startTime))
        .map(slot => {
            const sub = subjects.find(s => s.id === slot.subjectId);
            const log = logs.find(l => l.date === dateKey && l.slotId === slot.id);
            
            let state: 'past' | 'current' | 'future' = 'future';
            if (nowStr >= slot.endTime) state = 'past';
            else if (nowStr >= slot.startTime && nowStr < slot.endTime) state = 'current';

            return { slot, sub, log, state };
        });
  }, [schedule, subjects, logs, currentTime, dayOfWeek, dateKey]);

  const globalStats = useMemo(() => {
      const normalSubs = subjects.filter(s => s.type === SubjectType.NORMAL);
      let sumGrades = 0;
      let countGrades = 0;
      normalSubs.forEach(sub => {
           const subAssessments = assessments.filter(a => a.subjectId === sub.id);
           if (subAssessments.length > 0) {
               const val = subAssessments.reduce((acc, curr) => acc + curr.value, 0);
               sumGrades += (val / Math.max(1, subAssessments.length)); 
               countGrades++;
           }
      });
      const avg = countGrades > 0 ? (sumGrades / countGrades) : 0;

      const totalLogs = logs.filter(l => {
         const s = subjects.find(sb => sb.id === l.originalSubjectId);
         return s?.type === SubjectType.NORMAL && l.status !== ClassStatus.CANCELED;
      });
      const presentLogs = totalLogs.filter(l => l.status === ClassStatus.PRESENT || l.status === ClassStatus.SUBSTITUTED).length;
      const att = totalLogs.length > 0 ? (presentLogs / totalLogs.length) * 100 : 100;

      return { avg: avg.toFixed(1), att: att.toFixed(0) };
  }, [subjects, assessments, logs]);

  const urgentTasks = useMemo(() => {
    return tasks
        .filter(t => t.status !== TaskStatus.COMPLETED)
        .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3);
  }, [tasks]);

  const handleQuickCheckIn = (slotId: string, subjectId: string) => {
      logClass({
          id: `${dateKey}-${slotId}`,
          date: dateKey,
          slotId: slotId,
          originalSubjectId: subjectId,
          actualSubjectId: subjectId,
          status: ClassStatus.PRESENT
      });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <Tutorial isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                  <div>
                      <div className="flex items-center gap-2 mb-1 text-indigo-200 dark:text-gray-400 font-medium">
                          {greeting.icon}
                          <span className="capitalize">{format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-4">{greeting.text}, {currentUser}</h1>
                      
                      <div className="flex items-center gap-4">
                          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                              <p className="text-xs text-indigo-200 dark:text-gray-400">Progresso do Dia</p>
                              <p className="text-2xl font-bold">{dailyProgress}%</p>
                          </div>
                          {dailyProgress === 100 && (
                              <div className="bg-green-500/20 backdrop-blur-md rounded-xl p-3 border border-green-500/30 text-green-300">
                                  <p className="text-xs font-bold">Tudo Pronto!</p>
                                  <CheckCircle size={24} />
                              </div>
                          )}
                      </div>
                  </div>
                  
                  <div className="w-24 h-24 hidden sm:block">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={[{ value: dailyProgress }, { value: 100 - dailyProgress }]}
                                  innerRadius={30}
                                  outerRadius={40}
                                  startAngle={90}
                                  endAngle={-270}
                                  dataKey="value"
                                  stroke="none"
                                  paddingAngle={5}
                              >
                                  <Cell fill="#ffffff" />
                                  <Cell fill="#ffffff" fillOpacity={0.2} />
                              </Pie>
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center gap-6">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                          <TrendingUp size={24} />
                      </div>
                      <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Média Geral</p>
                          <p className="text-2xl font-bold text-gray-800 dark:text-white">{globalStats.avg}</p>
                      </div>
                  </div>
                  {Number(globalStats.avg) >= settings.passingGrade ? (
                      <CheckCircle className="text-green-500" size={20} />
                  ) : (
                      <AlertCircle className="text-red-500" size={20} />
                  )}
              </div>
              <div className="w-full h-px bg-gray-100 dark:bg-gray-700"></div>
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl">
                          <MapPin size={24} />
                      </div>
                      <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Presença</p>
                          <p className="text-2xl font-bold text-gray-800 dark:text-white">{globalStats.att}%</p>
                      </div>
                  </div>
                   {Number(globalStats.att) >= 75 ? (
                      <CheckCircle className="text-green-500" size={20} />
                  ) : (
                      <AlertCircle className="text-red-500" size={20} />
                  )}
              </div>
          </div>
      </div>

      <div>
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Clock size={20} className="text-indigo-600 dark:text-purple-400" />
                  Próximas Aulas
              </h2>
              <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                  {format(currentTime, 'HH:mm')}
              </span>
          </div>

          <div className="relative">
              <div className="flex overflow-x-auto pb-6 gap-4 no-scrollbar snap-x">
                  {timelineData.length === 0 ? (
                      <div className="w-full py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                          <p className="text-gray-400">Você está livre! Sem aulas programadas.</p>
                      </div>
                  ) : (
                      timelineData.map((item, index) => (
                          <div 
                            key={item.slot.id}
                            className={`
                                flex-shrink-0 w-64 p-5 rounded-2xl border transition-all snap-center relative overflow-hidden group
                                ${item.state === 'current' 
                                    ? 'bg-white dark:bg-gray-800 border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900 shadow-lg scale-105 z-10' 
                                    : item.state === 'past'
                                        ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-70 grayscale'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                }
                            `}
                          >
                                {item.state === 'current' && (
                                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                        AGORA
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-xs font-mono font-bold ${item.state === 'current' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
                                        {item.slot.startTime}
                                    </span>
                                    {item.log ? (
                                        item.log.status === ClassStatus.PRESENT ? <CheckCircle size={16} className="text-green-500" /> :
                                        item.log.status === ClassStatus.ABSENT ? <XCircle size={16} className="text-red-500" /> :
                                        <div className="w-4 h-4 rounded-full bg-gray-300" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                                    )}
                                </div>

                                <h3 className="font-bold text-gray-800 dark:text-white truncate mb-1" title={item.sub?.name}>
                                    {item.sub?.name}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 truncate">{item.sub?.teacher || 'Prof. não informado'}</p>

                                {item.state === 'current' && !item.log && (
                                    <button 
                                        onClick={() => handleQuickCheckIn(item.slot.id, item.sub?.id || '')}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition-colors animate-pulse"
                                    >
                                        Marcar Presença
                                    </button>
                                )}
                                {item.log && (
                                    <div className="text-xs text-center font-medium text-gray-400 bg-gray-100 dark:bg-gray-700 py-1 rounded-lg">
                                        Registrado: {item.log.status === 'Present' ? 'Presente' : 'Faltou'}
                                    </div>
                                )}
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      <AlertCircle className="text-orange-500" size={20} />
                      Para Entregar
                  </h3>
                  <Link to="/tasks" className="text-xs font-bold text-indigo-600 dark:text-purple-400 hover:underline">
                      Ver tudo
                  </Link>
              </div>

              <div className="space-y-3">
                  {urgentTasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                          Tudo em dia! Sem pendências urgentes.
                      </div>
                  ) : (
                      urgentTasks.map(task => {
                          const sub = subjects.find(s => s.id === task.subjectId);
                          const isLate = new Date(task.dueDate) < new Date() && !isSameDay(new Date(task.dueDate), new Date());
                          return (
                              <div key={task.id} className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                                  <div className={`w-1 h-8 rounded-full mr-3 ${isLate ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                                  <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-sm text-gray-800 dark:text-white truncate">{task.title}</h4>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                          {sub?.name} • {format(new Date(task.dueDate), "dd MMM", { locale: ptBR })}
                                      </p>
                                  </div>
                                  {task.priority === 'high' && (
                                      <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Alta</span>
                                  )}
                              </div>
                          );
                      })
                  )}
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
               <button 
                  onClick={() => setIsTutorialOpen(true)}
                  className="col-span-2 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/50 hover:shadow-md transition-all flex items-center justify-between group text-left"
               >
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                           <HelpCircle size={20} />
                       </div>
                       <div>
                           <span className="font-bold text-purple-800 dark:text-purple-300 text-sm block">Como usar o App</span>
                           <span className="text-xs text-purple-600 dark:text-purple-400 opacity-80">Aprenda a marcar faltas e mais</span>
                       </div>
                   </div>
                   <ArrowRight size={18} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
               </button>

               <Link to="/grades" className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 hover:shadow-md transition-all flex flex-col justify-center items-center text-center group">
                   <div className="w-10 h-10 bg-white dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                       <TrendingUp size={20} />
                   </div>
                   <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Lançar Nota</span>
               </Link>

               <Link 
                  to={DeepLinkService.generateLink('/tasks', 'create')}
                  className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/50 hover:shadow-md transition-all flex flex-col justify-center items-center text-center group"
               >
                   <div className="w-10 h-10 bg-white dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                       <BookOpen size={20} />
                   </div>
                   <span className="font-bold text-blue-800 dark:text-blue-300 text-sm">Nova Tarefa</span>
               </Link>

               <Link to="/diary" className="col-span-2 bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 hover:shadow-md transition-all flex items-center justify-between group">
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                           <CalendarCheck size={20} />
                       </div>
                       <div className="text-left">
                           <span className="font-bold text-indigo-800 dark:text-indigo-300 text-sm block">Diário de Classe</span>
                           <span className="text-xs text-indigo-600 dark:text-indigo-400">Ver horários e presenças</span>
                       </div>
                   </div>
                   <ArrowRight size={18} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
               </Link>
          </div>
      </div>
    </div>
  );
};