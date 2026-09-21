import { useCallback, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Column } from './Column'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'
import { ColumnModal } from './ColumnModal'
import { TaskPreviewModal } from './TaskPreviewModal'
import { BoardSkeleton } from './BoardSkeleton'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useKanban } from '../hooks/useKanban'
import type { Task } from '@/api/endpoints/boards'

interface KanbanBoardProps {
  boardSlug: string
}

export const KanbanBoard = ({ boardSlug }: KanbanBoardProps) => {
  const {
    board,
    isLoading,
    isFetching,
    error,
    isTaskModalOpen,
    isColumnModalOpen,
    isDeleteModalOpen,
    deleteTarget,
    selectedTask,
    editingColumnId,
    openTaskModal,
    closeTaskModal,
    openColumnModal,
    closeColumnModal,
    openDeleteModal,
    closeDeleteModal,
    setEditingColumn,
    createColumn,
    updateColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    addNote,
    deleteNote,
  } = useKanban(boardSlug)

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [addingToColumnId, setAddingToColumnId] = useState<number | null>(null)
  const [previewTaskId, setPreviewTaskId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'board' | 'analytics'>('board')

  const ownerMember = board ? {
    id: board.owner_id,
    email: board.owner,
    first_name: board.owner_name.split(' ')[0] || '',
    last_name: board.owner_name.split(' ').slice(1).join(' ') || ''
  } : null
  const potentialAssignees = board && ownerMember ? [ownerMember, ...board.members] : []

  const previewTask = board
    ? board.columns.flatMap((col) => col.tasks).find((t) => t.id === previewTaskId) || null
    : null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const taskId = event.active.id as number
      if (!board) return
      for (const column of board.columns) {
        const task = column.tasks.find((t) => t.id === taskId)
        if (task) { setActiveTask(task); break }
      }
    },
    [board]
  )

  const handleDragOver = useCallback((_event: DragOverEvent) => {}, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveTask(null)

      if (!over || !board) return

      const taskId = active.id as number
      let targetColumnId: number | null = null
      let newPosition = 0

      if (String(over.id).startsWith('column-')) {
        targetColumnId = parseInt(String(over.id).replace('column-', ''))
        const targetColumn = board.columns.find((c) => c.id === targetColumnId)
        newPosition = targetColumn?.tasks.length || 0
      } else {
        const overTaskId = over.id as number
        for (const column of board.columns) {
          const taskIndex = column.tasks.findIndex((t) => t.id === overTaskId)
          if (taskIndex !== -1) { targetColumnId = column.id; newPosition = taskIndex; break }
        }
      }

      if (targetColumnId === null) return

      let sourceColumnId: number | null = null
      for (const column of board.columns) {
        if (column.tasks.some((t) => t.id === taskId)) { sourceColumnId = column.id; break }
      }

      if (sourceColumnId === null) return

      if (sourceColumnId === targetColumnId) {
        const column = board.columns.find((c) => c.id === sourceColumnId)
        const currentIndex = column?.tasks.findIndex((t) => t.id === taskId) ?? -1
        if (currentIndex === newPosition) return
      }

      moveTask(taskId, { column: targetColumnId, position: newPosition })
    },
    [board, moveTask]
  )

  const handleAddTask = (columnId: number) => {
    setAddingToColumnId(columnId)
    openTaskModal()
  }

  const handleTaskSubmit = async (data: {
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    due_date: string | null
    assignee: number | null
  }) => {
    if (selectedTask) {
      await updateTask(selectedTask.id, data)
    } else if (addingToColumnId) {
      await createTask({ column: addingToColumnId, ...data })
    }
    setAddingToColumnId(null)
  }

  const handleColumnSubmit = async (name: string) => {
    if (!board) return
    await createColumn({ board: board.id, name })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'task') await deleteTask(deleteTarget.id)
    else if (deleteTarget.type === 'column') await deleteColumn(deleteTarget.id)
  }

  const handleTaskClick = (task: Task) => setPreviewTaskId(task.id)

  if (isLoading && !board) return <BoardSkeleton />

  if (error && !board) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ textAlign: 'center', animation: 'scaleIn 0.3s ease' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>❌</div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Failed to load board</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '9px 20px',
              borderRadius: 40,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              border: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!board) return null

  return (
    <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ padding: '3px 10px', borderRadius: 20, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              {board.columns.length} column{board.columns.length !== 1 ? 's' : ''}
            </span>
            <span style={{ padding: '3px 10px', borderRadius: 20, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              {board.columns.reduce((acc, col) => acc + col.tasks.length, 0)} task{board.columns.reduce((acc, col) => acc + col.tasks.length, 0) !== 1 ? 's' : ''}
            </span>
          </span>

          {/* View Toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 18,
            padding: 3,
            border: '1px solid var(--border-subtle)',
            marginLeft: 8
          }}>
            <button
              onClick={() => setActiveTab('board')}
              style={{
                padding: '4px 12px',
                borderRadius: 14,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: activeTab === 'board' ? 'var(--text-primary)' : 'var(--text-muted)',
                background: activeTab === 'board' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Board
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                padding: '4px 12px',
                borderRadius: 14,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: activeTab === 'analytics' ? 'var(--text-primary)' : 'var(--text-muted)',
                background: activeTab === 'analytics' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </button>
          </div>

          {isFetching && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <svg style={{ animation: 'spin 0.8s linear infinite' }} width="12" height="12" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.2 }} />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.7 }} />
              </svg>
              Syncing…
            </div>
          )}
        </div>

        {activeTab === 'board' && (
          <button
            onClick={openColumnModal}
            disabled={board.columns.length >= 10}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 18px',
              borderRadius: 40,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: board.columns.length >= 10 ? 'not-allowed' : 'pointer',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              opacity: board.columns.length >= 10 ? 0.5 : 1,
              boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              if (board.columns.length < 10) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(124,58,237,0.45)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.3)'
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Column
            {board.columns.length >= 10 && <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>(Max 10)</span>}
          </button>
        )}
      </div>

      {/* Board area */}
      {activeTab === 'board' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="kanban-scroll" style={{ flex: 1, minHeight: 0 }}>
            <div style={{ display: 'flex', gap: 16, height: '100%', alignItems: 'stretch' }}>
              {board.columns.map((column, index) => (
                <Column
                  key={column.id}
                  column={column}
                  colorIndex={index}
                  isEditing={editingColumnId === column.id}
                  onEditColumn={() => setEditingColumn(column.id)}
                  onDeleteColumn={() => openDeleteModal('column', column.id, column.name)}
                  onUpdateColumnName={(name) => updateColumn(column.id, { name })}
                  onAddTask={() => handleAddTask(column.id)}
                  onEditTask={(task) => openTaskModal(task)}
                  onDeleteTask={(task) => openDeleteModal('task', task.id, task.title)}
                  onTaskClick={handleTaskClick}
                />
              ))}

              {/* Empty board state */}
              {board.columns.length === 0 && (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'fadeIn 0.4s ease',
                }}>
                  <div style={{
                    textAlign: 'center',
                    padding: '64px 32px',
                    borderRadius: 20,
                    background: 'var(--bg-surface)',
                    border: '1.5px dashed rgba(124,58,237,0.3)',
                    maxWidth: 380,
                  }}>
                    <div style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: 'rgba(124,58,237,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      animation: 'float 3s ease-in-out infinite',
                    }}>
                      <span style={{ fontSize: '2rem' }}>📋</span>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                      No columns yet
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                      Add your first column to start organizing tasks
                    </p>
                    <button
                      onClick={openColumnModal}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 7,
                        padding: '10px 22px',
                        borderRadius: 40,
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        border: 'none',
                        fontFamily: 'var(--font-sans)',
                        boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                      }}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Column
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div style={{
                transform: 'rotate(3deg) scale(1.04)',
                filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.5))',
                animation: 'dragFloat 0.5s ease infinite',
              }}>
                <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div style={{ flex: 1, minHeight: 0 }}>
          <AnalyticsDashboard board={board} onTaskClick={handleTaskClick} />
        </div>
      )}

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => { closeTaskModal(); setAddingToColumnId(null) }}
        onSubmit={handleTaskSubmit}
        task={selectedTask}
        columnId={addingToColumnId || 0}
        assignees={potentialAssignees}
      />

      <ColumnModal isOpen={isColumnModalOpen} onClose={closeColumnModal} onSubmit={handleColumnSubmit} />

      <TaskPreviewModal
        isOpen={!!previewTask}
        onClose={() => setPreviewTaskId(null)}
        task={previewTask}
        onEdit={() => {
          if (previewTask) { openTaskModal(previewTask); setPreviewTaskId(null) }
        }}
        onDelete={() => {
          if (previewTask) { openDeleteModal('task', previewTask.id, previewTask.title); setPreviewTaskId(null) }
        }}
        onAddNote={(content) => addNote(previewTask!.id, content)}
        onDeleteNote={(noteId) => deleteNote(previewTask!.id, noteId)}
        boardOwnerEmail={board.owner}
      />

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteTarget?.type === 'task' ? 'Task' : 'Column'}`}
        description={`Are you sure you want to delete "${deleteTarget?.name}"? ${deleteTarget?.type === 'column' ? 'All tasks in this column will be deleted.' : ''}`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}