
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../services/store';
import { useToast } from '../components/Toast';
import { SubjectType, Subject, ScheduleSlot, GradingSystem, SubjectCategory, SpecialDay } from '../types';
import { 
    Plus, X, Trash2, Moon, Sun, Database, FileUp, FileDown, 
    Pencil, LogOut, Info, Globe, BookTemplate, 
    ChevronRight, ArrowLeft, GraduationCap, Calendar, 
    LayoutGrid, Upload, Loader2, Clock, Palette, 
    Download, Check, Briefcase, Monitor, Book, Cloud, Wifi, AlertTriangle, Smartphone, Shield, ChevronDown
} from 'lucide-react';
import { DAYS_OF_WEEK, PREDEFINED_GRADEBOOKS, OFFICIAL_SATURDAY_CALENDAR } from '../constants';
import { DBService } from '../services/db';
import { SupabaseService } from '../services/supabase';
// @ts-ignore
import { useSearchParams } from 'react-router-dom';

const ModalWrapper: React.FC<{ children: React.ReactNode; onClose: () => void; title: string }> = ({ children, onClose, title }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-fade-in" 
            onClick={onClose}
        />
        <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl relative z-10 animate-scale-in border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
                    <X size={20} />
                </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    </div>
);

const SettingsGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8 animate-fade-in">
        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-4 flex items-center gap-2">
            {title}
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700/50 ml-2"></div>
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {children}
        </div>
    </div>
);

const SettingsItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  description?: string;
  value?: string | React.ReactNode; 
  onClick?: () => void;
  isToggle?: boolean;
  toggled?: boolean;
  onToggle?: (val: boolean) => void;
  isDestructive?: boolean;
}> = ({ icon, label, description, value, onClick, isToggle, toggled, onToggle, isDestructive }) => (
    <div 
      onClick={isToggle ? () => onToggle?.(!toggled) : onClick}
      className={`
        flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-700/50 last:border-0 transition-all duration-200 group
        ${(onClick || isToggle) ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 active:bg-gray-100 dark:active:bg-gray-700/50' : ''}
      `}
    >
        <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                ${isDestructive 
                    ? 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400' 
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-900/20 dark:group-hover:text-indigo-400'}
            `}>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className={`font-semibold text-sm ${isDestructive ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {label}
                </span>
                {description && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 leading-tight mt-0.5 font-medium">
                        {description}
                    </span>
                )}
            </div>
        </div>
        
        <div className="pl-4">
            {isToggle ? (
                <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ease-in-out ${toggled ? 'bg-indigo-600 dark:bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                    <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${toggled ? 'translate-x-5' : ''}`} />
                </div>
            ) : (
               <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                   {value && <span className="text-sm font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">{value}</span>}
                   {onClick && <ChevronRight size={18} />}
               </div>
            )}
        </div>
    </div>
);

const SubPageHeader: React.FC<{ title: string; subtitle?: string; onBack: () => void }> = ({ title, subtitle, onBack }) => (
    <div className="mb-8 pt-2">
        <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white transition-colors mb-4 group"
        >
            <div className="p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm group-hover:shadow-md transition-all">
                <ArrowLeft size={18} />
            </div>
            <span className="text-sm font-bold">Voltar</span>
        </button>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtitle}</p>}
    </div>
);

export const Settings: React.FC = () => {
  const { subjects, addSubject, updateSubject, removeSubject, schedule, updateSchedule, settings, updateSettings, importData, currentUser, logout, specialDays, addSpecialDay, removeSpecialDay, getCurrentState } = useStore();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
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

  const [isCloudConfigured, setIsCloudConfigured] = useState(false);
  const [cloudUser, setCloudUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
      const checkCloud = async () => {
          const configured = SupabaseService.isConfigured();
          setIsCloudConfigured(configured);
          if (configured) {
              const user = await SupabaseService.getUser();
              setCloudUser(user);
          }
      };
      if (activeTab === 'backup' || activeTab === 'account') checkCloud();
  }, [activeTab]);

  useEffect(() => {
      const action = searchParams.get('action');
      if (action === 'new_subject') {
          setActiveTab('subjects');
          openSubjectModal();
          setSearchParams({}, { replace: true });
      }
  }, [searchParams, setSearchParams]);

  const openSubjectModal = (subject?: Subject) => {
      setEditingSubject(subject ? { ...subject } : {
          name: '',
          color: '#6366f1',
          totalClasses: 80,
          type: SubjectType.NORMAL,
          teacher: '',
          category: SubjectCategory.OTHER
      });
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
          gradingMethod: editingSubject.gradingMethod
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
    if (template && window.confirm(`Substituir grade atual por ${course} (${year}º Ano)?`)) {
        const subjectMap = new Map<number, string>();

        template.subjects.forEach((t, index) => {
            const normalizedName = t.name?.trim();
            if (['Reposição', 'Horário Vago', 'Vago'].includes(normalizedName || '')) {
                const id = normalizedName === 'Reposição' ? 'reposicao' : 'vago';
                updateSubject({ 
                    id, 
                    name: normalizedName!, 
                    color: t.color || '#9ca3af', 
                    totalClasses: 0, 
                    type: SubjectType.ORGANIZATIONAL, 
                    category: SubjectCategory.OTHER 
                });
                subjectMap.set(index, id);
                return;
            }

            const existingSubject = subjects.find(s => s.name.toLowerCase() === normalizedName?.toLowerCase());
            if (existingSubject) {
                subjectMap.set(index, existingSubject.id);
                updateSubject({ ...existingSubject, ...t });
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
                    ...t 
                } as Subject);
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
        addToast('Grade importada com sucesso!', 'success');
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
      updateSchedule([...schedule, newSlot].sort((a,b) => a.startTime.localeCompare(b.startTime)));
      addToast('Aula adicionada.', 'success');
  };

  const handleAddCustomSlot = () => setTempCustomSlots([...tempCustomSlots, { id: Date.now().toString(), startTime: '07:00', endTime: '07:50', subjectId: '' }]);
  const updateTempSlot = (index: number, field: keyof ScheduleSlot, value: string) => { 
      const updated = [...tempCustomSlots]; 
      updated[index] = { ...updated[index], [field]: value }; 
      setTempCustomSlots(updated); 
  };
  const removeTempSlot = (index: number) => setTempCustomSlots(tempCustomSlots.filter((_, i) => i !== index));

  const handleAddSpecialDay = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSpecialDate) return;
      const validSlots = tempCustomSlots.filter(s => s.startTime && s.endTime && s.subjectId) as ScheduleSlot[];
      if (validSlots.length === 0) { addToast('Adicione pelo menos uma aula.', 'error'); return; }
      addSpecialDay({ id: Date.now().toString(), date: newSpecialDate, description: newSpecialDesc, customSlots: validSlots });
      addToast('Sábado letivo adicionado!', 'success');
      setNewSpecialDate(''); setTempCustomSlots([]);
  };

  const handleImportSelectYear = (year: string) => {
      if (!importCourse) return;
      setImportStage('processing');
      setTimeout(() => {
          const officialDays = OFFICIAL_SATURDAY_CALENDAR[importCourse][year];
          if (!officialDays) { addToast('Calendário não encontrado.', 'error'); setIsImportModalOpen(false); return; }
          let addedCount = 0;
          officialDays.forEach(day => {
              const [_, month, dayStr] = day.date.split('-');
              const adjustedDate = `${settings.currentYear}-${month}-${dayStr}`;
              const resolvedSlots: ScheduleSlot[] = day.slots.map(s => {
                  const matchedSub = subjects.find(sub => sub.name.toLowerCase().includes(s.subjectName.toLowerCase()));
                  return { id: Date.now().toString() + Math.random().toString(), dayOfWeek: 6, startTime: s.start, endTime: s.end, subjectId: matchedSub ? matchedSub.id : 'vago' };
              });
              addSpecialDay({ id: `off_sat_${day.number}_${settings.currentYear}`, date: adjustedDate, description: `${day.number}º Sábado Letivo`, customSlots: resolvedSlots });
              addedCount++;
          });
          addToast(`${addedCount} sábados importados!`, 'success');
          setIsImportModalOpen(false);
      }, 1000); 
  };

  const handleCloudLogin = async () => {
      try {
          await SupabaseService.signInWithGoogle();
      } catch (error) {
          addToast('Erro ao conectar com Google', 'error');
      }
  };

  const handleCloudLogout = async () => {
      await SupabaseService.logout();
      setCloudUser(null);
      addToast('Desconectado.', 'info');
  };

  const handleCloudSync = async (direction: 'up' | 'down') => {
      setIsSyncing(true);
      try {
          if (direction === 'up') {
              const currentState = getCurrentState ? getCurrentState() : null;
              if (!currentState) throw new Error("Erro de estado");
              await SupabaseService.uploadBackup(currentState);
              addToast('Upload concluído!', 'success');
          } else {
              const backup = await SupabaseService.downloadBackup();
              if (backup && window.confirm(`Restaurar backup de ${new Date(backup.updated_at).toLocaleString()}?`)) {
                  importData(backup.data);
                  addToast('Dados restaurados!', 'success');
              } else if (!backup) {
                  addToast('Nenhum backup encontrado.', 'info');
              }
          }
      } catch (err: any) {
          addToast(err.message || 'Erro na sincronização', 'error');
      } finally {
          setIsSyncing(false);
      }
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
      addToast('Backup salvo.', 'success');
    }
  };

  if (activeTab === 'account') {
      return (
          <div className="pb-20 max-w-2xl mx-auto animate-fade-in px-4">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-8">Configurações</h1>
              
              <div className="relative bg-white dark:bg-gray-800 rounded-[32px] p-6 mb-10 shadow-xl border border-white/20 dark:border-gray-700 overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                   
                   <div className="relative flex items-center gap-6">
                       <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-indigo-500/30 transform group-hover:scale-105 transition-transform duration-300">
                            {currentUser.charAt(0).toUpperCase()}
                       </div>
                       <div className="flex-1 min-w-0">
                           <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{currentUser}</h2>
                           <div className="flex items-center gap-2 mt-2">
                               <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${cloudUser ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                   <div className={`w-2 h-2 rounded-full ${cloudUser ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                   {cloudUser ? 'Conta Conectada' : 'Modo Offline'}
                               </div>
                           </div>
                       </div>
                       <button onClick={logout} className="p-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 rounded-xl transition-colors" title="Sair">
                           <LogOut size={22} />
                       </button>
                   </div>
              </div>

              <SettingsGroup title="Customização">
                  <SettingsItem icon={<Palette size={22} />} label="Aparência" description="Tema escuro, modo compacto" value={settings.darkMode ? 'Escuro' : 'Claro'} onClick={() => setActiveTab('appearance')} />
                  <SettingsItem icon={<GraduationCap size={22} />} label="Geral" description="Ano letivo, sistema de notas" value={`${settings.currentYear}`} onClick={() => setActiveTab('academic')} />
              </SettingsGroup>

              <SettingsGroup title="Planejamento">
                  <SettingsItem icon={<BookTemplate size={22} />} label="Matérias" description="Adicionar, editar ou remover matérias" value={`${subjects.length}`} onClick={() => setActiveTab('subjects')} />
                  <SettingsItem icon={<Calendar size={22} />} label="Grade Horária" description="Definir os horários das aulas" onClick={() => setActiveTab('schedule')} />
              </SettingsGroup>

              <SettingsGroup title="Sistema">
                  <SettingsItem icon={<Database size={22} />} label="Dados e Backup" description="Salvar dados na nuvem ou localmente" value={cloudUser ? <span className="text-green-500 font-bold">Ativo</span> : 'Offline'} onClick={() => setActiveTab('backup')} />
                  <SettingsItem icon={<Info size={22} />} label="Sobre" description="Versão, créditos e links" value="v2.3.0" onClick={() => setActiveTab('about')} />
              </SettingsGroup>
          </div>
      )
  }

  if (activeTab === 'appearance') {
      return (
          <div className="pb-20 max-w-2xl mx-auto animate-slide-in px-4">
              <SubPageHeader title="Aparência" subtitle="Personalize sua experiência visual" onBack={() => setActiveTab('account')} />
              <SettingsGroup title="Tema">
                  <SettingsItem icon={settings.darkMode ? <Moon size={22} /> : <Sun size={22} />} label="Modo Escuro" description="Reduz o cansaço visual" isToggle toggled={settings.darkMode} onToggle={(val) => updateSettings({...settings, darkMode: val})} />
              </SettingsGroup>
              <SettingsGroup title="Interface">
                  <SettingsItem icon={<LayoutGrid size={22} />} label="Modo Compacto" description="Exibir mais itens em listas longas" isToggle toggled={settings.compactMode} onToggle={(val) => updateSettings({...settings, compactMode: val})} />
              </SettingsGroup>
          </div>
      )
  }

  if (activeTab === 'academic') {
      return (
          <div className="pb-20 max-w-2xl mx-auto animate-slide-in px-4">
              <SubPageHeader title="Acadêmico" subtitle="Regras de cálculo e estrutura" onBack={() => setActiveTab('account')} />
              <SettingsGroup title="Ano Letivo">
                   <div className="p-5 space-y-5">
                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-2 uppercase ml-1">Ano Atual</label>
                           <div className="relative">
                               <select className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none appearance-none font-medium" value={settings.currentYear} onChange={(e) => updateSettings({...settings, currentYear: Number(e.target.value)})}>
                                   {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(y => (<option key={y} value={y}>{y}</option>))}
                               </select>
                               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                           </div>
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-2 uppercase ml-1">Dias Letivos Totais</label>
                           <input type="number" className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none font-medium" value={settings.totalSchoolDays} onChange={(e) => updateSettings({...settings, totalSchoolDays: Number(e.target.value)})} />
                           <p className="text-xs text-gray-400 mt-2 ml-1">Usado para calcular a porcentagem de faltas permitidas (25%).</p>
                       </div>
                   </div>
              </SettingsGroup>
              <SettingsGroup title="Sistema de Avaliação">
                   <div className="p-5 space-y-5">
                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-2 uppercase ml-1">Cálculo de Notas</label>
                           <div className="relative">
                               <select className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none appearance-none font-medium" value={settings.gradingSystem || 'average'} onChange={(e) => updateSettings({...settings, gradingSystem: e.target.value as GradingSystem})}>
                                   <option value="average">Média Ponderada (0-10)</option>
                                   <option value="sum">Somatória de Pontos</option>
                               </select>
                               <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                           </div>
                           <p className="text-xs text-gray-400 mt-2 ml-1">
                               {settings.gradingSystem === 'sum' 
                                ? 'As notas são somadas diretamente. Ideal para sistemas de distribuição de pontos (ex: 30pts no 1º tri).' 
                                : 'Cada nota tem um peso. A média é calculada baseada nesses pesos.'}
                           </p>
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-2 uppercase ml-1">Média para Aprovação</label>
                           <input type="number" step="0.1" className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none font-medium" value={settings.passingGrade} onChange={(e) => updateSettings({...settings, passingGrade: Number(e.target.value)})} />
                       </div>
                   </div>
              </SettingsGroup>
          </div>
      )
  }

  if (activeTab === 'subjects') {
      return (
          <div className="pb-24 max-w-2xl mx-auto animate-slide-in px-4">
              <SubPageHeader title="Matérias" subtitle="Gerencie suas matérias" onBack={() => setActiveTab('account')} />
              
              <div className="mb-8 bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                  <h3 className="font-bold text-xl mb-2 flex items-center gap-2 relative z-10"><Database size={24} /> Assistente de Grade</h3>
                  
                  {presetFlow === 'menu' && (
                      <div className="relative z-10">
                          <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                              Configure sua grade horária em segundos usando os modelos pré-definidos para o seu curso.
                          </p>
                          <button onClick={() => setPresetFlow('select_course')} className="w-full py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                              Começar Importação <ArrowLeft className="rotate-180" size={18} />
                          </button>
                      </div>
                  )}
                  
                  {presetFlow === 'select_course' && (
                      <div className="space-y-3 relative z-10">
                          <p className="text-sm text-indigo-100 mb-2 font-medium">Qual o seu curso técnico?</p>
                          <button onClick={() => { setSelectedPresetCourse('INF'); setPresetFlow('select_year'); }} className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-left flex items-center gap-4 transition-colors">
                              <div className="p-2 bg-white/20 rounded-lg"><Monitor size={20} /></div>
                              Informática
                          </button>
                          <button onClick={() => { setSelectedPresetCourse('ADM'); setPresetFlow('select_year'); }} className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-left flex items-center gap-4 transition-colors">
                              <div className="p-2 bg-white/20 rounded-lg"><Briefcase size={20} /></div>
                              Administração
                          </button>
                          <button onClick={() => setPresetFlow('menu')} className="text-xs text-indigo-200 hover:text-white mt-2 block w-full text-center">Cancelar</button>
                      </div>
                  )}

                  {presetFlow === 'select_year' && (
                      <div className="space-y-3 animate-fade-in relative z-10">
                          <p className="text-sm text-indigo-100 mb-2 font-medium">Qual sua série?</p>
                          {[1, 2, 3].map(year => (
                              <button key={year} onClick={() => handlePresetSelect(selectedPresetCourse!, year.toString())} className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold transition-colors">
                                  {year}º Ano
                              </button>
                          ))}
                          <button onClick={() => setPresetFlow('select_course')} className="text-xs text-indigo-200 hover:text-white mt-2 block w-full text-center">Voltar</button>
                      </div>
                  )}
              </div>

              <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-2">Suas Matérias</h3>
                  {subjects.map(subject => (
                      <div key={subject.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ backgroundColor: subject.color }}>
                                  {subject.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                  <h4 className="font-bold text-gray-800 dark:text-white leading-tight">{subject.name}</h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subject.teacher || 'Professor não definido'} • {subject.totalClasses}h</p>
                              </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openSubjectModal(subject)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><Pencil size={18} /></button>
                              <button onClick={() => { if(window.confirm('Excluir?')) removeSubject(subject.id); }} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={18} /></button>
                          </div>
                      </div>
                  ))}
                  <div className="h-20"></div>
              </div>

              <button onClick={() => openSubjectModal()} className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-40">
                  <Plus size={32} />
              </button>

              {isSubjectModalOpen && (
                  <ModalWrapper title={editingSubject?.id ? 'Editar Matéria' : 'Nova Matéria'} onClose={() => setIsSubjectModalOpen(false)}>
                      <form onSubmit={handleSubjectSave} className="space-y-5">
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Nome da Matéria</label>
                              <input className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Ex: Matemática" value={editingSubject?.name} onChange={e => setEditingSubject({...editingSubject, name: e.target.value})} required autoFocus />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Cor</label>
                                  <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                      <input type="color" className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent p-0" value={editingSubject?.color} onChange={e => setEditingSubject({...editingSubject, color: e.target.value})} />
                                      <span className="text-xs font-mono text-gray-500 uppercase">{editingSubject?.color}</span>
                                  </div>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Carga Horária</label>
                                  <input type="number" className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" value={editingSubject?.totalClasses} onChange={e => setEditingSubject({...editingSubject, totalClasses: Number(e.target.value)})} />
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Professor (Opcional)</label>
                              <input className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Nome do professor" value={editingSubject?.teacher} onChange={e => setEditingSubject({...editingSubject, teacher: e.target.value})} />
                          </div>
                          <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors mt-4">
                              Salvar Alterações
                          </button>
                      </form>
                  </ModalWrapper>
              )}
          </div>
      )
  }

  if (activeTab === 'schedule') {
      const activeSlots = schedule.filter(s => s.dayOfWeek === activeScheduleDay).sort((a,b) => a.startTime.localeCompare(b.startTime));
      return (
          <div className="pb-24 max-w-2xl mx-auto animate-slide-in px-4">
              <SubPageHeader title="Grade Horária" subtitle="Configure seus horários semanais" onBack={() => setActiveTab('account')} />
              
              <div className="bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex overflow-x-auto no-scrollbar">
                  {DAYS_OF_WEEK.map((day, idx) => idx > 0 && (
                      <button 
                        key={idx} 
                        onClick={() => setActiveScheduleDay(idx)} 
                        className={`flex-1 min-w-[80px] py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeScheduleDay === idx ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      >
                          {day.slice(0, 3)}
                      </button>
                  ))}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-3xl border border-gray-200 dark:border-gray-700 mb-8 border-dashed">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><Clock size={14}/> Adicionar Aula</h4>
                  <form onSubmit={handleAddSlot} className="flex flex-col gap-3">
                      <div className="relative">
                          <select className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none appearance-none font-medium" value={newSlotSubject} onChange={e => setNewSlotSubject(e.target.value)} required>
                              <option value="" disabled>Selecione a matéria...</option>
                              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                      </div>
                      <div className="flex gap-3">
                          <input type="time" className="flex-1 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono" value={newSlotStart} onChange={e => setNewSlotStart(e.target.value)} required />
                          <input type="time" className="flex-1 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono" value={newSlotEnd} onChange={e => setNewSlotEnd(e.target.value)} required />
                          <button type="submit" className="bg-indigo-600 text-white rounded-xl px-6 flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"><Plus /></button>
                      </div>
                  </form>
              </div>

              <div className="space-y-3 mb-10">
                  {activeSlots.length === 0 && <div className="text-center py-10 text-gray-400">Nenhuma aula cadastrada para {DAYS_OF_WEEK[activeScheduleDay]}.</div>}
                  {activeSlots.map(slot => { 
                      const sub = subjects.find(s => s.id === slot.subjectId); 
                      return (
                          <div key={slot.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">
                              <div className="flex items-center gap-5">
                                  <div className="flex flex-col items-center justify-center w-16 h-14 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                      <span className="block font-bold text-gray-800 dark:text-white text-sm font-mono">{slot.startTime}</span>
                                      <span className="text-[10px] text-gray-400 font-mono">{slot.endTime}</span>
                                  </div>
                                  <div>
                                      <div className="font-bold text-gray-800 dark:text-white text-lg">{sub?.name}</div>
                                      <div className="text-xs text-gray-500">{sub?.teacher}</div>
                                  </div>
                              </div>
                              <button onClick={() => updateSchedule(schedule.filter(s => s.id !== slot.id))} className="text-gray-300 hover:text-red-500 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><Trash2 size={20} /></button>
                          </div>
                      ) 
                  })}
              </div>

              <SettingsGroup title="Sábados Letivos & Exceções">
                  <div className="p-5 space-y-5">
                      <button onClick={() => { setImportStage('course'); setImportCourse(null); setIsImportModalOpen(true); }} className="w-full py-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors border border-indigo-100 dark:border-indigo-900/30">
                          <Book size={20} /> Importar Calendário
                      </button>

                      <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-4">Adicionar Manualmente</p>
                          <div className="space-y-3">
                              <input type="date" className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium" value={newSpecialDate} onChange={e => setNewSpecialDate(e.target.value)} />
                              <input type="text" placeholder="Descrição (Ex: Sábado Letivo)" className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium" value={newSpecialDesc} onChange={e => setNewSpecialDesc(e.target.value)} />
                              
                              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                                  <div className="flex justify-between mb-3 items-center">
                                      <span className="text-xs font-bold text-gray-500 uppercase">Grade do Dia</span>
                                      <button type="button" onClick={handleAddCustomSlot} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-indigo-200"><Plus size={12} /> Add</button>
                                  </div>
                                  <div className="space-y-2">
                                      {tempCustomSlots.map((slot, idx) => (
                                          <div key={idx} className="flex gap-2">
                                              <input type="time" className="w-20 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xs font-mono" value={slot.startTime} onChange={e => updateTempSlot(idx, 'startTime', e.target.value)} />
                                              <select className="flex-1 p-2 rounded-lg border dark:bg-gray-800 dark:border-gray-600 dark:text-white text-xs" value={slot.subjectId} onChange={e => updateTempSlot(idx, 'subjectId', e.target.value)}>
                                                  <option value="">Selecione...</option>
                                                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                              </select>
                                              <button onClick={() => removeTempSlot(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={16} /></button>
                                          </div>
                                      ))}
                                      {tempCustomSlots.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2">Nenhuma aula adicionada.</p>}
                                  </div>
                              </div>
                              <button onClick={handleAddSpecialDay} className="w-full py-4 bg-gray-800 dark:bg-gray-700 text-white font-bold rounded-2xl hover:bg-gray-900 transition-all shadow-lg">Salvar Dia Especial</button>
                          </div>
                      </div>

                      <div className="space-y-2 pt-2">
                          {specialDays.map(sd => (
                              <div key={sd.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                  <div>
                                      <p className="font-bold text-sm text-gray-800 dark:text-white">{sd.date}</p>
                                      <p className="text-xs text-gray-500 mt-0.5">{sd.description}</p>
                                  </div>
                                  <button onClick={() => removeSpecialDay(sd.date)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={18} /></button>
                              </div>
                          ))}
                      </div>
                  </div>
              </SettingsGroup>

              {isImportModalOpen && (
                  <ModalWrapper title="Importar Calendário" onClose={() => setIsImportModalOpen(false)}>
                          {importStage === 'course' && (
                              <div className="space-y-3">
                                  <button onClick={() => setImportCourse('INF')} className="w-full p-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl dark:text-white font-bold hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex justify-between items-center group">
                                      <span>Informática</span>
                                      <ChevronRight className="text-gray-300 group-hover:text-indigo-500" />
                                  </button>
                                  <button onClick={() => setImportCourse('ADM')} className="w-full p-4 border-2 border-gray-100 dark:border-gray-700 rounded-2xl dark:text-white font-bold hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex justify-between items-center group">
                                      <span>Administração</span>
                                      <ChevronRight className="text-gray-300 group-hover:text-indigo-500" />
                                  </button>
                                  {importCourse && <button onClick={() => setImportStage('year')} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl mt-4">Continuar</button>}
                              </div>
                          )}
                          {importStage === 'year' && (
                              <div className="space-y-3">
                                  {[1, 2, 3].map(y => <button key={y} onClick={() => handleImportSelectYear(y.toString())} className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">{y}º Ano</button>)}
                              </div>
                          )}
                          {importStage === 'processing' && (
                              <div className="text-center py-12">
                                  <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={40} />
                                  <p className="text-gray-500 font-medium">Processando calendário...</p>
                              </div>
                          )}
                  </ModalWrapper>
              )}
          </div>
      )
  }

  if (activeTab === 'backup') {
      return (
        <div className="pb-20 max-w-2xl mx-auto animate-slide-in px-4">
            <SubPageHeader title="Backup" subtitle="Sincronização e exportação de dados" onBack={() => setActiveTab('account')} />
            
            <SettingsGroup title="Nuvem">
                {!isCloudConfigured ? (
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-white text-xl mb-2">Configuração Ausente:</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed max-w-xs mx-auto">
                            As chaves da API não foram encontradas no arquivo <code>.env</code>. A sincronização na nuvem está desativada.
                        </p>
                    </div>
                ) : !cloudUser ? (
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <Cloud size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg dark:text-white">Sincronizar Dados</h3>
                                <p className="text-xs text-gray-500">Mantenha seus dados salvos na nuvem.</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleCloudLogin}
                            className="w-full py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-all active:scale-95"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                            Entrar com Google
                        </button>
                    </div>
                ) : (
                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-800">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shadow-inner relative">
                                    <Wifi size={24} />
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-white text-base">Conectado</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{cloudUser.email}</p>
                                </div>
                            </div>
                            <button onClick={handleCloudLogout} className="px-4 py-2 bg-white dark:bg-gray-800 text-red-500 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-red-50 transition-colors">Sair</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => handleCloudSync('up')}
                                disabled={isSyncing}
                                className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group active:scale-95"
                            >
                                {isSyncing ? <Loader2 className="animate-spin mb-3 text-indigo-500" size={28} /> : <Upload className="mb-3 text-indigo-500 group-hover:-translate-y-1 transition-transform" size={28} />}
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Fazer Backup</span>
                                <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">Upload</span>
                            </button>
                            <button 
                                onClick={() => handleCloudSync('down')}
                                disabled={isSyncing}
                                className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center hover:border-green-300 dark:hover:border-green-700 transition-all group active:scale-95"
                            >
                                {isSyncing ? <Loader2 className="animate-spin mb-3 text-green-500" size={28} /> : <Download className="mb-3 text-green-500 group-hover:translate-y-1 transition-transform" size={28} />}
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Restaurar</span>
                                <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">Download</span>
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-4">Última sincronização: {new Date().toLocaleDateString()}</p>
                    </div>
                )}
            </SettingsGroup>

            <SettingsGroup title="Arquivos Locais">
                <div className="p-6 grid grid-cols-2 gap-4">
                    <button onClick={handleExport} className="flex flex-col items-center justify-center gap-2 p-5 border border-gray-200 dark:border-gray-600 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                        <FileDown size={24} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Salvar JSON</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-2 p-5 border border-gray-200 dark:border-gray-600 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                        <FileUp size={24} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Abrir JSON</span>
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if(file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                                try {
                                    importData(JSON.parse(ev.target?.result as string));
                                    addToast('Dados carregados.', 'success');
                                } catch (err) { addToast('Arquivo inválido', 'error'); }
                            };
                            reader.readAsText(file);
                        }
                    }}/>
                </div>
            </SettingsGroup>
        </div>
      )
  }

  if (activeTab === 'about') {
      return (
        <div className="pb-20 max-w-2xl mx-auto animate-slide-in px-4">
            <SubPageHeader title="Sobre" onBack={() => setActiveTab('account')} />
            <div className="bg-white dark:bg-gray-800 rounded-[40px] p-10 border border-gray-200 dark:border-gray-700 shadow-xl text-center relative overflow-hidden mb-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-2xl shadow-indigo-500/30 transform hover:scale-110 transition-transform duration-500 cursor-pointer">
                    <BookTemplate size={48} />
                </div>
                <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">Diary</h2>
                <p className="text-xl text-indigo-600 dark:text-purple-400 font-bold mb-6">um app Microspace</p>
                <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-4 py-2 rounded-full">
                    <span>Desenvolvido por:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">Lucas Willian</span>
                </div>
            </div>
            <SettingsGroup title="Comunidade & Links">
                  <a href="https://forumcefet.site" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group border-b border-gray-50 dark:border-gray-700/50">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-2xl text-gray-600 dark:text-gray-300 group-hover:bg-black group-hover:text-white transition-colors"><Globe size={20} /></div>
                          <div>
                              <span className="font-bold text-gray-700 dark:text-gray-200 block">Fórum</span>
                              <span className="text-xs text-gray-400">Papos</span>
                          </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a href="https://microspace.site" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Globe size={20} /></div>
                          <div>
                              <span className="font-bold text-gray-700 dark:text-gray-200 block">Microspace</span>
                              <span className="text-xs text-gray-400">Materiais</span>
                          </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </a>
            </SettingsGroup>
            <div className="text-center pt-8 pb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Versão 2.3.0</p>
                <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-2">© {new Date().getFullYear()} Lucas Willian</p>
            </div>
        </div>
      )
  }

  return null;
};
