import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useResourcesData, ResourceType, ResourceSummary } from '../hooks/useResourcesData';
import { allSubjects } from '../data/subjects';
import { formatRelativeTime } from '../utils/time';
import { forceDownloadUrl } from '../utils/download';
import VideoModal from '../components/common/VideoModal';

const ALL_RESOURCE_TYPES = ['pdf', 'video', 'audio', 'image', 'link'] as const;

const RESOURCE_TYPE_META: Record<ResourceType, { label: string; badgeColor: string; icon: string; gradient: string }> = {
  pdf: { label: 'PDF', badgeColor: 'bg-green-500', icon: '📄', gradient: 'bg-gradient-to-br from-green-800 to-emerald-900' },
  video: { label: 'VIDEO', badgeColor: 'bg-purple-500', icon: '▶', gradient: 'bg-gradient-to-br from-purple-900 to-indigo-900' },
  audio: { label: 'AUDIO', badgeColor: 'bg-pink-500', icon: '🎧', gradient: 'bg-gradient-to-br from-pink-900 to-rose-900' },
  image: { label: 'IMAGE', badgeColor: 'bg-indigo-500', icon: '🖼️', gradient: 'bg-gradient-to-br from-indigo-900 to-purple-900' },
  link: { label: 'LINK', badgeColor: 'bg-blue-500', icon: '🔗', gradient: 'bg-gradient-to-br from-blue-900 to-slate-900' },
};

const FALLBACK_SUBJECT_STYLES = [
  { color: 'bg-emerald-500', icon: '📘' },
  { color: 'bg-blue-500', icon: '📗' },
  { color: 'bg-purple-500', icon: '📕' },
  { color: 'bg-orange-500', icon: '📙' },
  { color: 'bg-teal-500', icon: '📓' },
  { color: 'bg-indigo-500', icon: '📔' },
];

function getSubjectStyle(name: string, index: number) {
  const known = allSubjects.find((s) => s.name.toLowerCase() === name.toLowerCase());
  if (known) {
    const colorClass = known.iconBg.split(' ').find((c) => c.startsWith('bg-')) ?? FALLBACK_SUBJECT_STYLES[0].color;
    return { color: colorClass, icon: known.icon };
  }
  return FALLBACK_SUBJECT_STYLES[index % FALLBACK_SUBJECT_STYLES.length];
}

function getSubjectSlug(name: string): string | null {
  const known = allSubjects.find((s) => s.name.toLowerCase() === name.toLowerCase());
  return known ? known.id : null;
}

function ResourceCard({
  resource,
  bookmarked,
  onOpen,
  onToggleBookmark,
}: {
  resource: ResourceSummary;
  bookmarked: boolean;
  onOpen: (resource: ResourceSummary) => void;
  onToggleBookmark: (resource: ResourceSummary) => void;
}) {
  const meta = RESOURCE_TYPE_META[resource.resourceType];
  return (
    <div
      onClick={() => onOpen(resource)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(resource)}
      className="bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all group cursor-pointer"
    >
      <div className={`h-24 ${meta.gradient} relative flex items-center justify-center`}>
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold text-white bg-black/40 backdrop-blur-sm border border-white/10">{meta.label}</span>
        <span className="text-4xl opacity-80 group-hover:scale-110 transition-transform">{meta.icon}</span>
        {(resource.resourceType === 'video' || resource.resourceType === 'audio') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
            </div>
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="text-white font-bold text-xs leading-tight mb-1 line-clamp-1">{resource.title}</h4>
        <p className="text-gray-500 text-[10px] leading-tight line-clamp-2 mb-3">{resource.subjectName ?? 'General'}</p>
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span>{meta.label} • {formatRelativeTime(resource.createdAt)}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(resource);
            }}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark this resource'}
            className={bookmarked ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResourcesView() {
  const [activeTab, setActiveTab] = useState<'All' | ResourceType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllRecommended, setShowAllRecommended] = useState(false);
  const featuredSectionRef = useRef<HTMLDivElement>(null);
  const { stats, subjects, featured, recentlyViewed, bookmarkedIds, toggleBookmark, loading, error } = useResourcesData();
  const [playingVideo, setPlayingVideo] = useState<ResourceSummary | null>(null);

  // Only show tabs for resource types that actually exist, instead of a
  // fixed list -- Audio/Image/Link have no content yet and offering a
  // filter with zero possible results is confusing, not helpful.
  const visibleTabs = useMemo(() => {
    const present = new Set(featured.map((r) => r.resourceType));
    return ['All', ...ALL_RESOURCE_TYPES.filter((t) => present.has(t))] as const;
  }, [featured]);

  const filteredFeatured = useMemo(() => {
    return featured
      .filter((r) => activeTab === 'All' || r.resourceType === activeTab)
      .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [featured, activeTab, searchQuery]);

  const recommendedPool = useMemo(
    () => featured.filter((r) => !bookmarkedIds.has(r.id)),
    [featured, bookmarkedIds]
  );
  const visibleRecommended = showAllRecommended ? recommendedPool : recommendedPool.slice(0, 3);

  const topSubjects = subjects.slice(0, 5);
  const maxSubjectCount = Math.max(1, ...subjects.map((s) => s.resourceCount));
  const popularSubjects = subjects.filter((s) => s.resourceCount > 0).slice(0, 6);

  function handleOpenResource(resource: ResourceSummary) {
    if (!resource.url) return;
    if (resource.resourceType === 'video') {
      setPlayingVideo(resource);
      return;
    }
    if (resource.resourceType === 'pdf') {
      window.open(forceDownloadUrl(resource.url, `${resource.title}.pdf`), '_blank', 'noopener,noreferrer');
      return;
    }
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  }

  function scrollToFeatured() {
    featuredSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function clearFeaturedFilters() {
    setActiveTab('All');
    setSearchQuery('');
    scrollToFeatured();
  }

  const statCards = [
    { label: 'Resources available', value: stats.totalResources.toLocaleString(), icon: '📚', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { label: 'Subjects covered', value: String(stats.totalSubjects), icon: '📂', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
    { label: 'Topics covered', value: String(stats.totalTopics), icon: '🎯', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Last updated', value: formatRelativeTime(stats.lastUpdatedAt), icon: '🔄', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-2 flex-1 min-h-0 overflow-y-auto lg:overflow-visible">
      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-4 lg:overflow-y-auto pr-1">

        {/* Search Bar */}
        <div className="glass-card p-1 flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for notes, videos, audio, images and links..."
            className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          <button onClick={scrollToFeatured} className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {visibleTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-[rgba(17,24,50,0.6)] text-gray-400 hover:text-white hover:bg-[rgba(30,41,59,0.8)] border border-[rgba(56,78,135,0.2)]'
              }`}
            >
              {tab === 'All' ? 'All' : RESOURCE_TYPE_META[tab].label}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xl font-extrabold text-white leading-none">{stat.value}</p>
                <p className="text-gray-400 text-[10px] mt-1 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Browse by Subject */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Browse by Subject</h3>
            <Link to="/subjects" className="text-cyan-400 text-xs font-medium hover:text-cyan-300 flex items-center gap-1">
              View all subjects
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" /></svg>
            </Link>
          </div>
          {topSubjects.length === 0 ? (
            <p className="text-gray-500 text-xs">{loading ? 'Loading subjects…' : 'No subjects available yet.'}</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {topSubjects.map((sub, i) => {
                const style = getSubjectStyle(sub.name, i);
                const slug = getSubjectSlug(sub.name);
                return (
                  <Link
                    key={sub.id}
                    to={slug ? `/subjects/${slug}` : '/subjects'}
                    className="bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] rounded-xl p-4 text-center flex flex-col items-center hover:border-cyan-500/30 transition-all cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-2 ${style.color} bg-opacity-20 border border-opacity-30 group-hover:scale-110 transition-transform`}>
                      {style.icon}
                    </div>
                    <p className="text-white font-bold text-xs">{sub.name}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">{sub.resourceCount} resources</p>
                    <div className="w-full h-1 bg-[rgba(56,78,135,0.2)] rounded-full mt-3 overflow-hidden">
                      <div className={`h-full ${style.color} rounded-full`} style={{ width: `${Math.min(100, (sub.resourceCount / maxSubjectCount) * 100)}%` }} />
                    </div>
                  </Link>
                );
              })}
              <Link
                to="/subjects"
                className="bg-[rgba(17,24,50,0.6)] border border-dashed border-[rgba(56,78,135,0.3)] rounded-xl p-4 text-center flex flex-col items-center justify-center hover:border-cyan-500/30 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-[rgba(56,78,135,0.2)] flex items-center justify-center text-cyan-400 mb-2 group-hover:bg-cyan-500/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </div>
                <p className="text-cyan-400 font-bold text-xs">View all subjects</p>
              </Link>
            </div>
          )}
        </div>

        {/* Featured Resources */}
        <div ref={featuredSectionRef} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-base">Featured Resources</h3>
              <p className="text-gray-500 text-xs">Hand-picked quality content for your learning journey.</p>
            </div>
            <button onClick={clearFeaturedFilters} className="text-cyan-400 text-xs font-medium hover:text-cyan-300 flex items-center gap-1">
              View all
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" /></svg>
            </button>
          </div>
          {error ? (
            <p className="text-red-400 text-xs">{error}</p>
          ) : loading ? (
            <p className="text-gray-500 text-xs">Loading resources…</p>
          ) : filteredFeatured.length === 0 ? (
            <p className="text-gray-500 text-xs">No resources match your filters yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredFeatured.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  bookmarked={bookmarkedIds.has(res.id)}
                  onOpen={handleOpenResource}
                  onToggleBookmark={(r) => toggleBookmark(r.id)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-[300px] flex-shrink-0 space-y-4 lg:overflow-y-auto pb-6">

        {/* Find Resources Quickly */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-1">Find Resources Quickly</h3>
          <p className="text-gray-500 text-xs mb-3">Search by topic, keyword or resource type.</p>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Photosynthesis, Algebra, etc."
              className="flex-1 px-3 py-2 rounded-lg bg-[rgba(17,24,50,0.8)] border border-[rgba(56,78,135,0.3)] text-gray-300 text-xs placeholder-gray-600 focus:outline-none focus:border-cyan-500/40"
            />
            <button onClick={scrollToFeatured} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </button>
          </div>
          <p className="text-gray-500 text-[10px] font-bold mb-2">Popular subjects</p>
          <div className="flex flex-wrap gap-2">
            {popularSubjects.length === 0 ? (
              <p className="text-gray-600 text-[10px]">Nothing popular yet.</p>
            ) : (
              popularSubjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSearchQuery(sub.name)}
                  className="px-2.5 py-1 rounded-full bg-[rgba(17,24,50,0.6)] border border-[rgba(56,78,135,0.2)] text-gray-400 text-[10px] hover:border-cyan-500/30 hover:text-cyan-400 transition-all"
                >
                  {sub.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Recommended for You */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-base">Recommended for You</h3>
            {recommendedPool.length > 3 && (
              <button onClick={() => setShowAllRecommended((v) => !v)} className="text-cyan-400 text-xs font-medium hover:text-cyan-300">
                {showAllRecommended ? 'Show less' : 'View all'}
              </button>
            )}
          </div>
          <p className="text-gray-500 text-[10px] mb-3">Based on your subjects and progress</p>
          <div className="space-y-3">
            {visibleRecommended.length === 0 ? (
              <p className="text-gray-600 text-[10px]">{loading ? 'Loading…' : 'No recommendations yet.'}</p>
            ) : (
              visibleRecommended.map((rec) => {
                const meta = RESOURCE_TYPE_META[rec.resourceType];
                const bookmarked = bookmarkedIds.has(rec.id);
                return (
                  <div
                    key={rec.id}
                    onClick={() => handleOpenResource(rec)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleOpenResource(rec)}
                    className="flex items-start gap-3 p-2 rounded-lg bg-[rgba(17,24,50,0.5)] border border-[rgba(56,78,135,0.1)] hover:border-[rgba(56,78,135,0.3)] transition-all cursor-pointer"
                  >
                    <div className={`w-12 h-14 rounded ${meta.gradient} flex-shrink-0 flex items-center justify-center text-white border border-white/10`}>
                      <span className="text-lg">{meta.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold text-white ${meta.badgeColor}`}>{meta.label}</span>
                        <p className="text-white text-xs font-semibold leading-tight truncate">{rec.title}</p>
                      </div>
                      <p className="text-gray-500 text-[10px] leading-tight line-clamp-2">{rec.subjectName ?? 'General'}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(rec.id);
                      }}
                      title={bookmarked ? 'Remove bookmark' : 'Bookmark this resource'}
                      className={`mt-1 ${bookmarked ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recently Viewed */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-base">Recently Viewed</h3>
            <Link to="/my-learning" className="text-cyan-400 text-xs font-medium hover:text-cyan-300">View all</Link>
          </div>
          <div className="space-y-3">
            {recentlyViewed.length === 0 ? (
              <p className="text-gray-600 text-[10px]">{loading ? 'Loading…' : 'Nothing viewed yet.'}</p>
            ) : (
              recentlyViewed.map((item) => (
                <Link to="/my-learning" key={item.topicId} className="flex items-center justify-between gap-3 hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-[rgba(56,78,135,0.2)] flex items-center justify-center text-gray-400 flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /></svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold leading-tight truncate">{item.topicTitle}</p>
                      <p className="text-gray-500 text-[10px]">Viewed {formatRelativeTime(item.lastAccessedAt)}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold border flex-shrink-0 bg-green-500/10 text-green-400 border-green-500/20">TOPIC</span>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>

      {playingVideo?.url && <VideoModal title={playingVideo.title} url={playingVideo.url} onClose={() => setPlayingVideo(null)} />}
    </div>
  );
}
