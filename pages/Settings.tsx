import React, { useState, useRef } from 'react';
import { useStore } from '../services/store';
import { SubjectType, Subject, ScheduleSlot, Subject as SubjectTypeInterface, GradeCalcMethod, GradingSystem, SubjectCategory } from '../types';
import { Plus, X, Trash2, Save, Moon, Sun, Bell, Database, FileUp, FileDown, Pencil, LogOut, Info, ExternalLink, Upload, Loader2, Github, Linkedin, Globe, BookTemplate, PenTool, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { DAYS_OF_WEEK, PREDEFINED_GRADEBOOKS } from '../constants';
import { DBService } from '../services/db';

export const Settings: React.FC = () => {
  const { subjects, addSubject, updateSubject, removeSubject, schedule, updateSchedule, settings, updateSettings, importData, currentUser, logout } = useStore();
  const [activeTab, setActiveTab] = useState<'preferences' | 'academic' | 'data' | 'subjects' | 'schedule' | 'about'>('preferences');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [subjectViewMode, setSubjectViewMode] = useState<'menu' | 'manual' | 'preset'>('menu');
  const [presetCourse, setPresetCourse] = useState<string | null>(null);

  const [serverUrl, setServerUrl] = useState('https://nao-tem-backup-ainda.sorry');
  const [isUploading, setIsUploading] = useState(false);

  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subName, setSubName] = useState('');
  const [subColor, setSubColor] = useState('#6366f1');
  const [subClasses, setSubClasses] = useState(80);
  const [subType, setSubType] = useState<SubjectType>(SubjectType.NORMAL);
  const [subTeacher, setSubTeacher] = useState('');
  const [subCategory, setSubCategory] = useState<SubjectCategory>(SubjectCategory.OTHER);
  const [subGradingMethod, setSubGradingMethod] = useState<GradingSystem | ''>('');

  const [schedDay, setSchedDay] = useState(1);
  const [schedStart, setSchedStart] = useState('07:00');
  const [schedEnd, setSchedEnd] = useState('07:50');
  const [schedSubject, setSchedSubject] = useState(subjects[0]?.id || '');

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!subName) return;

    const subjectData: SubjectTypeInterface = {
        id: editingSubjectId || Date.now().toString(),
        name: subName,
        color: subColor,
        totalClasses: subClasses,
        type: subType,
        teacher: subTeacher,
        category: subCategory,
        gradingMethod: subGradingMethod === '' ? undefined : subGradingMethod
    };

    if (editingSubjectId) {
        updateSubject(subjectData);
        setEditingSubjectId(null);
    } else {
        addSubject(subjectData);
    }
    
    setSubName('');
    setSubTeacher('');
    setSubClasses(80);
    setSubColor('#6366f1');
    setSubType(SubjectType.NORMAL);
    setSubCategory(SubjectCategory.OTHER);
    setSubGradingMethod('');
  };

  const handleEditClick = (s: Subject) => {
      setSubjectViewMode('manual'); 
      setEditingSubjectId(s.id);
      setSubName(s.name);
      setSubColor(s.color);
      setSubClasses(s.totalClasses);
      setSubType(s.type);
      setSubTeacher(s.teacher || '');
      setSubCategory(s.category || SubjectCategory.OTHER);
      setSubGradingMethod(s.gradingMethod || '');
  };

  const handleCancelEdit = () => {
      setEditingSubjectId(null);
      setSubName('');
      setSubTeacher('');
      setSubClasses(80);
      setSubColor('#6366f1');
      setSubType(SubjectType.NORMAL);
      setSubCategory(SubjectCategory.OTHER);
      setSubGradingMethod('');
  }
  
  const handlePresetSelect = (course: string, year: string) => {
      const template = PREDEFINED_GRADEBOOKS[course]?.[year];
      if (template) {
          if (window.confirm(`Isso irá configurar ${template.subjects.length} matérias e ${template.schedule.length} aulas na sua grade. As matérias 'Reposição' e 'Horário Vago' serão atualizadas. Deseja continuar?`)) {              
              
            const createdSubjectIds: string[] = [];
              template.subjects.forEach((t, index) => {

                  if (t.name === 'Reposição') {
                      createdSubjectIds.push('reposicao');
                      updateSubject({
                          id: 'reposicao',
                          name: t.name,
                          color: t.color || '#9ca3af',
                          totalClasses: t.totalClasses || 0,
                          type: t.type || SubjectType.ORGANIZATIONAL,
                          category: t.category || SubjectCategory.OTHER,
                          gradingMethod: undefined
                      });
                      return; 
                  }
                  
                  if (t.name === 'Horário Vago' || t.name === 'Vago') {
                      createdSubjectIds.push('vago');
                      updateSubject({
                          id: 'vago',
                          name: t.name || 'Horário Vago',
                          color: t.color || '#9ca3af',
                          totalClasses: 0,
                          type: SubjectType.ORGANIZATIONAL,
                          category: SubjectCategory.OTHER,
                          gradingMethod: undefined
                      });
                      return;
                  }

                  const newId = Date.now().toString() + index;
                  createdSubjectIds.push(newId);
                  
                  const newSubject: SubjectTypeInterface = {
                      id: newId,
                      name: t.name || 'Nova Matéria',
                      color: t.color || '#ccc',
                      totalClasses: t.totalClasses || 80,
                      type: t.type || SubjectType.NORMAL,
                      category: t.category || SubjectCategory.OTHER,
                      gradingMethod: undefined 
                  };
                  addSubject(newSubject);
              });

              const newSlots: ScheduleSlot[] = template.schedule.map((slot, idx) => ({
                  id: Date.now().toString() + '_slot_' + idx,
                  dayOfWeek: slot.day,
                  startTime: slot.start,
                  endTime: slot.end,
                  subjectId: createdSubjectIds[slot.subjectIndex] || ''
              })).filter(s => s.subjectId !== '');

              if (newSlots.length > 0) {
                  const updatedSchedule = [...schedule, ...newSlots].sort((a,b) => a.startTime.localeCompare(b.startTime));
                  updateSchedule(updatedSchedule);
              }

              alert('Grade predefinida carregada com sucesso!');
              setSubjectViewMode('manual');
          }
      }
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedSubject) return;

    const newSlot: ScheduleSlot = {
      id: Date.now().toString(),
      dayOfWeek: schedDay,
      startTime: schedStart,
      endTime: schedEnd,
      subjectId: schedSubject
    };

    const newSchedule = [...schedule, newSlot].sort((a,b) => a.startTime.localeCompare(b.startTime));
    updateSchedule(newSchedule);
  };

  const removeSlot = (id: string) => {
    updateSchedule(schedule.filter(s => s.id !== id));
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
    } else {
        alert("Sem dados para exportar.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          importData(parsed);
          alert('Dados importados com sucesso!');
        } catch (error) {
          alert('Erro ao importar arquivo. Formato inválido.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCloudUpload = async () => {
      setIsUploading(true);
      const success = await DBService.uploadBackupToServer(currentUser, serverUrl);
      setIsUploading(false);
      if(success) alert('Backup enviado com sucesso para o servidor!');
      else alert('Erro ao enviar backup. Verifique o console.');
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({length: 5}, (_, i) => currentYear - 2 + i);

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Configurações</h1>
      
      <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
          {[
              { id: 'preferences', label: 'Preferências' },
              { id: 'academic', label: 'Acadêmico' },
              { id: 'subjects', label: 'Matérias' },
              { id: 'schedule', label: 'Grade' },
              { id: 'data', label: 'Dados' },
              { id: 'about', label: 'Sobre' }
          ].map(tab => (
               <button 
                key={tab.id}
                className={`pb-3 px-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'border-b-2 border-indigo-600 dark:border-purple-500 text-indigo-600 dark:text-purple-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id !== 'subjects') {
                        setSubjectViewMode('menu');
                        setPresetCourse(null);
                    } else if (subjects.length > 2) {
                         setSubjectViewMode('manual');
                    }
                }}
              >
                  {tab.label}
              </button>
          ))}
      </div>

      {activeTab === 'preferences' && (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-lg space-y-6">
            <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4">Perfil e Aparência</h3>
            
            <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-700">
                 <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-purple-900/50 flex items-center justify-center text-indigo-600 dark:text-purple-400 font-bold text-lg">
                         {currentUser.charAt(0).toUpperCase()}
                     </div>
                     <div>
                         <p className="font-semibold text-gray-800 dark:text-white">Conectado como {currentUser}</p>
                         <button onClick={logout} className="text-xs text-red-500 hover:underline flex items-center mt-1">
                             <LogOut size={12} className="mr-1" /> Sair / Trocar Usuário
                         </button>
                     </div>
                 </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-50 dark:bg-gray-700 rounded-lg text-indigo-600 dark:text-purple-400">
                        {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">Modo Escuro</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Alterar tema da aplicação</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings.darkMode}
                        onChange={(e) => updateSettings({...settings, darkMode: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-purple-600"></div>
                </label>
            </div>
         </div>
      )}

      {activeTab === 'academic' && (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-lg space-y-6">
            <h3 className="font-bold text-gray-700 dark:text-gray-200">Ano Letivo e Avaliação</h3>
            
            <div className="p-4 bg-indigo-50 dark:bg-purple-900/20 rounded-xl border border-indigo-100 dark:border-purple-800">
                <label className="block text-sm font-bold text-indigo-800 dark:text-purple-300 mb-2">Ano Letivo Ativo</label>
                <select
                    className="w-full p-2 border border-indigo-200 dark:border-purple-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                    value={settings.currentYear}
                    onChange={(e) => updateSettings({...settings, currentYear: Number(e.target.value)})}
                >
                    {yearOptions.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                <p className="text-xs text-indigo-500 dark:text-purple-400 mt-2">
                    Alterar o ano carrega um novo banco de dados. Dados de anos anteriores são preservados.
                </p>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Sistema de Notas Padrão</label>
               <select
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={settings.gradingSystem || 'average'}
                  onChange={(e) => updateSettings({...settings, gradingSystem: e.target.value as GradingSystem})}
               >
                   <option value="average">Média Ponderada</option>
                   <option value="sum">Somatória de Pontos</option>
                   <option value="manual">Entrada Manual (Calculadora Desativada)</option>
               </select>
               <p className="text-xs text-gray-400 mt-2">
                   Este é o método padrão. Você pode alterar por matéria individualmente.
               </p>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Cálculo da Média Anual</label>
               <select
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={settings.gradeCalcMethod}
                  onChange={(e) => updateSettings({...settings, gradeCalcMethod: e.target.value as GradeCalcMethod})}
               >
                   <option value="absolute">Absoluta (Divide por 3 Trimestres)</option>
                   <option value="running">Corrente (Considera apenas trimestres com nota)</option>
               </select>
            </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Média Azul</label>
                    <input 
                        type="number" 
                        step="0.1"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white no-spinner"
                        value={settings.passingGrade}
                        onChange={(e) => updateSettings({...settings, passingGrade: Number(e.target.value)})}
                    />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Dias Letivos</label>
                   <input 
                      type="number" 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white no-spinner"
                      value={settings.totalSchoolDays}
                      onChange={(e) => updateSettings({...settings, totalSchoolDays: Number(e.target.value)})}
                   />
                </div>
            </div>
         </div>
      )}

      {activeTab === 'data' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6 h-fit">
                <h3 className="font-bold text-gray-700 dark:text-gray-200">Arquivo Local (Manual)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={handleExport}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-500 dark:hover:border-purple-500 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all text-gray-600 dark:text-gray-300"
                    >
                        <FileDown size={32} className="mb-2" />
                        <span className="font-bold">Baixar Backup</span>
                        <span className="text-xs text-gray-400 mt-1">.json</span>
                    </button>

                    <button 
                        onClick={handleImportClick}
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-500 dark:hover:border-purple-500 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all text-gray-600 dark:text-gray-300"
                    >
                        <FileUp size={32} className="mb-2" />
                        <span className="font-bold">Restaurar</span>
                        <span className="text-xs text-gray-400 mt-1">.json</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                </div>
                
                <p className="text-xs text-gray-400">
                    Use esta opção para salvar seus dados no Google Drive ou iCloud manualmente.
                </p>
             </div>

             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6 h-fit">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-purple-400">
                    <Upload size={24} />
                    <h3 className="font-bold text-gray-700 dark:text-gray-200">Backup na Nuvem</h3>
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">URL do Servidor</label>
                    <input 
                        type="text" 
                        value={serverUrl}
                        onChange={e => setServerUrl(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <button 
                    onClick={handleCloudUpload}
                    disabled={isUploading}
                    className="w-full bg-indigo-600 dark:bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                    {isUploading ? 'Enviando...' : 'Enviar Backup Agora'}
                </button>

                 <div className="p-3 bg-indigo-50 dark:bg-purple-900/20 rounded-lg border border-indigo-100 dark:border-purple-900/50">
                    <p className="text-xs text-indigo-700 dark:text-purple-300">
                        Esta função envia uma cópia criptografada dos seus dados para o servidor configurado acima.
                    </p>
                </div>
             </div>
          </div>
      )}

      {activeTab === 'subjects' && (
          <div>
            {subjectViewMode === 'menu' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto py-10">
                    <button 
                        onClick={() => setSubjectViewMode('preset')}
                        className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-purple-500 hover:shadow-md transition-all group"
                    >
                        <div className="w-16 h-16 bg-indigo-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <BookTemplate className="text-indigo-600 dark:text-purple-400" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Grade Predefinida</h3>
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            Carregar matérias automaticamente a partir de um curso existente (ADM, INFO).
                        </p>
                    </button>

                    <button 
                        onClick={() => setSubjectViewMode('manual')}
                        className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-purple-500 hover:shadow-md transition-all group"
                    >
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <PenTool className="text-gray-600 dark:text-gray-300" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Criar Grade</h3>
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            Adicionar matérias manualmente, uma por uma, personalizando cores e professores.
                        </p>
                    </button>
                </div>
            )}

            {subjectViewMode === 'preset' && (
                <div className="max-w-2xl mx-auto">
                    <button 
                        onClick={() => { setPresetCourse(null); setSubjectViewMode('menu'); }}
                        className="flex items-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white mb-6"
                    >
                        <ArrowLeft size={20} className="mr-2" /> Voltar
                    </button>

                    {!presetCourse ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Selecione o Curso</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.keys(PREDEFINED_GRADEBOOKS).map(course => (
                                    <button 
                                        key={course}
                                        onClick={() => setPresetCourse(course)}
                                        className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-purple-500 transition-all font-bold text-xl text-gray-700 dark:text-gray-200"
                                    >
                                        {course}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Selecione o Ano ({presetCourse})</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {Object.keys(PREDEFINED_GRADEBOOKS[presetCourse]).map(year => (
                                    <button 
                                        key={year}
                                        onClick={() => handlePresetSelect(presetCourse, year)}
                                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-purple-500 transition-all group"
                                    >
                                        <div className="text-left">
                                            <span className="font-bold text-gray-800 dark:text-white block">{year}º Ano</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{PREDEFINED_GRADEBOOKS[presetCourse][year].subjects.length} Matérias</span>
                                        </div>
                                        <ChevronRight className="text-gray-400 group-hover:text-indigo-500" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {subjectViewMode === 'manual' && (
                <>
                <div className="flex items-center justify-between mb-6">
                    <button 
                        onClick={() => setSubjectViewMode('menu')}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                    >
                        <ArrowLeft size={16} className="mr-1" /> Menu de Grade
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Matérias Atuais ({settings.currentYear})</h3>
                        {subjects.map(s => (
                            <div key={s.id} className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all ${editingSubjectId === s.id ? 'border-indigo-500 ring-1 ring-indigo-200 dark:border-purple-500' : 'border-gray-200 dark:border-gray-700'}`}>
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: s.color }} />
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">{s.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{s.category || 'Outros'} • {s.totalClasses} Aulas</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEditClick(s)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-purple-400 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                        <Pencil size={18} />
                                    </button>
                                    <button onClick={() => removeSubject(s.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {subjects.length === 0 && <p className="text-sm text-gray-400 italic">Nenhuma matéria cadastrada para este ano.</p>}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 h-fit">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700 dark:text-gray-200">{editingSubjectId ? 'Editar Matéria' : 'Adicionar Matéria'}</h3>
                            {editingSubjectId && (
                                <button onClick={handleCancelEdit} className="text-xs text-gray-500 hover:text-red-500">Cancelar</button>
                            )}
                        </div>
                        <form onSubmit={handleSubjectSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Nome</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    value={subName}
                                    onChange={e => setSubName(e.target.value)}
                                    required
                                    placeholder="Ex: Matemática"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Professor(a)</label>
                                        <input 
                                            type="text" 
                                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            value={subTeacher}
                                            onChange={e => setSubTeacher(e.target.value)}
                                            placeholder="Opcional"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Categoria (Perfil)</label>
                                        <select
                                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            value={subCategory}
                                            onChange={e => setSubCategory(e.target.value as SubjectCategory)}
                                        >
                                            {Object.values(SubjectCategory).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Cor</label>
                                    <input 
                                        type="color" 
                                        className="w-full h-10 p-1 rounded-lg border border-gray-300 dark:border-gray-600"
                                        value={subColor}
                                        onChange={e => setSubColor(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Total Aulas (Ano)</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white no-spinner"
                                        value={subClasses}
                                        onChange={e => setSubClasses(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Tipo</label>
                                    <select 
                                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={subType}
                                        onChange={e => setSubType(e.target.value as SubjectType)}
                                    >
                                        <option value={SubjectType.NORMAL}>Normal (Conta Notas)</option>
                                        <option value={SubjectType.ORGANIZATIONAL}>Organizacional</option>
                                        <option value={SubjectType.EXTENSION}>Extensão</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Sistema de Notas</label>
                                    <select 
                                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        value={subGradingMethod}
                                        onChange={e => setSubGradingMethod(e.target.value as GradingSystem)}
                                    >
                                        <option value="">Padrão ({settings.gradingSystem === 'sum' ? 'Soma' : 'Média'})</option>
                                        <option value="average">Média Ponderada</option>
                                        <option value="sum">Somatória</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className={`w-full text-white py-2 rounded-lg font-bold transition-colors ${editingSubjectId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 dark:bg-purple-600 hover:bg-indigo-700 dark:hover:bg-purple-700'}`}>
                                {editingSubjectId ? 'Salvar Alterações' : 'Adicionar'}
                            </button>
                        </form>
                    </div>
                </div>
                </>
            )}
          </div>
      )}

      {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 h-fit">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4">Adicionar Aula</h3>
                  <form onSubmit={handleAddSlot} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Dia da Semana</label>
                          <select 
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={schedDay}
                            onChange={e => setSchedDay(Number(e.target.value))}
                          >
                            {DAYS_OF_WEEK.map((d, i) => (
                                <option key={i} value={i}>{d}</option>
                            ))}
                          </select>
                      </div>
                      <div className="flex gap-4">
                          <div className="flex-1">
                             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Início</label>
                             <input 
                                type="time" 
                                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={schedStart}
                                onChange={e => setSchedStart(e.target.value)}
                                required
                             />
                          </div>
                          <div className="flex-1">
                             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Fim</label>
                             <input 
                                type="time" 
                                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={schedEnd}
                                onChange={e => setSchedEnd(e.target.value)}
                                required
                             />
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Matéria</label>
                          <select 
                            className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={schedSubject}
                            onChange={e => setSchedSubject(e.target.value)}
                          >
                            {subjects.filter(s => s.id !== 'vago').map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 dark:bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 dark:hover:bg-purple-700">
                          Adicionar à Grade
                      </button>
                  </form>
              </div>

              <div className="lg:col-span-2 space-y-6">
                 {DAYS_OF_WEEK.map((dayName, index) => {
                     const daySlots = schedule.filter(s => s.dayOfWeek === index).sort((a,b) => a.startTime.localeCompare(b.startTime));
                     if (daySlots.length === 0) return null;

                     return (
                         <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                             <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 font-bold text-gray-700 dark:text-white">
                                 {dayName}
                             </div>
                             <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                 {daySlots.map(slot => {
                                     const sub = subjects.find(s => s.id === slot.subjectId);
                                     return (
                                         <div key={slot.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                                             <div className="flex items-center space-x-4">
                                                 <div className="text-sm font-mono text-gray-500 dark:text-gray-400 w-24">
                                                     {slot.startTime} - {slot.endTime}
                                                 </div>
                                                 <div className="flex items-center space-x-2">
                                                     <div className="w-3 h-3 rounded-full" style={{backgroundColor: sub?.color || '#ccc'}} />
                                                     <span className="font-medium text-gray-800 dark:text-gray-200">{sub?.name}</span>
                                                 </div>
                                             </div>
                                             <button onClick={() => removeSlot(slot.id)} className="text-gray-300 hover:text-red-500">
                                                 <Trash2 size={16} />
                                             </button>
                                         </div>
                                     )
                                 })}
                             </div>
                         </div>
                     )
                 })}
                 {schedule.length === 0 && (
                     <div className="text-center p-8 text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                         Nenhuma aula cadastrada. Use o formulário para montar sua grade.
                     </div>
                 )}
              </div>
          </div>
      )}

      {activeTab === 'about' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-2xl mx-auto text-center space-y-8">
              <div>
                  <h2 className="text-3xl font-bold text-indigo-600 dark:text-purple-400 mb-2">Diary</h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">um app Microspace</p>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">versão 1.2.2</p>
              </div>

              <div className="bg-indigo-50 dark:bg-purple-900/10 p-4 rounded-xl inline-block">
                  <p className="text-gray-700 dark:text-gray-200 text-sm">
                      Criado por <strong className="text-indigo-700 dark:text-purple-300">Lucas Willian</strong>
                  </p>
              </div>

              <div className="text-left space-y-4 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                  <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
                      <Info size={18} className="mr-2 text-indigo-500" />
                      Como usar
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 list-disc list-inside">
                      <li>Configure suas matérias e grade horária na aba <strong>Ajustes</strong>.</li>
                      <li>Use o <strong>Diário</strong> para registrar presenças e faltas.</li>
                      <li>Acompanhe seu desempenho e notas em <strong>Notas</strong> e <strong>Análise</strong>.</li>
                      <li>Gerencie seus trabalhos e provas em <strong>Tarefas</strong>.</li>
                  </ul>
              </div>

              <div className="flex justify-center space-x-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <a href="#" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-1 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <Globe size={20} />
                      </div>
                      <span className="text-xs">Notes</span>
                  </a>
                  <a href="https://microspace.forumcefet.site" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <Globe size={20} />
                      </div>
                      <span className="text-xs">Microspace</span>
                  </a>
                  <a href="https://forumcefet.site" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-1 text-gray-500 hover:text-indigo-600 dark:hover:text-purple-400 transition-colors">
                       <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <Globe size={20} />
                      </div>
                      <span className="text-xs">Fórum</span>
                  </a>
              </div>
          </div>
      )}
    </div>
  );
};