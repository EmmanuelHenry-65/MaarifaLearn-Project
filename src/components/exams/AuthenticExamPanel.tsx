import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  getExamSubmissions,
  markExamSubmission,
  uploadExamSubmission,
  type ExamPaper,
  type ExamSubmission,
} from '../../services/examinations.service';
import { forceDownloadUrl } from '../../utils/download';
import PdfModal from '../common/PdfModal';

interface AuthenticExamPanelProps {
  paper: ExamPaper;
  userId: string;
}

const statusLabel = (status: ExamSubmission['status']) => {
  if (status === 'ai_reviewing') return 'AI is reviewing — if this sits too long, use Retry Marking';
  if (status === 'reviewed') return 'Reviewed';
  return 'Uploaded — not yet marked';
};

export default function AuthenticExamPanel({ paper, userId }: AuthenticExamPanelProps) {
  const { theme } = useTheme();
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  const mutedColor = theme === 'light' ? 'text-slate-500' : 'text-gray-400';
  const itemBg = theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[rgba(17,24,50,0.55)] border-[rgba(56,78,135,0.18)]';

  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [notice, setNotice] = useState('');
  const [viewingPdf, setViewingPdf] = useState<{ title: string; url: string } | null>(null);
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      setSubmissions(await getExamSubmissions(userId, paper.id));
    } catch {
      setNotice('Could not load your past submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper.id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setNotice('');
    try {
      const submissionId = await uploadExamSubmission(userId, paper.id, file);
      setNotice('Uploaded! Marking your paper now...');
      await load();
      setUploading(false);
      setMarking(true);
      await markExamSubmission(submissionId);
      setNotice('Marking complete — see your result below.');
      await load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Upload failed — please try again.');
    } finally {
      setUploading(false);
      setMarking(false);
    }
  };

  const retryMarking = async (submissionId: string) => {
    setRetryingId(submissionId);
    setNotice('');
    try {
      await markExamSubmission(submissionId);
      setNotice('Marking complete — see your result below.');
      await load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Marking failed again — please try once more in a moment.');
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-4 ${itemBg}`}>
        <h4 className={`font-bold text-sm ${textColor}`}>1. View the exam paper</h4>
        <p className={`text-xs mt-1 ${mutedColor}`}>Read it here, or print it and complete it on paper, exactly like the real exam.</p>
        {paper.pdfUrl ? (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setViewingPdf({ title: paper.title, url: paper.pdfUrl! })}
              className="inline-flex px-4 py-2 rounded-lg bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-600"
            >
              View Exam Paper
            </button>
            <a
              href={forceDownloadUrl(paper.pdfUrl, `${paper.title}.pdf`)}
              className="inline-flex px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-xs font-bold hover:bg-cyan-500/20"
            >
              Download
            </a>
          </div>
        ) : (
          <p className="mt-3 text-xs text-gray-500 italic">Exam paper not uploaded yet — check back soon.</p>
        )}
      </div>

      <div className={`rounded-xl border p-4 ${itemBg}`}>
        <h4 className={`font-bold text-sm ${textColor}`}>2. Upload your completed answers</h4>
        <p className={`text-xs mt-1 ${mutedColor}`}>A clear photo or scan (PDF/JPG/PNG) of your finished answer sheet.</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || marking}
          className="inline-flex mt-3 px-4 py-2 rounded-lg bg-purple-500 text-white text-xs font-bold hover:bg-purple-600 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : marking ? 'AI is marking your paper...' : 'Upload Completed Answers'}
        </button>
        {notice && <p className={`text-xs mt-2 ${mutedColor}`}>{notice}</p>}
      </div>

      <div className={`rounded-xl border p-4 ${itemBg}`}>
        <h4 className={`font-bold text-sm ${textColor}`}>Your submissions</h4>
        {loading ? (
          <p className={`text-xs mt-2 ${mutedColor}`}>Loading...</p>
        ) : submissions.length === 0 ? (
          <p className={`text-xs mt-2 ${mutedColor}`}>No submissions yet for this paper.</p>
        ) : (
          <div className="space-y-2 mt-2">
            {submissions.map((s) => (
              <div key={s.id} className={`rounded-lg ${s.aiFeedback ? `border p-2 ${itemBg}` : ''}`}>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className={textColor}>{new Date(s.submittedAt).toLocaleString()}</p>
                    <p className={mutedColor}>{statusLabel(s.status)}{s.aiPercentage !== null ? ` • ${s.aiPercentage}%` : ''}</p>
                  </div>
                  <div className="flex gap-3">
                    {(s.status === 'submitted' || s.status === 'ai_reviewing') && (
                      <button
                        onClick={() => retryMarking(s.id)}
                        disabled={retryingId === s.id}
                        className="text-purple-600 font-bold disabled:opacity-50"
                      >
                        {retryingId === s.id ? 'Marking...' : s.status === 'ai_reviewing' ? 'Retry Marking' : 'Mark Now'}
                      </button>
                    )}
                    {s.aiFeedback && (
                      <button onClick={() => setExpandedFeedbackId((id) => (id === s.id ? null : s.id))} className="text-cyan-600 font-bold">
                        {expandedFeedbackId === s.id ? 'Hide Feedback' : 'View Feedback'}
                      </button>
                    )}
                    {s.signedUrl && (
                      <button onClick={() => setViewingPdf({ title: `Your submission — ${new Date(s.submittedAt).toLocaleDateString()}`, url: s.signedUrl! })} className="text-cyan-600 font-bold">
                        View
                      </button>
                    )}
                  </div>
                </div>
                {expandedFeedbackId === s.id && s.aiFeedback && (
                  <p className={`text-xs mt-2 leading-relaxed whitespace-pre-line ${mutedColor}`}>{s.aiFeedback}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {viewingPdf && <PdfModal title={viewingPdf.title} url={viewingPdf.url} onClose={() => setViewingPdf(null)} />}
    </div>
  );
}
