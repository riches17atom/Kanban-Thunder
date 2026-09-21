import { StaticPageLayout } from '@/components/StaticPageLayout'

export const About = () => {
  const values = [
    {
      emoji: "⚡",
      title: "Lightning Speed",
      description: "No spinners, no lag. Every click, column move, or task update happens in milliseconds to keep you in your productive zone."
    },
    {
      emoji: "🛡️",
      title: "Privacy Focused",
      description: "Your workspace data is encrypted and secure. We believe in pure task organization, not tracking or advertising."
    },
    {
      emoji: "🧩",
      title: "Simple & Clean",
      description: "Say goodbye to overloaded menus and complex configs. Thunder Kanban has a sleek, intuitive layout that just works."
    }
  ]

  return (
    <StaticPageLayout
      title="About Thunder Kanban"
      subtitle="The lightning-fast, premium project tracker designed to get you organized in seconds."
    >
      <div className="space-y-16">
        {/* Intro Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
              Why We Built <span className="text-blue-500">Thunder Kanban</span>
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Traditional project management applications have become bloated, slow, and overly complicated. They demand hours of setup and drag browser tabs down with heavy client scripts.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              We wanted a tool that behaves like a local native app—instantaneous, smooth, and lightweight—while retaining real-time synchronization, fluid drag-and-drop mechanics, and custom board control.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] glass relative overflow-hidden flex flex-col justify-center items-center text-center">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            <span className="text-7xl mb-4 animate-bounce">⚡</span>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Our Mission</h3>
            <p className="text-[var(--text-muted)] max-w-sm">
              Empower builders, coders, and creators to plan projects at the speed of thought.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center">Our Core Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, idx) => (
              <div
                key={idx}
                className="bg-[var(--bg-surface-2)] p-6 rounded-xl border border-[var(--border-subtle)] glass hover:border-blue-500/30 transition-all duration-300 group"
              >
                <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform duration-200">{v.emoji}</span>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-blue-400 transition-colors">{v.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team / Creator Card */}
        <div className="bg-[var(--bg-surface-2)] p-8 md:p-10 rounded-2xl border border-[var(--border-subtle)] glass text-center max-w-2xl mx-auto space-y-6">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg mx-auto">
              RT
            </div>
            <div className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-[var(--bg-surface-2)]" title="Creator Online" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Riches Thapa</h3>
            <p className="text-sm text-blue-400 font-medium">Founder & Developer</p>
            <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto">
              A software engineering enthusiast dedicated to creating responsive, high-performance web applications that enhance workflow efficiency.
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-2">
            <a
              href="https://github.com/riches17atom"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-2 rounded-lg text-sm transition-all"
            >
              GitHub Profile
            </a>
            <a
              href="/contact"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-all font-semibold"
            >
              Contact Me
            </a>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  )
}
export default About
