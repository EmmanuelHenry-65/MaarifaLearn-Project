export type ExamSubjectId =
  | 'mathematics'
  | 'english'
  | 'kiswahili'
  | 'ict'
  | 'pe'
  | 'csl'
  | 'physics'
  | 'chemistry'
  | 'computer-studies';

export type QuestionType = 'multiple-choice' | 'short-answer' | 'essay' | 'matching' | 'fill-blank' | 'practical' | 'diagram' | 'calculation' | 'code';
export type ExamMode = 'authentic' | 'guided';

export interface ExamSubject {
  id: ExamSubjectId;
  name: string;
  icon: string;
  accent: string;
  readiness: number;
}

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  topic: string;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  marks: number;
  options?: string[];
  correctAnswer: string;
  markingScheme: string;
  aiExplanation: string;
}

export interface ExamPaper {
  id: string;
  subjectId: ExamSubjectId;
  title: string;
  year: number;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  durationMinutes: number;
  totalMarks: number;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  type: 'KCSE Practice' | 'Mock Exam' | 'Timed Exam' | 'Topical Paper';
  completionStatus: 'Not Started' | 'In Progress' | 'Completed';
  averageScore: number;
  attemptCount: number;
  readiness: number;
  topics: string[];
  questions: ExamQuestion[];
}

export const examSubjects: ExamSubject[] = [
  { id: 'mathematics', name: 'Mathematics', icon: '⨍', accent: 'from-blue-500 to-cyan-400', readiness: 78 },
  { id: 'english', name: 'English', icon: '📖', accent: 'from-indigo-500 to-blue-400', readiness: 72 },
  { id: 'kiswahili', name: 'Kiswahili', icon: '🗣️', accent: 'from-teal-500 to-emerald-400', readiness: 69 },
  { id: 'ict', name: 'ICT', icon: '💻', accent: 'from-cyan-500 to-sky-500', readiness: 84 },
  { id: 'pe', name: 'Physical Education (PE)', icon: '🏃', accent: 'from-indigo-500 to-purple-500', readiness: 64 },
  { id: 'csl', name: 'Community Service Learning (CSL)', icon: '🤝', accent: 'from-emerald-500 to-teal-400', readiness: 67 },
  { id: 'physics', name: 'Physics', icon: '⚛️', accent: 'from-amber-500 to-yellow-400', readiness: 58 },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', accent: 'from-orange-500 to-red-400', readiness: 71 },
  { id: 'computer-studies', name: 'Computer Studies', icon: '🖥️', accent: 'from-sky-500 to-cyan-400', readiness: 81 },
];

const makeQuestions = (subjectId: ExamSubjectId, seed: string): ExamQuestion[] => {
  const baseTopic = subjectId === 'mathematics' ? 'Simultaneous Equations' : subjectId === 'chemistry' ? 'Chemical Bonding' : subjectId === 'physics' ? 'Forces and Motion' : subjectId === 'computer-studies' ? 'Algorithms' : 'Core Concepts';
  return [
    {
      id: `${seed}-q1`,
      type: 'multiple-choice',
      prompt: `Which statement best describes ${baseTopic.toLowerCase()} in this context?`,
      topic: baseTopic,
      difficulty: 'Foundation',
      marks: 2,
      options: ['It identifies the unknown relationship', 'It ignores all variables', 'It only applies to essays', 'It cannot be tested'],
      correctAnswer: 'It identifies the unknown relationship',
      markingScheme: 'Award 2 marks for identifying the core concept and rejecting distractors.',
      aiExplanation: 'The correct option focuses on the underlying relationship being tested rather than surface wording.',
    },
    {
      id: `${seed}-q2`,
      type: subjectId === 'computer-studies' ? 'code' : subjectId === 'mathematics' || subjectId === 'physics' || subjectId === 'chemistry' ? 'calculation' : 'short-answer',
      prompt: `Solve the structured problem about ${baseTopic}. Show your working clearly.`,
      topic: baseTopic,
      difficulty: 'Intermediate',
      marks: 6,
      correctAnswer: 'A complete working sequence with correct final response.',
      markingScheme: 'Award method marks for setup, process marks for correct steps, and accuracy marks for the final answer.',
      aiExplanation: 'Break the problem into known quantities, required output, method, working, and final verification.',
    },
    {
      id: `${seed}-q3`,
      type: 'essay',
      prompt: `Explain how ${baseTopic} can be applied in a real-life CBE scenario.`,
      topic: baseTopic,
      difficulty: 'Advanced',
      marks: 10,
      correctAnswer: 'A structured response with clear explanation, examples, and conclusion.',
      markingScheme: 'Award marks for relevance, structure, concept accuracy, examples, and clarity.',
      aiExplanation: 'Strong answers define the concept, connect it to a real situation, and evaluate its usefulness.',
    },
    {
      id: `${seed}-q4`,
      type: 'fill-blank',
      prompt: `Fill in the missing keyword: The first step in this problem is to identify the _____.`,
      topic: baseTopic,
      difficulty: 'Foundation',
      marks: 2,
      correctAnswer: 'knowns',
      markingScheme: 'Award 2 marks for knowns or equivalent wording such as given information.',
      aiExplanation: 'Identifying what is given prevents guessing and supports a logical solution path.',
    },
    {
      id: `${seed}-q5`,
      type: 'matching',
      prompt: `Match each term in ${baseTopic} to its correct description.`,
      topic: baseTopic,
      difficulty: 'Intermediate',
      marks: 5,
      correctAnswer: 'All terms matched correctly.',
      markingScheme: 'Award 1 mark for each correct match.',
      aiExplanation: 'Matching tests conceptual fluency and whether the learner can distinguish similar terms.',
    },
  ];
};

export const examPapers: ExamPaper[] = examSubjects.flatMap((subject, subjectIndex) =>
  [2026, 2025, 2024].map((year, index) => ({
    id: `${subject.id}-${year}`,
    subjectId: subject.id,
    title: `${subject.name} ${index === 0 ? 'Mock Exam' : index === 1 ? 'Paper 1' : 'Topical Paper'}`,
    year,
    term: (['Term 1', 'Term 2', 'Term 3'] as const)[index],
    durationMinutes: subject.id === 'pe' || subject.id === 'csl' ? 90 : 120 + index * 15,
    totalMarks: subject.id === 'english' || subject.id === 'kiswahili' ? 80 : 100,
    difficulty: (['Intermediate', 'Advanced', 'Foundation'] as const)[(subjectIndex + index) % 3],
    type: (['Mock Exam', 'Timed Exam', 'Topical Paper'] as const)[index],
    completionStatus: (['In Progress', 'Not Started', 'Completed'] as const)[(subjectIndex + index) % 3],
    averageScore: Math.max(48, Math.min(88, subject.readiness - 8 + index * 5)),
    attemptCount: 42 + subjectIndex * 11 + index * 7,
    readiness: Math.max(35, Math.min(96, subject.readiness + index * 3 - 4)),
    topics: subject.id === 'mathematics' ? ['Algebra', 'Geometry', 'Statistics'] : subject.id === 'chemistry' ? ['Bonding', 'Acids and Bases', 'Reactions'] : ['Core Concepts', 'Application', 'Reflection'],
    questions: makeQuestions(subject.id, `${subject.id}-${year}`),
  }))
);

export const examAnalytics = {
  weeklyImprovement: [58, 62, 66, 71, 74, 78],
  topicMastery: [
    { topic: 'Algebra', value: 78 },
    { topic: 'Comprehension', value: 72 },
    { topic: 'Chemical Bonding', value: 68 },
    { topic: 'Algorithms', value: 81 },
  ],
  recommendations: ['Revise simultaneous equations', 'Practice timed short answers', 'Review marking schemes', 'Attempt one guided exam'],
};