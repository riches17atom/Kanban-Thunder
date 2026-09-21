import { useState, useEffect } from 'react'
import { StaticPageLayout } from './StaticPageLayout'

interface Section {
  id: string
  title: string
  content: React.ReactNode
}

interface LegalLayoutProps {
  title: string
  subtitle: string
  sections: Section[]
}

export const LegalLayout = ({ title, subtitle, sections }: LegalLayoutProps) => {
  const [activeSection, setActiveSection] = useState(sections[0]?.id)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight

          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  return (
    <StaticPageLayout title={title} subtitle={subtitle}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sticky Sidebar */}
        <aside className="lg:col-span-1 lg:sticky lg:top-24 bg-[var(--bg-surface-2)] p-6 rounded-xl border border-[var(--border-subtle)] glass">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Sections</h3>
          <nav className="flex flex-col gap-2">
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveSection(sec.id)
                  document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`text-sm font-medium transition-all text-left py-2 px-3 rounded-md border-l-2 ${
                  activeSection === sec.id
                    ? 'bg-blue-600/10 text-blue-400 border-blue-500 font-semibold'
                    : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {sec.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Document Content */}
        <div className="lg:col-span-3 bg-[var(--bg-surface-2)] p-8 md:p-10 rounded-xl border border-[var(--border-subtle)] glass space-y-12">
          {sections.map((sec) => (
            <section key={sec.id} id={sec.id} className="scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <span className="text-blue-500 font-mono text-sm">#</span> {sec.title}
              </h2>
              <div className="text-[var(--text-secondary)] leading-relaxed space-y-4 text-sm md:text-base">
                {sec.content}
              </div>
            </section>
          ))}
        </div>
      </div>
    </StaticPageLayout>
  )
}
