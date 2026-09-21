
interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: 'danger' | 'default'
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'default',
}: ConfirmDialogProps) => {
  if (!isOpen) return null

  const isDanger = variant === 'danger'

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} className="glass-strong" onClick={e => e.stopPropagation()}>
        {/* Accent bar */}
        <div style={{ height: 3, background: isDanger ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'linear-gradient(90deg, var(--accent), var(--accent-end))' }} />

        <div style={{ padding: '24px 24px 22px' }}>
          {/* Icon + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isDanger ? 'rgba(239,68,68,0.12)' : 'rgba(124,58,237,0.12)',
            }}>
              {isDanger ? (
                <svg width="18" height="18" fill="none" stroke="var(--danger)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="var(--accent-light)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
            </div>
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
            {description}
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={cancelBtn}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                ...confirmBtn,
                background: isDanger
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'linear-gradient(135deg, var(--accent), var(--accent-end))',
                boxShadow: isDanger
                  ? '0 4px 16px rgba(239,68,68,0.3)'
                  : '0 4px 16px rgba(124,58,237,0.3)',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
                  </svg>
                  Please wait...
                </span>
              ) : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.65)',
  backdropFilter: 'blur(6px)',
  animation: 'fadeIn 0.15s ease',
  padding: '20px',
}

const modal: React.CSSProperties = {
  width: '100%', maxWidth: 400,
  borderRadius: 16, overflow: 'hidden',
  animation: 'slideUp 0.2s ease',
}

const cancelBtn: React.CSSProperties = {
  padding: '9px 18px', borderRadius: 9,
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500,
  cursor: 'pointer', transition: 'all 0.15s',
  fontFamily: 'var(--font-sans)',
}

const confirmBtn: React.CSSProperties = {
  padding: '9px 18px', borderRadius: 9,
  border: 'none',
  color: '#fff', fontSize: '0.85rem', fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.2s',
  fontFamily: 'var(--font-sans)',
}