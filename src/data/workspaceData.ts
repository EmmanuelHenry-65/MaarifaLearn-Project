export type WorkspaceSubjectId =
  | 'mathematics'
  | 'english'
  | 'kiswahili'
  | 'ict'
  | 'pe'
  | 'csl'
  | 'physics'
  | 'chemistry'
  | 'computer-studies';

export type WorkspaceMode =
  | 'overview'
  | 'lesson'
  | 'videos'
  | 'notes'
  | 'worksheets'
  | 'resources'
  | 'flashcards'
  | 'practice'
  | 'past-questions'
  | 'bookmarks'
  | 'progress';

export interface WorkspaceTopic {
  id: string;
  title: string;
  mastery: number;
  duration: string;
  summary: string;
}

export interface WorkspaceLesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  mastery: number;
  topics: WorkspaceTopic[];
}

export interface WorkspaceUnit {
  id: string;
  title: string;
  lessons: WorkspaceLesson[];
}

export interface WorkspaceSubject {
  id: WorkspaceSubjectId;
  name: string;
  icon: string;
  category: 'Mandatory' | 'Elective';
  accent: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  studyTime: string;
  syllabus: string;
  competencies: string[];
  objectives: string[];
  recommendedPath: string[];
  units: WorkspaceUnit[];
  tools: string[];
}

const makeTopics = (prefix: string, titles: string[]): WorkspaceTopic[] =>
  titles.map((title, index) => ({
    id: `${prefix}-topic-${index + 1}`,
    title,
    mastery: [84, 72, 61, 48][index % 4],
    duration: `${12 + index * 4} min`,
    summary: `Focused learning notes, worked examples, and practice activities for ${title.toLowerCase()}.`,
  }));

const makeLesson = (
  id: string,
  title: string,
  topics: string[],
  completed = false,
  mastery = 64,
): WorkspaceLesson => ({
  id,
  title,
  duration: `${topics.length * 18} min`,
  completed,
  mastery,
  topics: makeTopics(id, topics),
});

export const workspaceSubjects: WorkspaceSubject[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: '⨍',
    category: 'Mandatory',
    accent: 'from-blue-500 to-cyan-400',
    progress: 82,
    lessonsCompleted: 24,
    totalLessons: 29,
    studyTime: '34h 20m',
    syllabus: 'Number, algebra, geometry, statistics, trigonometry, and practical problem-solving aligned to CBE competencies.',
    competencies: ['Mathematical reasoning', 'Problem solving', 'Financial literacy', 'Data interpretation'],
    objectives: ['Solve linear and quadratic equations', 'Model real-life situations mathematically', 'Interpret graphs and data', 'Communicate mathematical arguments'],
    recommendedPath: ['Algebra foundations', 'Simultaneous equations', 'Quadratics', 'Graphs and transformations', 'Practice assessment'],
    tools: ['Equation editor', 'Scratchpad', 'Formula sheet', 'Worked examples', 'Calculator', 'Graphing placeholder', 'Practice problems'],
    units: [
      { id: 'algebra', title: 'Algebra', lessons: [makeLesson('linear-equations', 'Linear Equations', ['Solving one-step equations', 'Solving two-step equations', 'Word problems'], true, 92), makeLesson('simultaneous-equations', 'Simultaneous Equations', ['Elimination method', 'Substitution method', 'Real-world systems'], false, 66), makeLesson('quadratics', 'Quadratics', ['Factorisation', 'Completing the square', 'Quadratic graphs'], false, 45)] },
      { id: 'geometry', title: 'Geometry', lessons: [makeLesson('circle-theorems', 'Circle Theorems', ['Angles in a circle', 'Tangents', 'Cyclic quadrilaterals'], false, 58)] },
      { id: 'statistics', title: 'Statistics', lessons: [makeLesson('data-analysis', 'Data Analysis', ['Mean median mode', 'Quartiles', 'Histograms'], false, 72)] },
      { id: 'trigonometry', title: 'Trigonometry', lessons: [makeLesson('trig-ratios', 'Trigonometric Ratios', ['Sine cosine tangent', 'Angles of elevation', 'Bearings'], false, 39)] },
    ],
  },
  {
    id: 'english',
    name: 'English',
    icon: '📖',
    category: 'Mandatory',
    accent: 'from-indigo-500 to-blue-400',
    progress: 75,
    lessonsCompleted: 20,
    totalLessons: 27,
    studyTime: '28h 10m',
    syllabus: 'Reading, grammar, writing, oral communication, literature, and composition for confident communication.',
    competencies: ['Critical reading', 'Creative writing', 'Oral presentation', 'Grammar accuracy'],
    objectives: ['Analyze literary texts', 'Write structured essays', 'Build vocabulary', 'Improve comprehension accuracy'],
    recommendedPath: ['Comprehension skills', 'Narrative writing', 'Grammar clinic', 'Essay planning', 'Peer review'],
    tools: ['Reading workspace', 'Comprehension activities', 'Writing workspace', 'Vocabulary builder', 'Grammar support', 'Essay planning'],
    units: [
      { id: 'reading', title: 'Reading', lessons: [makeLesson('comprehension', 'Comprehension Strategies', ['Skimming and scanning', 'Inference', 'Author purpose'], true, 80)] },
      { id: 'writing', title: 'Writing', lessons: [makeLesson('narrative-writing', 'Narrative Writing', ['Plot structure', 'Character voice', 'Editing for impact'], false, 70)] },
      { id: 'grammar', title: 'Grammar', lessons: [makeLesson('sentence-control', 'Sentence Control', ['Clauses', 'Punctuation', 'Common errors'], false, 64)] },
    ],
  },
  {
    id: 'kiswahili',
    name: 'Kiswahili',
    icon: '🗣️',
    category: 'Mandatory',
    accent: 'from-teal-500 to-emerald-400',
    progress: 71,
    lessonsCompleted: 17,
    totalLessons: 24,
    studyTime: '23h 05m',
    syllabus: 'Ufahamu, insha, sarufi, fasihi, msamiati, na mawasiliano kwa ufasaha.',
    competencies: ['Kusoma kwa ufahamu', 'Kuandika insha', 'Sarufi sahihi', 'Kuzungumza kwa ufasaha'],
    objectives: ['Kuandika insha iliyo na muundo bora', 'Kutambua aina za maneno', 'Kujibu maswali ya ufahamu', 'Kukuza msamiati'],
    recommendedPath: ['Ufahamu', 'Sarufi', 'Insha', 'Msamiati', 'Mazoezi ya tathmini'],
    tools: ['Insha workspace', 'Sarufi reference', 'Comprehension activities', 'Msamiati builder', 'Writing practice'],
    units: [
      { id: 'sarufi', title: 'Sarufi', lessons: [makeLesson('aina-za-maneno', 'Aina za Maneno', ['Nomino', 'Vitenzi', 'Vivumishi'], true, 76)] },
      { id: 'insha', title: 'Insha', lessons: [makeLesson('insha-ya-maelezo', 'Insha ya Maelezo', ['Muundo', 'Msamiati', 'Uhariri'], false, 62)] },
      { id: 'ufahamu', title: 'Ufahamu', lessons: [makeLesson('ufahamu-wa-kifungu', 'Ufahamu wa Kifungu', ['Hoja kuu', 'Maana ya maneno', 'Hitimisho'], false, 58)] },
    ],
  },
  {
    id: 'ict',
    name: 'ICT',
    icon: '💻',
    category: 'Mandatory',
    accent: 'from-cyan-500 to-blue-500',
    progress: 88,
    lessonsCompleted: 22,
    totalLessons: 25,
    studyTime: '31h 40m',
    syllabus: 'Digital literacy, productivity tools, safe internet use, data handling, and practical technology workflows.',
    competencies: ['Digital literacy', 'Cyber safety', 'Information management', 'Tool fluency'],
    objectives: ['Apply safe online practices', 'Create digital documents', 'Use spreadsheets', 'Explain computer systems'],
    recommendedPath: ['Digital citizenship', 'Productivity suite', 'Spreadsheets', 'Networks', 'Practical task'],
    tools: ['Digital literacy activities', 'Practical exercises', 'Interactive diagrams', 'Software workflow examples', 'Technology concept explorer'],
    units: [
      { id: 'digital-literacy', title: 'Digital Literacy', lessons: [makeLesson('safe-internet', 'Safe Internet Use', ['Passwords', 'Privacy', 'Cyberbullying'], true, 90)] },
      { id: 'productivity', title: 'Productivity Tools', lessons: [makeLesson('spreadsheets', 'Spreadsheets', ['Cell references', 'Formulas', 'Charts'], false, 82)] },
    ],
  },
  {
    id: 'pe',
    name: 'Physical Education (PE)',
    icon: '🏃',
    category: 'Mandatory',
    accent: 'from-indigo-500 to-purple-500',
    progress: 45,
    lessonsCompleted: 9,
    totalLessons: 20,
    studyTime: '14h 10m',
    syllabus: 'Movement skills, fitness, sports rules, wellness, teamwork, and personal health routines.',
    competencies: ['Fitness planning', 'Movement coordination', 'Teamwork', 'Wellness habits'],
    objectives: ['Track fitness activities', 'Explain sports rules', 'Practice safe warm-ups', 'Reflect on wellness'],
    recommendedPath: ['Warm-up basics', 'Fitness tracking', 'Sports rules', 'Team strategy', 'Wellness reflection'],
    tools: ['Movement illustrations', 'Sports rules', 'Fitness activity tracker', 'Exercise guides', 'Wellness notes'],
    units: [
      { id: 'fitness', title: 'Fitness', lessons: [makeLesson('activity-tracking', 'Activity Tracking', ['Warm ups', 'Cardio tracking', 'Recovery'], false, 45)] },
      { id: 'sports', title: 'Sports Rules', lessons: [makeLesson('team-games', 'Team Games', ['Rules', 'Positions', 'Fair play'], false, 38)] },
    ],
  },
  {
    id: 'csl',
    name: 'Community Service Learning (CSL)',
    icon: '🤝',
    category: 'Mandatory',
    accent: 'from-emerald-500 to-teal-400',
    progress: 54,
    lessonsCompleted: 11,
    totalLessons: 22,
    studyTime: '16h 25m',
    syllabus: 'Community problem solving, reflection, project planning, evidence collection, and service impact.',
    competencies: ['Civic responsibility', 'Project planning', 'Reflection', 'Collaboration'],
    objectives: ['Plan a service project', 'Keep a reflection journal', 'Collect evidence', 'Evaluate impact'],
    recommendedPath: ['Community mapping', 'Project proposal', 'Implementation log', 'Evidence portfolio', 'Reflection report'],
    tools: ['Community project planner', 'Service learning journal', 'Reflection workspace', 'Case studies', 'Evidence portfolio placeholder', 'Project templates'],
    units: [
      { id: 'project-planning', title: 'Project Planning', lessons: [makeLesson('community-mapping', 'Community Mapping', ['Identify needs', 'Stakeholders', 'Project goals'], false, 60)] },
      { id: 'reflection', title: 'Reflection', lessons: [makeLesson('service-journal', 'Service Journal', ['Daily entries', 'Evidence', 'Impact'], false, 48)] },
    ],
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: '⚛️',
    category: 'Elective',
    accent: 'from-amber-500 to-yellow-400',
    progress: 39,
    lessonsCompleted: 9,
    totalLessons: 23,
    studyTime: '18h 15m',
    syllabus: 'Motion, forces, energy, waves, electricity, measurement, experiments, and scientific reasoning.',
    competencies: ['Scientific inquiry', 'Measurement', 'Problem solving', 'Experimental analysis'],
    objectives: ['Use formulas correctly', 'Convert units', 'Analyze experiments', 'Solve motion problems'],
    recommendedPath: ['Measurements', 'Forces', 'Energy', 'Electricity', 'Practical investigation'],
    tools: ['Scientific calculator', 'Formula sheet', 'Unit converter', 'Simulation placeholders', 'Experiment viewer', 'Worked examples'],
    units: [
      { id: 'mechanics', title: 'Mechanics', lessons: [makeLesson('motion', 'Motion', ['Speed velocity acceleration', 'Distance-time graphs', 'Equations of motion'], false, 42)] },
      { id: 'electricity', title: 'Electricity', lessons: [makeLesson('circuits', 'Electric Circuits', ['Current', 'Voltage', 'Resistance'], false, 36)] },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: '🧪',
    category: 'Elective',
    accent: 'from-orange-500 to-red-400',
    progress: 56,
    lessonsCompleted: 14,
    totalLessons: 25,
    studyTime: '21h 30m',
    syllabus: 'Atomic structure, bonding, acids and bases, chemical reactions, laboratory skills, and analysis.',
    competencies: ['Laboratory safety', 'Chemical reasoning', 'Equation balancing', 'Data analysis'],
    objectives: ['Balance equations', 'Explain bonding', 'Use lab notes', 'Classify reactions'],
    recommendedPath: ['Atomic structure', 'Bonding', 'Chemical equations', 'Acids and bases', 'Lab report'],
    tools: ['Periodic table', 'Equation balancing workspace', 'Molecular structure placeholder', 'Experiment guides', 'Laboratory notes'],
    units: [
      { id: 'bonding', title: 'Chemical Bonding', lessons: [makeLesson('ionic-covalent', 'Ionic and Covalent Bonding', ['Electron transfer', 'Sharing electrons', 'Properties'], false, 58)] },
      { id: 'reactions', title: 'Chemical Reactions', lessons: [makeLesson('balancing-equations', 'Balancing Equations', ['Reactants', 'Products', 'Coefficients'], false, 52)] },
    ],
  },
  {
    id: 'computer-studies',
    name: 'Computer Studies',
    icon: '🖥️',
    category: 'Elective',
    accent: 'from-sky-500 to-cyan-400',
    progress: 78,
    lessonsCompleted: 18,
    totalLessons: 24,
    studyTime: '26h 00m',
    syllabus: 'Programming logic, algorithms, data representation, systems, networks, and practical computing tasks.',
    competencies: ['Algorithmic thinking', 'Programming basics', 'System design', 'Digital problem solving'],
    objectives: ['Write pseudocode', 'Trace algorithms', 'Explain system components', 'Build simple programs'],
    recommendedPath: ['Algorithms', 'Pseudocode', 'Flowcharts', 'Programming practice', 'Project task'],
    tools: ['Coding workspace placeholder', 'Syntax highlighted editor placeholder', 'Algorithm visualizer', 'Flowchart viewer', 'Practical exercises'],
    units: [
      { id: 'algorithms', title: 'Algorithms', lessons: [makeLesson('pseudocode', 'Pseudocode', ['Sequence', 'Selection', 'Iteration'], true, 80)] },
      { id: 'programming', title: 'Programming', lessons: [makeLesson('variables-and-logic', 'Variables and Logic', ['Data types', 'Operators', 'Control flow'], false, 72)] },
    ],
  },
];

export const getWorkspaceSubject = (id?: string) => workspaceSubjects.find((subject) => subject.id === id);

export const getDefaultLesson = (subject: WorkspaceSubject) => subject.units[0]?.lessons[0];
export const getDefaultTopic = (subject: WorkspaceSubject) => getDefaultLesson(subject)?.topics[0];