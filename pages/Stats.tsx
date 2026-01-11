
import React, { useMemo } from 'react';
import { useStore } from '../services/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Label, ReferenceLine, ScatterChart, Scatter, ZAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { SubjectType, ClassStatus, SubjectCategory } from '../types';
import { Printer, UserCircle } from 'lucide-react';

const getAvg = (assessments: any[], subjectId: string, trimester?: number) => {
    const filtered = assessments.filter(a => 
        a.subjectId === subjectId && 
        (trimester ? a.trimester === trimester : true)
    );
    if (filtered.length === 0) return 0;
    
    let wSum = 0;
    let wTotal = 0;
    filtered.forEach(a => {
        if(a.isExtra) {
        } else {
            wSum += (a.value * a.weight);
            wTotal += a.weight;
        }
    });
    const avg = wTotal > 0 ? (wSum / wTotal) : 0;
    const extra = filtered.filter(a => a.isExtra).reduce((acc: number, c: any) => acc + c.value, 0);
    return Math.min(10, avg + extra);
};

export const Stats: React.FC = () => {
  const { subjects, logs, schedule, validations, assessments, settings, currentUser } = useStore();

  const normalSubjects = subjects.filter(s => s.type === SubjectType.NORMAL);

  const schoolDayStats = useMemo(() => {
     let accumulatedDayValues = 0;
     const totalTarget = settings.totalSchoolDays || 200;

     validations.forEach(val => {
        const dateLogs = logs.filter(l => l.date === val.date);
        const dateObj = new Date(val.date + 'T00:00:00');
        const dayOfWeek = dateObj.getDay();
        
        const relevantSlots = schedule.filter(s => {
             const sub = subjects.find(sb => sb.id === s.subjectId);
             return sub && sub.type === SubjectType.NORMAL && s.dayOfWeek === dayOfWeek;
        });

        if (relevantSlots.length === 0) return; 

        let classesGiven = 0;
        let classesPresent = 0;

        relevantSlots.forEach(slot => {
            const log = dateLogs.find(l => l.slotId === slot.id);
            const status = log ? log.status : ClassStatus.PRESENT; 

            if (status !== ClassStatus.CANCELED) {
                classesGiven++;
                if (status === ClassStatus.PRESENT || status === ClassStatus.SUBSTITUTED) {
                    classesPresent++;
                }
            }
        });

        if (classesGiven > 0) {
            accumulatedDayValues += (classesPresent / classesGiven);
        }
     });

     const percentage = Math.min((accumulatedDayValues / totalTarget) * 100, 100);
     return {
         accumulated: accumulatedDayValues.toFixed(1),
         percentage: percentage.toFixed(1)
     };
  }, [validations, logs, schedule, subjects, settings]);

  const subjectStats = useMemo(() => {
     return normalSubjects.map(sub => {
         const limit = Math.floor(sub.totalClasses * 0.25);
         const absences = logs.filter(l => l.actualSubjectId === sub.id && l.status === ClassStatus.ABSENT).length;
         const bank = limit - absences;
         
         const t1 = getAvg(assessments, sub.id, 1);
         const t2 = getAvg(assessments, sub.id, 2);
         const t3 = getAvg(assessments, sub.id, 3);
         
         let final = 0;
         if (settings.gradeCalcMethod === 'absolute') final = (t1+t2+t3)/3;
         else {
             let count = 0;
             if(t1>0) count++; if(t2>0) count++; if(t3>0) count++;
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
         
         const freq = classesHeld > 0 ? (classesPresent / classesHeld) * 100 : 100;

         return {
             ...sub,
             classesHeld,
             classesPresent,
             freqRaw: freq,
             freq: freq.toFixed(1),
             absences,
             bank,
             limit,
             t1: t1.toFixed(1),
             t2: t2.toFixed(1),
             t3: t3.toFixed(1),
             final: final.toFixed(1),
             finalRaw: final,
             isRiskGrade: final < settings.passingGrade && final > 0,
             isRiskAbsence: bank < (limit * 0.1) 
         };
     });
  }, [normalSubjects, logs, validations, schedule, assessments, settings]);

  const chartData = subjectStats.map(s => ({
      name: s.name,
      grade: parseFloat(s.final),
      color: parseFloat(s.final) < settings.passingGrade ? '#ef4444' : parseFloat(s.final) < 7 ? '#eab308' : '#22c55e'
  }));

  const riskSubjects = subjectStats.filter(s => s.isRiskGrade || s.isRiskAbsence);

  const profileStats = useMemo(() => {
      const cats = Object.values(SubjectCategory);
      const data = cats.map(cat => {
          const subs = subjectStats.filter(s => (s.category || SubjectCategory.OTHER) === cat);
          if (subs.length === 0) return { subject: cat, A: 0, fullMark: 10 };
          
          const sum = subs.reduce((acc, curr) => acc + curr.finalRaw, 0);
          const avg = sum / subs.length;
          return { subject: cat.split(' ')[0], fullLabel: cat, A: avg, fullMark: 10 };
      }).filter(d => d.A > 0);

      const sciences = data.find(d => d.fullLabel === SubjectCategory.EXACT_SCIENCES)?.A || 0;
      const humanities = data.find(d => d.fullLabel === SubjectCategory.HUMAN_SCIENCES)?.A || 0;
      
      let type = "Generalista";
      if (sciences > humanities + 1) type = "Cientista / Exatas";
      else if (humanities > sciences + 1) type = "Humanista";
      else if (sciences > 8 && humanities > 8) type = "Alto Desempenho";

      return { data, type };
  }, [subjectStats]);

  const handlePrint = () => {
      window.print();
  };

  const scatterData = subjectStats.map(s => ({
      x: s.freqRaw,
      y: s.finalRaw,
      z: 1,
      name: s.name,
      fill: s.color
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Estatísticas e Análise</h1>
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors print:hidden"
          >
              <Printer size={18} />
              <span>Imprimir / PDF</span>
          </button>
      </div>

      <div className="hidden print:block mb-6 border-b border-gray-300 pb-4">
          <div className="flex items-center justify-between">
              <div>
                  <h2 className="text-2xl font-bold text-gray-800">Relatório Acadêmico</h2>
                  <p className="text-sm text-gray-500">Ano Letivo {settings.currentYear}</p>
              </div>
              <div className="text-right">
                  <p className="font-bold text-gray-700">{currentUser}</p>
                  <p className="text-xs text-gray-400">Gerado em {new Date().toLocaleDateString()}</p>
              </div>
          </div>
      </div>

      {/* Row 1: Global Pie + Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Global Frequency Donut */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center">
              <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-2">Frequência Global</h3>
              <p className="text-xs text-gray-400 mb-4">Baseada em {settings.totalSchoolDays} dias letivos</p>
              <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={[
                                  { value: parseFloat(schoolDayStats.percentage) },
                                  { value: 100 - parseFloat(schoolDayStats.percentage) }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              startAngle={90}
                              endAngle={-270}
                              dataKey="value"
                              paddingAngle={0}
                              isAnimationActive={false}
                          >
                              <Cell key="p" fill="#10b981" />
                              <Cell key="r" fill="#fee2e2" />
                              <Label 
                                  value={`${schoolDayStats.percentage}%`} 
                                  position="center" 
                                  className="text-2xl font-bold fill-gray-800 dark:fill-white"
                              />
                          </Pie>
                      </PieChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Student Profile & Radar */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row">
             <div className="flex-1">
                 <div className="flex items-center gap-3 mb-4">
                    <UserCircle className="text-indigo-600 dark:text-purple-400" size={28} />
                    <div>
                        <h3 className="text-lg font-bold text-gray-700 dark:text-white">Perfil do Aluno</h3>
                        <p className="text-sm font-medium text-indigo-600 dark:text-purple-400">{profileStats.type}</p>
                    </div>
                 </div>
                 <div className="space-y-3">
                     {profileStats.data.map(d => (
                         <div key={d.fullLabel} className="flex items-center justify-between text-sm">
                             <span className="text-gray-600 dark:text-gray-300">{d.fullLabel}</span>
                             <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${d.A * 10}%` }}></div>
                                </div>
                                <span className="font-bold text-gray-800 dark:text-white w-6 text-right">{d.A.toFixed(1)}</span>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
             <div className="w-full md:w-1/2 h-64 mt-6 md:mt-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={profileStats.data}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                      <Radar
                        name="Média"
                        dataKey="A"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.4}
                        isAnimationActive={false}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
             </div>
          </div>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scatter Plot - Risk Matrix */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
               <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-2">Matriz de Risco</h3>
               <p className="text-xs text-gray-400 mb-6">Comparativo Nota vs. Frequência. Área inferior esquerda é crítica.</p>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <XAxis type="number" dataKey="x" name="Frequência" unit="%" domain={[50, 100]} stroke="#9ca3af" tick={{fontSize: 10}} />
                      <YAxis type="number" dataKey="y" name="Nota" domain={[0, 10]} stroke="#9ca3af" tick={{fontSize: 10}} />
                      <ZAxis type="number" dataKey="z" range={[60, 400]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      
                      {/* Danger Zones */}
                      <ReferenceLine x={75} stroke="red" strokeDasharray="3 3" label={{ value: 'Freq. Mín', position: 'insideTopLeft', fontSize: 10, fill: 'red' }} />
                      <ReferenceLine y={settings.passingGrade} stroke="blue" strokeDasharray="3 3" label={{ value: 'Média Azul', position: 'insideBottomRight', fontSize: 10, fill: 'blue' }} />
                      
                      <Scatter name="Matérias" data={scatterData} fill="#8884d8">
                        {scatterData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
               </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-700 dark:text-white mb-6">Ranking de Notas</h3>
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                          <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} stroke="#6b7280" />
                          <YAxis domain={[0, 10]} ticks={[0,2,4,6,8,10]} stroke="#6b7280" />
                          <ReferenceLine y={settings.passingGrade} stroke="#6b7280" strokeDasharray="3 3" />
                          <Bar dataKey="grade" radius={[4, 4, 0, 0]} barSize={30} isAnimationActive={false}>
                              {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* Risk Alert Section */}
      {riskSubjects.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/50 rounded-2xl p-6 print:border-red-200">
              <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-4 flex items-center">
                  <span className="mr-2">⚠️</span> Atenção Necessária
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3">
                  {riskSubjects.map(s => (
                      <div key={s.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm print:border-gray-200">
                          <h4 className="font-bold text-gray-800 dark:text-white" style={{color: s.color}}>{s.name}</h4>
                          {s.isRiskGrade && <p className="text-sm text-red-600 dark:text-red-400 mt-1">Média Global: {s.final} (Abaixo de {settings.passingGrade})</p>}
                          {s.isRiskAbsence && <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">Banco de Faltas Crítico: {s.bank} restantes</p>}
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Main Stats Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden print:border print:border-gray-300">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-700 dark:text-white">Detalhamento por Matéria</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 uppercase font-bold text-xs print:bg-gray-100 print:text-gray-700">
                      <tr>
                          <th className="px-6 py-4">Matéria</th>
                          <th className="px-6 py-4 text-center">Frequência</th>
                          <th className="px-6 py-4 text-center">Banco Faltas</th>
                          <th className="px-6 py-4 text-center">Tri 1</th>
                          <th className="px-6 py-4 text-center">Tri 2</th>
                          <th className="px-6 py-4 text-center">Tri 3</th>
                          <th className="px-6 py-4 text-center text-indigo-600 dark:text-purple-400">Final</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 print:divide-gray-200">
                      {subjectStats.map(s => (
                          <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-200">
                              <td className="px-6 py-4 font-medium flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full print:border print:border-gray-300" style={{backgroundColor: s.color}} />
                                  <div>
                                      <div>{s.name}</div>
                                      <div className="text-[10px] text-gray-400">{s.category || 'Geral'}</div>
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <div className="font-bold text-gray-700 dark:text-gray-200">{s.freq}%</div>
                                  <div className="text-xs text-gray-400">{s.classesPresent}/{s.classesHeld}</div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <span className={`font-bold ${s.bank < 0 ? 'text-red-500' : s.bank < s.limit * 0.2 ? 'text-orange-500' : 'text-green-500'}`}>
                                      {s.bank}
                                  </span>
                                  <span className="text-xs text-gray-400"> / {s.limit}</span>
                              </td>
                              <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{s.t1}</td>
                              <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{s.t2}</td>
                              <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{s.t3}</td>
                              <td className="px-6 py-4 text-center font-bold text-gray-800 dark:text-gray-100">{s.final}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};
