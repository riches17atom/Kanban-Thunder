export const MockKanban = () => {
  return (
    <section id="preview" className="bg-[var(--bg-base)] py-20 border-y border-[var(--border-subtle)]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-4">
            Intuitive Workspace. Powerful Results.
          </h2>
          <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
            A beautiful, clean board workspace designed to clear visual clutter and help your team focus on getting things done.
          </p>
        </div>

        {/* Mock Application Window */}
        <div className="mx-auto max-w-5xl rounded-2xl border border-[var(--border-medium)] bg-[var(--bg-base)] shadow-2xl overflow-hidden">
          {/* OS Title Bar */}
          <div className="bg-[var(--bg-surface-2)] px-4 py-3 flex items-center justify-between border-b border-[var(--border-medium)]">
            <div className="flex gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500/80 block" />
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 block" />
              <span className="w-3.5 h-3.5 rounded-full bg-green-500/80 block" />
            </div>
            <div className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
              <span>⚡ Product Roadmap Dashboard</span>
            </div>
            <div className="w-12" /> {/* spacer */}
          </div>

          {/* Workspace Body */}
          <div className="p-6 md:p-8 overflow-x-auto">
            <div className="flex gap-6 min-w-[760px] pb-4">
              
              {/* Column 1 */}
              <div className="flex-1 bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                    Backlog
                    <span className="text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-surface-2)] px-2 py-0.5 rounded-full">
                      2
                    </span>
                  </h3>
                  <span className="text-[var(--text-muted)] text-xs">•••</span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-[var(--bg-surface-2)] rounded-lg p-4 border border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:translate-y-[-2px] transition-all cursor-grab">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded-full">
                        High
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">Jun 12</span>
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Connect Client Account Profiles</h4>
                    <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-2">Configure fast single sign-on options for all partner teams.</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded">Setup</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        JD
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--bg-surface-2)] rounded-lg p-4 border border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:translate-y-[-2px] transition-all cursor-grab">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded-full">
                        Low
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">Jun 20</span>
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Review Q3 Marketing Campaign</h4>
                    <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-2">Finalize guidelines and outline content buckets for the next cycle.</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded">Strategy</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                        SN
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="flex-1 bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                    In Progress
                    <span className="text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-surface-2)] px-2 py-0.5 rounded-full">
                      2
                    </span>
                  </h3>
                  <span className="text-[var(--text-muted)] text-xs">•••</span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-[var(--bg-surface-2)] rounded-lg p-4 border border-blue-500/50 hover:border-blue-400 hover:translate-y-[-2px] transition-all cursor-grab">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded-full">
                        High
                      </span>
                      <span className="text-[10px] text-blue-400 font-medium">Jun 10</span>
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Update Dashboard Layout</h4>
                    <div className="w-full bg-[var(--bg-surface)] h-1.5 rounded-full overflow-hidden mb-3">
                      <div className="bg-blue-500 h-full rounded-full w-4/5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded">Design</span>
                        <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded">Feedback</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                        AW
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--bg-surface-2)] rounded-lg p-4 border border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:translate-y-[-2px] transition-all cursor-grab">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold text-yellow-400 bg-yellow-950/40 px-2 py-0.5 rounded-full">
                        Medium
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">Jun 15</span>
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Analyze Performance Report</h4>
                    <div className="w-full bg-[var(--bg-surface)] h-1.5 rounded-full overflow-hidden mb-3">
                      <div className="bg-yellow-500 h-full rounded-full w-1/2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded">Analytics</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        JD
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3 */}
              <div className="flex-1 bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-2">
                    Completed
                    <span className="text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-surface-2)] px-2 py-0.5 rounded-full">
                      2
                    </span>
                  </h3>
                  <span className="text-[var(--text-muted)] text-xs">•••</span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-[var(--bg-surface-2)] rounded-lg p-4 border border-green-500/40 hover:border-green-500/60 opacity-80 hover:opacity-100 transition-all cursor-grab">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold text-green-400 bg-green-950/40 px-2 py-0.5 rounded-full">
                        Done
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">Completed</span>
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--text-secondary)] line-through mb-2">Secure Sign-In Screens</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded">Security</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                        SN
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--bg-surface-2)] rounded-lg p-4 border border-green-500/40 hover:border-green-500/60 opacity-80 hover:opacity-100 transition-all cursor-grab">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold text-green-400 bg-green-950/40 px-2 py-0.5 rounded-full">
                        Done
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">Completed</span>
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--text-secondary)] line-through mb-2">Deploy Application Changes</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded">Release</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                        AW
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
