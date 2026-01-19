import { SubjectType, SubjectCategory, Subject, SpecialDay } from './types';

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

export const MOCK_SPECIAL_DAYS: SpecialDay[] = [
    { id: 'sat1', date: '2024-04-13', description: 'Sábado Letivo (Abril)', customSlots: [] },
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
        { name: "Filosofia I", color: "#f59e0b", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Rafael Mello' }, // 0
        { name: "Espanhol", color: "#ec4899", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES, teacher: 'Neidelberg' }, // 1
        { name: "Arquitetura de Computadores", color: "#6366f1", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Nilson' }, // 2
        { name: "Geografia I", color: "#d97706", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Cristiane' }, // 3
        { name: "Matemática I", color: "#3b82f6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Jardel' }, // 4
        { name: "Química I", color: "#10b981", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Rafaela' }, // 5
        { name: "Ed. Física I", color: "#84cc16", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.SPORTS, teacher: 'Carla' }, // 6
        { name: "Reposição", color: "#9ca3af", totalClasses: 0, type: SubjectType.ORGANIZATIONAL, category: SubjectCategory.OTHER }, // 7
        { name: "LPLB I", color: "#f43f5e", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES, teacher: 'Daniele' }, // 8
        { name: "História I", color: "#b45309", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'André Franklin' }, // 9
        { name: "Algoritmos", color: "#8b5cf6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Rodrigo' }, // 10
        { name: "Inglês I", color: "#fb7185", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES, teacher: 'Suzana/Alessandra' }, // 11
        { name: "Informática Básica", color: "#06b6d4", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher:  'Eliezer' }, // 12
        { name: "Design Web", color: "#d946ef", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Rafael Escalfoni' }, // 13
        { name: "Física I", color: "#14b8a6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Raposo' }, // 14
        { name: "Biologia I", color: "#22c55e", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Anderson' }, // 15
        { name: "Sociologia I", color: "#f97316", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Adriana' } // 16
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
        { name: "LPLB II", color: "#f43f5e", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES, teacher: 'Daniele' }, // 1
        { name: "Filosofia II", color: "#f59e0b", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Rafael Mello' }, // 2
        { name: "Ed. Física II", color: "#84cc16", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.SPORTS, teacher: 'Carla' }, // 3
        { name: "Geografia II", color: "#d97706", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Cristiane' }, // 4
        { name: "Desenv. Web I", color: "#d946ef", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Vitor' }, // 5
        { name: "Matemática II", color: "#3b82f6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Jardel' }, // 6
        { name: "Banco de Dados", color: "#6366f1", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Eliezer' }, // 7
        { name: "Química II", color: "#10b981", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Rafaela' }, // 8
        { name: "Sociologia II", color: "#f97316", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Adriana' }, // 9
        { name: "Língua Estrangeira", color: "#ec4899", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES, teacher: 'Suzana/Alessandra/Neidelberg' }, // 10
        { name: "Biologia II", color: "#22c55e", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Anderson' }, // 11
        { name: "PC Web", color: "#06b6d4", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Rafael Escalfoni' }, // 12
        { name: "Fund. Redes", color: "#8b5cf6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Helga' }, // 13
        { name: "Física II", color: "#14b8a6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Gustavo' }, // 14
        { name: "Ed. Artística I (Música)", color: "#db2777", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.ARTS, teacher: 'Eduardo' }, // 15
        { name: "História II", color: "#b45309", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'André Franklin' } // 16
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
        { name: "LPLB III", color: "#f43f5e", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES, teacher: 'Daniele' }, // 0
        { name: "Filosofia III", color: "#f59e0b", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Rafael Mello' }, // 1
        { name: "Reposição", color: "#9ca3af", totalClasses: 0, type: SubjectType.ORGANIZATIONAL, category: SubjectCategory.OTHER }, // 2
        { name: "PDME", color: "#8b5cf6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Paulo H.' }, // 3
        { name: "Química III", color: "#10b981", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Rafaela' }, // 4
        { name: "Matemática III", color: "#3b82f6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Jardel' }, // 5
        { name: "Desenv. Web II", color: "#d946ef", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Rafael G.' }, // 6
        { name: "Geografia III", color: "#d97706", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Cristiane' }, // 7
        { name: "História III", color: "#b45309", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'André Franklin' }, // 8
        { name: "Língua Estrangeira", color: "#ec4899", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES, teacher: 'Suzana/Alessandra/Neidelberg' }, // 9
        { name: "Ed. Artística II (Música)", color: "#db2777", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.ARTS, teacher: 'Eduardo' }, // 10
        { name: "Sociologia III", color: "#f97316", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Adriana' }, // 11
        { name: "Biologia III", color: "#22c55e", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Anderson' }, // 12
        { name: "Física III", color: "#14b8a6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Gustavo' }, // 13
        { name: "Sist. Operacionais", color: "#06b6d4", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Bruno' } // 14
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
        { name: "Filosofia I", color: "#f59e0b", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Rafael Mello' }, // 0
        { name: "Comp. Org.", color: "#6366f1", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Suzanny' }, // 1
        { name: "Espanhol", color: "#ec4899", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES, teacher: 'Neidelberg' }, // 2
        { name: "Matemática I", color: "#3b82f6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Jardel' }, // 3
        { name: "Geografia I", color: "#d97706", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Cristiane' }, // 4
        { name: "Química I", color: "#10b981", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Rafaela' }, // 5
        { name: "Reposição", color: "#9ca3af", totalClasses: 0, type: SubjectType.ORGANIZATIONAL, category: SubjectCategory.OTHER }, // 6
        { name: "Fund. Adm.", color: "#8b5cf6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Suzanny' }, // 7
        { name: "LPLB I", color: "#f43f5e", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES, teacher: 'Daniele' }, // 8
        { name: "Int. Inform.", color: "#06b6d4", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Eliezer' }, // 9
        { name: "Biologia I", color: "#22c55e", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Anderson' }, // 10
        { name: "História I", color: "#b45309", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'André Franklin' }, // 11
        { name: "Ética RSA", color: "#84cc16", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'André Mello' }, // 12
        { name: "Física I", color: "#14b8a6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Raposo' }, // 13
        { name: "Sociologia I", color: "#f97316", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Adriana' }, // 14
        { name: "Ed. Física I", color: "#84cc16", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.SPORTS, teacher: 'Carla' }, // 15
        { name: "Inglês I", color: "#fb7185", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES, teacher: 'Suzana/Alessandra' } //16
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
        { name: "LPLB II", color: "#f43f5e", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES, teacher: 'Daniele' }, // 1
        { name: "Filosofia II", color: "#f59e0b", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Rafael Mello' }, // 2
        { name: "Ed. Física II", color: "#84cc16", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.SPORTS, teacher: 'Carla' }, // 3
        { name: "Geografia II", color: "#d97706", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Cristiane' }, // 4
        { name: "Marketing", color: "#d946ef", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Suzanny' }, // 5
        { name: "Contabilidade", color: "#10b981", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Juliano' }, // 6
        { name: "Matemática II", color: "#3b82f6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Jardel' }, // 7
        { name: "Logística", color: "#8b5cf6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Suzanny' }, // 8
        { name: "Química II", color: "#06b6d4", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Rafaela' }, // 9
        { name: "Sociologia II", color: "#f97316", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Adriana' }, // 10
        { name: "Língua Estrangeira", color: "#ec4899", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES, teacher: 'Suzana/Alessandra/Neidelberg' }, // 11
        { name: "História II", color: "#b45309", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'André Franklin' }, // 12
        { name: "Legisl. Trab.", color: "#f472b6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'André Mello' }, // 13
        { name: "SIG e OSM", color: "#6366f1", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Eliezer' }, // 14
        { name: "Física II", color: "#14b8a6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Gustavo' }, // 15
        { name: "Ed. Artística I (Música)", color: "#db2777", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.ARTS, teacher: 'Eduardo' }, // 16
        { name: "Biologia II", color: "#22c55e", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Anderson' } // 17
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
        { name: "LPLB III", color: "#f43f5e", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES, teacher: 'Daniele' }, // 0
        { name: "Filosofia III", color: "#f59e0b", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Rafael Mello' }, // 1
        { name: "Empreend. Inov.", color: "#84cc16", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Suzanny' }, // 2
        { name: "Gest. Pessoas", color: "#d946ef", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Márcio' }, // 3
        { name: "Economia", color: "#10b981", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Ivan' }, // 4
        { name: "Química III", color: "#06b6d4", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Rafaela' }, // 5
        { name: "Matemática III", color: "#3b82f6", totalClasses: 160, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Jardel' }, // 6
        { name: "APO", color: "#8b5cf6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Márcio' }, // 7
        { name: "Adm. Finan. Orç.", color: "#14b8a6", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Suzanny' }, // 8
        { name: "Geografia III", color: "#d97706", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Cristiane' }, // 9
        { name: "História III", color: "#b45309", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'André Franklin' }, // 10
        { name: "Língua Estrangeira", color: "#ec4899", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.LANGUAGES, teacher: 'Suzana/Alessandra/Neidelberg' }, // 11
        { name: "Ed. Artística II (Música)", color: "#db2777", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.ARTS, teacher: 'Eduardo' }, // 12
        { name: "Sociologia III", color: "#f97316", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.HUMAN_SCIENCES, teacher: 'Adriana' }, // 13
        { name: "Biologia III", color: "#22c55e", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Anderson' }, // 14
        { name: "Física III", color: "#6366f1", totalClasses: 80, type: SubjectType.NORMAL, category: SubjectCategory.EXACT_SCIENCES, teacher: 'Gustavo' }, // 15
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

interface OfficialCalendarEntry {
    date: string;
    number: number;
    slots: { start: string; end: string; subjectName: string }[];
}

const SAT_DATES = [
    '2026-03-09', '2026-03-23', '2026-04-06', '2026-04-20', '2026-05-04', 
    '2026-05-18', '2026-06-08', '2026-06-22', '2026-07-06', '2026-07-27', 
    '2026-08-10', '2026-08-24', '2026-09-14', '2026-09-28', '2026-10-05', 
    '2026-10-19', '2026-11-09', '2026-11-23', '2026-11-30', '2026-12-07',
    '2026-12-14'
];

const T_START = ["07:00", "07:50", "08:40", "09:50", "10:40", "11:30"];
const T_END   = ["07:50", "08:40", "09:30", "10:40", "11:30", "12:20"];

const createDay = (dateIdx: number, subjects: string[]): OfficialCalendarEntry => ({
    date: SAT_DATES[dateIdx],
    number: dateIdx + 1,
    slots: subjects.map((sub, i) => ({
        start: T_START[i] || "00:00",
        end: T_END[i] || "00:00",
        subjectName: sub
    }))
});

export const OFFICIAL_SATURDAY_CALENDAR: Record<string, Record<string, OfficialCalendarEntry[]>> = {
    "INF": {
        "1": [
            createDay(0, ["Filosofia I", "Filosofia I", "Espanhol", "Espanhol", "Geografia I", "Geografia I"]),
            createDay(1, ["Matemática I", "Matemática I", "Química I", "Química I", "Ed. Física I", "Ed. Física I"]),
            createDay(2, ["LPLB I", "LPLB I", "História I", "História I", "Algoritmos", "Algoritmos"]),
            createDay(3, ["Inglês I", "Inglês I", "Informática Básica", "Informática Básica", "Design Web", "Design Web"]),
            createDay(4, ["Física I", "Física I", "Biologia I", "Biologia I", "Sociologia I", "Sociologia I"]),
            createDay(5, ["Arquitetura de Computadores", "Arquitetura de Computadores", "Matemática I", "Matemática I", "Química I", "Química I"]),
            createDay(6, ["Filosofia I", "Filosofia I", "Espanhol", "Espanhol", "Geografia I", "Geografia I"]),
            createDay(7, ["Matemática I", "Matemática I", "Química I", "Química I", "Ed. Física I", "Ed. Física I"]),
            createDay(8, ["LPLB I", "LPLB I", "História I", "História I", "Algoritmos", "Algoritmos"]),
            createDay(9, ["Inglês I", "Inglês I", "Informática Básica", "Informática Básica", "Design Web", "Design Web"]),
            createDay(10, ["Física I", "Física I", "Biologia I", "Biologia I", "Sociologia I", "Sociologia I"]),
            createDay(11, ["Arquitetura de Computadores", "Arquitetura de Computadores", "Matemática I", "Matemática I", "Química I", "Química I"]),
            createDay(12, ["Filosofia I", "Filosofia I", "Espanhol", "Espanhol", "Geografia I", "Geografia I"]),
            createDay(13, ["Matemática I", "Matemática I", "Química I", "Química I", "Ed. Física I", "Ed. Física I"]),
            createDay(14, ["LPLB I", "LPLB I", "História I", "História I", "Algoritmos", "Algoritmos"]),
            createDay(15, ["Inglês I", "Inglês I", "Informática Básica", "Informática Básica", "Design Web", "Design Web"]),
            createDay(16, ["Física I", "Física I", "Biologia I", "Biologia I", "Sociologia I", "Sociologia I"]),
            createDay(17, ["Arquitetura de Computadores", "Arquitetura de Computadores", "Matemática I", "Matemática I", "Química I", "Química I"]),
            createDay(18, ["Filosofia I", "Filosofia I", "Espanhol", "Espanhol", "Geografia I", "Geografia I"]),
            createDay(19, ["Matemática I", "Matemática I", "Química I", "Química I", "Ed. Física I", "Ed. Física I"]),
            createDay(20, ["LPLB I", "LPLB I", "História I", "História I", "Algoritmos", "Algoritmos"])
        ],
        "2": [
            createDay(0, ["LPLB II", "LPLB II", "Filosofia II", "Filosofia II", "Ed. Física II", "Ed. Física II"]),
            createDay(1, ["Geografia II", "Geografia II", "Desenv. Web I", "Desenv. Web I", "Matemática II", "Matemática II"]),
            createDay(2, ["Banco de Dados", "Banco de Dados", "Química II", "Química II", "Sociologia II", "Sociologia II"]),
            createDay(3, ["Língua Estrangeira", "Língua Estrangeira", "Biologia II", "Biologia II", "PC Web", "PC Web"]),
            createDay(4, ["Fund. Redes", "Fund. Redes", "Física II", "Física II", "Ed. Artística I (Música)", "Ed. Artística I (Música)"]),
            createDay(5, ["História II", "História II", "LPLB II", "LPLB II", "Filosofia II", "Filosofia II"]),
            createDay(6, ["Ed. Física II", "Ed. Física II", "Geografia II", "Geografia II", "Desenv. Web I", "Desenv. Web I"]),
            createDay(7, ["Matemática II", "Matemática II", "Banco de Dados", "Banco de Dados", "Química II", "Química II"]),
            createDay(8, ["Sociologia II", "Sociologia II", "Língua Estrangeira", "Língua Estrangeira", "Biologia II", "Biologia II"]),
            createDay(9, ["PC Web", "PC Web", "Fund. Redes", "Fund. Redes", "Física II", "Física II"]),
            createDay(10, ["Ed. Artística I (Música)", "Ed. Artística I (Música)", "História II", "História II", "LPLB II", "LPLB II"]),
            createDay(11, ["Filosofia II", "Filosofia II", "Ed. Física II", "Ed. Física II", "Geografia II", "Geografia II"]),
            createDay(12, ["Desenv. Web I", "Desenv. Web I", "Matemática II", "Matemática II", "Banco de Dados", "Banco de Dados"]),
            createDay(13, ["Química II", "Química II", "Sociologia II", "Sociologia II", "Língua Estrangeira", "Língua Estrangeira"]),
            createDay(14, ["Biologia II", "Biologia II", "PC Web", "PC Web", "Fund. Redes", "Fund. Redes"]),
            createDay(15, ["Física II", "Física II", "Ed. Artística I (Música)", "Ed. Artística I (Música)", "História II", "História II"]),
            createDay(16, ["LPLB II", "LPLB II", "Filosofia II", "Filosofia II", "Ed. Física II", "Ed. Física II"]),
            createDay(17, ["Geografia II", "Geografia II", "Desenv. Web I", "Desenv. Web I", "Matemática II", "Matemática II"]),
            createDay(18, ["Banco de Dados", "Banco de Dados", "Química II", "Química II", "Sociologia II", "Sociologia II"]),
            createDay(19, ["Língua Estrangeira", "Língua Estrangeira", "Biologia II", "Biologia II", "PC Web", "PC Web"]),
            createDay(20, ["Fund. Redes", "Fund. Redes", "Física II", "Física II", "Ed. Artística I (Música)", "Ed. Artística I (Música)"])
        ],
        "3": [
            createDay(0, ["LPLB III", "LPLB III", "Filosofia III", "Filosofia III", "PDME", "PDME"]),
            createDay(1, ["Química III", "Química III", "Matemática III", "Matemática III", "Desenv. Web II", "Desenv. Web II"]),
            createDay(2, ["Geografia III", "Geografia III", "História III", "História III", "Língua Estrangeira", "Língua Estrangeira"]),
            createDay(3, ["Ed. Artística II (Música)", "Ed. Artística II (Música)", "Sociologia III", "Sociologia III", "Biologia III", "Biologia III"]),
            createDay(4, ["Física III", "Física III", "Sist. Operacionais", "Sist. Operacionais", "LPLB III", "LPLB III"]),
            createDay(5, ["Filosofia III", "Filosofia III", "PDME", "PDME", "Química III", "Química III"]),
            createDay(6, ["Matemática III", "Matemática III", "Desenv. Web II", "Desenv. Web II", "Geografia III", "Geografia III"]),
            createDay(7, ["História III", "História III", "Língua Estrangeira", "Língua Estrangeira", "Ed. Artística II (Música)", "Ed. Artística II (Música)"]),
            createDay(8, ["Sociologia III", "Sociologia III", "Biologia III", "Biologia III", "Física III", "Física III"]),
            createDay(9, ["Sist. Operacionais", "Sist. Operacionais", "LPLB III", "LPLB III", "Filosofia III", "Filosofia III"]),
            createDay(10, ["PDME", "PDME", "Química III", "Química III", "Matemática III", "Matemática III"]),
            createDay(11, ["Desenv. Web II", "Desenv. Web II", "Geografia III", "Geografia III", "História III", "História III"]),
            createDay(12, ["Língua Estrangeira", "Língua Estrangeira", "Ed. Artística II (Música)", "Ed. Artística II (Música)", "Sociologia III", "Sociologia III"]),
            createDay(13, ["Biologia III", "Biologia III", "Física III", "Física III", "Sist. Operacionais", "Sist. Operacionais"]),
            createDay(14, ["LPLB III", "LPLB III", "Filosofia III", "Filosofia III", "PDME", "PDME"]),
            createDay(15, ["Química III", "Química III", "Matemática III", "Matemática III", "Desenv. Web II", "Desenv. Web II"]),
            createDay(16, ["Geografia III", "Geografia III", "História III", "História III", "Língua Estrangeira", "Língua Estrangeira"]),
            createDay(17, ["Ed. Artística II (Música)", "Ed. Artística II (Música)", "Sociologia III", "Sociologia III", "Biologia III", "Biologia III"]),
            createDay(18, ["Física III", "Física III", "Sist. Operacionais", "Sist. Operacionais", "LPLB III", "LPLB III"]),
            createDay(19, ["Filosofia III", "Filosofia III", "PDME", "PDME", "Química III", "Química III"]),
            createDay(20, ["Matemática III", "Matemática III", "Desenv. Web II", "Desenv. Web II", "Geografia III", "Geografia III"])
        ]
    },
    "ADM": {
        "1": [
            createDay(0, ["Filosofia I", "Filosofia I", "Comp. Org.", "Comp. Org.", "Espanhol", "Espanhol"]),
            createDay(1, ["Matemática I", "Matemática I", "Geografia I", "Geografia I", "Química I", "Química I"]),
            createDay(2, ["Fund. Adm.", "Fund. Adm.", "LPLB I", "LPLB I", "Int. Inform.", "Int. Inform."]),
            createDay(3, ["Biologia I", "Biologia I", "História I", "História I", "Ética RSA", "Ética RSA"]),
            createDay(4, ["Física I", "Física I", "Sociologia I", "Sociologia I", "Ed. Física I", "Ed. Física I"]),
            createDay(5, ["Inglês I", "Inglês I", "Filosofia I", "Filosofia I", "Comp. Org.", "Comp. Org."]),
            createDay(6, ["Espanhol", "Espanhol", "Matemática I", "Matemática I", "Geografia I", "Geografia I"]),
            createDay(7, ["Química I", "Química I", "Fund. Adm.", "Fund. Adm.", "LPLB I", "LPLB I"]),
            createDay(8, ["Int. Inform.", "Int. Inform.", "Biologia I", "Biologia I", "História I", "História I"]),
            createDay(9, ["Ética RSA", "Ética RSA", "Física I", "Física I", "Sociologia I", "Sociologia I"]),
            createDay(10, ["Ed. Física I", "Ed. Física I", "Inglês I", "Inglês I", "Filosofia I", "Filosofia I"]),
            createDay(11, ["Comp. Org.", "Comp. Org.", "Espanhol", "Espanhol", "Matemática I", "Matemática I"]),
            createDay(12, ["Geografia I", "Geografia I", "Química I", "Química I", "Fund. Adm.", "Fund. Adm."]),
            createDay(13, ["LPLB I", "LPLB I", "Int. Inform.", "Int. Inform.", "Biologia I", "Biologia I"]),
            createDay(14, ["História I", "História I", "Ética RSA", "Ética RSA", "Física I", "Física I"]),
            createDay(15, ["Sociologia I", "Sociologia I", "Ed. Física I", "Ed. Física I", "Inglês I", "Inglês I"]),
            createDay(16, ["Filosofia I", "Filosofia I", "Comp. Org.", "Comp. Org.", "Espanhol", "Espanhol"]),
            createDay(17, ["Matemática I", "Matemática I", "Geografia I", "Geografia I", "Química I", "Química I"]),
            createDay(18, ["Fund. Adm.", "Fund. Adm.", "LPLB I", "LPLB I", "Int. Inform.", "Int. Inform."]),
            createDay(19, ["Biologia I", "Biologia I", "História I", "História I", "Ética RSA", "Ética RSA"]),
            createDay(20, ["Física I", "Física I", "Sociologia I", "Sociologia I", "Ed. Física I", "Ed. Física I"])
        ],
        "2": [
            createDay(0, ["LPLB II", "LPLB II", "Filosofia II", "Filosofia II", "Ed. Física II", "Ed. Física II"]),
            createDay(1, ["Geografia II", "Geografia II", "Marketing", "Marketing", "Contabilidade", "Contabilidade"]),
            createDay(2, ["Matemática II", "Matemática II", "Logística", "Logística", "Química II", "Química II"]),
            createDay(3, ["Sociologia II", "Sociologia II", "Língua Estrangeira", "Língua Estrangeira", "História II", "História II"]),
            createDay(4, ["Legisl. Trab.", "Legisl. Trab.", "SIG e OSM", "SIG e OSM", "Física II", "Física II"]),
            createDay(5, ["Ed. Artística I (Música)", "Ed. Artística I (Música)", "Biologia II", "Biologia II", "LPLB II", "LPLB II"]),
            createDay(6, ["Filosofia II", "Filosofia II", "Ed. Física II", "Ed. Física II", "Geografia II", "Geografia II"]),
            createDay(7, ["Marketing", "Marketing", "Contabilidade", "Contabilidade", "Matemática II", "Matemática II"]),
            createDay(8, ["Logística", "Logística", "Química II", "Química II", "Sociologia II", "Sociologia II"]),
            createDay(9, ["Língua Estrangeira", "Língua Estrangeira", "História II", "História II", "Legisl. Trab.", "Legisl. Trab."]),
            createDay(10, ["SIG e OSM", "SIG e OSM", "Física II", "Física II", "Ed. Artística I (Música)", "Ed. Artística I (Música)"]),
            createDay(11, ["Biologia II", "Biologia II", "LPLB II", "LPLB II", "Filosofia II", "Filosofia II"]),
            createDay(12, ["Ed. Física II", "Ed. Física II", "Geografia II", "Geografia II", "Marketing", "Marketing"]),
            createDay(13, ["Contabilidade", "Contabilidade", "Matemática II", "Matemática II", "Logística", "Logística"]),
            createDay(14, ["Química II", "Química II", "Sociologia II", "Sociologia II", "Língua Estrangeira", "Língua Estrangeira"]),
            createDay(15, ["História II", "História II", "Legisl. Trab.", "Legisl. Trab.", "SIG e OSM", "SIG e OSM"]),
            createDay(16, ["Física II", "Física II", "Ed. Artística I (Música)", "Ed. Artística I (Música)", "Biologia II", "Biologia II"]),
            createDay(17, ["LPLB II", "LPLB II", "Filosofia II", "Filosofia II", "Ed. Física II", "Ed. Física II"]),
            createDay(18, ["Geografia II", "Geografia II", "Marketing", "Marketing", "Contabilidade", "Contabilidade"]),
            createDay(19, ["Matemática II", "Matemática II", "Logística", "Logística", "Química II", "Química II"]),
            createDay(20, ["Sociologia II", "Sociologia II", "Língua Estrangeira", "Língua Estrangeira", "História II", "História II"])
        ],
        "3": [
            createDay(0, ["LPLB III", "LPLB III", "Filosofia III", "Filosofia III", "Empreend. Inov.", "Empreend. Inov."]),
            createDay(1, ["Gest. Pessoas", "Gest. Pessoas", "Economia", "Economia", "Química III", "Química III"]),
            createDay(2, ["Matemática III", "Matemática III", "APO", "APO", "Adm. Finan. Orç.", "Adm. Finan. Orç."]),
            createDay(3, ["Geografia III", "Geografia III", "História III", "História III", "Língua Estrangeira", "Língua Estrangeira"]),
            createDay(4, ["Ed. Artística II (Música)", "Ed. Artística II (Música)", "Sociologia III", "Sociologia III", "Biologia III", "Biologia III"]),
            createDay(5, ["Física III", "Física III", "LPLB III", "LPLB III", "Filosofia III", "Filosofia III"]),
            createDay(6, ["Empreend. Inov.", "Empreend. Inov.", "Gest. Pessoas", "Gest. Pessoas", "Economia", "Economia"]),
            createDay(7, ["Química III", "Química III", "Matemática III", "Matemática III", "APO", "APO"]),
            createDay(8, ["Adm. Finan. Orç.", "Adm. Finan. Orç.", "Geografia III", "Geografia III", "História III", "História III"]),
            createDay(9, ["Língua Estrangeira", "Língua Estrangeira", "Ed. Artística II (Música)", "Ed. Artística II (Música)", "Sociologia III", "Sociologia III"]),
            createDay(10, ["Biologia III", "Biologia III", "Física III", "Física III", "LPLB III", "LPLB III"]),
            createDay(11, ["Filosofia III", "Filosofia III", "Empreend. Inov.", "Empreend. Inov.", "Gest. Pessoas", "Gest. Pessoas"]),
            createDay(12, ["Economia", "Economia", "Química III", "Química III", "Matemática III", "Matemática III"]),
            createDay(13, ["APO", "APO", "Adm. Finan. Orç.", "Adm. Finan. Orç.", "Geografia III", "Geografia III"]),
            createDay(14, ["História III", "História III", "Língua Estrangeira", "Língua Estrangeira", "Ed. Artística II (Música)", "Ed. Artística II (Música)"]),
            createDay(15, ["Sociologia III", "Sociologia III", "Biologia III", "Biologia III", "Física III", "Física III"]),
            createDay(16, ["LPLB III", "LPLB III", "Filosofia III", "Filosofia III", "Empreend. Inov.", "Empreend. Inov."]),
            createDay(17, ["Gest. Pessoas", "Gest. Pessoas", "Economia", "Economia", "Química III", "Química III"]),
            createDay(18, ["Matemática III", "Matemática III", "APO", "APO", "Adm. Finan. Orç.", "Adm. Finan. Orç."]),
            createDay(19, ["Geografia III", "Geografia III", "História III", "História III", "Língua Estrangeira", "Língua Estrangeira"]),
            createDay(20, ["Ed. Artística II (Música)", "Ed. Artística II (Música)", "Sociologia III", "Sociologia III", "Biologia III", "Biologia III"])
        ]
    }
};