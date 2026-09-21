import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import type { Column as ColumnType, Task } from '@/api/endpoints/boards'

interface ColumnProps {
  column: ColumnType
  colorIndex: number
  onEditColumn: () => void
  onDeleteColumn: () => void
  onUpdateColumnName: (name: string) => void
  isEditing: boolean
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onTaskClick: (task: Task) => void
}

const COLUMN_COLORS = [
  '#7c3aed', // purple
  '#0ea5e9', // sky
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ec4899', // pink
  '#f97316', // orange
]

export const Column = ({
  column,
  colorIndex,
  onEditColumn,
  onDeleteColumn,
  onUpdateColumnName,
  isEditing,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onTaskClick,
}: ColumnProps) => {
  const [editName, setEditName] = useState(column.name)
  const [showMenu, setShowMenu] = useState(false)
  const [addHover, setAddHover] = useState(false)

  const accentColor = COLUMN_COLORS[colorIndex % COLUMN_COLORS.length]

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { columnId: column.id },
  })

  const handleNameSubmit = () => {
    const trimmedName = editName.trim()
    if (!trimmedName) {
      setEditName(column.name)
      onEditColumn()
      return
    }
    if (trimmedName === column.name) {
      onEditColumn()
      return
    }
    onUpdateColumnName(trimmedName)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNameSubmit()
    else if (e.key === 'Escape') {
      setEditName(column.name)
      onEditColumn()
    }
  }

  return (
    <div
      style={{
        width: 300,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: 'var(--bg-surface)',
        border: `1px solid ${isOver ? accentColor + '60' : 'var(--border-subtle)'}`,
        borderRadius: 16,
        boxShadow: isOver ? `0 0 0 2px ${accentColor}40, 0 8px 32px rgba(0,0,0,0.3)` : '0 4px 16px rgba(0,0,0,0.2)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        overflow: 'hidden',
      }}
    >
      {/* Accent top bar */}
      <div style={{ height: 3, background: accentColor, borderRadius: '16px 16px 0 0', flexShrink: 0 }} />

      {/* Column header */}
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              flex: 1,
              padding: '4px 10px',
              background: 'var(--bg-surface-2)',
              border: `1px solid ${accentColor}80`,
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
              fontWeight: 600,
              outline: 'none',
              boxShadow: `0 0 0 3px ${accentColor}20`,
            }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {column.name}
            </h3>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 99,
              background: accentColor + '22',
              color: accentColor,
              flexShrink: 0,
            }}>
              {column.tasks.length}
            </span>
          </div>
        )}

        {/* Column menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              padding: '4px 6px',
              borderRadius: 8,
              background: showMenu ? 'var(--bg-hover)' : 'transparent',
              color: 'var(--text-muted)',
              transition: 'background 0.15s, color 0.15s',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { if (!showMenu) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowMenu(false)} />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 6px)',
                  width: 152,
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 12,
                  padding: 6,
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(20px)',
                  zIndex: 20,
                  animation: 'slideDown 0.15s ease',
                }}
              >
                <button
                  onClick={() => { setShowMenu(false); onEditColumn() }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: '0.83rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Rename
                </button>
                <button
                  onClick={() => { setShowMenu(false); onDeleteColumn() }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: '0.83rem',
                    fontWeight: 500,
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-soft)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Task list (droppable) */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '0 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task, idx) => (
            <div key={task.id} style={{ animation: `cardIn 0.25s ease both`, animationDelay: `${idx * 30}ms` }}>
              <TaskCard
                task={task}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task)}
                onClick={() => onTaskClick(task)}
              />
            </div>
          ))}
        </SortableContext>

        {column.tasks.length === 0 && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 12px',
            gap: 6,
            opacity: isOver ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: accentColor + '15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 4,
            }}>
              <svg width="16" height="16" fill="none" stroke={accentColor} viewBox="0 0 24 24" style={{ opacity: 0.7 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              {isOver ? 'Drop here' : 'No tasks yet'}
            </p>
          </div>
        )}
      </div>

      {/* Add task button */}
      <div style={{ padding: '8px 10px 12px', flexShrink: 0 }}>
        <button
          onClick={onAddTask}
          onMouseEnter={() => setAddHover(true)}
          onMouseLeave={() => setAddHover(false)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px',
            borderRadius: 10,
            border: `1px dashed ${addHover ? accentColor + 'aa' : 'var(--border-subtle)'}`,
            background: addHover ? accentColor + '10' : 'transparent',
            color: addHover ? accentColor : 'var(--text-muted)',
            fontSize: '0.8rem',
            fontWeight: 500,
            transition: 'all 0.18s ease',
            cursor: 'pointer',
          }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add task
        </button>
      </div>
    </div>
  )
}