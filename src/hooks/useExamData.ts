import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getExamSubjects,
  getExamPapers,
  getExamStats,
  getBookmarkedPaperIds,
  togglePaperBookmark,
  type ExamSubject,
  type ExamPaper,
  type ExamStats,
} from '../services/examinations.service';

const EMPTY_STATS: ExamStats = { papersAttempted: 0, averageScore: 0, bestScore: 0, totalPracticeMinutes: 0 };

/**
 * Loads Past Papers / Exam Center data for the current user from Supabase.
 * Mirrors useResourcesData.ts's shape: per-concern state, an `active` flag
 * to discard stale results, and Promise.all for the parallel fetches.
 */
export function useExamData() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<ExamSubject[]>([]);
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [stats, setStats] = useState<ExamStats>(EMPTY_STATS);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!user) {
        setSubjects([]);
        setPapers([]);
        setStats(EMPTY_STATS);
        setBookmarkedIds(new Set());
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [subjectRows, paperRows, statsRow, bookmarkIds] = await Promise.all([
          getExamSubjects(user.id),
          getExamPapers(user.id),
          getExamStats(user.id),
          getBookmarkedPaperIds(user.id),
        ]);

        if (!active) return;

        setSubjects(subjectRows);
        setPapers(paperRows);
        setStats(statsRow);
        setBookmarkedIds(bookmarkIds);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load exam data');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [user, reloadToken]);

  /** Re-runs every query -- call after starting/submitting an attempt so stats/papers reflect it. */
  const refresh = useCallback(() => setReloadToken((t) => t + 1), []);

  async function toggleBookmark(paperId: string) {
    if (!user) return;

    const alreadyBookmarked = bookmarkedIds.has(paperId);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (alreadyBookmarked) next.delete(paperId);
      else next.add(paperId);
      return next;
    });

    try {
      await togglePaperBookmark(user.id, paperId, !alreadyBookmarked);
    } catch (err) {
      // Roll back the optimistic update if the write failed.
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (alreadyBookmarked) next.add(paperId);
        else next.delete(paperId);
        return next;
      });
      throw err;
    }
  }

  return { subjects, papers, stats, bookmarkedIds, toggleBookmark, refresh, loading, error };
}
