import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { boardsApi } from '@/api/endpoints/boards'

export const JoinBoard = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const hasJoinedRef = useRef(false)

  useEffect(() => {
    const join = async () => {
      if (!token || hasJoinedRef.current) return
      hasJoinedRef.current = true

      try {
        const response = await boardsApi.join(token)
        toast.success(response.meta?.message || 'Successfully joined the board!')
        navigate(`/boards/${response.data.slug}`)
      } catch (err: any) {
        console.error('Failed to join board:', err)
        // If join fails (e.g. invalid token, archived, etc.), interceptor toasts the detail.
        // Redirect to dashboard as a fallback.
        navigate('/dashboard')
      }
    }

    join()
  }, [token, navigate])

  return (
    <div style={styles.root}>
      {/* Background aura blobs */}
      <div style={styles.aura1} />
      <div style={styles.aura2} />

      <div style={styles.container}>
        <div className="glass-strong" style={styles.card}>
          <div style={styles.accentStripe} />
          
          <div style={styles.content}>
            <div style={styles.iconWrap}>
              <svg style={{ animation: 'spin 1s linear infinite' }} width="24" height="24" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.15, color: '#fff' }} />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ color: 'var(--accent-light)' }} />
              </svg>
            </div>
            <h2 style={styles.title}>Accepting Board Invitation</h2>
            <p style={styles.subtitle}>Adding you as a collaborator. Please wait...</p>
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
    maxWidth: 400,
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
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 24px',
    textAlign: 'center',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: 'rgba(124,58,237,0.12)',
    border: '1px solid rgba(124,58,237,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    boxShadow: '0 0 20px rgba(124, 58, 237, 0.15)',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
}
