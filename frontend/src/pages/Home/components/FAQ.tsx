import { useState } from 'react'

interface FAQItem {
  q: string
  a: string
}

export const FAQ = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const items: FAQItem[] = [
    {
      q: "Can I use Thunder Kanban on my mobile phone?",
      a: "Yes! Thunder Kanban is built with a responsive interface that functions smoothly on smartphones, tablets, laptops, and desktop screens, allowing you to stay updated wherever you are."
    },
    {
      q: "Is there a limit on how many boards I can create?",
      a: "No, you can create as many boards as you need to organize different projects, client deliverables, or personal routines."
    },
    {
      q: "How do I duplicate a board to use as a template?",
      a: "Simply find the board card in your dashboard, click the 'Duplicate' option, and a new copy containing the same lists and tasks will be created instantly, saving you from setting up columns manually."
    },
    {
      q: "How does the board help me organize complex task workloads?",
      a: "Each card supports quick title names, descriptions, due dates, and priority status (Low, Medium, High). You can drag tasks across lists to easily visualize what is pending, active, and completed."
    }
  ]

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx)
  }

  return (
    <section id="faq" className="bg-[var(--bg-base)] py-20 border-t border-[var(--border-subtle)]">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-[var(--text-secondary)]">
            Everything you need to know about organizing your work with Thunder Kanban.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {items.map((item, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={idx}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden transition-colors duration-200"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-[var(--text-primary)] hover:text-blue-400 transition-colors"
                >
                  <span>{item.q}</span>
                  <svg
                    className={`w-5 h-5 text-[var(--text-muted)] transform transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6 text-[var(--text-secondary)] text-sm leading-relaxed border-t border-[var(--border-subtle)] pt-4 animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
