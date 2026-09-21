import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/api/endpoints/boards'

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
  onClick?: () => void
}

const PRIORITY_CONFIG = {
  low: {
    bar: 'var(--priority-low-bar)',
    bg: 'var(--priority-low-bg)',
    badgeBg: 'var(--priority-low-bg)',
    badgeText: 'var(--priority-low-text)',
    label: 'Low',
  },
  medium: {
    bar: 'var(--priority-med-bar)',
    bg: 'var(--priority-med-bg)',
    badgeBg: 'var(--priority-med-bg)',
    badgeText: 'var(--priority-med-text)',
    label: 'Medium',
  },
  high: {
    bar: 'var(--priority-high-bar)',
    bg: 'var(--priority-high-bg)',
    badgeBg: 'var(--priority-high-bg)',
    badgeText: 'var(--priority-high-text)',
    label: 'High',
  },
}

export const TaskCard = ({ task, onEdit, onDelete, onClick }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priority = PRIORITY_CONFIG[task.priority]

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    onClick?.()
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        opacity: isDragging ? 0.35 : 1,
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'grab',
        userSelect: 'none',
        '--priority-glow': priority.bar + '30',
      } as React.CSSProperties}
      className="task-card"
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
    >
      {/* Priority left bar */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: priority.bar,
        borderRadius: '12px 0 0 12px',
      }} />

      {/* Card content */}
      <div style={{ padding: '10px 12px 10px 16px' }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <h4 style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
            flex: 1,
            letterSpacing: '-0.01em',
          }}>
            {task.title}
          </h4>

          {/* Action buttons — always visible but subtle */}
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} className="task-actions">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              title="Edit task"
              style={{
                padding: 4,
                borderRadius: 6,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              title="Delete task"
              style={{
                padding: 4,
                borderRadius: 6,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-soft)'; e.currentTarget.style.color = 'var(--danger)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description snippet */}
        {task.description && (
          <p style={{
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            marginTop: 5,
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {task.description}
          </p>
        )}

        {/* Footer chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {/* Priority badge */}
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 99,
            background: priority.badgeBg,
            color: priority.badgeText,
            letterSpacing: '0.01em',
            textTransform: 'uppercase',
          }}>
            {priority.label}
          </span>

          {/* Due date */}
          {task.due_date && (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: 99,
              background: task.is_overdue ? 'var(--danger-soft)' : 'var(--bg-surface-2)',
              color: task.is_overdue ? 'var(--danger)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(task.due_date)}
              {task.is_overdue && ' ⚠'}
            </span>
          )}

          {/* Assignee Avatar */}
          {task.assignee && (
            <div 
              style={{ 
                marginLeft: 'auto', 
                width: 18, 
                height: 18, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--accent), var(--accent-end))', 
                color: '#fff', 
                fontSize: '0.62rem', 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                flexShrink: 0,
              }}
              title={`Assigned to ${task.assignee.first_name} ${task.assignee.last_name}`}
            >
              {((task.assignee.first_name?.[0] ?? '') + (task.assignee.last_name?.[0] ?? '')).toUpperCase() || task.assignee.email[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}