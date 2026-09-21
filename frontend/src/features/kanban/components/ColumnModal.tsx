import { useState } from 'react'
import { useKanbanStore } from '../store/kanbanStore'

interface ColumnModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
}

export const ColumnModal = ({ isOpen, onClose, onSubmit }: ColumnModalProps) => {
  const [name, setName]           = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState('')
  const board = useKanbanStore((state) => state.board)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    if (!trimmedName) { setError('Column name is required'); return }
    if (trimmedName.length > 50) { setError('Column name cannot exceed 50 characters'); return }
    if (board) {
      const isDuplicate = board.columns.some((col) => col.name.toLowerCase() === trimmedName.toLowerCase())
      if (isDuplicate) { setError('A column with this name already exists'); return }
    }

    setIsLoading(true)
    try {
      await onSubmit(trimmedName)
      setName('')
    } catch { /* Error handled in hook */ } finally { setIsLoading(false) }
  }

  const handleClose = () => { setName(''); setError(''); onClose() }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(6px)',
          animation: 'overlayIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'relative', zIndex: 51,
        width: '100%', maxWidth: 420,
        borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.1)',
        animation: 'modalIn 0.25s ease',
        overflow: 'hidden',
      }} className="glass-strong">
        {/* Accent bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, var(--accent), var(--accent-end))' }} />

        {/* Header */}
        <div style={{
          padding: '20px 24px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Add Column
            </h2>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Add a new stage to your board
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              padding: 6, borderRadius: 8,
              color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
              COLUMN NAME
            </label>
            <input
              className="dark-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., To Do, In Review, Done"
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <p style={{ fontSize: '0.76rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              style={{
                padding: '9px 20px',
                borderRadius: 40,
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.borderColor = 'var(--border-medium)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '9px 22px',
                borderRadius: 40,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
                color: '#fff',
                fontWeight: 600, fontSize: '0.85rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                opacity: isLoading ? 0.7 : 1,
                boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: 7,
              }}
              onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)' }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)' }}
            >
              {isLoading && (
                <svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isLoading ? 'Creating…' : 'Add Column'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}