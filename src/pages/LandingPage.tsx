import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#features' },
  { label: 'Subjects', to: '/subjects' },
  { label: 'Resources', to: '/resources' },
];

const FEATURES = [
  {
    title: 'Track Your Progress',
    desc: 'Real-time analytics and reports help you see how you’re improving every day.',
    accent: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="14 7 21 7 21 14" />
      </svg>
    ),
  },
  {
    title: 'Earn Achievements',
    desc: 'Complete lessons, ace quizzes and earn badges as you level up your learning journey.',
    accent: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v5a5 5 0 0 1-10 0Z" />
        <path d="M17 5.5h2a2 2 0 0 1 0 4h-.5" />
        <path d="M7 5.5H5a2 2 0 0 0 0 4h.5" />
      </svg>
    ),
  },
  {
    title: 'AI-Powered Help',
    desc: 'Get instant explanations, hints and practice questions from your AI Study Assistant.',
    accent: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="7" width="16" height="12" rx="3" />
        <circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none" />
        <path d="M12 7V3" />
        <path d="M9 3h6" />
      </svg>
    ),
  },
  {
    title: 'Study Anywhere',
    desc: 'Access lessons on any device, anytime, even offline. Learn wherever you are.',
    accent: 'text-green-400 border-green-400/30 bg-green-400/10',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3a13 13 0 0 1 0 18a13 13 0 0 1 0-18Z" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-[#0a0e1a] text-slate-50 overflow-x-hidden">
      {/* Nav */}
      <header className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-6 py-5">
        <a href="#top" className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <span className="font-extrabold text-lg">
            Maarifa<span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Learn</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          {NAV_LINKS.map((link) =>
            link.to ? (
              <Link key={link.label} to={link.to} className="hover:text-cyan-400 transition-colors">
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className="hover:text-cyan-400 transition-colors">
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-white/15 text-sm font-semibold text-slate-50 hover:bg-white/5 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="inline-flex px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-600 text-sm font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-shadow"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[560px] flex items-center">
        <img
          src="/images/hero-students.png"
          alt="Kenyan students studying together on laptops and tablets with MaarifaLearn"
          className="absolute inset-0 w-full h-full object-cover object-[75%_center]"
        />
        {/* Fade the photo into the page background so it reads as one continuous scene behind the headline */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a] via-[#0a0e1a]/85 to-[#0a0e1a]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-[#0a0e1a]/40" />

        <div className="relative max-w-7xl mx-auto w-full px-6 py-16">
          <div className="max-w-lg">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              Learn Smarter.
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Master the CBC Curriculum.</span>
            </h1>
            <p className="mt-5 text-slate-300 text-lg max-w-md">
              Personalized AI tutoring. Real-time progress tracking. Gamified learning for{' '}
              <span className="text-cyan-400 font-semibold">Grade 1&ndash;12</span> learners.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-600 font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
              >
                Get Started Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 pb-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className={`w-12 h-12 rounded-full border flex items-center justify-center mb-4 ${feature.accent}`}>{feature.icon}</div>
            <h3 className="font-bold text-slate-50 mb-1.5">{feature.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Trust bar */}
      <section className="max-w-7xl mx-auto px-6 pb-16 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src="/images/security-shield.png" alt="" className="w-8 h-8 rounded-lg object-cover" />
          <div>
            <p className="text-sm font-bold text-slate-50">Aligned to the CBC Curriculum</p>
            <p className="text-xs text-slate-500">For Grade 1 &ndash; 12 learners</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-50">Safe &amp; Secure</p>
            <p className="text-xs text-slate-500">Your data is protected</p>
          </div>
        </div>
        <p className="font-semibold italic text-lg">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Jifunze.</span>{' '}
          <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Kuelewa.</span>{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Kufanikiwa.</span>
        </p>
      </section>
    </div>
  );
}
