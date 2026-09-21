import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center focus:outline-none"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun 
          className={`w-5 h-5 absolute transition-all duration-300 ${
            theme === 'light' 
              ? 'rotate-0 scale-100 opacity-100 text-amber-500' 
              : 'rotate-90 scale-0 opacity-0'
          }`} 
        />
        <Moon 
          className={`w-5 h-5 absolute transition-all duration-300 ${
            theme === 'dark' 
              ? 'rotate-0 scale-100 opacity-100 text-violet-400' 
              : '-rotate-90 scale-0 opacity-0'
          }`} 
        />
      </div>
    </button>
  )
}
