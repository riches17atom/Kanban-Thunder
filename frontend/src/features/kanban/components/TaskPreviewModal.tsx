import { useState } from 'react'
import type { Task } from '@/api/endpoints/boards'

interface TaskPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onEdit: () => void
  onDelete: () => void
  onAddNote: (content: string) => Promise<any>
  onDeleteNote: (noteId: number) => Promise<void>
  boardOwnerEmail?: string
}

const PRIORITY_CONFIG = {
  low:    { color: '#34d399', bg: 'rgba(16,185,129,0.12)',  bar: '#10b981', label: 'Low'    },
  medium: { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', bar: '#f59e0b', label: 'Medium' },
  high:   { color: '#f87171', bg: 'rgba(239,68,68,0.12)',  bar: '#ef4444', label: 'High'   },
}

export const TaskPreviewModal = ({ isOpen, onClose, task, onEdit, onDelete, onAddNote, onDeleteNote, boardOwnerEmail }: TaskPreviewModalProps) => {
  const [noteText, setNoteText] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  if (!isOpen || !task) return null

  const priority = PRIORITY_CONFIG[task.priority]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getInitials = (first: string, last: string, email: string) => {
    const initials = `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
    return initials || email[0].toUpperCase()
  }

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteText.trim()) return
    setIsAddingNote(true)
    try {
      await onAddNote(noteText.trim())
      setNoteText('')
    } catch {
      // handled
    } finally {
      setIsAddingNote(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(6px)',
          animation: 'overlayIn 0.2s ease',
        }}
      />

      {/* Modal panel */}
      <div style={{
        position: 'relative', zIndex: 51,
        width: '100%', maxWidth: 500,
        borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.08)',
        animation: 'modalIn 0.25s ease',
        overflow: 'hidden',
      }} className="glass-strong">
        {/* Priority accent bar at top */}
        <div style={{ height: 3, background: priority.bar }} />

        {/* Header */}
        <div style={{
          padding: '20px 22px 16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
                {task.title}
              </h2>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.6 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                in {task.column_name}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: 6, borderRadius: 8, flexShrink: 0,
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
        </div>

        {/* Body */}
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Priority badge */}
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Priority</p>
              <span style={{
                fontSize: '0.78rem', fontWeight: 700,
                padding: '4px 12px', borderRadius: 99,
                background: priority.bg, color: priority.color,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: priority.color, flexShrink: 0 }} />
                {priority.label}
              </span>
            </div>

            {/* Due date */}
            {task.due_date && (
              <div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Due Date</p>
                <span style={{
                  fontSize: '0.78rem', fontWeight: 600,
                  padding: '4px 12px', borderRadius: 99,
                  background: task.is_overdue ? 'var(--danger-soft)' : 'var(--bg-surface-2)',
                  color: task.is_overdue ? 'var(--danger)' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(task.due_date)}
                  {task.is_overdue && <span style={{ background: '#ef444430', borderRadius: 4, padding: '1px 5px', fontSize: '0.68rem' }}>Overdue</span>}
                </span>
              </div>
            )}

            {/* Assignee */}
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Assignee</p>
              {task.assignee ? (
                <span style={{
                  fontSize: '0.78rem', fontWeight: 600,
                  padding: '4px 12px 4px 6px', borderRadius: 99,
                  background: 'var(--bg-surface-2)', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-end))', color: '#fff', fontSize: '0.62rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getInitials(task.assignee.first_name, task.assignee.last_name, task.assignee.email)}
                  </div>
                  {task.assignee.first_name} {task.assignee.last_name}
                </span>
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'block', padding: '4px 0' }}>Unassigned</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Description</p>
            {task.description ? (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '12px 14px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {task.description}
              </div>
            ) : (
              <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No description provided.</p>
            )}
          </div>

          {/* Timestamps */}
          <div style={{
            display: 'flex',
            gap: 20,
            paddingTop: 14,
            borderTop: '1px solid var(--border-subtle)',
          }}>
            {[
              { label: 'Created', value: formatDate(task.created_at) },
              { label: 'Updated', value: formatDate(task.updated_at) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Notes / Activity Section */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 18 }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Activity & Notes</p>
            
            {/* Notes List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, maxHeight: 180, overflowY: 'auto' }} className="custom-scroll">
              {task.notes && task.notes.length > 0 ? (
                task.notes.map(note => {
                  const initials = getInitials(note.author_name.split(' ')[0] || '', note.author_name.split(' ').slice(1).join(' ') || '', note.author_email)
                  const dateStr = new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  const canDelete = note.is_author || (boardOwnerEmail && boardOwnerEmail === note.author_email)
                  return (
                    <div key={note.id} style={{ display: 'flex', gap: 10, background: 'var(--bg-surface)', padding: 10, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-end))', color: '#fff', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{note.author_name}</span>
                          <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{dateStr}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{note.content}</p>
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, borderRadius: 4, alignSelf: 'flex-start' }}
                          title="Delete note"
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )
                })
              ) : (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>No notes yet.</p>
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNoteSubmit} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Add a note or update..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                disabled={isAddingNote}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                }}
              />
              <button
                type="submit"
                disabled={isAddingNote || !noteText.trim()}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: isAddingNote || !noteText.trim() ? 'default' : 'pointer',
                  opacity: isAddingNote || !noteText.trim() ? 0.6 : 1,
                }}
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{
          padding: '12px 22px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          gap: 10,
        }}>
          <button
            onClick={onDelete}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px',
              borderRadius: 40,
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.07)',
              color: 'var(--danger)',
              fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)' }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>

          <button
            onClick={onEdit}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 20px',
              borderRadius: 40,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
              color: '#fff',
              fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)' }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Task
          </button>
        </div>
      </div>
    </div>
  )
}