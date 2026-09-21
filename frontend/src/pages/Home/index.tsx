import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { MockKanban } from './components/MockKanban'
import { Features } from './components/Features'
import { FAQ } from './components/FAQ'
import { Footer } from './components/Footer'

export const Home = () => {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1)
      const element = document.getElementById(id)
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 100)
        return () => clearTimeout(timer)
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location])

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <MockKanban />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
