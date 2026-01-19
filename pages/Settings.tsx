import React, { useState, useRef } from 'react';
import { useStore } from '../services/store';
import { useToast } from '../components/Toast';
import { SubjectType, Subject, ScheduleSlot, GradingSystem, SubjectCategory, SpecialDay } from '../types';
import { 
    Plus, X, Trash2, Moon, Sun, Database, FileUp, FileDown, 
    Pencil, LogOut, Info, Github, Linkedin, Globe, BookTemplate, 
    ChevronRight, ArrowLeft, GraduationCap, Calendar, 
    LayoutGrid, Settings as SettingsIcon, Upload, Loader2, Clock, User, Zap, Palette, Bell, AlertOctagon, Download, Copy, Check, Briefcase, Monitor, Book, Save
} from 'lucide-react';
import { DAYS_OF_WEEK, PREDEFINED_GRADEBOOKS, MOCK_SPECIAL_DAYS, OFFICIAL_SATURDAY_CALENDAR } from '../constants';
import { DBService } from '../services/db';

const SettingsGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 ml-2">{title}</h3>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden shadow-sm">
            {children}
        </div>
    </div>
);

const SettingsItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value?: string | React.ReactNode; 
  onClick?: () => void;
  isToggle?: boolean;
  toggled?: boolean;
  onToggle?: (val: boolean) => void;
}> = ({ icon, label, value, onClick, isToggle, toggled, onToggle }) => (
    <div 
      onClick={isToggle ? () => onToggle?.(!toggled) : onClick}
      className={`flex items-center justify-between p-4 ${onClick || isToggle ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors' : ''}`}
    >
        <div className="flex items-center gap-3">
            <div className="text-gray-400 dark:text-gray-500">{icon}</div>
            <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
        </div>
        
        {isToggle ? (
            <div className={`w-11 h-6 rounded-full relative transition-colors ${toggled ? 'bg-indigo-600 dark:bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${toggled ? 'translate-x-5' : ''}`} />
            </div>
        ) : (
           <div className="flex items-center gap-2 text-gray-400">
               <span className="text-sm">{value}</span>
               {onClick && <ChevronRight size={16} />}
           </div>
        )}
    </div>
);

export const Settings: React.FC = () => {
  const { subjects, addSubject, updateSubject, removeSubject, schedule, updateSchedule, settings, updateSettings, importData, currentUser, logout, specialDays, addSpecialDay, removeSpecialDay } = useStore();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'academic' | 'subjects' | 'schedule' | 'backup' | 'about'>('account');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Partial<Subject> | null>(null);
  const [presetFlow, setPresetFlow] = useState<'menu' | 'select_course' | 'select_year'>('menu');
  const [selectedPresetCourse, setSelectedPresetCourse] = useState<string | null>(null);

  const [activeScheduleDay, setActiveScheduleDay] = useState(1);
  const [newSlotStart, setNewSlotStart] = useState('07:00');
  const [newSlotEnd, setNewSlotEnd] = useState('07:50');
  const [newSlotSubject, setNewSlotSubject] = useState('');

  const [newSpecialDate, setNewSpecialDate] = useState('');
  const [newSpecialDesc, setNewSpecialDesc] = useState('Sábado Letivo');
  const [tempCustomSlots, setTempCustomSlots] = useState<Partial<ScheduleSlot>[]>([]);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStage, setImportStage] = useState<'course' | 'year' | 'processing'>('course');
  const [importCourse, setImportCourse] = useState<string | null>(null);

  const [serverUrl, setServerUrl] = useState('https://nao-tem-backup-ainda.sorry');
  const [isUploading, setIsUploading] = useState(false);

  const openSubjectModal = (subject?: Subject) => {
      if (subject) {
          setEditingSubject({ ...subject });
      } else {
          setEditingSubject({
              name: '',
              color: '#6366f1',
              totalClasses: 80,
              type: SubjectType.NORMAL,
              teacher: '',
              category: SubjectCategory.OTHER,
              gradingMethod: undefined
          });
      }
      setIsSubjectModalOpen(true);
  };

  const handleSubjectSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingSubject?.name) return;

      const subjectData: Subject = {
          id: editingSubject.id || Date.now().toString(),
          name: editingSubject.name,
          color: editingSubject.color || '#6366f1',
          totalClasses: Number(editingSubject.totalClasses) || 80,
          type: editingSubject.type || SubjectType.NORMAL,
          teacher: editingSubject.teacher,
          category: editingSubject.category || SubjectCategory.OTHER,
          gradingMethod: editingSubject.gradingMethod === 'average' || editingSubject.gradingMethod === 'sum' || editingSubject.gradingMethod === 'manual' ? editingSubject.gradingMethod : undefined
      };

      if (editingSubject.id) {
          updateSubject(subjectData);
          addToast('Matéria atualizada!', 'success');
      } else {
          addSubject(subjectData);
          addToast('Matéria criada!', 'success');
      }
      setIsSubjectModalOpen(false);
      setEditingSubject(null);
  };

  const handlePresetSelect = (course: string, year: string) => {
    const template = PREDEFINED_GRADEBOOKS[course]?.[year];
    if (template && window.confirm(`Isso irá substituir sua grade atual pelo curso ${course} (${year}º Ano). Confirmar?`)) {
        const subjectMap = new Map<number, string>();

        template.subjects.forEach((t, index) => {
            const normalizedName = t.name?.trim();
            
            if (normalizedName === 'Reposição') {
                subjectMap.set(index, 'reposicao');
                updateSubject({ id: 'reposicao', name: 'Reposição', color: t.color || '#9ca3af', totalClasses: 0, type: SubjectType.ORGANIZATIONAL, category: SubjectCategory.OTHER });
                return;
            }
            if (normalizedName === 'Horário Vago' || normalizedName === 'Vago') {
                subjectMap.set(index, 'vago');
                updateSubject({ id: 'vago', name: 'Horário Vago', color: '#9ca3af', totalClasses: 0, type: SubjectType.ORGANIZATIONAL, category: SubjectCategory.OTHER });
                return;
            }

            const existingSubject = subjects.find(s => s.name.toLowerCase() === normalizedName?.toLowerCase());
            if (existingSubject) {
                subjectMap.set(index, existingSubject.id);
                updateSubject({
                    ...existingSubject,
                    color: t.color || existingSubject.color,
                    totalClasses: t.totalClasses || existingSubject.totalClasses,
                    category: t.category || existingSubject.category,
                    teacher: t.teacher || existingSubject.teacher
                });
            } else {
                const newId = Date.now().toString() + '_' + index;
                subjectMap.set(index, newId);
                addSubject({
                    id: newId,
                    name: normalizedName || 'Nova Matéria',
                    color: t.color || '#ccc',
                    totalClasses: t.totalClasses || 80,
                    type: t.type || SubjectType.NORMAL,
                    category: t.category || SubjectCategory.OTHER,
                    teacher: t.teacher
                });
            }
        });

        const newSlots: ScheduleSlot[] = template.schedule.map((slot, idx) => ({
            id: Date.now().toString() + '_slot_' + idx,
            dayOfWeek: slot.day,
            startTime: slot.start,
            endTime: slot.end,
            subjectId: subjectMap.get(slot.subjectIndex) || ''
        })).filter(s => s.subjectId !== '');

        updateSchedule(newSlots.sort((a,b) => a.startTime.localeCompare(b.startTime)));
        addToast('Grade curricular carregada com sucesso!', 'success');
        setPresetFlow('menu');
    }
  };

  const handleAddSlot = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSlotSubject) return;

      const newSlot: ScheduleSlot = {
          id: Date.now().toString(),
          dayOfWeek: activeScheduleDay,
          startTime: newSlotStart,
          endTime: newSlotEnd,
          subjectId: newSlotSubject
      };

      const newSchedule = [...schedule, newSlot].sort((a,b) => a.startTime.localeCompare(b.startTime));
      updateSchedule(newSchedule);
      const [endH, endM] = newSlotEnd.split(':').map(Number);
      addToast('Aula adicionada.', 'success');
  };

  const handleAddCustomSlot = () => {
      setTempCustomSlots([...tempCustomSlots, {
          id: Date.now().toString(),
          startTime: '07:00',
          endTime: '07:50',
          subjectId: ''
      }]);
  };

  const updateTempSlot = (index: number, field: keyof ScheduleSlot, value: string) => {
      const updated = [...tempCustomSlots];
      updated[index] = { ...updated[index], [field]: value };
      setTempCustomSlots(updated);
  };

  const removeTempSlot = (index: number) => {
      setTempCustomSlots(tempCustomSlots.filter((_, i) => i !== index));
  };

  const handleAddSpecialDay = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSpecialDate) return;

      const validSlots = tempCustomSlots.filter(s => s.startTime && s.endTime && s.subjectId) as ScheduleSlot[];
      if (validSlots.length === 0) {
          addToast('Adicione pelo menos uma aula à grade personalizada.', 'error');
          return;
      }

      const newDay: SpecialDay = {
          id: Date.now().toString(),
          date: newSpecialDate,
          description: newSpecialDesc,
          customSlots: validSlots
      };
      
      addSpecialDay(newDay);
      addToast('Sábado letivo adicionado!', 'success');
      setNewSpecialDate('');
      setTempCustomSlots([]);
  };

  const handleStartImport = () => {
      setImportStage('course');
      setImportCourse(null);
      setIsImportModalOpen(true);
  };

  const handleImportSelectYear = (year: string) => {
      if (!importCourse) return;
      setImportStage('processing');

      setTimeout(() => {
          const officialDays = OFFICIAL_SATURDAY_CALENDAR[importCourse][year];
          
          if (!officialDays) {
              addToast('Calendário não encontrado.', 'error');
              setIsImportModalOpen(false);
              return;
          }

          let addedCount = 0;
          officialDays.forEach(day => {
              const [_, month, dayStr] = day.date.split('-');
              const adjustedDate = `${settings.currentYear}-${month}-${dayStr}`;

              const resolvedSlots: ScheduleSlot[] = day.slots.map(s => {
                  const matchedSub = subjects.find(sub => 
                      sub.name.toLowerCase() === s.subjectName.toLowerCase() ||
                      sub.name.toLowerCase().includes(s.subjectName.toLowerCase())
                  );
                  
                  return {
                      id: Date.now().toString() + Math.random().toString(),
                      dayOfWeek: 6,
                      startTime: s.start,
                      endTime: s.end,
                      subjectId: matchedSub ? matchedSub.id : 'vago'
                  };
              });

              addSpecialDay({
                  id: `official_sat_${day.number}_${settings.currentYear}`,
                  date: adjustedDate,
                  description: `${day.number}º Sábado Letivo`,
                  customSlots: resolvedSlots
              });
              addedCount++;
          });

          addToast(`${addedCount} sábados letivos importados para ${settings.currentYear}!`, 'success');
          setIsImportModalOpen(false);
      }, 1000);
  };

  const handleExport = async () => {
    const data = await DBService.loadState(currentUser, settings.currentYear);
    if (data) {
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `diary_backup_${currentUser}_${settings.currentYear}.json`;
      link.click();
      addToast('Arquivo de backup baixado.', 'success');
    }
  };

  const handleCloudUpload = async () => {
      setIsUploading(true);
      await new Promise(r => setTimeout(r, 1500));
      setIsUploading(false);
      addToast('Sincronização concluída (Simulado)', 'success');
  };

  if (activeTab === 'account') {
      return (
          <div className="pb-20 max-w-2xl mx-auto animate-fade-in">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Configurações</h1>
              
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-8 shadow-lg flex items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                        {currentUser.charAt(0).toUpperCase()}
                   </div>
                   <div className="flex-1">
                       <h2 className="text-xl font-bold">{currentUser}</h2>
                       <p className="text-indigo-100 text-sm">Conta Local</p>
                   </div>
                   <button onClick={logout} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors">
                       <LogOut size={20} />
                   </button>
              </div>

              <SettingsGroup title="Preferências">
                  <SettingsItem 
                    icon={<Palette size={20} />} 
                    label="Aparência" 
                    value={settings.darkMode ? 'Escuro' : 'Claro'} 
                    onClick={() => setActiveTab('appearance')} 
                  />
                  <SettingsItem 
                    icon={<GraduationCap size={20} />} 
                    label="Geral" 
                    value="Notas e Ano" 
                    onClick={() => setActiveTab('academic')} 
                  />
              </SettingsGroup>

              <SettingsGroup title="Gestão">
                  <SettingsItem 
                    icon={<BookTemplate size={20} />} 
                    label="Matérias" 
                    value={`${subjects.length} ativas`} 
                    onClick={() => setActiveTab('subjects')} 
                  />
                  <SettingsItem 
                    icon={<Calendar size={20} />} 
                    label="Grade Horária" 
                    value="Editar" 
                    onClick={() => setActiveTab('schedule')} 
                  />
              </SettingsGroup>

              <SettingsGroup title="Sistema">
                  <SettingsItem 
                    icon={<Database size={20} />} 
                    label="Backup e Sincronização" 
                    value="Gerenciar" 
                    onClick={() => setActiveTab('backup')} 
                  />
                  <SettingsItem 
                    icon={<Info size={20} />} 
                    label="Sobre" 
                    value="v2.0.2" 
                    onClick={() => setActiveTab('about')} 
                  />
              </SettingsGroup>
          </div>
      )
  }

  const SubPageHeader: React.FC<{ title: string }> = ({ title }) => (
      <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setActiveTab('account')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
              <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h1>
      </div>
  );

  if (activeTab === 'appearance') {
      return (
          <div className="pb-20 max-w-2xl mx-auto animate-slide-in">
              <SubPageHeader title="Aparência" />
              <SettingsGroup title="Tema">
                  <SettingsItem 
                    icon={settings.darkMode ? <Moon size={20} /> : <Sun size={20} />} 
                    label="Modo Escuro" 
                    isToggle 
                    toggled={settings.darkMode} 
                    onToggle={(val) => updateSettings({...settings, darkMode: val})} 
                  />
              </SettingsGroup>
              <SettingsGroup title="Densidade">
                  <SettingsItem 
                    icon={<LayoutGrid size={20} />} 
                    label="Modo Compacto" 
                    isToggle 
                    toggled={settings.compactMode} 
                    onToggle={(val) => updateSettings({...settings, compactMode: val})} 
                  />
                  <p className="px-4 pb-4 text-xs text-gray-400">Reduz o espaçamento nas listas do Diário e Tarefas para exibir mais conteúdo.</p>
              </SettingsGroup>
          </div>
      )
  }

  if (activeTab === 'academic') {
      return (
          <div className="pb-20 max-w-2xl mx-auto animate-slide-in">
              <SubPageHeader title="Configurações Gerais" />
              
              <SettingsGroup title="Ano Letivo">
                   <div className="p-4">
                       <label className="block text-xs font-bold text-gray-500 mb-1.5">Ano Atual</label>
                       <select
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={settings.currentYear}
                            onChange={(e) => updateSettings({...settings, currentYear: Number(e.target.value)})}
                       >
                           {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                               <option key={y} value={y}>{y}</option>
                           ))}
                       </select>
                       <p className="text-xs text-gray-400 mt-2">Alterar o ano mudará o banco de dados ativo. Seus dados de outros anos ficam salvos separadamente.</p>
                   </div>
                   <div className="p-4 pt-0">
                       <label className="block text-xs font-bold text-gray-500 mb-1.5">Total de Dias Letivos</label>
                       <input 
                            type="number"
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={settings.totalSchoolDays}
                            onChange={(e) => updateSettings({...settings, totalSchoolDays: Number(e.target.value)})}
                        />
                   </div>
              </SettingsGroup>

              <SettingsGroup title="Critérios de Avaliação">
                   <div className="p-4">
                       <label className="block text-xs font-bold text-gray-500 mb-1.5">Sistema de Notas</label>
                       <select
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={settings.gradingSystem || 'average'}
                            onChange={(e) => updateSettings({...settings, gradingSystem: e.target.value as GradingSystem})}
                       >
                           <option value="average">Média Ponderada (0-10)</option>
                           <option value="sum">Somatória de Pontos</option>
                       </select>
                   </div>
                   <div className="p-4 pt-0">
                       <label className="block text-xs font-bold text-gray-500 mb-1.5">Média para Aprovação</label>
                       <input 
                            type="number" step="0.1"
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={settings.passingGrade}
                            onChange={(e) => updateSettings({...settings, passingGrade: Number(e.target.value)})}
                        />
                   </div>
              </SettingsGroup>
          </div>
      )
  }

  if (activeTab === 'subjects') {
      return (
          <div className="pb-24 max-w-2xl mx-auto animate-slide-in">
              <SubPageHeader title="Gerenciar Matérias" />

              <SettingsGroup title="Ações Rápidas">
                  <div className="p-4">
                      {presetFlow === 'menu' && (
                          <button 
                            onClick={() => setPresetFlow('select_course')}
                            className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-2"
                          >
                              <Database size={18} /> Importar Grade Oficial
                          </button>
                      )}
                      {presetFlow === 'select_course' && (
                          <div className="space-y-3">
                              <p className="text-sm text-gray-500 mb-2">Selecione o curso:</p>
                              <button onClick={() => { setSelectedPresetCourse('INF'); setPresetFlow('select_year'); }} className="w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 flex items-center gap-3">
                                  <Monitor className="text-blue-500" />
                                  <span className="font-bold text-gray-800 dark:text-white">Informática (INF)</span>
                              </button>
                              <button onClick={() => { setSelectedPresetCourse('ADM'); setPresetFlow('select_year'); }} className="w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 flex items-center gap-3">
                                  <Briefcase className="text-orange-500" />
                                  <span className="font-bold text-gray-800 dark:text-white">Administração (ADM)</span>
                              </button>
                              <button onClick={() => setPresetFlow('menu')} className="text-xs text-gray-400 underline mt-2">Cancelar</button>
                          </div>
                      )}
                      {presetFlow === 'select_year' && selectedPresetCourse && (
                          <div className="space-y-3">
                              <p className="text-sm text-gray-500 mb-2">Selecione o ano:</p>
                              {[1, 2, 3].map(year => (
                                  <button 
                                    key={year}
                                    onClick={() => handlePresetSelect(selectedPresetCourse, year.toString())} 
                                    className="w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 font-bold text-gray-800 dark:text-white"
                                  >
                                      {year}º Ano
                                  </button>
                              ))}
                              <button onClick={() => setPresetFlow('select_course')} className="text-xs text-gray-400 underline mt-2">Voltar</button>
                          </div>
                      )}
                  </div>
              </SettingsGroup>
              
              <div className="space-y-3">
                  {subjects.map(subject => (
                      <div key={subject.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm" style={{ backgroundColor: subject.color }}>
                                  {subject.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                  <h4 className="font-bold text-gray-800 dark:text-white leading-tight">{subject.name}</h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subject.teacher || 'Prof. não informado'} • {subject.totalClasses}h</p>
                              </div>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => openSubjectModal(subject)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"><Pencil size={18} /></button>
                              <button onClick={() => {
                                  if(window.confirm('Excluir esta matéria?')) removeSubject(subject.id);
                              }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={18} /></button>
                          </div>
                      </div>
                  ))}
              </div>

              <button 
                onClick={() => openSubjectModal()}
                className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              >
                  <Plus size={28} />
              </button>

              {isSubjectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                    <form onSubmit={handleSubjectSave} className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-gray-200 dark:border-gray-600 pointer-events-auto">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-xl text-gray-800 dark:text-white">{editingSubject?.id ? 'Editar Matéria' : 'Nova Matéria'}</h3>
                            <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Nome da Disciplina</label>
                                <input 
                                    className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400" 
                                    placeholder="Ex: Matemática"
                                    value={editingSubject?.name} 
                                    onChange={e => setEditingSubject({...editingSubject, name: e.target.value})} 
                                    autoFocus 
                                    required 
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Cor do Card</label>
                                    <div className="flex items-center gap-2 w-full p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                        <input 
                                            type="color" 
                                            className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent" 
                                            value={editingSubject?.color} 
                                            onChange={e => setEditingSubject({...editingSubject, color: e.target.value})} 
                                        />
                                        <span className="text-xs text-gray-500 font-mono">{editingSubject?.color}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Aulas/Ano</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                        value={editingSubject?.totalClasses} 
                                        onChange={e => setEditingSubject({...editingSubject, totalClasses: Number(e.target.value)})} 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Professor</label>
                                <input 
                                    className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-gray-400" 
                                    placeholder="Nome do professor(a)"
                                    value={editingSubject?.teacher} 
                                    onChange={e => setEditingSubject({...editingSubject, teacher: e.target.value})} 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Categoria</label>
                                <div className="relative">
                                    <select 
                                        className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none" 
                                        value={editingSubject?.category} 
                                        onChange={e => setEditingSubject({...editingSubject, category: e.target.value as SubjectCategory})}
                                    >
                                        {Object.values(SubjectCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" size={16} />
                                </div>
                            </div>
                            
                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all mt-4 flex items-center justify-center gap-2">
                                <Save size={20} />
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
              )}
          </div>
      )
  }

  if (activeTab === 'schedule') {
      const activeSlots = schedule.filter(s => s.dayOfWeek === activeScheduleDay).sort((a,b) => a.startTime.localeCompare(b.startTime));
      
      return (
          <div className="pb-24 max-w-2xl mx-auto animate-slide-in">
              <SubPageHeader title="Grade Horária" />

              <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
                  {DAYS_OF_WEEK.map((day, idx) => idx > 0 && (
                      <button
                        key={idx}
                        onClick={() => setActiveScheduleDay(idx)}
                        className={`
                            px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border
                            ${activeScheduleDay === idx 
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}
                        `}
                      >
                          {day}
                      </button>
                  ))}
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-200 dark:border-gray-700 mb-8 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <Clock size={14} /> Adicionar Aula
                  </h3>
                  <form onSubmit={handleAddSlot} className="flex flex-col gap-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Matéria</label>
                          <div className="relative">
                            <select 
                                className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none" 
                                value={newSlotSubject} 
                                onChange={e => setNewSlotSubject(e.target.value)} 
                                required
                            >
                                <option value="" disabled>Selecione a disciplina...</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" size={16} />
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Início</label>
                              <input 
                                type="time" 
                                className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                value={newSlotStart} 
                                onChange={e => setNewSlotStart(e.target.value)} 
                                required 
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Fim</label>
                              <input 
                                type="time" 
                                className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                value={newSlotEnd} 
                                onChange={e => setNewSlotEnd(e.target.value)} 
                                required 
                              />
                          </div>
                      </div>
                      
                      <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-2">
                          <Plus size={20} /> Adicionar ao Horário
                      </button>
                  </form>
              </div>

              <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between px-2 mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Aulas Cadastradas</span>
                      <span className="text-xs font-bold text-gray-400">{activeSlots.length} aulas</span>
                  </div>
                  
                  {activeSlots.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                          <p className="text-gray-400 font-medium">Nenhuma aula neste dia.</p>
                      </div>
                  ) : (
                      activeSlots.map(slot => {
                          const sub = subjects.find(s => s.id === slot.subjectId);
                          return (
                              <div key={slot.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm group">
                                  <div className="flex items-center gap-4">
                                      <div className="flex flex-col items-center justify-center w-16 p-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
                                          <span className="text-sm font-bold text-gray-800 dark:text-white">{slot.startTime}</span>
                                          <span className="text-[10px] text-gray-400">{slot.endTime}</span>
                                      </div>
                                      <div>
                                          <div className="font-bold text-gray-800 dark:text-white text-lg">{sub?.name || 'Desconhecido'}</div>
                                          <div className="flex items-center gap-1.5 mt-1">
                                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: sub?.color}} />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{sub?.teacher || 'Sem professor'}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <button 
                                    onClick={() => updateSchedule(schedule.filter(s => s.id !== slot.id))} 
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  >
                                      <Trash2 size={20} />
                                  </button>
                              </div>
                          )
                      })
                  )}
              </div>

              <SettingsGroup title="Sábados Letivos & Dias Especiais">
                  <div className="p-4 space-y-4">
                      <button 
                          onClick={handleStartImport}
                          className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mb-4"
                      >
                          <Book size={20} />
                          Importar
                      </button>

                      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-3">Adicionar Manualmente</p>
                          <div className="flex flex-col gap-3 mb-3">
                              <div className="relative">
                                  <input 
                                    type="date" 
                                    className="w-full p-3 pl-10 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 cursor-pointer" 
                                    value={newSpecialDate} 
                                    min={`${settings.currentYear}-01-01`}
                                    max={`${settings.currentYear}-12-31`}
                                    onChange={e => setNewSpecialDate(e.target.value)} 
                                  />
                                  <Calendar className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" size={18} />
                              </div>
                              <input 
                                type="text" 
                                placeholder="Descrição (Ex: Sábado Letivo)" 
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500" 
                                value={newSpecialDesc} 
                                onChange={e => setNewSpecialDesc(e.target.value)} 
                              />
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-3 border border-gray-100 dark:border-gray-700">
                              <div className="flex justify-between items-center mb-3">
                                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Aulas do Dia</span>
                                  <button type="button" onClick={handleAddCustomSlot} className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1">
                                      <Plus size={14} /> Adicionar Aula
                                  </button>
                              </div>
                              <div className="space-y-2">
                                {tempCustomSlots.map((slot, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input 
                                            type="time" 
                                            className="w-20 p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white" 
                                            value={slot.startTime} 
                                            onChange={e => updateTempSlot(idx, 'startTime', e.target.value)} 
                                        />
                                        <select 
                                            className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white" 
                                            value={slot.subjectId} 
                                            onChange={e => updateTempSlot(idx, 'subjectId', e.target.value)}
                                        >
                                            <option value="">Matéria...</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        <button onClick={() => removeTempSlot(idx)} className="text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><X size={14} /></button>
                                    </div>
                                ))}
                              </div>
                              {tempCustomSlots.length === 0 && <p className="text-xs text-gray-400 italic text-center py-4">Nenhuma aula adicionada.</p>}
                          </div>

                          <button onClick={handleAddSpecialDay} className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                              Salvar Dia Especial
                          </button>
                      </div>

                      <div className="mt-4 space-y-2">
                          {specialDays.map(sd => (
                              <div key={sd.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                  <div>
                                      <p className="font-bold text-sm text-gray-800 dark:text-white">
                                          {sd.date.split('-').reverse().join('/')} - {sd.description}
                                      </p>
                                      <p className="text-xs text-gray-500">{sd.customSlots.length} aulas</p>
                                  </div>
                                  <button onClick={() => removeSpecialDay(sd.date)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                              </div>
                          ))}
                      </div>
                  </div>
              </SettingsGroup>

              {isImportModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-scale-in relative overflow-hidden border border-gray-100 dark:border-gray-700">
                          <button onClick={() => setIsImportModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
                          
                          <div className="text-center mb-6">
                              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Book size={32} />
                              </div>
                              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Importar Sábados</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure automaticamente todos os sábados letivos oficiais.</p>
                          </div>

                          {importStage === 'course' && (
                              <div className="space-y-3">
                                  <button onClick={() => setImportCourse('INF')} className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-purple-500 hover:bg-indigo-50 dark:hover:bg-purple-900/20 transition-all group">
                                      <span className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-purple-400">Informática</span>
                                  </button>
                                  <button onClick={() => setImportCourse('ADM')} className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-purple-500 hover:bg-indigo-50 dark:hover:bg-purple-900/20 transition-all group">
                                      <span className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-purple-400">Administração</span>
                                  </button>
                                  {importCourse && (
                                      <button onClick={() => setImportStage('year')} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl mt-4">Continuar</button>
                                  )}
                              </div>
                          )}

                          {importStage === 'year' && (
                              <div className="space-y-3">
                                  <p className="text-center text-sm font-bold text-indigo-600 dark:text-purple-400 mb-2">Curso: {importCourse === 'INF' ? 'Informática' : 'Administração'}</p>
                                  {[1, 2, 3].map(y => (
                                      <button key={y} onClick={() => handleImportSelectYear(y.toString())} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 font-bold text-gray-800 dark:text-white">
                                          {y}º Ano
                                      </button>
                                  ))}
                                  <button onClick={() => setImportStage('course')} className="w-full text-xs text-gray-400 mt-4 hover:underline">Voltar</button>
                              </div>
                          )}

                          {importStage === 'processing' && (
                              <div className="py-8 text-center">
                                  <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
                                  <p className="font-bold text-gray-800 dark:text-white">Processando calendário...</p>
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>
      )
  }

  if (activeTab === 'backup') {
      return (
        <div className="pb-20 max-w-2xl mx-auto animate-slide-in">
            <SubPageHeader title="Dados" />
            
            <SettingsGroup title="Backup Local (Arquivo)">
                <div className="grid grid-cols-2 gap-4 p-4">
                    <button onClick={handleExport} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all text-gray-500 dark:text-gray-400 hover:text-indigo-600">
                        <FileDown size={32} className="mb-2" />
                        <span className="font-bold text-sm">Baixar Dados</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-gray-700 transition-all text-gray-500 dark:text-gray-400 hover:text-purple-600">
                        <FileUp size={32} className="mb-2" />
                        <span className="font-bold text-sm">Restaurar</span>
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if(file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                                try {
                                    importData(JSON.parse(ev.target?.result as string));
                                    addToast('Dados restaurados com sucesso!', 'success');
                                } catch (err) { addToast('Arquivo de backup inválido', 'error'); }
                            };
                            reader.readAsText(file);
                        }
                    }}/>
                </div>
            </SettingsGroup>

            <SettingsGroup title="Nuvem (Sync)">
                 <div className="p-4 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 mb-1 block">URL do Servidor</label>
                        <input type="text" value={serverUrl} onChange={e => setServerUrl(e.target.value)} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <button 
                        onClick={handleCloudUpload}
                        disabled={isUploading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                        {isUploading ? 'Sincronizando...' : 'Sincronizar Agora'}
                    </button>
                 </div>
            </SettingsGroup>
        </div>
      )
  }

  if (activeTab === 'about') {
      return (
        <div className="pb-20 max-w-2xl mx-auto animate-slide-in">
            <SubPageHeader title="Sobre" />
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm text-center relative overflow-hidden mb-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
                
                <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-indigo-500/30 transform hover:scale-105 transition-transform duration-300">
                    <BookTemplate size={40} />
                </div>
                
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Diary</h2>
                <p className="text-lg text-indigo-600 dark:text-purple-400 font-medium mb-4">um app Microspace</p>
                
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Desenvolvido por:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">Lucas Willian</span>
                </div>
            </div>

            <SettingsGroup title="Guia Rápido">
                <div className="p-5 space-y-4">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0">1</div>
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-white text-sm">Configure suas Matérias</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vá em "Matérias" para adicionar disciplinas, professores e definir a carga horária anual.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0">2</div>
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-white text-sm">Monte sua Grade</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Defina seus horários na aba "Grade Horária" para habilitar o registro de presença no Diário.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0">3</div>
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-white text-sm">Acompanhe seu Desempenho</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lance suas notas por trimestre e veja simulações automáticas para alcançar a aprovação.</p>
                        </div>
                    </div>
                </div>
            </SettingsGroup>

            <SettingsGroup title="Conecte-se">
                  <a href="https://github.com/lucas-willian" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:bg-black group-hover:text-white transition-colors">
                              <Github size={20} />
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-200">GitHub</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                  </a>
                  <a href="https://linkedin.com/in/lucas-willian" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <Linkedin size={20} />
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-200">LinkedIn</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                  </a>
                  <a href="https://lucaswillian.dev" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                              <Globe size={20} />
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-200">Portfolio</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                  </a>
            </SettingsGroup>

            <div className="text-center pt-8 pb-4">
                <p className="text-xs text-gray-400 font-medium">Versão 2.0.2</p>
                <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">© {new Date().getFullYear()}</p>
            </div>
        </div>
      )
  }

  return null;
};
