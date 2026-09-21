import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuth } from '@/features/auth/hooks/useAuth'

export const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div style={styles.root}>
      {/* Background aura blobs */}
      <div style={styles.aura1} />
      <div style={styles.aura2} />

      {/* Main Container */}
      <div style={styles.container}>
        <div 
          className="glass-strong animate-fadeIn"
          style={{
            ...styles.card,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Accent gradient top stripe */}
          <div style={styles.accentStripe} />

          {/* Header */}
          <div style={styles.header}>
            <Link to="/" className="hover:scale-105 transition-transform duration-200" style={styles.logoLink}>
              <div style={styles.logoIconBg}>
                <span style={styles.logoIcon}>⚡</span>
              </div>
            </Link>
            <h1 style={styles.title}>
              Welcome back to <span className="gradient-text">Thunder</span>
            </h1>
            <p style={styles.subtitle}>Sign in to manage your boards and tasks</p>
            {location.state?.from?.pathname?.startsWith('/join/') && (
              <div style={{
                background: 'rgba(124, 58, 237, 0.12)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                borderRadius: 12,
                padding: '12px 16px',
                marginTop: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textAlign: 'left',
              }}>
                <span style={{ fontSize: '1.25rem' }}>👋</span>
                <p style={{ fontSize: '0.82rem', color: 'var(--accent)', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
                  You have been invited to join a board. Please sign in to accept the invitation.
                </p>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div style={styles.content}>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: 'var(--bg-base)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
  },
  aura1: {
    position: 'absolute', top: '-10vh', left: '-10vw',
    width: '45vw', height: '45vw',
    background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
  },
  aura2: {
    position: 'absolute', bottom: '-10vh', right: '-10vw',
    width: '40vw', height: '40vw',
    background: 'radial-gradient(ellipse, rgba(79,70,229,0.12) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
  },
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: 440,
    zIndex: 1,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  },
  accentStripe: {
    height: 4,
    background: 'linear-gradient(90deg, var(--accent), var(--accent-end), #c084fc)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '36px 24px 16px',
    textAlign: 'center',
  },
  logoLink: {
    display: 'inline-flex',
    marginBottom: 20,
  },
  logoIconBg: {
    width: 54,
    height: 54,
    borderRadius: 16,
    background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)',
  },
  logoIcon: {
    fontSize: '1.8rem',
    filter: 'drop-shadow(0 2px 8px rgba(124,58,237,0.5))',
    lineHeight: 1,
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    maxWidth: '320px',
  },
  content: {
    padding: '0 32px 36px',
  },
}