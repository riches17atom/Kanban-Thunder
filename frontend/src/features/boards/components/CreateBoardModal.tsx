import { useState } from 'react'

interface CreateBoardModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description: string }) => Promise<void>
}

export const CreateBoardModal = ({ isOpen, onClose, onSubmit }: CreateBoardModalProps) => {
  const [name, setName]             = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading]   = useState(false)
  const [errors, setErrors]         = useState<{ name?: string }>({})
  const [nameFocused, setNameFocused]   = useState(false)
  const [descFocused, setDescFocused]   = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    if (!name.trim()) { setErrors({ name: 'Board name is required' }); return }
    if (name.length > 100) { setErrors({ name: 'Board name cannot exceed 100 characters' }); return }

    setIsLoading(true)
    try {
      await onSubmit({ name: name.trim(), description: description.trim() })
      setName(''); setDescription(''); onClose()
    } catch {
      // handled by hook
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => { setName(''); setDescription(''); setErrors({}); onClose() }

  return (
    <div style={overlay} onClick={handleClose}>
      <div style={modal} className="glass-strong" onClick={e => e.stopPropagation()}>
        {/* Accent gradient top stripe */}
        <div style={modalAccent} />

        {/* Header */}
        <div style={modalHeader}>
          <div style={modalIconWrap}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-light)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 style={modalTitle}>Create New Board</h2>
            <p style={modalSub}>Set up your workspace in seconds</p>
          </div>
          <button style={closeBtn} onClick={handleClose} aria-label="Close">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
          {/* Board Name */}
          <div style={fieldGroup}>
            <label style={fieldLabel} htmlFor="board-name">
              Board Name
              <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>
            </label>
            <input
              id="board-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              placeholder="e.g. Product Roadmap"
              disabled={isLoading}
              autoFocus
              style={{
                ...inputStyle,
                borderColor: errors.name
                  ? 'var(--danger)'
                  : nameFocused ? 'var(--accent)' : 'var(--border-subtle)',
                boxShadow: errors.name
                  ? '0 0 0 3px rgba(239,68,68,0.12)'
                  : nameFocused ? '0 0 0 3px rgba(124,58,237,0.18)' : 'none',
              }}
            />
            {errors.name && (
              <p style={errorMsg}>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div style={fieldGroup}>
            <label style={fieldLabel} htmlFor="board-desc">
              Description
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 6, fontWeight: 400 }}>optional</span>
            </label>
            <textarea
              id="board-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onFocus={() => setDescFocused(true)}
              onBlur={() => setDescFocused(false)}
              placeholder="Describe what this board is for..."
              rows={3}
              disabled={isLoading}
              style={{
                ...inputStyle,
                resize: 'none',
                borderColor: descFocused ? 'var(--accent)' : 'var(--border-subtle)',
                boxShadow: descFocused ? '0 0 0 3px rgba(124,58,237,0.18)' : 'none',
              }}
            />
          </div>

          {/* Actions */}
          <div style={actions}>
            <button type="button" style={cancelBtn} onClick={handleClose} disabled={isLoading}>
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...submitBtn, opacity: isLoading ? 0.7 : 1 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg style={{ animation: 'spin 0.8s linear infinite' }} width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Board
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Styles ── */
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.65)',
  backdropFilter: 'blur(6px)',
  animation: 'fadeIn 0.15s ease',
  padding: '20px',
}

const modal: React.CSSProperties = {
  width: '100%', maxWidth: 460,
  borderRadius: 20, overflow: 'hidden',
  animation: 'slideUp 0.22s ease',
  position: 'relative',
}

const modalAccent: React.CSSProperties = {
  height: 3,
  background: 'linear-gradient(90deg, var(--accent), var(--accent-end), #c084fc)',
}

const modalHeader: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 14,
  padding: '24px 24px 20px',
}

const modalIconWrap: React.CSSProperties = {
  width: 42, height: 42, borderRadius: 10,
  background: 'rgba(124,58,237,0.15)',
  border: '1px solid rgba(124,58,237,0.25)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}

const modalTitle: React.CSSProperties = {
  fontSize: '1.05rem', fontWeight: 700,
  color: 'var(--text-primary)', marginBottom: 2,
}

const modalSub: React.CSSProperties = {
  fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400,
}

const closeBtn: React.CSSProperties = {
  marginLeft: 'auto', flexShrink: 0,
  width: 32, height: 32, borderRadius: 8,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-muted)', cursor: 'pointer',
  transition: 'all 0.15s',
}

const fieldGroup: React.CSSProperties = { marginBottom: 18 }

const fieldLabel: React.CSSProperties = {
  display: 'block', fontSize: '0.82rem', fontWeight: 600,
  color: 'var(--text-secondary)', marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 10,
  color: 'var(--text-primary)',
  fontSize: '0.88rem', fontFamily: 'var(--font-sans)',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const errorMsg: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5,
  fontSize: '0.77rem', color: 'var(--danger)',
  marginTop: 6,
}

const actions: React.CSSProperties = {
  display: 'flex', gap: 10, justifyContent: 'flex-end',
  paddingTop: 8,
}

const cancelBtn: React.CSSProperties = {
  padding: '10px 20px', borderRadius: 10,
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-secondary)', fontSize: '0.86rem', fontWeight: 500,
  cursor: 'pointer', transition: 'all 0.15s',
  fontFamily: 'var(--font-sans)',
}

const submitBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 7,
  padding: '10px 22px', borderRadius: 10,
  background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
  border: 'none',
  color: '#fff', fontSize: '0.86rem', fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.2s',
  boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
  fontFamily: 'var(--font-sans)',
}