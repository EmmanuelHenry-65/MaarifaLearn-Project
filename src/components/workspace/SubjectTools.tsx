import { useState } from 'react';
import type { WorkspaceSubject } from '../../data/workspaceData';
import { useTheme } from '../../context/ThemeContext';
import SimpleCalculator from '../common/SimpleCalculator';

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
  const isCalculator = /calculator|equation|converter|balancing/i.test(activeTool);
  // Keyed by tool name so switching tools (within this session) doesn't wipe
  // what was typed into a different one -- content still resets on navigating
  // away, since there's nowhere in the schema to persist it long-term yet.
  const [draftsByTool, setDraftsByTool] = useState<Record<string, string>>({});

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
          {!isCalculator && (
            <button
              onClick={() => setDraftsByTool((prev) => ({ ...prev, [activeTool]: '' }))}
              className="text-cyan-600 text-xs font-bold hover:text-cyan-700"
            >
              Reset tool
            </button>
          )}
        </div>
        {isCalculator ? (
          <SimpleCalculator />
        ) : (
          <textarea
            className="w-full min-h-[90px] bg-transparent focus:outline-none text-sm text-inherit font-mono"
            placeholder={`Use ${activeTool} for ${subject.name} here...`}
            value={draftsByTool[activeTool] ?? ''}
            onChange={(e) => setDraftsByTool((prev) => ({ ...prev, [activeTool]: e.target.value }))}
          />
        )}
      </div>
    </div>
  );
}