import React, { useState, useRef } from 'react';
import { useStore } from '../services/store';
import { useToast } from '../components/Toast';
import { SubjectType, Subject, ScheduleSlot, GradingSystem, SubjectCategory } from '../types';
import { 
    Plus, X, Trash2, Moon, Sun, Database, FileUp, FileDown, 
    Pencil, LogOut, Info, Github, Linkedin, Globe, BookTemplate, 
    ChevronRight, ArrowLeft, GraduationCap, Calendar, 
    LayoutGrid, Settings as SettingsIcon, Upload, Loader2, Clock, User, Zap, Palette, Bell
} from 'lucide-react';
import { DAYS_OF_WEEK, PREDEFINED_GRADEBOOKS } from '../constants';
import { DBService } from '../services/db';

export const Settings: React.FC = () => {
  const { subjects, addSubject, updateSubject, removeSubject, schedule, updateSchedule, settings, updateSettings, importData, currentUser, logout } = useStore();
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
      addToast('Aula adicionada ao horário.', 'success');
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
                    label="Acadêmico" 
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
                    value="v2.0.1" 
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
              <SubPageHeader title="Configurações Acadêmicas" />
              
              <SettingsGroup title="Ano Letivo">
                   <div className="p-4">
                       <label className="block text-xs font-bold text-gray-500 mb-1.5">Ano Atual</label>
                       <select
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={settings.currentYear}
                            onChange={(e) => updateSettings({...settings, currentYear: Number(e.target.value)})}
                       >
                           {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                               <option key={y} value={y}>{y}</option>
                           ))}
                       </select>
                       <p className="text-xs text-gray-400 mt-2">Alterar o ano mudará o banco de dados ativo. Suas notas de outros anos ficam salvas separadamente.</p>
                   </div>
                   <div className="p-4 pt-0">
                       <label className="block text-xs font-bold text-gray-500 mb-1.5">Total de Dias Letivos</label>
                       <input 
                            type="number"
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={settings.totalSchoolDays}
                            onChange={(e) => updateSettings({...settings, totalSchoolDays: Number(e.target.value)})}
                        />
                   </div>
              </SettingsGroup>

              <SettingsGroup title="Critérios de Avaliação">
                   <div className="p-4">
                       <label className="block text-xs font-bold text-gray-500 mb-1.5">Sistema de Notas</label>
                       <select
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
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
                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={settings.passingGrade}
                            onChange={(e) => updateSettings({...settings, passingGrade: Number(e.target.value)})}
                        />
                   </div>
              </SettingsGroup>
          </div>
      )
  }

  if (activeTab === 'backup') {
      return (
        <div className="pb-20 max-w-2xl mx-auto animate-slide-in">
            <SubPageHeader title="Backup e Sincronização" />
            
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
                        <input type="text" value={serverUrl} onChange={e => setServerUrl(e.target.value)} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm dark:text-white text-gray-900 outline-none focus:ring-2 focus:ring-purple-500" />
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
                    <span>Desenvolvido por</span>
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

            <SettingsGroup title="Links">
                  <a href="https://forumcefet.site" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:bg-black group-hover:text-white transition-colors">
                              <User size={20} />
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-200">Fórum</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                  </a>
                  <a href="https://microspace.forumcefet.site" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              <Globe size={20} />
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-200">Microspace</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                  </a>
                  <a href="https://notes.forumcefet.site" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                              <Pencil size={20} />
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-200">Notes</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                  </a>
            </SettingsGroup>

            <div className="text-center pt-8 pb-4">
                <p className="text-xs text-gray-400 font-medium">Versão 2.0.0</p>
                <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">© {new Date().getFullYear()} Lucas Willian. Todos os direitos reservados.</p>
            </div>
        </div>
      )
  }


  if (activeTab === 'subjects') {
      return (
          <div className="pb-20 max-w-4xl mx-auto animate-slide-in">
             <SubPageHeader title="Gerenciar Matérias" />
             
              {presetFlow === 'menu' && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-lg">Configuração Rápida</h3>
                        <p className="text-indigo-100 text-sm opacity-90">Carregue uma grade curricular completa (ADM, INFO) em um clique.</p>
                    </div>
                    <button 
                        onClick={() => setPresetFlow('select_course')}
                        className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors"
                    >
                        Carregar Predefinição
                    </button>
                </div>
              )}

              {presetFlow === 'select_course' && (
                   <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 animate-slide-in mb-6">
                       <button onClick={() => setPresetFlow('menu')} className="text-sm text-gray-500 mb-4 flex items-center hover:text-indigo-600"><ArrowLeft size={16} className="mr-1"/> Cancelar</button>
                       <h3 className="font-bold text-gray-800 dark:text-white mb-4">Selecione o Curso</h3>
                       <div className="grid grid-cols-2 gap-4">
                           {Object.keys(PREDEFINED_GRADEBOOKS).map(course => (
                               <button 
                                key={course} 
                                onClick={() => { setSelectedPresetCourse(course); setPresetFlow('select_year'); }}
                                className="p-4 border-2 border-gray-100 dark:border-gray-700 rounded-xl font-bold text-xl hover:border-indigo-500 dark:hover:border-purple-500 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all"
                               >
                                   {course}
                               </button>
                           ))}
                       </div>
                   </div>
              )}

              {presetFlow === 'select_year' && selectedPresetCourse && (
                   <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 animate-slide-in mb-6">
                       <button onClick={() => setPresetFlow('select_course')} className="text-sm text-gray-500 mb-4 flex items-center hover:text-indigo-600"><ArrowLeft size={16} className="mr-1"/> Voltar</button>
                       <h3 className="font-bold text-gray-800 dark:text-white mb-4">Selecione o Ano ({selectedPresetCourse})</h3>
                       <div className="space-y-2">
                           {Object.keys(PREDEFINED_GRADEBOOKS[selectedPresetCourse]).map(year => (
                               <button 
                                key={year} 
                                onClick={() => handlePresetSelect(selectedPresetCourse, year)}
                                className="w-full flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors group"
                               >
                                   <span className="font-bold text-gray-800 dark:text-white">{year}º Ano</span>
                                   <div className="flex items-center text-gray-400 group-hover:text-indigo-600">
                                        <span className="text-xs mr-2">{PREDEFINED_GRADEBOOKS[selectedPresetCourse][year].subjects.length} Matérias</span>
                                        <ChevronRight size={18} />
                                   </div>
                               </button>
                           ))}
                       </div>
                   </div>
              )}

              <div className="flex justify-between items-end mb-4">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200">Suas Matérias ({subjects.length})</h3>
                  <button onClick={() => openSubjectModal()} className="flex items-center gap-2 text-indigo-600 dark:text-purple-400 font-bold text-sm hover:underline">
                      <Plus size={16} /> Nova
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map(sub => (
                      <div key={sub.id} className="group relative bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-2">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{backgroundColor: sub.color}}>
                                  {sub.name.charAt(0)}
                              </div>
                              <div className="flex gap-1">
                                  <button onClick={() => openSubjectModal(sub)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Pencil size={16} /></button>
                                  <button onClick={() => removeSubject(sub.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={16} /></button>
                              </div>
                          </div>
                          <h4 className="font-bold text-gray-800 dark:text-white truncate" title={sub.name}>{sub.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">{sub.teacher || 'Sem professor'}</p>
                          <div className="flex gap-2 text-[10px]">
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">{sub.type === SubjectType.NORMAL ? 'Normal' : 'Extra'}</span>
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">{sub.totalClasses} Aulas</span>
                          </div>
                      </div>
                  ))}
              </div>

              {isSubjectModalOpen && editingSubject && (
                  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                              <h3 className="font-bold text-gray-800 dark:text-white">{editingSubject.id ? 'Editar Matéria' : 'Nova Matéria'}</h3>
                              <button onClick={() => setIsSubjectModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                          </div>
                          <form onSubmit={handleSubjectSave} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Nome</label>
                                    <input type="text" value={editingSubject.name} onChange={e => setEditingSubject({...editingSubject, name: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" autoFocus placeholder="Ex: História" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Professor</label>
                                        <input type="text" value={editingSubject.teacher || ''} onChange={e => setEditingSubject({...editingSubject, teacher: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white" placeholder="Opcional" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Cor</label>
                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-xl border border-gray-200 dark:border-gray-600">
                                            <input type="color" value={editingSubject.color} onChange={e => setEditingSubject({...editingSubject, color: e.target.value})} className="w-8 h-8 rounded border-none cursor-pointer" />
                                            <span className="text-xs text-gray-500 uppercase">{editingSubject.color}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Aulas Anuais</label>
                                        <input type="number" value={editingSubject.totalClasses} onChange={e => setEditingSubject({...editingSubject, totalClasses: Number(e.target.value)})} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Tipo</label>
                                        <select value={editingSubject.type} onChange={e => setEditingSubject({...editingSubject, type: e.target.value as SubjectType})} className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white">
                                            <option value={SubjectType.NORMAL}>Normal</option>
                                            <option value={SubjectType.ORGANIZATIONAL}>Organizacional</option>
                                            <option value={SubjectType.EXTENSION}>Extensão</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors">{editingSubject.id ? 'Salvar' : 'Criar'}</button>
                          </form>
                      </div>
                  </div>
              )}
          </div>
      )
  }

  if (activeTab === 'schedule') {
      return (
          <div className="pb-20 max-w-5xl mx-auto animate-slide-in">
             <SubPageHeader title="Grade Horária" />
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="space-y-6">
                   <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                       <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dia da Semana</h3>
                       <div className="flex flex-wrap gap-2">
                           {DAYS_OF_WEEK.map((day, idx) => (
                               <button 
                                key={idx}
                                onClick={() => setActiveScheduleDay(idx)}
                                className={`flex-1 min-w-[80px] py-2 rounded-lg text-sm font-bold transition-all ${activeScheduleDay === idx ? 'bg-indigo-100 dark:bg-purple-900/30 text-indigo-700 dark:text-purple-300 ring-1 ring-indigo-500 dark:ring-purple-500' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                               >
                                   {day}
                               </button>
                           ))}
                       </div>
                   </div>

                   <div className="bg-indigo-50 dark:bg-gray-800 p-6 rounded-2xl border border-indigo-100 dark:border-gray-700 shadow-sm">
                       <h3 className="font-bold text-indigo-900 dark:text-white mb-4">Adicionar Aula</h3>
                       <form onSubmit={handleAddSlot} className="space-y-4">
                           <div className="flex gap-2">
                               <div className="flex-1">
                                   <label className="text-xs font-bold text-indigo-400 mb-1 block">Início</label>
                                   <input type="time" value={newSlotStart} onChange={e => setNewSlotStart(e.target.value)} className="w-full p-2 rounded-lg border border-indigo-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" required />
                               </div>
                               <div className="flex-1">
                                   <label className="text-xs font-bold text-indigo-400 mb-1 block">Fim</label>
                                   <input type="time" value={newSlotEnd} onChange={e => setNewSlotEnd(e.target.value)} className="w-full p-2 rounded-lg border border-indigo-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" required />
                               </div>
                           </div>
                           <div>
                               <label className="text-xs font-bold text-indigo-400 mb-1 block">Matéria</label>
                               <select value={newSlotSubject} onChange={e => setNewSlotSubject(e.target.value)} className="w-full p-2 rounded-lg border border-indigo-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" required>
                                   <option value="" disabled>Selecione...</option>
                                   {subjects.filter(s => s.id !== 'vago').map(s => (
                                       <option key={s.id} value={s.id}>{s.name}</option>
                                   ))}
                               </select>
                           </div>
                           <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors shadow-sm">
                               Adicionar
                           </button>
                       </form>
                   </div>
               </div>

               <div className="lg:col-span-2">
                   <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                       <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                           <h3 className="font-bold text-gray-700 dark:text-white">{DAYS_OF_WEEK[activeScheduleDay]}</h3>
                           <span className="text-xs text-gray-500 dark:text-gray-400">
                               {schedule.filter(s => s.dayOfWeek === activeScheduleDay).length} Aulas
                           </span>
                       </div>
                       
                       <div className="divide-y divide-gray-100 dark:divide-gray-700">
                           {schedule.filter(s => s.dayOfWeek === activeScheduleDay).length === 0 ? (
                               <div className="p-8 text-center text-gray-400">
                                   <Clock size={32} className="mx-auto mb-2 opacity-50" />
                                   <p>Nenhuma aula neste dia.</p>
                               </div>
                           ) : (
                               schedule
                                .filter(s => s.dayOfWeek === activeScheduleDay)
                                .sort((a,b) => a.startTime.localeCompare(b.startTime))
                                .map(slot => {
                                   const sub = subjects.find(s => s.id === slot.subjectId);
                                   return (
                                       <div key={slot.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                           <div className="flex items-center gap-4">
                                               <div className="w-20 text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-center">
                                                   {slot.startTime}<br/><span className="text-xs opacity-70">{slot.endTime}</span>
                                               </div>
                                               <div className="flex items-center gap-3">
                                                   <div className="w-3 h-3 rounded-full" style={{backgroundColor: sub?.color}} />
                                                   <div>
                                                       <p className="font-bold text-gray-800 dark:text-white">{sub?.name}</p>
                                                       <p className="text-xs text-gray-400">{sub?.teacher}</p>
                                                   </div>
                                               </div>
                                           </div>
                                           <button 
                                            onClick={() => {
                                                updateSchedule(schedule.filter(s => s.id !== slot.id));
                                                addToast('Aula removida', 'info');
                                            }}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                           >
                                               <Trash2 size={18} />
                                           </button>
                                       </div>
                                   )
                                })
                           )}
                       </div>
                   </div>
               </div>
          </div>
          </div>
      )
  }

  return null;
};