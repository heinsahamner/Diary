
import React, { useState, useMemo } from 'react';
import { useStore } from '../services/store';
import { TRIMESTERS } from '../constants';
import { Plus, Trash2, Calculator, Star, TrendingUp, GraduationCap, AlertTriangle, BookOpen, Target, X, LayoutGrid, List, Pencil, ChevronRight, ArrowLeft, LayoutTemplate } from 'lucide-react';
import { Assessment, SubjectType, GradingSystem, Subject, ClassStatus } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// @ts-ignore
import { useNavigate } from 'react-router-dom';

const calculateSubjectAverage = (assessments: Assessment[], subject: Subject | undefined, trimester: number | null, method: 'running' | 'absolute', globalGradingSystem: GradingSystem) => {
    if (!subject) return 0;
    const gradingSystem = subject.gradingMethod || globalGradingSystem;

    if (trimester === null) {
        let sumAverages = 0;
        let countTrimesters = 0;
        TRIMESTERS.forEach(t => {
             const tAvg = calculateSubjectAverage(assessments, subject, t, method, globalGradingSystem);
             const hasAssessments = assessments.some(a => a.subjectId === subject.id && a.trimester === t);
             if (tAvg > 0 || hasAssessments) {
                 sumAverages += tAvg;
                 countTrimesters++;
             }
        });
        
        if (countTrimesters === 0) return 0;
        
        if (method === 'absolute') return Math.min(10, sumAverages / 3);
        return Math.min(10, sumAverages / countTrimesters);
    }

    const filtered = assessments.filter(a => a.subjectId === subject.id && a.trimester === trimester);
    if (filtered.length === 0) return 0;

    let result = 0;
    if (gradingSystem === 'manual') {
        result = filtered.reduce((acc, curr) => acc + curr.value, 0);
    } else if (gradingSystem === 'sum') {
        const baseSum = filtered.filter(a => !a.isExtra).reduce((acc, curr) => acc + curr.value, 0);
        const extraSum = filtered.filter(a => a.isExtra).reduce((acc, curr) => acc + curr.value, 0);
        result = baseSum + extraSum;
    } else {
        const normal = filtered.filter(a => !a.isExtra);
        const extra = filtered.filter(a => a.isExtra);
        let totalWeight = 0;
        let weightedSum = 0;
        normal.forEach(a => {
            weightedSum += (a.value * a.weight);
            totalWeight += a.weight;
        });
        const baseAvg = totalWeight === 0 ? 0 : weightedSum / totalWeight;
        const extraPoints = extra.reduce((acc, curr) => acc + curr.value, 0);
        result = baseAvg + extraPoints;
    }
    return Math.min(10, Math.max(0, result));
};

export const Grades: React.FC = () => {
  const { subjects, assessments, addAssessment, removeAssessment, updateAssessment, settings, logs, schedule, validations } = useStore();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<'overview' | 'detail' | 'cards'>('overview');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects.find(s => s.type === SubjectType.NORMAL)?.id || '');
  const [activeTrimester, setActiveTrimester] = useState<number>(1);
  const [showSimulator, setShowSimulator] = useState(false);
  const [targetGrade, setTargetGrade] = useState(settings.passingGrade);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newWeight, setNewWeight] = useState('1');
  const [isExtra, setIsExtra] = useState(false);
  
  const reportCard = useMemo(() => {
      return subjects
        .filter(s => s.type === SubjectType.NORMAL)
        .map(sub => {
            const t1 = calculateSubjectAverage(assessments, sub, 1, settings.gradeCalcMethod, settings.gradingSystem || 'average');
            const t2 = calculateSubjectAverage(assessments, sub, 2, settings.gradeCalcMethod, settings.gradingSystem || 'average');
            const t3 = calculateSubjectAverage(assessments, sub, 3, settings.gradeCalcMethod, settings.gradingSystem || 'average');
            const final = calculateSubjectAverage(assessments, sub, null, settings.gradeCalcMethod, settings.gradingSystem || 'average');

            const subjectLogs = logs.filter(l => l.actualSubjectId === sub.id && l.status !== ClassStatus.CANCELED);
            const absences = subjectLogs.filter(l => l.status === ClassStatus.ABSENT).length;
            
            let classesHeld = 0;
            validations.forEach(v => {
                const d = new Date(v.date + 'T00:00:00').getDay();
                const slots = schedule.filter(s => s.dayOfWeek === d && s.subjectId === sub.id);
                classesHeld += slots.length;
            });
            if (classesHeld === 0) classesHeld = Math.max(1, subjectLogs.length);
            
            const attendance = classesHeld > 0 ? ((classesHeld - absences) / classesHeld) * 100 : 100;

            return { subject: sub, t1, t2, t3, final, attendance, absences };
        });
  }, [subjects, assessments, logs, validations, schedule, settings]);

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const activeGradingSystem = currentSubject?.gradingMethod || settings.gradingSystem || 'average';
  
  const subjectAssessments = useMemo(() => {
      return assessments.filter(a => a.subjectId === selectedSubjectId && a.trimester === activeTrimester);
  }, [assessments, selectedSubjectId, activeTrimester]);

  const stats = useMemo(() => {
      if (!currentSubject) return { t1: 0, t2: 0, t3: 0, final: 0, attendance: 100, trend: [], absences: 0 };
      const data = reportCard.find(r => r.subject.id === currentSubject.id);
      if (!data) return { t1: 0, t2: 0, t3: 0, final: 0, attendance: 100, trend: [], absences: 0 };

      const trend = [
          { name: 'T1', score: data.t1 },
          { name: 'T2', score: data.t2 },
          { name: 'T3', score: data.t3 },
      ];
      return { ...data, trend, classesHeld: 0 };
  }, [currentSubject, reportCard]);

  const openForm = (assessment?: Assessment) => {
      if (assessment) {
          setEditingId(assessment.id);
          setNewName(assessment.name);
          setNewValue(assessment.value.toString());
          setNewWeight(assessment.weight.toString());
          setIsExtra(assessment.isExtra || false);
      } else {
          setEditingId(null);
          setNewName('');
          setNewValue('');
          setNewWeight('1');
          setIsExtra(false);
      }
      setIsFormOpen(true);
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newValue) return;
    let val = parseFloat(newValue);
    if (isNaN(val)) return;
    if (val < 0) val = 0;
    if (val > 10) val = 10; 

    const newAssessment: Assessment = {
      id: editingId || Date.now().toString(),
      subjectId: selectedSubjectId,
      trimester: activeTrimester as 1|2|3,
      name: newName,
      value: val,
      weight: parseFloat(newWeight) || 1,
      date: new Date().toISOString(),
      isExtra: isExtra
    };

    if (editingId) {
        updateAssessment(newAssessment);
    } else {
        addAssessment(newAssessment);
    }

    setNewName('');
    setNewValue('');
    setIsExtra(false);
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubjectSelect = (id: string) => {
      setSelectedSubjectId(id);
      setViewMode('detail');
  };

  const handleAddNewSubject = () => {
      navigate('/settings?action=new_subject');
  };

  const simulationResult = useMemo(() => {
      if(!currentSubject) return null;
      
      const t1 = stats.t1 || 0;
      const t2 = stats.t2 || 0;
      const t3 = stats.t3 || 0;
      
      const hasT1 = assessments.some(a => a.subjectId === selectedSubjectId && a.trimester === 1);
      const hasT2 = assessments.some(a => a.subjectId === selectedSubjectId && a.trimester === 2);
      const hasT3 = assessments.some(a => a.subjectId === selectedSubjectId && a.trimester === 3);

      let missingCount = 0;
      if (!hasT1) missingCount++;
      if (!hasT2) missingCount++;
      if (!hasT3) missingCount++;

      if (missingCount === 0) return null;

      const currentSum = t1 + t2 + t3; 
      const totalNeeded = targetGrade * 3;
      const neededPoints = totalNeeded - currentSum;
      
      const neededPerTrim = neededPoints / missingCount;
      return neededPerTrim > 0 ? neededPerTrim.toFixed(1) : 0;
  }, [stats, targetGrade, assessments, selectedSubjectId, currentSubject]);


  return (
    <div className="pb-20 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Boletim Escolar</h1>
              <button 
                onClick={handleAddNewSubject}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-110 active:scale-95"
                title="Adicionar Matéria"
              >
                  <Plus size={20} />
              </button>
          </div>
          <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-xl w-full md:w-auto">
              <button 
                onClick={() => setViewMode('overview')}
                className={`flex-1 md:flex-none p-2 rounded-lg transition-all ${viewMode === 'overview' ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                title="Visão Geral"
              >
                  <LayoutGrid size={20} className="mx-auto md:mx-0" />
              </button>
              <button 
                onClick={() => setViewMode('cards')}
                className={`flex-1 md:flex-none p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                title="Cartões"
              >
                  <LayoutTemplate size={20} className="mx-auto md:mx-0" />
              </button>
              <button 
                onClick={() => setViewMode('detail')}
                className={`flex-1 md:flex-none p-2 rounded-lg transition-all ${viewMode === 'detail' ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                title="Detalhes"
              >
                  <List size={20} className="mx-auto md:mx-0" />
              </button>
          </div>
      </div>

      {viewMode === 'overview' && (
          <div className="animate-fade-in">
              {reportCard.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                      <p className="text-gray-500">Nenhuma matéria cadastrada.</p>
                  </div>
              ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase text-xs font-bold">
                                  <tr>
                                      <th className="px-6 py-4 text-left">Matéria</th>
                                      <th className="px-4 py-4 text-center">T1</th>
                                      <th className="px-4 py-4 text-center">T2</th>
                                      <th className="px-4 py-4 text-center">T3</th>
                                      <th className="px-6 py-4 text-center text-indigo-600 dark:text-purple-400">Final</th>
                                      <th className="px-6 py-4 text-center">Freq.</th>
                                      <th className="px-4 py-4"></th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                  {reportCard.map((row) => (
                                      <tr 
                                        key={row.subject.id} 
                                        onClick={() => handleSubjectSelect(row.subject.id)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group"
                                      >
                                          <td className="px-6 py-4">
                                              <div className="flex items-center gap-3">
                                                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor: row.subject.color}} />
                                                  <span className="font-bold text-gray-800 dark:text-white">{row.subject.name}</span>
                                              </div>
                                          </td>
                                          <td className="px-4 py-4 text-center text-gray-600 dark:text-gray-300">
                                              {row.t1 > 0 ? row.t1.toFixed(1) : '-'}
                                          </td>
                                          <td className="px-4 py-4 text-center text-gray-600 dark:text-gray-300">
                                              {row.t2 > 0 ? row.t2.toFixed(1) : '-'}
                                          </td>
                                          <td className="px-4 py-4 text-center text-gray-600 dark:text-gray-300">
                                              {row.t3 > 0 ? row.t3.toFixed(1) : '-'}
                                          </td>
                                          <td className="px-6 py-4 text-center">
                                              <span className={`font-bold px-2 py-1 rounded-lg ${
                                                  row.final < settings.passingGrade 
                                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                                                  : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                              }`}>
                                                  {row.final.toFixed(1)}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4 text-center">
                                              <div className="flex flex-col items-center">
                                                  <span className={`font-bold ${row.attendance < 75 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                      {Math.round(row.attendance)}%
                                                  </span>
                                                  <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                                      <div 
                                                        className={`h-full rounded-full ${row.attendance < 75 ? 'bg-red-500' : 'bg-green-500'}`}
                                                        style={{width: `${row.attendance}%`}}
                                                      />
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-4 py-4 text-right">
                                              <ChevronRight className="text-gray-300 group-hover:text-indigo-500 transition-colors" size={20} />
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}
          </div>
      )}

      {viewMode === 'cards' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportCard.map(row => (
                  <div 
                    key={row.subject.id}
                    onClick={() => handleSubjectSelect(row.subject.id)}
                    className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group hover:scale-[1.02]"
                    style={{ backgroundColor: row.subject.color }}
                  >
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent pointer-events-none" />
                      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

                      <div className="relative p-6 text-white h-full flex flex-col justify-between">
                          <div>
                              <div className="flex justify-between items-start mb-4">
                                  <h3 className="text-xl font-bold leading-tight drop-shadow-md">{row.subject.name}</h3>
                                  <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              
                              <div className="flex gap-2 mb-6">
                                  <div className="flex flex-col items-center bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[3rem]">
                                      <span className="text-[10px] uppercase font-bold opacity-70">T1</span>
                                      <span className="font-bold text-lg">{row.t1 > 0 ? row.t1.toFixed(1) : '-'}</span>
                                  </div>
                                  <div className="flex flex-col items-center bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[3rem]">
                                      <span className="text-[10px] uppercase font-bold opacity-70">T2</span>
                                      <span className="font-bold text-lg">{row.t2 > 0 ? row.t2.toFixed(1) : '-'}</span>
                                  </div>
                                  <div className="flex flex-col items-center bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[3rem]">
                                      <span className="text-[10px] uppercase font-bold opacity-70">T3</span>
                                      <span className="font-bold text-lg">{row.t3 > 0 ? row.t3.toFixed(1) : '-'}</span>
                                  </div>
                              </div>
                          </div>

                          <div>
                              <div className="flex justify-between text-xs font-bold mb-1 opacity-90">
                                  <span>Frequência</span>
                                  <span>{Math.round(row.attendance)}%</span>
                              </div>
                              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${row.attendance < 75 ? 'bg-red-400' : 'bg-white'}`}
                                    style={{width: `${row.attendance}%`}}
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
              ))}
              <button 
                onClick={handleAddNewSubject}
                className="rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center p-6 text-gray-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all min-h-[200px] group"
              >
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 flex items-center justify-center mb-3 transition-colors">
                      <Plus size={24} className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  </div>
                  <span className="font-bold">Nova Matéria</span>
              </button>
          </div>
      )}

      {viewMode === 'detail' && currentSubject && (
        <div className="animate-fade-in space-y-6">
            
            <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
                {subjects.filter(s => s.type === SubjectType.NORMAL).map(sub => (
                    <button
                        key={sub.id}
                        onClick={() => setSelectedSubjectId(sub.id)}
                        className={`
                            flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all whitespace-nowrap flex-shrink-0
                            ${selectedSubjectId === sub.id 
                            ? 'bg-indigo-600 dark:bg-purple-600 border-indigo-600 dark:border-purple-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105' 
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}
                        `}
                    >
                        <div className="w-2 h-2 rounded-full bg-white" style={{backgroundColor: selectedSubjectId === sub.id ? 'white' : sub.color}} />
                        <span className="font-bold text-sm">{sub.name}</span>
                    </button>
                ))}
                <button 
                    onClick={handleAddNewSubject}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-dashed border-gray-300 text-gray-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50 transition-all whitespace-nowrap flex-shrink-0"
                >
                    <Plus size={16} />
                    <span className="font-bold text-sm">Adicionar</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-purple-900/20 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                    <div className="relative z-10">
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Média Anual</p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-5xl font-bold ${stats.final < settings.passingGrade ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                                {stats.final.toFixed(1)}
                            </span>
                            <span className="text-gray-400 text-sm">/ 10</span>
                        </div>
                        {stats.final < settings.passingGrade && (
                            <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
                                <AlertTriangle size={12} /> Abaixo da média
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <GraduationCap size={18} />
                            </div>
                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Presença</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                            {stats.attendance.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-400">
                            {stats.absences} faltas registradas
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-1 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                        <p className="absolute top-4 left-4 text-xs font-bold text-gray-400 z-10">Evolução</p>
                        <div className="w-full h-full pt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.trend}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" hide />
                                    <YAxis domain={[0, 10]} hide />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                        itemStyle={{color: '#4f46e5', fontWeight: 'bold'}}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100 dark:border-gray-700">
                    {TRIMESTERS.map(t => (
                        <button
                            key={t}
                            onClick={() => setActiveTrimester(t)}
                            className={`flex-1 py-4 text-sm font-bold transition-colors relative ${
                                activeTrimester === t 
                                ? 'text-indigo-600 dark:text-purple-400 bg-indigo-50/50 dark:bg-gray-700/50' 
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            }`}
                        >
                            {t}º Trimestre
                            {activeTrimester === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-purple-500"></div>}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Avaliações</h3>
                            <p className="text-xs text-gray-400">
                                {activeGradingSystem === 'average' ? 'Média Ponderada' : activeGradingSystem === 'sum' ? 'Somatória' : 'Manual'}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm text-gray-400 mr-2">Média do Trimestre</span>
                            <span className={`text-2xl font-bold ${(stats as any)[`t${activeTrimester}`] < settings.passingGrade ? 'text-red-500' : 'text-green-500'}`}>
                                {(stats as any)[`t${activeTrimester}`].toFixed(1)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {subjectAssessments.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                <BookOpen className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-400 text-sm">Nenhuma nota lançada.</p>
                                <button onClick={() => openForm()} className="mt-4 text-indigo-600 dark:text-purple-400 font-bold text-sm hover:underline">
                                    Adicionar primeira nota
                                </button>
                            </div>
                        ) : (
                            subjectAssessments.map(a => (
                                <div 
                                    key={a.id} 
                                    onClick={() => openForm(a)}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-purple-800 transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${a.value >= settings.passingGrade ? 'bg-green-400' : 'bg-red-400'}`}>
                                            {a.value}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                                {a.name}
                                                {a.isExtra && <Star size={12} className="text-yellow-500 fill-yellow-500" />}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {activeGradingSystem === 'average' && !a.isExtra ? `Peso ${a.weight}` : 'Ponto Extra'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Pencil size={16} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {isFormOpen ? (
                        <form onSubmit={handleSaveAssessment} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 animate-scale-in">
                            <div className="flex justify-between mb-4">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">{editingId ? 'Editar Nota' : 'Nova Nota'}</h4>
                                <button type="button" onClick={() => {setIsFormOpen(false); setEditingId(null);}}><X size={18} className="text-gray-400" /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                                <input 
                                    type="text" placeholder="Nome (Ex: Prova 1)" 
                                    className="md:col-span-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newName} onChange={e => setNewName(e.target.value)} autoFocus
                                />
                                <div className="relative">
                                    <input 
                                        type="number" step="0.1" placeholder="Nota"
                                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none no-spinner"
                                        value={newValue} onChange={e => setNewValue(e.target.value)}
                                    />
                                    <span className="absolute right-2 top-2 text-[10px] text-gray-400 pointer-events-none">/10</span>
                                </div>
                                {activeGradingSystem === 'average' && !isExtra && (
                                    <input 
                                        type="number" step="0.1" placeholder="Peso"
                                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none no-spinner"
                                        value={newWeight} onChange={e => setNewWeight(e.target.value)}
                                    />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                                    <input type="checkbox" checked={isExtra} onChange={e => setIsExtra(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                                    É ponto extra?
                                </label>
                                <div className="flex gap-2">
                                    {editingId && (
                                        <button 
                                            type="button" 
                                            onClick={() => { removeAssessment(editingId); setIsFormOpen(false); setEditingId(null); }}
                                            className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-bold"
                                        >
                                            Excluir
                                        </button>
                                    )}
                                    <button type="submit" className="bg-indigo-600 dark:bg-purple-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700">
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <button 
                            onClick={() => openForm()}
                            className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 font-bold hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-purple-500 dark:hover:text-purple-400 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={20} /> Adicionar Nota
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <button 
                    onClick={() => setShowSimulator(!showSimulator)}
                    className="flex items-center gap-2 text-indigo-600 dark:text-purple-400 font-bold text-sm hover:underline mb-4"
                >
                    <Calculator size={16} />
                    {showSimulator ? 'Ocultar Simulador' : 'Simular Notas Futuras'}
                </button>
                
                {showSimulator && (
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 p-6 rounded-3xl border border-orange-200 dark:border-orange-800/50 animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h4 className="font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2">
                                    <Target size={20} />
                                    Objetivo Final
                                </h4>
                                <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                                    Quanto você quer tirar de média anual?
                                </p>
                                <div className="mt-3 flex items-center gap-3">
                                    <input 
                                        type="range" min="0" max="10" step="0.5"
                                        value={targetGrade} onChange={e => setTargetGrade(Number(e.target.value))}
                                        className="w-48 accent-orange-500"
                                    />
                                    <span className="font-bold text-xl text-orange-700 dark:text-orange-100">{targetGrade}</span>
                                </div>
                            </div>

                            <div className="text-right">
                                {simulationResult !== null ? (
                                    <>
                                        <p className="text-sm text-orange-600 dark:text-orange-300">Você precisa de média</p>
                                        <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{simulationResult}</p>
                                        <p className="text-xs text-orange-500">nos próximos trimestres</p>
                                    </>
                                ) : (
                                    <p className="text-sm font-bold text-green-600">Todas as notas já foram lançadas!</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};