import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export type ResourceType = 'pdf' | 'video' | 'audio' | 'image' | 'link';

export interface SubjectSummary {
  id: string;
  name: string;
  resourceCount: number;
}

export interface ResourceSummary {
  id: string;
  title: string;
  resourceType: ResourceType;
  url: string | null;
  createdAt: string;
  subjectName: string | null;
}

export interface RecentlyViewedItem {
  topicId: string;
  topicTitle: string;
  subjectName: string | null;
  lastAccessedAt: string;
}

export interface ResourcesStats {
  totalResources: number;
  totalSubjects: number;
  totalTopics: number;
  lastUpdatedAt: string | null;
}

const EMPTY_STATS: ResourcesStats = {
  totalResources: 0,
  totalSubjects: 0,
  totalTopics: 0,
  lastUpdatedAt: null,
};

function mapResourceRow(r: any): ResourceSummary {
  return {
    id: r.id,
    title: r.title,
    resourceType: r.resource_type,
    url: r.url,
    createdAt: r.created_at,
    // Subject-wide resources (curriculum notes/pamphlets) carry subject_id
    // directly; topic-scoped resources derive it through the topic's lesson.
    subjectName: r.topic?.lesson?.subject?.name ?? r.subject?.name ?? null,
  };
}

export function useResourcesData() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ResourcesStats>(EMPTY_STATS);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [featured, setFeatured] = useState<ResourceSummary[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [
          resourceCountRes,
          subjectCountRes,
          topicCountRes,
          latestResourceRes,
          subjectRowsRes,
          resourceSubjectRowsRes,
          featuredRowsRes,
        ] = await Promise.all([
          supabase.from('resources').select('*', { count: 'exact', head: true }),
          supabase.from('subjects').select('*', { count: 'exact', head: true }),
          supabase.from('topics').select('*', { count: 'exact', head: true }),
          supabase.from('resources').select('created_at').order('created_at', { ascending: false }).limit(1),
          supabase.from('subjects').select('id, name'),
          supabase.from('resources').select('id, subject_id, topic:topics(lesson:lessons(subject_id))'),
          supabase
            .from('resources')
            .select('id, title, resource_type, url, created_at, subject:subjects(name), topic:topics(title, lesson:lessons(subject:subjects(name)))')
            .order('created_at', { ascending: false })
            .limit(60),
        ]);

        if (!active) return;

        const firstError = [
          resourceCountRes.error,
          subjectCountRes.error,
          topicCountRes.error,
          latestResourceRes.error,
          subjectRowsRes.error,
          resourceSubjectRowsRes.error,
          featuredRowsRes.error,
        ].find(Boolean);
        if (firstError) throw firstError;

        const countsBySubject = new Map<string, number>();
        (resourceSubjectRowsRes.data ?? []).forEach((row: any) => {
          const subjectId = row.subject_id ?? row.topic?.lesson?.subject_id;
          if (!subjectId) return;
          countsBySubject.set(subjectId, (countsBySubject.get(subjectId) ?? 0) + 1);
        });

        const subjectSummaries: SubjectSummary[] = (subjectRowsRes.data ?? [])
          .map((s: any) => ({
            id: s.id,
            name: s.name,
            resourceCount: countsBySubject.get(s.id) ?? 0,
          }))
          .sort((a, b) => b.resourceCount - a.resourceCount);

        setSubjects(subjectSummaries);
        setStats({
          totalResources: resourceCountRes.count ?? 0,
          totalSubjects: subjectCountRes.count ?? 0,
          totalTopics: topicCountRes.count ?? 0,
          lastUpdatedAt: latestResourceRes.data?.[0]?.created_at ?? null,
        });

        const featuredResources = (featuredRowsRes.data ?? []).map(mapResourceRow);
        setFeatured(featuredResources);

        if (user) {
          const [bookmarkRowsRes, progressRowsRes] = await Promise.all([
            supabase.from('bookmarks').select('resource_id').eq('profile_id', user.id),
            supabase
              .from('progress')
              .select('last_accessed_at, topic:topics(id, title, lesson:lessons(subject:subjects(name)))')
              .eq('profile_id', user.id)
              .not('last_accessed_at', 'is', null)
              .order('last_accessed_at', { ascending: false })
              .limit(3),
          ]);

          if (!active) return;

          const bookmarked = new Set((bookmarkRowsRes.data ?? []).map((b: any) => b.resource_id)) as Set<string>;
          setBookmarkedIds(bookmarked);

          setRecentlyViewed(
            (progressRowsRes.data ?? [])
              .filter((p: any) => p.topic)
              .map((p: any) => ({
                topicId: p.topic.id,
                topicTitle: p.topic.title,
                subjectName: p.topic.lesson?.subject?.name ?? null,
                lastAccessedAt: p.last_accessed_at,
              }))
          );
        } else {
          setRecentlyViewed([]);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load resources');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [user]);

  async function toggleBookmark(resourceId: string) {
    if (!user) return;

    const alreadyBookmarked = bookmarkedIds.has(resourceId);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (alreadyBookmarked) next.delete(resourceId);
      else next.add(resourceId);
      return next;
    });

    if (alreadyBookmarked) {
      await supabase.from('bookmarks').delete().eq('profile_id', user.id).eq('resource_id', resourceId);
    } else {
      await supabase.from('bookmarks').insert({ profile_id: user.id, resource_id: resourceId });
    }
  }

  return { stats, subjects, featured, recentlyViewed, bookmarkedIds, toggleBookmark, loading, error };
}
