import type { ExamPaper } from '../../services/examinations.service';
import { difficultyLabel, paperTypeLabel } from '../../services/examinations.service';
import type { ExamMode } from '../../views/ExamsView';
import { useTheme } from '../../context/ThemeContext';

interface ExamCardProps {
  paper: ExamPaper;
  bookmarked: boolean;
  onPreview: (paper: ExamPaper) => void;
  onStart: (paper: ExamPaper, mode: ExamMode) => void;
  onBookmark: (paperId: string) => void;
  onDownload: (paper: ExamPaper) => void;
}

export default function ExamCard({ paper, bookmarked, onPreview, onStart, onBookmark, onDownload }: ExamCardProps) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const rowBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.18)]';

  return (
    <div className={`rounded-2xl border p-4 transition-all hover:border-cyan-500/35 ${rowBg}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold text-base truncate ${textColor}`}>{paper.title}</h3>
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-[10px] font-bold">{paper.year}</span>
          </div>
          <p className={`text-xs ${mutedColor}`}>{paper.term} • {paperTypeLabel(paper.paperType)} • {paper.durationMinutes} min • {paper.totalMarks} marks • {paper.questionCount} questions</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${paper.completionStatus === 'Completed' ? 'bg-green-500/10 text-green-600 border-green-500/20' : paper.completionStatus === 'In Progress' ? 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' : 'bg-purple-500/10 text-purple-600 border-purple-500/20'}`}>
          {paper.completionStatus}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4">
        <Metric label="Your Score" value={paper.latestScore !== null ? `${paper.latestScore}%` : '—'} />
        <Metric label="Attempts" value={String(paper.attemptCount)} />
        <Metric label="Marks" value={String(paper.totalMarks)} />
        <Metric label="Difficulty" value={difficultyLabel(paper.difficulty)} />
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button onClick={() => onPreview(paper)} className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold hover:bg-cyan-500/20">Preview</button>
        <button onClick={() => onStart(paper, 'authentic')} className="px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-bold hover:bg-blue-600">Start</button>
        <button onClick={() => onStart(paper, 'guided')} className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 text-xs font-bold hover:bg-purple-500/20">AI Walkthrough</button>
        <button onClick={() => onBookmark(paper.id)} className={`px-3 py-2 rounded-lg border text-xs font-bold ${bookmarked ? 'bg-yellow-500/10 border-yellow-500/25 text-yellow-600' : 'bg-slate-500/10 border-slate-500/20 text-slate-500'}`}>{bookmarked ? 'Bookmarked' : 'Bookmark'}</button>
        <button onClick={() => onDownload(paper)} className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold hover:bg-green-500/20">Download</button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/15 p-2">
      <p className="text-cyan-600 text-[10px] font-bold uppercase">{label}</p>
      <p className="text-sm font-extrabold text-cyan-700 mt-0.5 truncate">{value}</p>
    </div>
  );
}