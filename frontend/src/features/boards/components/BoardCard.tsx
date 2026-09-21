import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface BoardCardProps {
  id: number
  slug: string
  name: string
  description: string
  columnsCount: number
  tasksCount: number
  colorIndex: number
  onDuplicate: () => void
  onDelete: () => void
}

const ACCENT_COLORS = [
  '#7c3aed', // violet
  '#0ea5e9', // sky
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ec4899', // pink
  '#f97316', // orange
]

export const BoardCard = ({
  slug, name, description, columnsCount, tasksCount, colorIndex,
  onDuplicate, onDelete,
}: BoardCardProps) => {
  const [menuOpen, setMenuOpen]     = useState(false)
  const [hovered, setHovered]       = useState(false)
  const navigate                    = useNavigate()
  const accentColor                 = ACCENT_COLORS[colorIndex % ACCENT_COLORS.length]
  const initials                    = name.slice(0, 2).toUpperCase()

  return (
    <div
      style={{
        ...cardStyle,
        boxShadow: hovered
          ? `0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1), 0 0 30px ${accentColor}28`
          : '0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      className="glass"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
    >
      {/* Accent top bar */}
      <div style={{ ...accentBar, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />

      {/* Card header */}
      <div style={cardHeader}>
        {/* Board avatar */}
        <div style={{ ...boardAvatar, background: `${accentColor}22`, color: accentColor }}>
          {initials}
        </div>

        {/* Menu */}
        <div style={{ position: 'relative' }} onClick={e => e.preventDefault()}>
          <button
            style={{
              ...menuBtn,
              background: menuOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
              opacity: hovered || menuOpen ? 1 : 0,
            }}
            onClick={e => { e.preventDefault(); e.stopPropagation(); setMenuOpen(v => !v) }}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--text-secondary)' }}>
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {menuOpen && (
            <div style={dropdownStyle} className="glass-strong">
              <button
                style={dropdownItem}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={e => { e.preventDefault(); onDuplicate(); setMenuOpen(false) }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate
              </button>
              <button
                style={{ ...dropdownItem, color: 'var(--danger)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-soft)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={e => { e.preventDefault(); onDelete(); setMenuOpen(false) }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--danger)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete board
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title & description */}
      <div style={{ marginBottom: 20 }}>
        <h3
          style={{ ...cardTitle, color: hovered ? 'var(--text-primary)' : 'var(--text-primary)' }}
          onClick={() => navigate(`/boards/${slug}`)}
        >
          {name}
        </h3>
        <p style={cardDesc}>{description || 'No description provided'}</p>
      </div>

      {/* Stats */}
      <div style={statsRow}>
        <div style={statChip}>
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: accentColor }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
          <span>{columnsCount} columns</span>
        </div>
        <div style={statChip}>
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: accentColor }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>{tasksCount} tasks</span>
        </div>
      </div>

      {/* CTA */}
      <Link
        to={`/boards/${slug}`}
        style={{
          ...openBtn,
          color: accentColor,
          borderColor: `${accentColor}40`,
          background: hovered ? `${accentColor}14` : 'transparent',
        }}
      >
        Open Board
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}

/* ── Styles ── */
const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: '0 0 20px',
  overflow: 'hidden',
  transition: 'all 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  cursor: 'default',
  position: 'relative',
}

const accentBar: React.CSSProperties = {
  height: 3, width: '100%', marginBottom: 20,
}

const cardHeader: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 20px', marginBottom: 14,
}

const boardAvatar: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 10,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.02em',
  flexShrink: 0,
}

const menuBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 6,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'all 0.15s', border: 'none',
}

const dropdownStyle: React.CSSProperties = {
  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
  minWidth: 168,
  borderRadius: 10, padding: '5px',
  animation: 'slideDown 0.15s ease',
  zIndex: 200,
}

const dropdownItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 9,
  width: '100%', padding: '9px 11px',
  borderRadius: 7, background: 'transparent',
  fontSize: '0.82rem', fontWeight: 500,
  color: 'var(--text-secondary)', cursor: 'pointer',
  transition: 'background 0.15s', border: 'none', textAlign: 'left',
}

const cardTitle: React.CSSProperties = {
  fontSize: '1rem', fontWeight: 700,
  marginBottom: 6, lineHeight: 1.3,
  cursor: 'pointer', padding: '0 20px',
  transition: 'color 0.15s',
}

const cardDesc: React.CSSProperties = {
  fontSize: '0.82rem', color: 'var(--text-muted)',
  lineHeight: 1.5,
  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  padding: '0 20px',
}

const statsRow: React.CSSProperties = {
  display: 'flex', gap: 8, padding: '0 20px', marginBottom: 16,
}

const statChip: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5,
  padding: '5px 10px', borderRadius: 20,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.07)',
  fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 500,
}

const openBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px',
  marginLeft: 20,
  borderRadius: 8,
  fontSize: '0.82rem', fontWeight: 600,
  border: '1px solid',
  transition: 'all 0.2s',
}