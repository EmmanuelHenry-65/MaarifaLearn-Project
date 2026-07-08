import { useTheme } from '../../context/ThemeContext';

interface SettingsRowProps {
  icon: string;
  label: string;
  description: string;
  /** Dev-facing note on what's needed to build this out for real — only meant for "Coming Soon" rows. */
  buildNote?: string;
  children: React.ReactNode;
}

// Icon + label + description + control row, matching the row layout already
// used inside PreferencesCard, factored out so the new Settings sections can
// reuse the same visual pattern without touching PreferencesCard itself.
export default function SettingsRow({ icon, label, description, buildNote, children }: SettingsRowProps) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const labelColor = theme === 'light' ? 'text-slate-500' : 'text-gray-500';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="w-8 h-8 rounded-lg border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center text-sm text-cyan-500 flex-shrink-0">
          {icon}
        </span>
        <div>
          <p className={`text-sm font-semibold ${textColor}`}>{label}</p>
          <p className={`text-xs ${labelColor}`}>{description}</p>
          {buildNote && <p className="text-[11px] italic text-amber-500/80 mt-1">🛠 {buildNote}</p>}
        </div>
      </div>
      <div className="sm:flex-shrink-0">{children}</div>
    </div>
  );
}
