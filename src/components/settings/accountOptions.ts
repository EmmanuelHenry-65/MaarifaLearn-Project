// Fixed option lists for the enumerable account fields. Kept as plain data so
// they're easy to extend without touching component logic.

export const GRADE_OPTIONS = [
  'PP1',
  'PP2',
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
].map((grade) => ({ label: grade, value: grade }));

export const CURRICULUM_OPTIONS = [
  { label: 'CBC (Competency-Based Curriculum)', value: 'CBC (Competency-Based Curriculum)' },
  { label: '8-4-4 (Legacy)', value: '8-4-4 (Legacy)' },
  { label: 'IGCSE', value: 'IGCSE' },
  { label: 'British Curriculum', value: 'British Curriculum' },
  { label: 'American Curriculum', value: 'American Curriculum' },
];

export const LEARNING_PATHWAY_OPTIONS = [
  { label: 'STEM (Science, Technology, Engineering & Mathematics)', value: 'STEM (Science, Technology, Engineering & Mathematics)' },
  { label: 'Social Sciences', value: 'Social Sciences' },
  { label: 'Arts & Sports Science', value: 'Arts & Sports Science' },
];
