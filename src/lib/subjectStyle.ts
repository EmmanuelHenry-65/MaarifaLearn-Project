export type SubjectStyle = { icon: string; iconColor: string; barColor: string; cardTint: string };

export const SUBJECT_STYLES: Record<string, SubjectStyle> = {
  mathematics: { icon: '⨍', iconColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400', barColor: 'bg-gradient-to-r from-blue-500 to-blue-400', cardTint: 'from-blue-500/20 to-blue-600/10' },
  english: { icon: '📖', iconColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400', barColor: 'bg-gradient-to-r from-purple-500 to-purple-400', cardTint: 'from-purple-500/20 to-purple-600/10' },
  kiswahili: { icon: '🗣️', iconColor: 'bg-teal-500/10 border-teal-500/20 text-teal-400', barColor: 'bg-gradient-to-r from-teal-500 to-teal-400', cardTint: 'from-teal-500/20 to-teal-600/10' },
  ict: { icon: '💻', iconColor: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400', barColor: 'bg-gradient-to-r from-cyan-500 to-cyan-400', cardTint: 'from-cyan-500/20 to-cyan-600/10' },
  pe: { icon: '🏃', iconColor: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', barColor: 'bg-gradient-to-r from-indigo-500 to-indigo-400', cardTint: 'from-indigo-500/20 to-indigo-600/10' },
  csl: { icon: '🤝', iconColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', barColor: 'bg-gradient-to-r from-emerald-500 to-emerald-400', cardTint: 'from-emerald-500/20 to-emerald-600/10' },
  physics: { icon: '⚛️', iconColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400', barColor: 'bg-gradient-to-r from-amber-500 to-amber-400', cardTint: 'from-amber-500/20 to-amber-600/10' },
  chemistry: { icon: '🧪', iconColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400', barColor: 'bg-gradient-to-r from-orange-500 to-orange-400', cardTint: 'from-orange-500/20 to-orange-600/10' },
  'computer-studies': { icon: '🖥️', iconColor: 'bg-pink-500/10 border-pink-500/20 text-pink-400', barColor: 'bg-gradient-to-r from-pink-500 to-pink-400', cardTint: 'from-pink-500/20 to-pink-600/10' },
};

export const DEFAULT_SUBJECT_STYLE: SubjectStyle = { icon: '📘', iconColor: 'bg-slate-500/10 border-slate-500/20 text-slate-400', barColor: 'bg-gradient-to-r from-slate-500 to-slate-400', cardTint: 'from-slate-500/20 to-slate-600/10' };

export const styleFor = (subjectCode: string): SubjectStyle => SUBJECT_STYLES[subjectCode] ?? DEFAULT_SUBJECT_STYLE;
