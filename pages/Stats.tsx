import React, { useMemo, useState } from 'react';
import { useStore } from '../services/store';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Label, ReferenceLine, ScatterChart, Scatter, ZAxis, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  LineChart, Line, CartesianGrid, Legend 
} from 'recharts';
import { SubjectType, ClassStatus, SubjectCategory } from '../types';
import { Printer, UserCircle, TrendingUp, AlertTriangle, CheckCircle, ShieldAlert, Award, GraduationCap, AlertOctagon, Activity } from 'lucide-react';

const getAvg = (assessments: any[], subjectId: string, trimester?: number) => {
    const filtered = assessments.filter(a => 
        a.subjectId === subjectId && 
        (trimester ? a.trimester === trimester : true)
    );
    if (filtered.length === 0) return 0;
    
    let wSum = 0;
    let wTotal = 0;
    const normal = filtered.filter(a => !a.isExtra);
    const extra = filtered.filter(a => a.isExtra);

    normal.forEach(a => {
        wSum += (a.value * a.weight);
        wTotal += a.weight;
    });
    
    const baseAvg = wTotal > 0 ? (wSum / wTotal) : 0;
    const extraPoints = extra.reduce((acc: number, c: any) => acc + c.value, 0);
    return Math.min(10, baseAvg + extraPoints);
};

export const Stats: React.FC = () => {
  const { subjects, logs, schedule, validations, assessments, settings, currentUser } = useStore();
  const normalSubjects = subjects.filter(s => s.type === SubjectType.NORMAL);

  const subjectStats = useMemo(() => {
     return normalSubjects.map(sub => {
         const limit = Math.floor(sub.totalClasses * 0.25);
         const absences = logs.filter(l => l.actualSubjectId === sub.id && l.status === ClassStatus.ABSENT).length;
         const bank = limit - absences;
         const absencePercentage = limit > 0 ? (absences / limit) * 100 : 0;
         
         const t1 = getAvg(assessments, sub.id, 1);
         const t2 = getAvg(assessments, sub.id, 2);
         const t3 = getAvg(assessments, sub.id, 3);
         
         let final = 0;
         if (settings.gradeCalcMethod === 'absolute') {
             final = (t1 + t2 + t3) / 3;
         } else {
             let count = 0;
             if(t1>0 || assessments.some(a=>a.subjectId===sub.id && a.trimester===1)) count++; 
             if(t2>0 || assessments.some(a=>a.subjectId===sub.id && a.trimester===2)) count++; 
             if(t3>0 || assessments.some(a=>a.subjectId===sub.id && a.trimester===3)) count++;
             final = count > 0 ? (t1+t2+t3)/count : 0;
         }

         let classesHeld = 0;
         let classesPresent = 0;
         
         validations.forEach(val => {
             const d = new Date(val.date + 'T00:00:00').getDay();
             const slots = schedule.filter(s => s.dayOfWeek === d && s.subjectId === sub.id);
             
             slots.forEach(slot => {
                 const log = logs.find(l => l.date === val.date && l.slotId === slot.id);
                 if (log?.status === ClassStatus.CANCELED) return;
                 if (log?.actualSubjectId && log.actualSubjectId !== sub.id) return;
                 
                 classesHeld++;
                 if (!log || log.status === ClassStatus.PRESENT || log.status === ClassStatus.SUBSTITUTED) {
                     classesPresent++;
                 }
             });

             const logsIn = logs.filter(l => l.date === val.date && l.actualSubjectId === sub.id && l.originalSubjectId !== sub.id);
             logsIn.forEach(l => {
                 if (l.status !== ClassStatus.CANCELED) {
                    classesHeld++;
                    if (l.status === ClassStatus.PRESENT || l.status === ClassStatus.SUBSTITUTED) classesPresent++;
                 }
             });
         });
         
         if (classesHeld === 0) classesHeld = 1; 

         const freq = (classesPresent / classesHeld) * 100;

         return {
             ...sub,
             classesHeld,
             classesPresent,
             freqRaw: freq,
             freq: freq.toFixed(0),
             absences,
             bank,
             limit,
             absencePercentage,
             t1, t2, t3,
             final,
             finalFixed: final.toFixed(1),
             isRiskGrade: final < settings.passingGrade && final > 0,
             isRiskAbsence: bank <= (limit * 0.2)
         };
     });
  }, [normalSubjects, logs, validations, schedule, assessments, settings]);

  const kpis = useMemo(() => {
      const totalSubjects = subjectStats.length;
      if (totalSubjects === 0) return { avg: 0, attendance: 0, atRisk: 0, bestSub: null };

      const sumFinal = subjectStats.reduce((acc, s) => acc + s.final, 0);
      const globalAvg = sumFinal / totalSubjects;

      const sumFreq = subjectStats.reduce((acc, s) => acc + s.freqRaw, 0);
      const globalFreq = sumFreq / totalSubjects;

      const atRiskCount = subjectStats.filter(s => s.isRiskGrade || s.isRiskAbsence).length;
      
      const bestSub = [...subjectStats].sort((a,b) => b.final - a.final)[0];

      return {
          avg: globalAvg.toFixed(1),
          attendance: globalFreq.toFixed(0),
          atRisk: atRiskCount,
          bestSub
      };
  }, [subjectStats]);

  const evolutionData = useMemo(() => {
      const calcGlobalT = (key: 't1' | 't2' | 't3') => {
          const validSubjects = subjectStats.filter(s => s[key] > 0);
          if (validSubjects.length === 0) return 0;
          return validSubjects.reduce((acc, s) => acc + s[key], 0) / validSubjects.length;
      };

      return [
          { name: '1º Trim', avg: calcGlobalT('t1'), passing: settings.passingGrade },
          { name: '2º Trim', avg: calcGlobalT('t2'), passing: settings.passingGrade },
          { name: '3º Trim', avg: calcGlobalT('t3'), passing: settings.passingGrade },
      ];
  }, [subjectStats, settings]);

  const radarData = useMemo(() => {
      const cats = Object.values(SubjectCategory);
      return cats.map(cat => {
          const subs = subjectStats.filter(s => (s.category || SubjectCategory.OTHER) === cat);
          if (subs.length === 0) return { subject: cat.split(' ')[0], A: 0, fullMark: 10 };
          
          const sum = subs.reduce((acc, curr) => acc + curr.final, 0);
          const avg = sum / subs.length;
          return { subject: cat.split(' ')[0], fullLabel: cat, A: avg, fullMark: 10 };
      }).filter(d => d.A > 0);
  }, [subjectStats]);

  const absenceData = useMemo(() => {
      return [...subjectStats]
        .sort((a,b) => b.absencePercentage - a.absencePercentage)
        .slice(0, 5)
        .map(s => ({
            name: s.name,
            used: s.absences,
            limit: s.limit,
            percentage: s.absencePercentage,
            color: s.color
        }));
  }, [subjectStats]);

  const scatterData = subjectStats.map(s => ({
      x: s.freqRaw,
      y: s.final,
      z: 1,
      name: s.name,
      fill: s.color
  }));

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
          <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Central de Análise</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Visão 360º do seu desempenho</p>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors print:hidden"
          >
              <Printer size={18} />
              <span className="hidden md:inline">Relatório PDF</span>
          </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-3 text-indigo-600 dark:text-purple-400 mb-2">
                  <Activity size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Média Global</span>
              </div>
              <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-800 dark:text-white">{kpis.avg}</span>
                  <span className="text-xs text-gray-400 mb-1">/ 10</span>
              </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
                  <GraduationCap size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Presença</span>
              </div>
              <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-800 dark:text-white">{kpis.attendance}%</span>
              </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${kpis.atRisk > 0 ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
              <div className={`flex items-center gap-3 mb-2 ${kpis.atRisk > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {kpis.atRisk > 0 ? <ShieldAlert size={20} /> : <CheckCircle size={20} />}
                  <span className={`text-xs font-bold uppercase tracking-wider ${kpis.atRisk > 0 ? 'text-red-500' : 'text-gray-500'}`}>Em Risco</span>
              </div>
              <div>
                  <span className={`text-3xl font-bold ${kpis.atRisk > 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>{kpis.atRisk}</span>
                  <span className="text-xs ml-2 opacity-60">Matérias</span>
              </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-3 text-yellow-500 mb-2">
                  <Award size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Destaque</span>
              </div>
              <div>
                  <span className="text-lg font-bold text-gray-800 dark:text-white truncate block" title={kpis.bestSub?.name}>
                      {kpis.bestSub?.name || '-'}
                  </span>
                  <span className="text-xs text-green-500 font-bold">{kpis.bestSub?.finalFixed || 0} de Média</span>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-bold text-gray-700 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-indigo-500" />
                  Evolução Anual
              </h3>
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolutionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                          <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend />
                          <ReferenceLine y={settings.passingGrade} label={{ value: 'Média', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }} stroke="#ef4444" strokeDasharray="3 3" />
                          <Line type="monotone" dataKey="avg" name="Média Geral" stroke="#6366f1" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="font-bold text-gray-700 dark:text-white mb-2 flex items-center gap-2">
                  <UserCircle size={20} className="text-purple-500" />
                  Perfil Acadêmico
              </h3>
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                      <Radar
                        name="Média"
                        dataKey="A"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
               <h3 className="font-bold text-gray-700 dark:text-white mb-4 flex items-center gap-2">
                   <AlertOctagon size={20} className="text-orange-500" />
                   Faltas Consumidas
               </h3>
               <div className="space-y-4">
                   {absenceData.length === 0 ? (
                       <p className="text-gray-400 text-sm text-center py-10">Nenhuma falta registrada.</p>
                   ) : (
                       absenceData.map((s, idx) => (
                           <div key={idx}>
                               <div className="flex justify-between text-sm mb-1">
                                   <span className="font-bold text-gray-700 dark:text-gray-300">{s.name}</span>
                                   <span className="text-gray-500 dark:text-gray-400 text-xs">
                                       {s.used} / {s.limit} ({Math.round(s.percentage)}%)
                                   </span>
                               </div>
                               <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                   <div 
                                      className={`h-full rounded-full ${s.percentage > 75 ? 'bg-red-500' : s.percentage > 50 ? 'bg-orange-400' : 'bg-green-500'}`}
                                      style={{ width: `${Math.min(s.percentage, 100)}%` }}
                                   />
                               </div>
                           </div>
                       ))
                   )}
               </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
               <h3 className="font-bold text-gray-700 dark:text-white mb-2 flex items-center gap-2">
                   <AlertTriangle size={20} className="text-red-500" />
                   Matriz de Risco
               </h3>
               <p className="text-xs text-gray-400 mb-4">Nota (Eixo Y) vs. Frequência (Eixo X)</p>
               <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="x" name="Freq" unit="%" domain={[50, 100]} stroke="#9ca3af" tick={{fontSize: 10}} />
                      <YAxis type="number" dataKey="y" name="Nota" domain={[0, 10]} stroke="#9ca3af" tick={{fontSize: 10}} />
                      <ZAxis type="number" dataKey="z" range={[60, 400]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      
                      <ReferenceLine x={75} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Freq. Crítica', position: 'insideTopLeft', fontSize: 9, fill: '#ef4444' }} />
                      <ReferenceLine y={settings.passingGrade} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Média', position: 'insideBottomRight', fontSize: 9, fill: '#3b82f6' }} />
                      
                      <Scatter name="Matérias" data={scatterData} fill="#8884d8">
                        {scatterData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
               </div>
          </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden print:border print:border-gray-300">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-700 dark:text-white">Detalhamento Completo</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 uppercase font-bold text-xs">
                      <tr>
                          <th className="px-6 py-4">Matéria</th>
                          <th className="px-6 py-4 text-center">Banco Faltas</th>
                          <th className="px-6 py-4 text-center">Freq. Real</th>
                          <th className="px-4 py-4 text-center">T1</th>
                          <th className="px-4 py-4 text-center">T2</th>
                          <th className="px-4 py-4 text-center">T3</th>
                          <th className="px-6 py-4 text-center text-indigo-600 dark:text-purple-400">Final</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {subjectStats.map(s => (
                          <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200 transition-colors">
                              <td className="px-6 py-4 font-medium">
                                  <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor: s.color}} />
                                    <div>
                                        <div className="font-bold">{s.name}</div>
                                        <div className="text-[10px] text-gray-400">{s.category}</div>
                                    </div>
                                    {(s.isRiskGrade || s.isRiskAbsence) && (
                                        <AlertTriangle size={14} className="text-red-500" />
                                    )}
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <span className={`font-bold ${s.bank < 0 ? 'text-red-500' : s.bank < s.limit * 0.2 ? 'text-orange-500' : 'text-green-500'}`}>
                                      {s.bank}
                                  </span>
                                  <span className="text-xs text-gray-400"> / {s.limit}</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <div className="font-bold text-gray-700 dark:text-gray-200">{s.freq}%</div>
                              </td>
                              <td className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">{s.t1 > 0 ? s.t1.toFixed(1) : '-'}</td>
                              <td className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">{s.t2 > 0 ? s.t2.toFixed(1) : '-'}</td>
                              <td className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">{s.t3 > 0 ? s.t3.toFixed(1) : '-'}</td>
                              <td className="px-6 py-4 text-center">
                                  <span className={`font-bold px-2 py-1 rounded ${s.final < settings.passingGrade ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30'}`}>
                                      {s.finalFixed}
                                  </span>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};