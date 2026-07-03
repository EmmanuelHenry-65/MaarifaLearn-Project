export default function ContinueLearning() {
  return (
    <div className="glass-card p-5 h-full">
      <h3 className="text-white font-bold text-lg mb-3">Continue Learning</h3>
      <div className="flex gap-4">
        <div className="w-36 h-36 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src="/images/photosynthesis.jpg"
            alt="Photosynthesis"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <span className="text-cyan-400 text-xs font-semibold">Biology</span>
            <h4 className="text-white font-bold text-base mt-0.5">Photosynthesis in Plants</h4>
            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex-1 h-2 rounded-full bg-[rgba(56,78,135,0.3)] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: '61%' }} />
              </div>
              <span className="text-gray-400 text-xs font-medium whitespace-nowrap">61%</span>
            </div>
            <p className="text-gray-400 text-xs mt-2 leading-relaxed">
              Learn how plants make their own food using sunlight, water and carbon dioxide.
            </p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              15 min left
            </div>
            <button className="btn-primary px-4 py-2 text-white text-[13px] flex items-center gap-2">
              Continue Lesson
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
