
import React, { useState, useEffect } from 'react';
import { useStore } from '../services/store';
import { useToast } from '../components/Toast';
import { format, addDays, subDays, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Slash, RefreshCw, Lock, Unlock, ArrowRightLeft, StickyNote, Save, Calendar as CalendarIcon, RotateCcw, Clock, AlertOctagon, ShieldCheck, Trash2 } from 'lucide-react';
import { ClassLog, ClassStatus, SubjectType, ScheduleSlot } from '../types';
import { useSearchParams } from 'react-router-dom';

export const Diary: React.FC = () => {
  const { schedule, subjects, logs, validations, validateDay, lockDay, invalidateDay, logClass, settings, specialDays } = useStore();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
        const [y, m, d] = dateParam.split('-').map(Number);
        if (y && m && d) {
             setCurrentDate(new Date(y, m - 1, d));
        }
    }
  }, [searchParams]);
  
  const [swappingSlotId, setSwappingSlotId] = useState<string | null>(null);
  
  const [editingNoteSlotId, setEditingNoteSlotId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const dateKey = format(currentDate, 'yyyy-MM-dd');
  const dayOfWeek = currentDate.getDay(); 
  
  const validation = validations.find(v => v.date === dateKey);
  const isActive = validation && !validation.isLocked;
  const isLocked = validation && validation.isLocked;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isNotStarted = !validation;

  let dailySlots: ScheduleSlot[] = [];

  if (validation?.archivedSchedule) {
      dailySlots = validation.archivedSchedule;
  } else {
      const specialDay = specialDays.find(sd => sd.date === dateKey);
      if (specialDay) {
          dailySlots = specialDay.customSlots;
      } else {
          dailySlots = schedule.filter(s => s.dayOfWeek === dayOfWeek);
      }
  }
  
  dailySlots = [...dailySlots].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const specialDay = specialDays.find(sd => sd.date === dateKey);

  const handleValidateDay = () => {
    validateDay(dateKey);
    addToast(isLocked ? 'Dia destrancado. Edições permitidas.' : 'Dia letivo iniciado!', 'success');
  };

  const handleLockDay = () => {
    if (window.confirm('🔒 Trancar este dia?\n\nA grade será "congelada" e as edições bloqueadas. O histórico será preservado.')) {
        lockDay(dateKey);
        addToast('Dia trancado e arquivado com sucesso.', 'info');
    }
  };

  const handleResetDay = () => {
    if (window.confirm('⚠️ Reiniciar este dia?\n\nIsso apagará o registro de "Dia Letivo" e as faltas/presenças deixarão de contar nas estatísticas até que você inicie o dia novamente.')) {
        invalidateDay(dateKey);
        addToast('Dia reiniciado para estado "Não Iniciado".', 'info');
    }
  };

  const getLogForSlot = (slotId: string): ClassLog | undefined => {
    return logs.find(l => l.date === dateKey && l.slotId === slotId);
  };

  const handleStatusToggle = (slot: ScheduleSlot) => {
    if (!isActive) return;

    const currentLog = getLogForSlot(slot.id);
    let nextStatus = ClassStatus.PRESENT;

    if (currentLog) {
      if (currentLog.status === ClassStatus.PRESENT) nextStatus = ClassStatus.ABSENT;
      else if (currentLog.status === ClassStatus.ABSENT) nextStatus = ClassStatus.CANCELED;
      else if (currentLog.status === ClassStatus.CANCELED) nextStatus = ClassStatus.PRESENT;
    }

    const newLog: ClassLog = {
      id: currentLog?.id || `${dateKey}-${slot.id}`,
      date: dateKey,
      slotId: slot.id,
      originalSubjectId: slot.subjectId,
      actualSubjectId: currentLog?.actualSubjectId || slot.subjectId, 
      status: nextStatus,
      note: currentLog?.note
    };
    logClass(newLog);
  };

  const handleSubstitute = (slot: ScheduleSlot, newSubjectId: string) => {
    const currentLog = getLogForSlot(slot.id);
    const newStatus = newSubjectId === 'vago' ? ClassStatus.CANCELED : ClassStatus.PRESENT;

    const newLog: ClassLog = {
        id: currentLog?.id || `${dateKey}-${slot.id}`,
        date: dateKey,
        slotId: slot.id,
        originalSubjectId: slot.subjectId,
        actualSubjectId: newSubjectId,
        status: newStatus,
        note: currentLog?.note
    };
    logClass(newLog);
    setSwappingSlotId(null);
    addToast('Grade horária atualizada.', 'info');
  }

  const handleEditNote = (slot: ScheduleSlot) => {
      const currentLog = getLogForSlot(slot.id);
      setNoteText(currentLog?.note || '');
      setEditingNoteSlotId(slot.id);
      setSwappingSlotId(null);
  };

  const handleSaveNote = (slot: ScheduleSlot) => {
    const currentLog = getLogForSlot(slot.id);
    const newLog: ClassLog = {
        id: currentLog?.id || `${dateKey}-${slot.id}`,
        date: dateKey,
        slotId: slot.id,
        originalSubjectId: slot.subjectId,
        actualSubjectId: currentLog?.actualSubjectId || slot.subjectId, 
        status: currentLog?.status || ClassStatus.PRESENT,
        note: noteText
    };
    logClass(newLog);
    setEditingNoteSlotId(null);
    addToast('Anotação salva.', 'success');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.value) {
          const [y, m, d] = e.target.value.split('-').map(Number);
          setCurrentDate(new Date(y, m - 1, d));
      }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 relative gap-4 md:gap-0 z-10">
        
        <div className="flex md:hidden items-center justify-between w-full relative z-20">
            <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors z-30">
              <ChevronLeft size={24} />
            </button>
            <div className="text-center relative group cursor-pointer z-10">
              <input 
                type="date" 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                value={format(currentDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
              />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize flex items-center justify-center gap-2 pointer-events-none">
                  {format(currentDate, 'EEEE', { locale: ptBR })}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs capitalize pointer-events-none">{format(currentDate, "d 'de' MMM", { locale: ptBR })}</p>
            </div>
            <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors z-30">
              <ChevronRight size={24} />
            </button>
        </div>

        <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors relative z-20">
          <ChevronLeft size={24} />
        </button>
        
        <div className="hidden md:block text-center relative group cursor-pointer flex-1 z-10">
          <input 
            type="date" 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            value={format(currentDate, 'yyyy-MM-dd')}
            onChange={handleDateChange}
          />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize flex items-center justify-center gap-2 group-hover:text-indigo-600 dark:group-hover:text-purple-400 transition-colors pointer-events-none">
              {format(currentDate, 'EEEE', { locale: ptBR })}
              <CalendarIcon size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm capitalize pointer-events-none">{format(currentDate, "d 'de' MMMM, yyyy", { locale: ptBR })}</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end border-t md:border-t-0 border-gray-100 dark:border-gray-700 pt-3 md:pt-0 relative z-50">
            {validation && (
                <button
                    onClick={handleResetDay}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 rounded-full transition-colors"
                    title="Reiniciar Dia (Apagar registros)"
                >
                    <RefreshCw size={18} />
                </button>
            )}
            
            {isActive && (
                <button
                    onClick={handleLockDay}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl font-bold text-xs hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                    title="Trancar Dia"
                >
                    <Lock size={16} />
                    <span>Trancar</span>
                </button>
            )}
            {!isToday(currentDate) && (
                <button 
                    onClick={() => setCurrentDate(new Date())}
                    className="p-2 hover:bg-indigo-50 dark:hover:bg-purple-900/30 rounded-full text-indigo-600 dark:text-purple-400 transition-colors"
                    title="Ir para Hoje"
                >
                    <RotateCcw size={20} />
                </button>
            )}
            <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors">
              <ChevronRight size={24} />
            </button>
        </div>
      </div>
      
      {specialDay && (
          <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-200 dark:border-orange-800 flex items-center gap-3 animate-fade-in">
              <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-full text-orange-600 dark:text-orange-300">
                  <AlertOctagon size={20} />
              </div>
              <div>
                  <p className="font-bold text-orange-800 dark:text-orange-200 text-sm">Horário Excepcional</p>
                  <p className="text-orange-600 dark:text-orange-300 text-xs">{specialDay.description}</p>
              </div>
          </div>
      )}
      
      {isActive ? (
        <div className={`space-y-${settings.compactMode ? '2' : '4'} animate-fade-in`}>
          {dailySlots.length === 0 && (
             <div className="text-center py-20 flex flex-col items-center justify-center">
                 <div className="w-16 h-16 bg-indigo-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                     <Clock size={32} className="text-indigo-300" />
                 </div>
                 <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhuma aula hoje. Aproveite!</p>
             </div>
          )}
          
          {dailySlots.map(slot => {
            const log = getLogForSlot(slot.id);
            const status = log?.status || ClassStatus.PRESENT; 
            
            const currentSubId = log?.actualSubjectId || slot.subjectId;
            const subject = subjects.find(s => s.id === currentSubId);
            const isOrganizational = subject?.type === SubjectType.ORGANIZATIONAL;
            const isSwapped = log?.actualSubjectId && log.actualSubjectId !== log.originalSubjectId;
            const isVago = currentSubId === 'vago';
            const isReposicao = currentSubId === 'reposicao';
            const hasNote = log?.note && log.note.trim().length > 0;

            let statusColor = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
            let statusIcon = <CheckCircle className="text-gray-300 dark:text-gray-600" />;
            
            if (!isOrganizational) {
                if (status === ClassStatus.PRESENT) {
                    statusColor = 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-800 ring-1 ring-green-100 dark:ring-green-900/50';
                    statusIcon = <CheckCircle className="text-green-500 dark:text-green-400 fill-green-50 dark:fill-green-900/30" size={settings.compactMode ? 24 : 28} />;
                } else if (status === ClassStatus.ABSENT) {
                    statusColor = 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50';
                    statusIcon = <XCircle className="text-red-500 dark:text-red-400 fill-red-100 dark:fill-red-900/30" size={settings.compactMode ? 24 : 28} />;
                } else if (status === ClassStatus.CANCELED) {
                    statusColor = 'bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-75';
                    statusIcon = <Slash className="text-gray-400" size={settings.compactMode ? 24 : 28} />;
                }
            } else if (isVago) {
                statusColor = 'bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700 border-dashed';
                statusIcon = <Slash className="text-gray-400" size={settings.compactMode ? 24 : 28} />;
            } else {
                statusColor = 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700';
                statusIcon = <div className="w-7 h-7" />;
            }

            return (
              <div 
                key={slot.id} 
                className={`relative ${settings.compactMode ? 'p-3' : 'p-4'} rounded-2xl border transition-all duration-200 ${statusColor}`}
              >
                <div className="flex items-center w-full">
                    <div className="w-16 flex flex-col justify-center mr-4 border-r border-gray-200 dark:border-gray-700 pr-4 self-stretch">
                        <span className={`font-bold text-gray-800 dark:text-white ${settings.compactMode ? 'text-sm' : ''}`}>{slot.startTime}</span>
                        <span className="text-xs text-gray-400">{slot.endTime}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: subject?.color }}></div>
                            <h3 className={`font-bold truncate ${settings.compactMode ? 'text-base' : 'text-lg'} ${status === ClassStatus.CANCELED ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {subject?.name}
                            </h3>
                            {isSwapped && <RefreshCw size={14} className="text-blue-500 flex-shrink-0" />}
                        </div>
                        {subject?.teacher && <p className="text-xs text-gray-500 mt-1 ml-5 truncate">{subject.teacher}</p>}
                        
                        {hasNote && editingNoteSlotId !== slot.id && (
                             <div className={`mt-2 ml-5 p-2 bg-gray-50 dark:bg-black/20 rounded-lg text-xs text-gray-600 dark:text-gray-300 border-l-2 border-indigo-400 ${settings.compactMode ? 'py-1' : 'py-2'}`}>
                                 {log.note}
                             </div>
                        )}
                    </div>

                    {(!isOrganizational || isVago || isReposicao) ? (
                        <div className="flex items-center space-x-2 ml-auto pl-2">
                             <button
                                onClick={() => handleEditNote(slot)}
                                className={`p-2 rounded-full transition-colors ${hasNote ? 'text-indigo-600 dark:text-purple-400 bg-indigo-50 dark:bg-purple-900/20' : 'text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                title="Anotações"
                             >
                                 <StickyNote size={settings.compactMode ? 16 : 18} />
                             </button>

                            {(!isOrganizational || isVago || isReposicao) && (
                              <button 
                                  onClick={() => {
                                      setEditingNoteSlotId(null);
                                      setSwappingSlotId(swappingSlotId === slot.id ? null : slot.id);
                                  }}
                                  className={`p-2 rounded-full transition-colors ${swappingSlotId === slot.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-300 hover:text-indigo-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                  title="Substituir Aula"
                              >
                                  <ArrowRightLeft size={settings.compactMode ? 16 : 18} />
                              </button>
                            )}

                            {!isVago && (
                                <button 
                                    onClick={() => handleStatusToggle(slot)}
                                    className="focus:outline-none transform active:scale-90 transition-transform"
                                >
                                    {statusIcon}
                                </button>
                            )}
                            {isVago && <span className="text-xs font-bold text-gray-400 uppercase">Cancelada</span>}
                        </div>
                    ) : null}
                </div>

                {swappingSlotId === slot.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 w-full animate-fade-in">
                        <p className="text-xs font-bold text-gray-500 mb-2">Substituir por:</p>
                        <div className="flex flex-wrap gap-2">
                             {subjects
                                .filter(s => s.type === SubjectType.NORMAL || s.id === 'reposicao' || s.id === 'vago')
                                .map(sub => (
                                 <button
                                    key={sub.id}
                                    onClick={() => handleSubstitute(slot, sub.id)}
                                    className="px-3 py-1 text-xs rounded-full border border-gray-300 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-purple-900/30 hover:border-indigo-300 dark:hover:border-purple-500 transition-colors dark:text-gray-300"
                                    style={{ color: sub.id === currentSubId ? 'white' : 'inherit', backgroundColor: sub.id === currentSubId ? sub.color : 'transparent' }}
                                 >
                                     {sub.name}
                                 </button>
                             ))}
                             <button onClick={() => setSwappingSlotId(null)} className="px-3 py-1 text-xs text-red-500 hover:underline">Cancelar</button>
                        </div>
                    </div>
                )}

                {editingNoteSlotId === slot.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 w-full animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500">Anotações da Aula</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setEditingNoteSlotId(null)} 
                                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={() => handleSaveNote(slot)} 
                                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-purple-400 hover:underline"
                                >
                                    <Save size={12} /> Salvar
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            rows={3}
                            placeholder="O que foi passado hoje? (Lição, matéria, avisos...)"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            autoFocus
                        />
                    </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`text-center py-12 px-6 rounded-3xl border animate-fade-in transition-all ${isLocked ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50' : 'bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 border-dashed'}`}>
           <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm ${isLocked ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
             {isLocked ? <Lock size={40} /> : <ShieldCheck size={40} />}
           </div>
           
           <h3 className={`text-xl font-bold mb-2 ${isLocked ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>
               {isLocked ? 'Dia Trancado' : 'Dia Não Iniciado'}
           </h3>
           
           <p className={`text-sm max-w-sm mx-auto mb-8 leading-relaxed ${isLocked ? 'text-red-600/80 dark:text-red-300/70' : 'text-gray-500 dark:text-gray-400'}`}>
             {isLocked
                ? 'Este dia foi trancado manualmente. A grade foi salva e o histórico preservado.' 
                : 'As aulas deste dia estão bloqueadas. Inicie o dia letivo para liberar o registro de presenças.'}
           </p>
           
           {dailySlots.length > 0 ? (
             <button 
               onClick={handleValidateDay}
               className={`font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mx-auto
                 ${isLocked 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200/50 dark:shadow-none ring-2 ring-red-500 ring-offset-2 dark:ring-offset-gray-900' 
                    : 'bg-indigo-600 dark:bg-purple-600 hover:bg-indigo-700 dark:hover:bg-purple-700 text-white shadow-indigo-200/50 dark:shadow-none'}
               `}
             >
               {isLocked ? <Unlock size={18} /> : null}
               {isLocked ? 'Destrancar Dia' : 'Iniciar Dia Letivo'}
             </button>
           ) : (
             <p className="text-sm font-medium text-orange-500">Sem aulas programadas para este dia.</p>
           )}
           
           <div className="mt-12 opacity-30 pointer-events-none filter blur-[2px] select-none scale-95 origin-top">
             {dailySlots.slice(0, 3).map(slot => {
               const sub = subjects.find(s => s.id === slot.subjectId);
               return (
                 <div key={slot.id} className="flex items-center p-4 border-b border-gray-400/50 dark:border-gray-600/50 last:border-0">
                    <div className="w-16 text-sm font-mono text-gray-500">{slot.startTime}</div>
                    <div className="flex-1 font-bold text-gray-800 dark:text-gray-300">{sub?.name}</div>
                 </div>
               );
             })}
             {dailySlots.length > 3 && <div className="p-4 text-center text-gray-400">... e mais {dailySlots.length - 3} aulas</div>}
           </div>
        </div>
      )}
    </div>
  );
};
