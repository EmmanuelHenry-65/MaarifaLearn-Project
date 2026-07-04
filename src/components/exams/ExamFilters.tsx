import type { ExamPaper } from '../../data/examData';
import { useTheme } from '../../context/ThemeContext';

export interface ExamFilterState {
  year: string;
  term: string;
  difficulty: string;
  topic: string;
  type: string;
  duration: string;
  status: string;
  sort: string;
  query: string;
}

interface ExamFiltersProps {
  filters: ExamFilterState;
  papers: ExamPaper[];
  onChange: (filters: ExamFilterState) => void;
}

const selectClassBase = 'px-3 py-2 rounded-lg border text-xs font-semibold focus:outline-none focus:border-cyan-500/50';

export default function ExamFilters({ filters, papers, onChange }: ExamFiltersProps) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const controlClass = theme === 'light'
    ? `${selectClassBase} bg-white border-slate-200 text-slate-700`
    : `${selectClassBase} bg-[rgba(17,24,50,0.75)] border-[rgba(56,78,135,0.25)] text-gray-300`;

  const topics = Array.from(new Set(papers.flatMap((paper) => paper.topics)));
  const years = Array.from(new Set(papers.map((paper) => paper.year))).sort((a, b) => b - a);

  const update = (key: keyof ExamFilterState, value: string) => onChange({ ...filters, [key]: value });

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className={`font-bold text-base ${textColor}`}>Examination Filters</h3>
        <button onClick={() => onChange({ year: 'All', term: 'All', difficulty: 'All', topic: 'All', type: 'All', duration: 'All', status: 'All', sort: 'Newest', query: '' })} className="text-cyan-600 text-xs font-bold hover:text-cyan-700">
          Reset filters
        </button>
      </div>
      <div className="grid grid-cols-5 gap-2">
        <input value={filters.query} onChange={(event) => update('query', event.target.value)} placeholder="Search exam papers..." className={`${controlClass} col-span-2`} />
        <select value={filters.year} onChange={(event) => update('year', event.target.value)} className={controlClass}><option>All</option>{years.map((year) => <option key={year}>{year}</option>)}</select>
        <select value={filters.term} onChange={(event) => update('term', event.target.value)} className={controlClass}><option>All</option><option>Term 1</option><option>Term 2</option><option>Term 3</option></select>
        <select value={filters.difficulty} onChange={(event) => update('difficulty', event.target.value)} className={controlClass}><option>All</option><option>Foundation</option><option>Intermediate</option><option>Advanced</option></select>
        <select value={filters.topic} onChange={(event) => update('topic', event.target.value)} className={controlClass}><option>All</option>{topics.map((topic) => <option key={topic}>{topic}</option>)}</select>
        <select value={filters.type} onChange={(event) => update('type', event.target.value)} className={controlClass}><option>All</option><option>Mock Exam</option><option>Timed Exam</option><option>Topical Paper</option></select>
        <select value={filters.duration} onChange={(event) => update('duration', event.target.value)} className={controlClass}><option>All</option><option>Under 2 hours</option><option>2 hours+</option></select>
        <select value={filters.status} onChange={(event) => update('status', event.target.value)} className={controlClass}><option>All</option><option>Not Started</option><option>In Progress</option><option>Completed</option></select>
        <select value={filters.sort} onChange={(event) => update('sort', event.target.value)} className={controlClass}><option>Newest</option><option>Oldest</option><option>Most Attempted</option></select>
      </div>
    </div>
  );
}