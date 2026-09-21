import { ReactNode } from 'react'
import { Navbar } from '@/pages/Home/components/Navbar'
import { Footer } from '@/pages/Home/components/Footer'

interface StaticPageLayoutProps {
  title: string
  subtitle?: string | ReactNode
  children: ReactNode
}

export const StaticPageLayout = ({ title, subtitle, children }: StaticPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col selection:bg-blue-600 selection:text-white relative overflow-hidden transition-colors duration-200">
      {/* Background Aura Blobs for Premium Aesthetic */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 py-16 md:py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-violet-600 mx-auto mt-6 rounded-full" />
          </div>

          {/* Content */}
          {children}
        </div>
      </main>

      <Footer />
    </div>
  )
}
