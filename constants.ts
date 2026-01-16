import { SubjectType, SubjectCategory, Subject } from './types';

export const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const TRIMESTERS = [1, 2, 3];

export const MOCK_SUBJECTS = [
  { id: '1', name: 'Matemática', color: '#6366f1', totalClasses: 200, type: SubjectType.NORMAL, teacher: 'Prof. Silva' },
  { id: '2', name: 'História', color: '#f59e0b', totalClasses: 80, type: SubjectType.NORMAL, teacher: 'Prof. Santos' },
  { id: '3', name: 'Física', color: '#10b981', totalClasses: 120, type: SubjectType.NORMAL, teacher: 'Dra. Oliveira' },
  { id: '4', name: 'Intervalo', color: '#94a3b8', totalClasses: 0, type: SubjectType.ORGANIZATIONAL },
  { id: '5', name: 'Português', color: '#ec4899', totalClasses: 160, type: SubjectType.NORMAL, teacher: 'Prof. Souza' },
];

export const DEFAULT_SCHEDULE_SLOTS = [
  { id: 's1', dayOfWeek: 1, startTime: '07:30', endTime: '08:20', subjectId: '1' },
  { id: 's2', dayOfWeek: 1, startTime: '08:20', endTime: '09:10', subjectId: '2' },
];

interface TemplateSchedule {
    day: number;
    start: string;
    end: string;
    subjectIndex: number;
}

interface GradebookTemplate {
    subjects: Partial<Subject>[];
    schedule: TemplateSchedule[];
}

const SLOT_TIMES = [
    { start: "07:30", end: "08:20" }, // Aula 1
    { start: "08:20", end: "09:10" }, // Aula 2
    { start: "09:35", end: "10:25" }, // Aula 3
    { start: "10:25", end: "11:15" }, // Aula 4
    { start: "11:25", end: "12:15" }, // Aula 5 
    { start: "12:15", end: "13:05" }, // Aula 6
    { start: "14:05", end: "14:55" }, // Aula 7
    { start: "14:55", end: "15:45" }, // Aula 8
    { start: "16:00", end: "16:50" }, // Aula 9
    { start: "16:50", end: "17:40" }, // Aula 10
];

const createSlots = (day: number, indices: number[]) => {
    return indices.map((subIndex, i) => {
        if (subIndex === -1) return null; 
        return {
            day,
            start: SLOT_TIMES[i].start,
            end: SLOT_TIMES[i].end,
            subjectIndex: subIndex
        };
    }).filter(s => s !== null) as TemplateSchedule[];
};

export const PREDEFINED_GRADEBOOKS: Record<string, Record<string, GradebookTemplate>> = {
  "INF": {
    "1": {
      subjects: [
        { name: "Filosofia I", color: "#f59e0b", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 0
        { name: "Espanhol", color: "#ec4899", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES }, // 1
        { name: "Arquitetura de Computadores", color: "#6366f1", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 2
        { name: "Geografia I", color: "#d97706", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 3
        { name: "Matemática I", color: "#3b82f6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 4
        { name: "Química I", color: "#10b981", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 5
        { name: "Ed. Física I", color: "#84cc16", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.SPORTS }, // 6
        { name: "Reposição", color: "#9ca3af", totalClasses: 0, type: SubjectType.ORGANIZATIONAL, category: SubjectCategory.OTHER }, // 7
        { name: "LPLB I", color: "#f43f5e", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES }, // 8
        { name: "História I", color: "#b45309", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 9
        { name: "Algoritmos", color: "#8b5cf6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 10
        { name: "Inglês I", color: "#fb7185", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES }, // 11
        { name: "Informática Básica", color: "#06b6d4", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 12
        { name: "Design Web", color: "#d946ef", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 13
        { name: "Física I", color: "#14b8a6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 14
        { name: "Biologia I", color: "#22c55e", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 15
        { name: "Sociologia I", color: "#f97316", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES } // 16
      ],
      schedule: [
          ...createSlots(1, [0,0, 1,1, 2,2]), // Seg: Filo, Filo, Esp, Esp, Arq, Arq
          ...createSlots(2, [3,3, 4,4, 5,5, 6,6, 7,7]), // Ter: Geo, Geo, Mat, Mat, Quim, Quim, EdFis, EdFis, Rep, Rep
          ...createSlots(3, [8,8, 4,4, 9,9]), // Qua: LPLB, LPLB, Mat, Mat, Hist, Hist
          ...createSlots(4, [7,7, 8,8, 11,11, 12,12, 13,13]), // Qui: Rep, Rep, LPLB, LPLB, Ing, Ing, InfBas, InfBas, DesWeb, DesWeb
          ...createSlots(5, [14,14, 15,15, 16,16, 10,10, 10,10]) // Sex: Fis, Fis, Bio, Bio, Soc, Soc, Alg, Alg, Alg, Alg
      ]
    },
    "2": {
      subjects: [
        { name: "Reposição", color: "#9ca3af", totalClasses: 0, type: SubjectType.ORGANIZATIONAL, category: SubjectCategory.OTHER }, // 0
        { name: "LPLB II", color: "#f43f5e", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES }, // 1
        { name: "Filosofia II", color: "#f59e0b", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 2
        { name: "Ed. Física II", color: "#84cc16", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.SPORTS }, // 3
        { name: "Geografia II", color: "#d97706", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 4
        { name: "Desenv. Web I", color: "#d946ef", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 5
        { name: "Matemática II", color: "#3b82f6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 6
        { name: "Banco de Dados", color: "#6366f1", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 7
        { name: "Química II", color: "#10b981", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 8
        { name: "Sociologia II", color: "#f97316", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 9
        { name: "Língua Estrangeira", color: "#ec4899", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES }, // 10
        { name: "Biologia II", color: "#22c55e", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 11
        { name: "PC Web", color: "#06b6d4", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 12
        { name: "Fund. Redes", color: "#8b5cf6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 13
        { name: "Física II", color: "#14b8a6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 14
        { name: "Ed. Artística I (Música)", color: "#db2777", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.ARTS }, // 15
        { name: "História II", color: "#b45309", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES } // 16
      ],
      schedule: [
          ...createSlots(1, [0,0, 1,1, 2,2]), // Seg: Rep, Rep, LPLB, LPLB, Fil, Fil
          ...createSlots(2, [3,3, 1,1, 4,4, 5,5, 5,5]), // Ter: EdFis, EdFis, LPLB, LPLB, Geo, Geo, DWeb, DWeb, DWeb, DWeb
          ...createSlots(3, [6,6, 7,7, 8,8]), // Qua: Mat, Mat, BD, BD, Quim, Quim
          ...createSlots(4, [6,6, 10,10, 16,16, 12,12, 13,13]), // Qui: Mat, Mat, LinEst, LinEst, Hist, Hist, PCWeb, PCWeb, FRedes, FRedes
          ...createSlots(5, [14,14, 15,15, 11,11, 9,9, 0,0]) // Sex: Fis, Fis, Art, Art, Bio, Bio, Soc, Soc, Rep, Rep
      ]
    },
    "3": {
      subjects: [
        { name: "LPLB III", color: "#f43f5e", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES }, // 0
        { name: "Filosofia III", color: "#f59e0b", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 1
        { name: "Reposição", color: "#9ca3af", totalClasses: 0, type: SubjectType.ORGANIZATIONAL, category: SubjectCategory.OTHER }, // 2
        { name: "PDME", color: "#8b5cf6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 3
        { name: "Química III", color: "#10b981", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 4
        { name: "Matemática III", color: "#3b82f6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 5
        { name: "Desenv. Web II", color: "#d946ef", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 6
        { name: "Geografia III", color: "#d97706", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 7
        { name: "História III", color: "#b45309", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 8
        { name: "Língua Estrangeira", color: "#ec4899", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES }, // 9
        { name: "Ed. Artística II (Música)", color: "#db2777", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.ARTS }, // 10
        { name: "Sociologia III", color: "#f97316", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 11
        { name: "Biologia III", color: "#22c55e", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 12
        { name: "Física III", color: "#14b8a6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 13
        { name: "Sist. Operacionais", color: "#06b6d4", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES } // 14
      ],
      schedule: [
          ...createSlots(1, [0,0, 1,1, 2,2, 3,3, 3,3]), // Seg: LPLB, LPLB, Fil, Fil, Rep, Rep, PDME, PDME, PDME, PDME
          ...createSlots(2, [0,0, 4,4, 5,5, 6,6, 6,6]), // Ter: LPLB, LPLB, Quim, Quim, Mat, Mat, DWebII, DWebII, DWebII, DWebII
          ...createSlots(3, [7,7, 8,8, 5,5]), // Qua: Geo, Geo, Hist, Hist, Mat, Mat
          ...createSlots(4, [9,9, 10,10, 11,11]), // Qui: LinEst, LinEst, Art, Art, Soc, Soc
          ...createSlots(5, [12,12, 13,13, 14,14]) // Sex: Bio, Bio, Fis, Fis, SO, SO
      ]
    }
  },
  "ADM": {
    "1": {
      subjects: [
        { name: "Filosofia I", color: "#f59e0b", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 0
        { name: "Comp. Org.", color: "#6366f1", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 1
        { name: "Espanhol", color: "#ec4899", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES }, // 2
        { name: "Matemática I", color: "#3b82f6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 3
        { name: "Geografia I", color: "#d97706", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 4
        { name: "Química I", color: "#10b981", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 5
        { name: "Reposição", color: "#9ca3af", totalClasses: 0, type: SubjectType.ORGANIZATIONAL, category: SubjectCategory.OTHER }, // 6
        { name: "Fund. Adm.", color: "#8b5cf6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 7
        { name: "LPLB I", color: "#f43f5e", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES }, // 8
        { name: "Int. Inform.", color: "#06b6d4", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 9
        { name: "Biologia I", color: "#22c55e", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 10
        { name: "História I", color: "#b45309", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 11
        { name: "Ética RSA", color: "#84cc16", totalClasses: 40, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 12
        { name: "Física I", color: "#14b8a6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 13
        { name: "Sociologia I", color: "#f97316", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 14
        { name: "Ed. Física I", color: "#84cc16", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.SPORTS }, // 15
        { name: "Inglês I", color: "#fb7185", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES } //16
      ],
      schedule: [
          ...createSlots(1, [0,0, 1,1, 2,2]), // Seg: Fil, Fil, COrg, COrg, Esp, Esp
          ...createSlots(2, [3,3, 4,4, 5,5, 15,15, 6,6]), // Ter: Mat, Mat, Geo, Geo, Quim, Quim, EdFis, EdFis, Rep, Rep
          ...createSlots(3, [7,7, 8,8, 9,9]), // Qua: FAdm, FAdm, LPLB, LPLB, IntInf, IntInf
          ...createSlots(4, [8,8, 3,3, 16,16, 11,11, 12,12]), // Qui: LPLB, LPLB, Mat, Mat, Ing, Ing, Hist, Hist, Etica, Etica
          ...createSlots(5, [6,6, 13,13, 14,14, 10,10, 6,6]) // Sex: Rep, Rep, Fis, Fis, Soc, Soc, Bio, Bio, Rep, Rep
      ]
    },
    "2": {
      subjects: [
        { name: "Reposição", color: "#9ca3af", totalClasses: 0, type: SubjectType.ORGANIZATIONAL, category: SubjectCategory.OTHER }, // 0
        { name: "LPLB II", color: "#f43f5e", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES }, // 1
        { name: "Filosofia II", color: "#f59e0b", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 2
        { name: "Ed. Física II", color: "#84cc16", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.SPORTS }, // 3
        { name: "Geografia II", color: "#d97706", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 4
        { name: "Marketing", color: "#d946ef", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 5
        { name: "Contabilidade", color: "#10b981", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 6
        { name: "Matemática II", color: "#3b82f6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 7
        { name: "Logística", color: "#8b5cf6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 8
        { name: "Química II", color: "#06b6d4", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 9
        { name: "Sociologia II", color: "#f97316", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 10
        { name: "Língua Estrangeira", color: "#ec4899", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES }, // 11
        { name: "História II", color: "#b45309", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 12
        { name: "Legisl. Trab.", color: "#f472b6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 13
        { name: "SIG e OSM", color: "#6366f1", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 14
        { name: "Física II", color: "#14b8a6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 15
        { name: "Ed. Artística I (Música)", color: "#db2777", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.ARTS }, // 16
        { name: "Biologia II", color: "#22c55e", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES } // 17
      ],
      schedule: [
          ...createSlots(1, [0,0, 1,1, 2,2]), // Seg: Rep, Rep, LPLB, LPLB, Fil, Fil
          ...createSlots(2, [3,3, 1,1, 4,4, 5,5, 6,6]), // Ter: EdFis, EdFis, LPLB, LPLB, Geo, Geo, Mkt, Mkt, Cont, Cont
          ...createSlots(3, [7,7, 8,8, 9,9]), // Qua: Mat, Mat, Log, Log, Quim, Quim
          ...createSlots(4, [7,7, 11,11, 12,12, 13,13, 14,14]), // Qui: Mat, Mat, LinEst, LinEst, Hist, Hist, LegT, LegT, SIG, SIG
          ...createSlots(5, [15,15, 16,16, 17,17, 10,10, 0,0]) // Sex: Fis, Fis, Art, Art, Bio, Bio, Soc, Soc, Rep, Rep
      ]
    },
    "3": {
      subjects: [
        { name: "LPLB III", color: "#f43f5e", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES }, // 0
        { name: "Filosofia III", color: "#f59e0b", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 1
        { name: "Empreend. Inov.", color: "#84cc16", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 2
        { name: "Gest. Pessoas", color: "#d946ef", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 3
        { name: "Economia", color: "#10b981", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 4
        { name: "Química III", color: "#06b6d4", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 5
        { name: "Matemática III", color: "#3b82f6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 6
        { name: "APO", color: "#8b5cf6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 7
        { name: "Adm. Finan. Orç.", color: "#14b8a6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 8
        { name: "Geografia III", color: "#d97706", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 9
        { name: "História III", color: "#b45309", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 10
        { name: "Língua Estrangeira", color: "#ec4899", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES }, // 11
        { name: "Ed. Artística II (Música)", color: "#db2777", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.ARTS }, // 12
        { name: "Sociologia III", color: "#f97316", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES }, // 13
        { name: "Biologia III", color: "#22c55e", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 14
        { name: "Física III", color: "#6366f1", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES }, // 15
        { name: "Reposição", color: "#9ca3af", totalClasses: 0, type: SubjectType.ORGANIZATIONAL, category: SubjectCategory.OTHER } // 16
      ],
      schedule: [
          ...createSlots(1, [0,0, 1,1, 2,2, 3,3, 4,4]), // Seg: LPLB, LPLB, Fil, Fil, Emp, Emp, GPess, GPess, Econ, Econ
          ...createSlots(2, [0,0, 5,5, 6,6, 7,7, 8,8]), // Ter: LPLB, LPLB, Quim, Quim, Mat, Mat, APO, APO, AFO, AFO
          ...createSlots(3, [9,9, 10,10, 6,6]), // Qua: Geo, Geo, Hist, Hist, Mat, Mat
          ...createSlots(4, [11,11, 12,12, 13,13]), // Qui: LinEst, LinEst, Art, Art, Soc, Soc
          ...createSlots(5, [14,14, 15,15, 16,16]) // Sex: Bio, Bio, Fis, Fis, Rep, Rep
      ]
    }
  }
};