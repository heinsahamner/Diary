
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../services/store';
import { useToast } from '../components/Toast';
import { DeepLinkService } from '../services/deepLink';
import { Task, TaskStatus, TaskType, Subtask, TaskPriority } from '../types';
import { FocusMode } from '../components/FocusMode';
import { 
    Check, Calendar, AlertCircle, Clock, ChevronDown, ChevronUp, Plus, X, 
    ListTodo, Layout, Kanban, Play, MoreHorizontal, Flag, Timer, Trash2
} from 'lucide-react';
import { format, isBefore, startOfToday, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
// @ts-ignore
import { useSearchParams } from 'react-router-dom';


const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
    const colors = {
        high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900',
        medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-900',
        low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900'
    };
    const labels = { high: 'Alta', medium: 'Média', low: 'Baixa' };

    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colors[priority] || colors.low}`}>
            {labels[priority] || 'Normal'}
        </span>
    );
};

export const Tasks: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, subjects } = useStore();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);

  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formDate, setFormDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formType, setFormType] = useState<TaskType>(TaskType.HOMEWORK);
  const [formDesc, setFormDesc] = useState('');

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
      const intent = DeepLinkService.parseIntent(searchParams);
      
      if (intent && intent.action === 'create') {
          setEditingTask(null);
          
          const data = intent.data;

          setFormTitle(data.title || '');
          setFormDesc(data.description || '');
          
          if (data.priority && ['low', 'medium', 'high'].includes(data.priority)) {
              setFormPriority(data.priority as TaskPriority);
          } else {
              setFormPriority('medium');
          }

          let subjectToSet = '';
          if (subjects.length > 0) {
              if (data.subject) {
                  const matchedSubject = subjects.find(s => 
                      s.name.toLowerCase().includes(data.subject.toLowerCase()) || 
                      s.id === data.subject
                  );
                  if (matchedSubject) {
                      subjectToSet = matchedSubject.id;
                  } else {
                      subjectToSet = subjects[0].id;
                  }
              } else {
                  subjectToSet = subjects[0].id;
              }
          }
          setFormSubject(subjectToSet);

          if (data.date === 'today') setFormDate(format(new Date(), 'yyyy-MM-dd'));
          else if (data.date === 'tomorrow') setFormDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
          else if (data.date) setFormDate(data.date);
          else setFormDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));

          if(data.type) setFormType(data.type as TaskType);
          else setFormType(TaskType.HOMEWORK);
          
          setIsFormOpen(true);

          setSearchParams({}, { replace: true });
      }
  }, [searchParams, subjects, setSearchParams]);

  const filteredTasks = useMemo(() => {
      let t = tasks;
      if (filterPriority !== 'all') t = t.filter(task => task.priority === filterPriority);
      if (filterSubject !== 'all') t = t.filter(task => task.subjectId === filterSubject);
      return t.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks, filterPriority, filterSubject]);

  const handleSaveTask = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formTitle.trim()) return;

      const newTask: Task = {
          id: editingTask ? editingTask.id : Date.now().toString(),
          title: formTitle,
          subjectId: formSubject || (subjects.length > 0 ? subjects[0].id : 'general'),
          dueDate: formDate,
          priority: formPriority,
          type: formType,
          status: editingTask ? editingTask.status : TaskStatus.PENDING,
          description: formDesc,
          subtasks: editingTask?.subtasks || [],
          timeSpent: editingTask?.timeSpent || 0
      };

      if (editingTask) {
          updateTask(newTask);
          addToast('Tarefa atualizada!', 'success');
      } else {
          addTask(newTask);
          addToast('Nova tarefa criada!', 'success');
      }
      closeForm();
  };

  const openForm = (task?: Task) => {
      if (task) {
          setEditingTask(task);
          setFormTitle(task.title);
          setFormSubject(task.subjectId);
          setFormDate(task.dueDate);
          setFormPriority(task.priority || 'medium');
          setFormType(task.type);
          setFormDesc(task.description || '');
      } else {
          setEditingTask(null);
          setFormTitle('');
          setFormSubject(subjects.length > 0 ? subjects[0].id : '');
          setFormDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
          setFormPriority('medium');
          setFormType(TaskType.HOMEWORK);
          setFormDesc('');
      }
      setIsFormOpen(true);
  };

  const closeForm = () => setIsFormOpen(false);

  const handleToggleSubtask = (task: Task, subId: string) => {
      const subs = task.subtasks || [];
      const updatedSubs = subs.map(s => s.id === subId ? { ...s, completed: !s.completed } : s);
      
      let newStatus = task.status;
      if (updatedSubs.every(s => s.completed) && updatedSubs.length > 0) {
      } else if (task.status === TaskStatus.PENDING && updatedSubs.some(s => s.completed)) {
          newStatus = TaskStatus.IN_PROGRESS;
      }

      updateTask({ ...task, subtasks: updatedSubs, status: newStatus });
  };

  const handleAddSubtask = (task: Task, title: string) => {
      const newSub: Subtask = { id: Date.now().toString(), title, completed: false };
      const subs = task.subtasks ? [...task.subtasks, newSub] : [newSub];
      updateTask({ ...task, subtasks: subs });
  };

  const handleDeleteSubtask = (task: Task, subId: string) => {
      const subs = (task.subtasks || []).filter(s => s.id !== subId);
      updateTask({ ...task, subtasks: subs });
  };

  const TaskCard: React.FC<{ task: Task, compact?: boolean }> = ({ task, compact }) => {
      const sub = subjects.find(s => s.id === task.subjectId);
      const isLate = isBefore(new Date(task.dueDate), startOfToday()) && task.status !== TaskStatus.COMPLETED;
      const [newSubTitle, setNewSubTitle] = useState('');
      const [expanded, setExpanded] = useState(false);

      const progress = useMemo(() => {
          if (!task.subtasks || task.subtasks.length === 0) return 0;
          const done = task.subtasks.filter(s => s.completed).length;
          return Math.round((done / task.subtasks.length) * 100);
      }, [task.subtasks]);

      return (
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group ${task.status === TaskStatus.COMPLETED ? 'opacity-60' : ''}`}>
              <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                              {task.status === TaskStatus.COMPLETED ? (
                                  <span className="text-green-500"><Check size={16} strokeWidth={3} /></span>
                              ) : isLate ? (
                                  <span className="text-red-500"><AlertCircle size={16} /></span>
                              ) : null}
                              <h3 className={`font-bold text-gray-800 dark:text-white truncate ${task.status === TaskStatus.COMPLETED ? 'line-through decoration-2 decoration-gray-300' : ''}`}>
                                  {task.title}
                              </h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                               <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white" style={{backgroundColor: sub?.color || '#ccc'}}>{sub?.name || 'Geral'}</span>
                               <PriorityBadge priority={task.priority || 'low'} />
                               {task.timeSpent && task.timeSpent > 0 ? (
                                   <span className="flex items-center text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                       <Timer size={10} className="mr-1" /> {task.timeSpent}m
                                   </span>
                               ) : null}
                          </div>
                      </div>
                      <div className="relative">
                           <button onClick={() => openForm(task)} className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-purple-400">
                               <MoreHorizontal size={18} />
                           </button>
                      </div>
                  </div>

                  {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                              <span>Progresso</span>
                              <span>{progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{width: `${progress}%`}} />
                          </div>
                      </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <div className={`text-xs font-medium flex items-center ${isLate ? 'text-red-500' : 'text-gray-400'}`}>
                          <Calendar size={12} className="mr-1" />
                          {format(new Date(task.dueDate), "dd MMM", {locale: ptBR})}
                      </div>
                      
                      <div className="flex gap-2">
                        {task.status !== TaskStatus.COMPLETED && (
                          <button 
                            onClick={() => setFocusedTask(task)}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                            title="Iniciar Foco"
                          >
                              <Play size={14} fill="currentColor" />
                          </button>
                        )}
                        <button 
                             onClick={() => setExpanded(!expanded)}
                             className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                  </div>
              </div>

              {expanded && (
                  <div className="bg-gray-50 dark:bg-black/20 p-4 border-t border-gray-100 dark:border-gray-700 rounded-b-xl animate-fade-in">
                      {task.description && (
                          <div className="mb-4 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                              {task.description}
                          </div>
                      )}

                      <div className="space-y-2">
                          <h4 className="text-xs font-bold text-gray-400 uppercase">Etapas</h4>
                          {(task.subtasks || []).map(s => (
                              <div key={s.id} className="flex items-center group/sub">
                                  <button 
                                    onClick={() => handleToggleSubtask(task, s.id)}
                                    className={`mr-2 w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                                        s.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                    }`}
                                  >
                                      {s.completed && <Check size={10} />}
                                  </button>
                                  <span className={`text-sm flex-1 ${s.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{s.title}</span>
                                  <button onClick={() => handleDeleteSubtask(task, s.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover/sub:opacity-100">
                                      <X size={14} />
                                  </button>
                              </div>
                          ))}
                          <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                if(newSubTitle.trim()) {
                                    handleAddSubtask(task, newSubTitle);
                                    setNewSubTitle('');
                                }
                            }}
                            className="flex gap-2 mt-2"
                          >
                              <input 
                                className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white"
                                placeholder="Adicionar etapa..."
                                value={newSubTitle}
                                onChange={e => setNewSubTitle(e.target.value)}
                              />
                              <button type="submit" className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                                  <Plus size={16} />
                              </button>
                          </form>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="text-xs text-red-500 hover:underline flex items-center"
                          >
                              <Trash2 size={12} className="mr-1" /> Excluir
                          </button>
                          
                          {task.status !== TaskStatus.COMPLETED ? (
                              <button 
                                onClick={() => updateTask({ ...task, status: TaskStatus.COMPLETED })}
                                className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full font-bold hover:bg-green-200"
                              >
                                  Concluir
                              </button>
                          ) : (
                              <button 
                                onClick={() => updateTask({ ...task, status: TaskStatus.PENDING })}
                                className="text-xs text-gray-400 hover:underline"
                              >
                                  Reabrir
                              </button>
                          )}
                      </div>
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Projetos & Tarefas</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Gerencie entregas com eficiência</p>
          </div>
          <div className="flex gap-2">
               <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-white dark:bg-gray-800 text-gray-500'}`}
               >
                   <ListTodo size={20} />
               </button>
               <button 
                  onClick={() => setViewMode('board')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'board' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-white dark:bg-gray-800 text-gray-500'}`}
               >
                   <Kanban size={20} />
               </button>
               <button 
                  onClick={() => openForm()}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
               >
                   <Plus size={20} />
                   <span className="hidden md:inline">Nova Tarefa</span>
               </button>
          </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
          <select 
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg px-3 py-2 outline-none"
          >
              <option value="all">Todas as Matérias</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg px-3 py-2 outline-none"
          >
              <option value="all">Todas as Prioridades</option>
              <option value="high">Alta Prioridade</option>
              <option value="medium">Média Prioridade</option>
              <option value="low">Baixa Prioridade</option>
          </select>
      </div>

      {viewMode === 'list' && (
          <div className="space-y-4 max-w-3xl mx-auto">
              {filteredTasks.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">Nenhuma tarefa encontrada.</div>
              ) : (
                  filteredTasks.map(task => <TaskCard key={task.id} task={task} />)
              )}
          </div>
      )}

      {viewMode === 'board' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-x-auto pb-4">
              <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">A Fazer</h3>
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                          {filteredTasks.filter(t => t.status === TaskStatus.PENDING).length}
                      </span>
                  </div>
                  <div className="flex flex-col gap-3">
                      {filteredTasks.filter(t => t.status === TaskStatus.PENDING).map(t => <TaskCard key={t.id} task={t} />)}
                  </div>
              </div>

              <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-indigo-400 dark:border-indigo-600">
                      <h3 className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-xs tracking-wider">Em Progresso</h3>
                      <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs px-2 py-0.5 rounded-full">
                          {filteredTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
                      </span>
                  </div>
                  <div className="flex flex-col gap-3">
                      {filteredTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).map(t => <TaskCard key={t.id} task={t} />)}
                  </div>
              </div>

              <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-green-400 dark:border-green-600">
                      <h3 className="font-bold text-green-600 dark:text-green-400 uppercase text-xs tracking-wider">Concluído</h3>
                      <span className="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-xs px-2 py-0.5 rounded-full">
                          {filteredTasks.filter(t => t.status === TaskStatus.COMPLETED).length}
                      </span>
                  </div>
                  <div className="flex flex-col gap-3">
                      {filteredTasks.filter(t => t.status === TaskStatus.COMPLETED).map(t => <TaskCard key={t.id} task={t} />)}
                  </div>
              </div>
          </div>
      )}

      {focusedTask && (
          <FocusMode 
            task={focusedTask} 
            onClose={() => setFocusedTask(null)}
            onUpdateTask={(t) => updateTask(t)}
          />
      )}

      {isFormOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                          {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
                      </h2>
                      <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                  </div>
                  
                  <form onSubmit={handleSaveTask} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Título</label>
                          <input 
                              type="text" 
                              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                              placeholder="Ex: Trabalho de História"
                              value={formTitle}
                              onChange={e => setFormTitle(e.target.value)}
                              autoFocus
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Matéria</label>
                              <select 
                                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white"
                                  value={formSubject}
                                  onChange={e => setFormSubject(e.target.value)}
                              >
                                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Data de Entrega</label>
                              <input 
                                  type="date"
                                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white"
                                  value={formDate}
                                  onChange={e => setFormDate(e.target.value)}
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Tipo</label>
                              <select 
                                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white"
                                  value={formType}
                                  onChange={e => setFormType(e.target.value as TaskType)}
                              >
                                  {Object.values(TaskType).map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Prioridade</label>
                              <div className="flex bg-gray-50 dark:bg-gray-700 p-1 rounded-xl border border-gray-200 dark:border-gray-600">
                                  {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                                      <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormPriority(p)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${formPriority === p ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-white' : 'text-gray-400'}`}
                                      >
                                          {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Descrição</label>
                          <textarea 
                              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white resize-none"
                              rows={3}
                              placeholder="Detalhes adicionais..."
                              value={formDesc}
                              onChange={e => setFormDesc(e.target.value)}
                          />
                      </div>

                      <div className="pt-2">
                          <button 
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                          >
                              {editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};