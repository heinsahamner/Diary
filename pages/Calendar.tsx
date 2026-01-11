import React, { useState } from 'react';
import { useStore } from '../services/store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClassStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarView: React.FC = () => {
    const { validations, logs } = useStore();
    const navigate = useNavigate();
    const [displayDate, setDisplayDate] = useState(new Date());
    
    const start = startOfMonth(displayDate);
    const end = endOfMonth(displayDate);
    const days = eachDayOfInterval({ start, end });

    return (
        <div className="max-w-4xl mx-auto pb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Calendário</h1>
            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                
                <div className="flex items-center justify-between mb-6">
                    <button 
                        onClick={() => setDisplayDate(subMonths(displayDate, 1))}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-xl font-bold capitalize text-gray-800 dark:text-white">
                        {format(displayDate, 'MMMM yyyy', {locale: ptBR})}
                    </h2>
                    <button 
                        onClick={() => setDisplayDate(addMonths(displayDate, 1))}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                        <div key={d} className="text-center text-[10px] md:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {days.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const isValidated = validations.some(v => v.date === dateKey);
                        const dayLogs = logs.filter(l => l.date === dateKey);
                        const hasAbsence = dayLogs.some(l => l.status === ClassStatus.ABSENT);

                        return (
                            <button 
                                key={day.toString()} 
                                onClick={() => navigate(`/diary?date=${dateKey}`)}
                                className={`
                                    min-h-[60px] md:min-h-[80px] p-1 md:p-2 rounded-lg md:rounded-xl border flex flex-col justify-between transition-all hover:shadow-md text-left
                                    ${!isSameMonth(day, displayDate) ? 'opacity-30' : ''}
                                    ${isSameDay(day, new Date()) ? 'border-indigo-500 dark:border-purple-500 bg-indigo-50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-gray-700 dark:bg-gray-800/50'}
                                `}
                            >
                                <div className="flex justify-between items-start w-full">
                                    <span className="font-bold text-xs md:text-sm text-gray-700 dark:text-gray-300">{format(day, 'd')}</span>
                                    {isValidated && (
                                        <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${hasAbsence ? 'bg-red-500' : 'bg-green-500'}`} />
                                    )}
                                </div>
                                <div className="text-[9px] md:text-[10px] text-gray-400 mt-1 md:mt-2 truncate w-full">
                                    {isValidated ? (hasAbsence ? 'Falta' : 'Presente') : ''}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};