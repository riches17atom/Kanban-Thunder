import { Link } from 'react-router-dom'

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[var(--bg-base)] py-20 lg:py-32">
      {/* Decorative Vector Accents (Solid Colors, No Glassmorphism) */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Banner Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] mb-8 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
          <span className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide uppercase">
            ⚡ Meet Thunder Version 2.0
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-[var(--text-primary)] tracking-tight leading-none mb-6">
          Accelerate Your Projects at <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Lightning Speed.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-3xl text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed">
          A high-performance project organizer designed to keep teams aligned. Plan workflows, prioritize checklists, and track task progress in real-time with responsive board templates.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl text-base font-bold shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all text-center"
          >
            Get Started Free
          </Link>
          <a
            href="#preview"
            className="w-full sm:w-auto border border-[var(--border-medium)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] px-8 py-4 rounded-xl text-base font-semibold hover:-translate-y-0.5 transition-all text-center"
          >
            Live Preview
          </a>
        </div>
      </div>
    </section>
  )
}
