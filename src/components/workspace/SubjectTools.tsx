import type { WorkspaceSubject } from '../../data/workspaceData';
import { useTheme } from '../../context/ThemeContext';

interface SubjectToolsProps {
  subject: WorkspaceSubject;
  activeTool: string;
  onToolChange: (tool: string) => void;
}

export default function SubjectTools({ subject, activeTool, onToolChange }: SubjectToolsProps) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';
  const editorBg = theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.18)]';

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className={`font-bold text-base ${textColor}`}>Subject Tools</h3>
          <p className={`text-xs ${mutedColor}`}>Tools adapt to {subject.name} and the current lesson.</p>
        </div>
        <span className="px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 text-[10px] font-bold">Context-aware</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {subject.tools.map((tool) => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              activeTool === tool
                ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/20'
                : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600 hover:bg-cyan-500/20'
            }`}
          >
            {tool}
          </button>
        ))}
      </div>
      <div className={`rounded-xl border p-4 min-h-[130px] ${editorBg}`}>
        <div className="flex items-center justify-between mb-3">
          <p className={`font-bold text-sm ${textColor}`}>{activeTool}</p>
          <button className="text-cyan-600 text-xs font-bold hover:text-cyan-700">Reset tool</button>
        </div>
        <ToolDemo subjectName={subject.name} activeTool={activeTool} textColor={textColor} mutedColor={mutedColor} />
      </div>
    </div>
  );
}

function ToolDemo({ subjectName, activeTool, textColor, mutedColor }: { subjectName: string; activeTool: string; textColor: string; mutedColor: string }) {
  if (/calculator|equation|converter|balancing/i.test(activeTool)) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {['x² + 5x + 6 = 0', 'y = mx + c', 'F = ma'].map((formula) => (
          <button key={formula} className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-bold text-left">
            {formula}
          </button>
        ))}
      </div>
    );
  }
  if (/coding|syntax|algorithm|flowchart/i.test(activeTool)) {
    return (
      <pre className="text-xs text-cyan-500 overflow-x-auto">
{`function solve(problem) {
  const steps = decompose(problem);
  return steps.map(explain);
}`}
      </pre>
    );
  }
  if (/writing|essay|insha|journal|reflection/i.test(activeTool)) {
    return <textarea className="w-full min-h-[80px] bg-transparent focus:outline-none text-sm text-inherit" placeholder={`Draft your ${subjectName} response here...`} />;
  }
  return (
    <div>
      <p className={`text-sm font-semibold ${textColor}`}>Interactive {activeTool}</p>
      <p className={`text-xs mt-1 ${mutedColor}`}>This mock tool is ready for backend data, file storage, AI feedback, and lesson context.</p>
    </div>
  );
}