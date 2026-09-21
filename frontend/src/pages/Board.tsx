import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useKanban } from '@/features/kanban/hooks/useKanban'
import { KanbanBoard } from '@/features/kanban/components/KanbanBoard'
import { BoardSkeleton } from '@/features/kanban/components/BoardSkeleton'
import { CollaborationModal } from '@/features/boards/components/CollaborationModal'
import { useKanbanStore } from '@/features/kanban/store/kanbanStore'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ThemeToggle } from '@/components/ThemeToggle'

const ErrorState = ({ message, onBack }: { message: string; onBack: () => void }) => (
  <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center', animation: 'slideUp 0.4s ease' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>😕</div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{message}</h2>
      <button
        onClick={onBack}
        style={{ marginTop: 20, padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--accent-end))', color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', border: 'none', fontFamily: 'var(--font-sans)' }}
      >
        Back to Dashboard
      </button>
    </div>
  </div>
)

export const Board = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { board, isLoading, isFetching, error, updateBoard } = useKanban(slug || '')
  const [isCollabOpen, setIsCollabOpen] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const setBoard = useKanbanStore((state) => state.setBoardWithCache)

  if (!slug) {
    return <ErrorState message="Invalid board URL" onBack={() => navigate('/dashboard')} />
  }

  if (isLoading && !board) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
        <nav style={navStyle} className="glass">
          <div style={navInner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Link to="/dashboard" style={backLink}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </Link>
              <div style={navDivider} />
              <div style={{ height: 16, width: 120, borderRadius: 6, background: 'rgba(255,255,255,0.07)', animation: 'shimmer 1.8s ease infinite' }} className="skeleton" />
            </div>
          </div>
        </nav>
        <main style={{ flex: 1, overflow: 'hidden', padding: 16 }}>
          <BoardSkeleton />
        </main>
      </div>
    )
  }

  if (error && !board) {
    return <ErrorState message="Failed to load board" onBack={() => navigate('/dashboard')} />
  }

  if (!board) {
    return <ErrorState message="Board not found" onBack={() => navigate('/dashboard')} />
  }

  const isOwner = user?.email === board.owner
  const totalTasks = board.columns.reduce((acc, col) => acc + col.tasks.length, 0)

  const allMembers = [
    { name: board.owner_name || board.owner, email: board.owner, isOwner: true },
    ...(board.members || []).map(m => ({ name: `${m.first_name} ${m.last_name}`.trim() || m.email, email: m.email, isOwner: false }))
  ]

  const startEditing = () => {
    if (board) {
      setEditName(board.name)
      setIsEditingName(true)
    }
  }

  const handleSaveName = async () => {
    const trimmed = editName.trim()
    if (!trimmed || trimmed === board.name) {
      setIsEditingName(false)
      return
    }
    try {
      const updated = await updateBoard({ name: trimmed })
      if (updated?.slug) {
        navigate(`/boards/${updated.slug}`, { replace: true })
      }
      setIsEditingName(false)
    } catch (err) {
      // updateBoard handles errors via toasts
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <nav style={navStyle} className="glass">
        <div style={navInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/dashboard" style={backLink}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            <div style={navDivider} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.1rem' }}>⚡</span>
              {isEditingName ? (
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') setIsEditingName(false)
                  }}
                  autoFocus
                  style={renameInputStyle}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h1 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    {board.name}
                  </h1>
                  {isOwner && (
                    <button
                      onClick={startEditing}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--text-primary)'
                        e.currentTarget.style.opacity = '1'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--text-muted)'
                        e.currentTarget.style.opacity = '0.6'
                        e.currentTarget.style.background = 'transparent'
                      }}
                      style={editBtnStyle}
                      title="Rename board"
                    >
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              {isFetching && (
                <svg style={{ animation: 'spin 0.8s linear infinite' }} width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ color: 'var(--text-muted)', opacity: 0.25 }} />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
                </svg>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* Collaborators Stack */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={avatarsGroup} onClick={() => setIsCollabOpen(true)} title="View collaborators">
                {allMembers.slice(0, 3).map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...avatarCircle,
                      zIndex: 10 - idx,
                      background: m.isOwner 
                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
                        : 'linear-gradient(135deg, var(--accent), var(--accent-end))',
                    }}
                    title={`${m.name} (${m.isOwner ? 'Owner' : 'Collaborator'})`}
                  >
                    {m.name[0].toUpperCase()}
                  </div>
                ))}
                {allMembers.length > 3 && (
                  <div style={{ ...avatarCircle, zIndex: 0, background: 'rgba(255,255,255,0.08)', fontSize: '0.7rem' }}>
                    +{allMembers.length - 3}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsCollabOpen(true)}
                style={collabBtn}
                className="hover:scale-102 hover:border-violet-500/50 transition-all duration-200"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 4 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Share
              </button>
            </div>

            <ThemeToggle />

            <div style={navDivider} />

            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ padding: '3px 9px', borderRadius: 20, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                {board.columns.length} columns
              </span>
              <span style={{ padding: '3px 9px', borderRadius: 20, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                {totalTasks} tasks
              </span>
            </span>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, overflow: 'hidden', padding: '12px 16px 16px' }}>
        <KanbanBoard boardSlug={board.slug} />
      </main>

      <CollaborationModal
        isOpen={isCollabOpen}
        onClose={() => setIsCollabOpen(false)}
        board={board}
        onUpdate={setBoard}
      />
    </div>
  )
}

const renameInputStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 700,
  color: 'var(--text-primary)',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 6,
  padding: '2px 8px',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  width: '180px',
}

const editBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 4,
  borderRadius: 4,
  transition: 'all 0.15s',
  opacity: 0.6,
}

const navStyle: React.CSSProperties = {
  position: 'sticky', top: 0, zIndex: 100,
  borderBottom: '1px solid var(--border-subtle)',
  borderRadius: 0,
}

const navInner: React.CSSProperties = {
  maxWidth: '100%',
  padding: '0 20px',
  height: 56,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}

const backLink: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6,
  color: 'var(--text-secondary)', fontSize: '0.83rem', fontWeight: 500,
  transition: 'color 0.15s',
  textDecoration: 'none',
}

const navDivider: React.CSSProperties = {
  width: 1, height: 18, background: 'var(--border-subtle)',
}

const avatarsGroup: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
}

const avatarCircle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  color: '#fff',
  fontSize: '0.75rem',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid var(--bg-base)',
  marginRight: -6,
  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
}

const collabBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid var(--border-subtle)',
  background: 'var(--bg-surface)',
  color: 'var(--text-secondary)',
  fontSize: '0.78rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
}
