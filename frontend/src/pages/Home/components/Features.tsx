export const Features = () => {
  const list = [
    {
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Instant Load Speeds",
      desc: "Your boards and tasks load instantly every single time, letting you jump straight into your projects without waiting for loading screens.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7h8m0 0v8a2 2 0 01-2 2" />
        </svg>
      ),
      title: "Project Templates",
      desc: "Clone entire boards, lists, and tasks with a single click. Save time setting up repeated routines and recurring workflows.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0V12m-3-5.5a1.5 1.5 0 113 0V12m0 0V9a1.5 1.5 0 013 0v3m0 0V7.5a1.5 1.5 0 013 0V12m0 0L15 8m0 4h.01" />
        </svg>
      ),
      title: "Fluid Drag & Drop",
      desc: "Organize tasks and transition them between columns effortlessly using intuitive, tactile gestures built for speed.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Secure Workspace",
      desc: "Rest easy knowing your private boards and proprietary task data are fully protected with bank-grade security protocols.",
    },
  ]

  return (
    <section id="features" className="bg-[var(--bg-base)] py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-4">
            Everything You Need to Get Done
          </h2>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
            A visual task organizer packed with speed, convenience, and privacy options to keep you performing at your best.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((item, idx) => (
            <div
              key={idx}
              className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all group duration-300"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] group-hover:border-blue-500/50 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
