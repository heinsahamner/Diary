
import React, { useState, useMemo } from 'react';
import { useStore } from '../services/store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, isToday, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClassStatus, TaskStatus, ScheduleSlot } from '../types';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Circle, CheckCircle, XCircle, Slash, Calendar as CalendarIcon, ArrowRight, CheckSquare } from 'lucide-react';

export const CalendarView: React.FC = () => {
    const { validations, logs, tasks, subjects, schedule, specialDays } = useStore();
    const navigate = useNavigate();
    
    const [displayDate, setDisplayDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const start = startOfMonth(displayDate);
    const end = endOfMonth(displayDate);
    const days = eachDayOfInterval({ start, end });

    const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
    
    const dailyLogs = useMemo(() => {
        return logs.filter(l => l.date === selectedDateKey);
    }, [logs, selectedDateKey]);

    const dailyTasks = useMemo(() => {
        return tasks.filter(t => isSameDay(new Date(t.dueDate), selectedDate));
    }, [tasks, selectedDate]);

    const validation = validations.find(v => v.date === selectedDateKey);
    const isDayValidated = !!validation;

    const agendaSlots = useMemo(() => {
        if (!isDayValidated) return [];
        
        if (validation?.archivedSchedule) {
            return validation.archivedSchedule;
        }

        const specialDay = specialDays.find(sd => sd.date === selectedDateKey);
        if (specialDay) return specialDay.customSlots;

        const dow = selectedDate.getDay();
        return schedule.filter(s => s.dayOfWeek === dow).sort((a,b) => a.startTime.localeCompare(b.startTime));
    }, [isDayValidated, validation, selectedDateKey, specialDays, selectedDate, schedule]);


    const monthStats = useMemo(() => {
        const monthLogs = logs.filter(l => l.date.startsWith(format(displayDate, 'yyyy-MM')));
        const validLogs = monthLogs.filter(l => l.status !== ClassStatus.CANCELED);
        const presentLogs = validLogs.filter(l => l.status === ClassStatus.PRESENT || l.status === ClassStatus.SUBSTITUTED).length;
        const attRate = validLogs.length > 0 ? Math.round((presentLogs / validLogs.length) * 100) : 100;

        const monthTasks = tasks.filter(t => isSameMonth(new Date(t.dueDate), displayDate));
        const pendingTasks = monthTasks.filter(t => t.status !== TaskStatus.COMPLETED).length;

        return { attRate, pendingTasks };
    }, [logs, tasks, displayDate]);


    const getDayStatus = (date: Date) => {
        const key = format(date, 'yyyy-MM-dd');
        const isValid = validations.some(v => v.date === key);
        const dayLogs = logs.filter(l => l.date === key);
        
        if (!isValid) return 'none';
        const hasAbsence = dayLogs.some(l => l.status === ClassStatus.ABSENT);
        return hasAbsence ? 'absent' : 'present';
    };

    const hasTask = (date: Date) => {
        return tasks.some(t => isSameDay(new Date(t.dueDate), date) && t.status !== TaskStatus.COMPLETED);
    };

    return (
        <div className="pb-20 h-full flex flex-col md:flex-row gap-6">
            
            <div className="flex-1 space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Presença Mensal</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{monthStats.attRate}%</p>
                        </div>
                        <div className={`p-2 rounded-lg ${monthStats.attRate >= 75 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {monthStats.attRate >= 75 ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
                         <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Tarefas Pendentes</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{monthStats.pendingTasks}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                            <CheckSquare size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-8">
                        <button 
                            onClick={() => setDisplayDate(subMonths(displayDate, 1))}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h2 className="text-xl font-bold capitalize text-gray-800 dark:text-white">
                            {format(displayDate, 'MMMM yyyy', {locale: ptBR})}
                        </h2>
                        <button 
                            onClick={() => setDisplayDate(addMonths(displayDate, 1))}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-4">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                            <div key={d} className="text-center text-xs font-bold text-gray-400 dark:text-gray-500">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {days.map(day => {
                            const status = getDayStatus(day);
                            const hasDot = hasTask(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameMonth(day, displayDate);
                            const isTodayDate = isToday(day);

                            return (
                                <button 
                                    key={day.toString()} 
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-200
                                        ${!isCurrentMonth ? 'opacity-30' : ''}
                                        ${isSelected 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 scale-105 z-10' 
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-600'}
                                        ${isTodayDate && !isSelected ? 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-gray-900' : ''}
                                    `}
                                >
                                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>{format(day, 'd')}</span>
                                    
                                    <div className="flex gap-1 mt-1">
                                        {status !== 'none' && (
                                            <div className={`w-1.5 h-1.5 rounded-full ${status === 'absent' ? (isSelected ? 'bg-red-300' : 'bg-red-500') : (isSelected ? 'bg-green-300' : 'bg-green-500')}`} />
                                        )}
                                        {hasDot && (
                                            <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-purple-300' : 'bg-purple-500'}`} />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="w-full md:w-80 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 h-fit">
                <div className="mb-6">
                    <h3 className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Agenda do Dia</h3>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">{format(selectedDate, "EEEE, d 'de' MMM", {locale: ptBR})}</h2>
                </div>

                <div className="space-y-6 relative">
                     <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />

                     <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-gray-50 dark:border-gray-900 ${isDayValidated ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500'}`}>
                            <CalendarIcon size={16} />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-gray-700 dark:text-gray-200 mt-2">
                                {isDayValidated ? 'Dia Letivo Iniciado' : 'Dia não iniciado'}
                            </p>
                        </div>
                     </div>

                     {agendaSlots.length > 0 ? (
                         agendaSlots.map(slot => {
                             const log = dailyLogs.find(l => l.slotId === slot.id);
                             
                             const status = log?.status || ClassStatus.PRESENT; 
                             const currentSubId = log?.actualSubjectId || slot.subjectId;
                             const sub = subjects.find(s => s.id === currentSubId);

                             let icon = <CheckCircle size={14} />;
                             let colorClass = 'bg-green-500';
                             
                             if(status === ClassStatus.ABSENT) { icon = <XCircle size={14} />; colorClass = 'bg-red-500'; }
                             else if(status === ClassStatus.CANCELED) { icon = <Slash size={14} />; colorClass = 'bg-gray-400'; }
                             else if(!isDayValidated) { icon = <Circle size={14} />; colorClass = 'bg-gray-300 dark:bg-gray-600'; }

                             return (
                                 <div key={slot.id} className="flex items-center gap-4 group">
                                     <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-gray-50 dark:border-gray-900 text-white ${colorClass}`}>
                                         {icon}
                                     </div>
                                     <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex-1">
                                         <p className="font-bold text-sm text-gray-800 dark:text-white">{sub?.name}</p>
                                         <div className="flex justify-between items-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                {isDayValidated ? (status === ClassStatus.PRESENT ? 'Presente' : status) : slot.startTime}
                                            </p>
                                            {!isDayValidated && <span className="text-[10px] text-gray-400 italic">Planejado</span>}
                                         </div>
                                     </div>
                                 </div>
                             )
                         })
                     ) : (
                         isDayValidated && <p className="text-xs text-gray-400 ml-14">Sem registros de aula.</p>
                     )}

                     {dailyTasks.length > 0 && (
                         <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                             <p className="text-xs font-bold text-gray-400 mb-3 ml-1">ENTREGAS</p>
                             {dailyTasks.map(t => (
                                 <div key={t.id} className="flex items-center gap-2 mb-2 ml-1">
                                     <div className={`w-2 h-2 rounded-full ${t.status === TaskStatus.COMPLETED ? 'bg-green-400' : 'bg-purple-500'}`} />
                                     <span className={`text-sm ${t.status === TaskStatus.COMPLETED ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>{t.title}</span>
                                 </div>
                             ))}
                         </div>
                     )}
                </div>
                
                <button 
                    onClick={() => navigate(`/diary?date=${selectedDateKey}`)}
                    className="w-full mt-8 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-bold py-3 rounded-xl border border-indigo-100 dark:border-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                    <span>Abrir no Diário</span>
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};