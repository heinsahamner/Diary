import React, { useState } from 'react';
import { useStore } from '../services/store';
import { TRIMESTERS } from '../constants';
import { Plus, Trash2, Calculator, Star } from 'lucide-react';
import { Assessment, SubjectType, GradingSystem } from '../types';

const calculateSubjectAverage = (assessments: Assessment[], subjectId: string, trimester: number | null, method: 'running' | 'absolute', gradingSystem: GradingSystem) => {
    
    if (trimester === null) {
        let sumAverages = 0;
        let countTrimesters = 0;
        
        TRIMESTERS.forEach(t => {
             const tAvg = calculateSubjectAverage(assessments, subjectId, t, method, gradingSystem);
             if (tAvg > 0 || assessments.some(a => a.subjectId === subjectId && a.trimester === t)) {
                 sumAverages += tAvg;
                 countTrimesters++;
             }
        });

        if (countTrimesters === 0) return 0;
        if (method === 'absolute') return Math.min(10, sumAverages / 3);
        return Math.min(10, sumAverages / countTrimesters);
    }

    const filtered = assessments.filter(a => a.subjectId === subjectId && a.trimester === trimester);
    if (filtered.length === 0) return 0;

    let result = 0;

    if (gradingSystem === 'manual') {
        result = filtered.reduce((acc, curr) => acc + curr.value, 0);
    }
    else if (gradingSystem === 'sum') {
        const baseSum = filtered.filter(a => !a.isExtra).reduce((acc, curr) => acc + curr.value, 0);
        const extraSum = filtered.filter(a => a.isExtra).reduce((acc, curr) => acc + curr.value, 0);
        result = baseSum + extraSum;
    }
    else {
        const normalAssessments = filtered.filter(a => !a.isExtra);
        const extraAssessments = filtered.filter(a => a.isExtra);
        
        let totalWeight = 0;
        let weightedSum = 0;
        
        normalAssessments.forEach(a => {
            weightedSum += (a.value * a.weight);
            totalWeight += a.weight;
        });
        
        const baseAvg = totalWeight === 0 ? 0 : weightedSum / totalWeight;
        const extraPoints = extraAssessments.reduce((acc, curr) => acc + curr.value, 0);
        
        result = baseAvg + extraPoints;
    }
    
    return Math.min(10, Math.max(0, result));
};

export const Grades: React.FC = () => {
  const { subjects, assessments, addAssessment, removeAssessment, settings } = useStore();
  const [activeTab, setActiveTab] = useState<'details' | 'overview'>('details');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedTrimester, setSelectedTrimester] = useState<number>(1);
  
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newWeight, setNewWeight] = useState('1');
  const [isExtra, setIsExtra] = useState(false);

  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const subjectAssessments = assessments.filter(a => 
    a.subjectId === selectedSubjectId && a.trimester === selectedTrimester
  );

  const currentTrimesterAvg = calculateSubjectAverage(assessments, selectedSubjectId, selectedTrimester, settings.gradeCalcMethod, settings.gradingSystem || 'average');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newValue) return;
    
    let val = parseFloat(newValue);
    if (isNaN(val)) return;
    
    if (val < 0) val = 0;
    if (val > 10) val = 10; 

    const assessment: Assessment = {
      id: Date.now().toString(),
      subjectId: selectedSubjectId,
      trimester: selectedTrimester as 1|2|3,
      name: newName,
      value: val,
      weight: parseFloat(newWeight) || 1,
      date: new Date().toISOString(),
      isExtra: isExtra
    };

    addAssessment(assessment);
    setNewName('');
    setNewValue('');
    setIsExtra(false);
  };

  const neededScore = (() => {
     if (settings.gradeCalcMethod !== 'absolute') return null;
     
     let currentSum = 0;
     let passedTrimesters = 0;
     TRIMESTERS.forEach(t => {
         const hasAssessments = assessments.some(a => a.subjectId === selectedSubjectId && a.trimester === t);
         if (hasAssessments) {
             currentSum += calculateSubjectAverage(assessments, selectedSubjectId, t, 'absolute', settings.gradingSystem || 'average');
             passedTrimesters++;
         }
     });

     const totalNeeded = settings.passingGrade * 3;
     const remainingScore = totalNeeded - currentSum;
     const remainingTrimesters = 3 - passedTrimesters;

     if (remainingTrimesters <= 0) return null;
     
     const neededPerTri = remainingScore / remainingTrimesters;
     return Math.max(0, neededPerTri).toFixed(1);
  })();

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Notas e Avaliações</h1>
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex">
            <button 
                onClick={() => setActiveTab('details')}
                className={`px-4 py-1.5 rounded-md font-bold text-sm transition-all ${activeTab === 'details' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-purple-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
                Lançamentos
            </button>
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-1.5 rounded-md font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-purple-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
            >
                Visão Geral
            </button>
        </div>
      </div>

      {activeTab === 'details' && (
      <>
        <div className="flex space-x-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto max-w-full">
           {subjects.length === 0 ? (
               <div className="p-2 text-sm text-gray-500 italic">Cadastre matérias nos Ajustes para começar.</div>
           ) : (
            subjects.filter(s => s.type === SubjectType.NORMAL).map(sub => (
             <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-3 py-1 text-sm rounded-md transition-colors whitespace-nowrap ${
                    selectedSubjectId === sub.id 
                    ? 'bg-indigo-600 dark:bg-purple-600 text-white shadow' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
             >
                {sub.name}
             </button>
            ))
           )}
        </div>

        {subjects.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Entry Form & Trimester Select */}
            <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Trimester Tabs */}
                <div className="flex space-x-4 border-b border-gray-100 dark:border-gray-700 pb-4 mb-4 overflow-x-auto">
                    {TRIMESTERS.map(t => (
                        <button
                            key={t}
                            onClick={() => setSelectedTrimester(t)}
                            className={`pb-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                selectedTrimester === t 
                                ? 'border-indigo-600 dark:border-purple-500 text-indigo-600 dark:text-purple-400' 
                                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            }`}
                        >
                            {t}º Trimestre
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-3 mb-6">
                    {subjectAssessments.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-4">Nenhuma nota lançada neste período.</p>
                    ) : (
                        subjectAssessments.map(a => (
                            <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-800 dark:text-white">{a.name}</p>
                                        {a.isExtra && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 rounded-full font-bold">Extra</span>}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {settings.gradingSystem === 'average' && !a.isExtra ? `Peso: ${a.weight}` : 
                                         settings.gradingSystem === 'sum' ? 'Pontos somados' : ''}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`text-lg font-bold ${a.value < settings.passingGrade ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                                        {a.value.toFixed(1)}
                                    </span>
                                    <button onClick={() => removeAssessment(a.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Form */}
                <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <input 
                        type="text" 
                        placeholder="Nome (Ex: Prova)" 
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                    />
                    <div className="flex gap-2">
                        <div className="relative">
                            <input 
                                type="number" 
                                placeholder="Nota" 
                                step="0.1"
                                min="0" max="10"
                                className="w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none no-spinner"
                                value={newValue}
                                onChange={e => setNewValue(e.target.value)}
                                required
                            />
                            <span className="absolute right-1 top-2 text-[10px] text-gray-400 pointer-events-none">0-10</span>
                        </div>
                         
                         {/* Only show weight if Average system and NOT Extra point */}
                         {settings.gradingSystem === 'average' && !isExtra && (
                             <div className="relative">
                                <input 
                                    type="number" 
                                    placeholder="Peso" 
                                    step="0.1"
                                    className="w-16 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none no-spinner"
                                    value={newWeight}
                                    onChange={e => setNewWeight(e.target.value)}
                                    required
                                />
                                <span className="absolute right-1 top-2 text-[10px] text-gray-400 pointer-events-none">Peso</span>
                             </div>
                         )}

                         <button 
                            type="button" 
                            onClick={() => setIsExtra(!isExtra)}
                            className={`p-2 rounded-lg border transition-colors ${isExtra ? 'bg-yellow-100 border-yellow-300 text-yellow-600' : 'border-gray-300 dark:border-gray-600 text-gray-400'}`}
                            title="Ponto Extra"
                         >
                             <Star size={18} fill={isExtra ? "currentColor" : "none"} />
                         </button>
                    </div>
                    <button type="submit" className="bg-indigo-600 dark:bg-purple-600 text-white p-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-purple-700 transition-colors">
                        <Plus size={20} />
                    </button>
                </form>
            </div>
            </div>

            {/* Right Col: Summary */}
            <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-purple-700 dark:to-indigo-900 p-6 rounded-2xl text-white shadow-lg">
                    <h3 className="text-indigo-100 text-sm font-medium mb-1">Média {selectedTrimester}º Trimestre</h3>
                    <div className="text-5xl font-bold mb-2">{currentTrimesterAvg.toFixed(2)}</div>
                    <div className="flex flex-col text-indigo-200 text-xs gap-1">
                        <span>Sistema: {settings.gradingSystem === 'sum' ? 'Somatória' : settings.gradingSystem === 'manual' ? 'Manual' : 'Média Ponderada'}</span>
                        <span>{subjectAssessments.length} lançamentos</span>
                    </div>
            </div>
            
            {/* Simulator Widget */}
            {neededScore && (
                 <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/50">
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-2">
                        <Calculator size={20} />
                        <h3 className="font-bold">Simulador</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Para passar com {settings.passingGrade}, você precisa de:
                    </p>
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{neededScore}</div>
                    <p className="text-xs text-gray-400 mt-1">
                        nos próximos trimestres.
                    </p>
                 </div>
            )}
            </div>
        </div>
        )}
      </>
      )}

      {activeTab === 'overview' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 uppercase font-bold text-xs">
                          <tr>
                              <th className="px-6 py-4">Matéria</th>
                              <th className="px-6 py-4 text-center">1º Tri</th>
                              <th className="px-6 py-4 text-center">2º Tri</th>
                              <th className="px-6 py-4 text-center">3º Tri</th>
                              <th className="px-6 py-4 text-center text-indigo-600 dark:text-purple-400">Final</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-900 dark:text-gray-200">
                          {subjects.filter(s => s.type === SubjectType.NORMAL).map(sub => {
                              const t1 = calculateSubjectAverage(assessments, sub.id, 1, settings.gradeCalcMethod, settings.gradingSystem || 'average');
                              const t2 = calculateSubjectAverage(assessments, sub.id, 2, settings.gradeCalcMethod, settings.gradingSystem || 'average');
                              const t3 = calculateSubjectAverage(assessments, sub.id, 3, settings.gradeCalcMethod, settings.gradingSystem || 'average');
                              const final = calculateSubjectAverage(assessments, sub.id, null, settings.gradeCalcMethod, settings.gradingSystem || 'average');
                              
                              return (
                                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: sub.color}} />
                                          {sub.name}
                                      </td>
                                      <td className="px-6 py-4 text-center">{t1 > 0 ? t1.toFixed(1) : '-'}</td>
                                      <td className="px-6 py-4 text-center">{t2 > 0 ? t2.toFixed(1) : '-'}</td>
                                      <td className="px-6 py-4 text-center">{t3 > 0 ? t3.toFixed(1) : '-'}</td>
                                      <td className={`px-6 py-4 text-center font-bold ${final < settings.passingGrade ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                                          {final > 0 ? final.toFixed(1) : '-'}
                                      </td>
                                  </tr>
                              )
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};
