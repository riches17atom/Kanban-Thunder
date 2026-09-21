import { useCallback, useEffect, useRef, useMemo } from 'react'
import toast from 'react-hot-toast'
import { boardsApi } from '@/api/endpoints/boards'
import { columnsApi } from '@/api/endpoints/columns'
import { tasksApi } from '@/api/endpoints/tasks'
import { useKanbanStore } from '../store/kanbanStore'
import { cacheService } from '@/services/cache.service'
import { CacheKeys } from '@/services/cache.keys'
import type { CreateTaskRequest, UpdateTaskRequest, MoveTaskRequest } from '@/api/endpoints/tasks'
import type { CreateColumnRequest, UpdateColumnRequest } from '@/api/endpoints/columns'
import type { BoardDetail } from '@/api/endpoints/boards'

export const useKanban = (slug: string) => {
  const board = useKanbanStore((state) => state.board)
  const isLoading = useKanbanStore((state) => state.isLoading)
  const isFetching = useKanbanStore((state) => state.isFetching)
  const error = useKanbanStore((state) => state.error)
  const selectedTask = useKanbanStore((state) => state.selectedTask)
  const isTaskModalOpen = useKanbanStore((state) => state.isTaskModalOpen)
  const isColumnModalOpen = useKanbanStore((state) => state.isColumnModalOpen)
  const isDeleteModalOpen = useKanbanStore((state) => state.isDeleteModalOpen)
  const deleteTarget = useKanbanStore((state) => state.deleteTarget)
  const editingColumnId = useKanbanStore((state) => state.editingColumnId)

  // Select individual functions to ensure their references are stable
  const setBoard = useKanbanStore((state) => state.setBoard)
  const setBoardWithCache = useKanbanStore((state) => state.setBoardWithCache)
  const setLoading = useKanbanStore((state) => state.setLoading)
  const setFetching = useKanbanStore((state) => state.setFetching)
  const setError = useKanbanStore((state) => state.setError)
  const openTaskModal = useKanbanStore((state) => state.openTaskModal)
  const closeTaskModal = useKanbanStore((state) => state.closeTaskModal)
  const openColumnModal = useKanbanStore((state) => state.openColumnModal)
  const closeColumnModal = useKanbanStore((state) => state.closeColumnModal)
  const openDeleteModal = useKanbanStore((state) => state.openDeleteModal)
  const closeDeleteModal = useKanbanStore((state) => state.closeDeleteModal)
  const setEditingColumn = useKanbanStore((state) => state.setEditingColumn)
  const addColumn = useKanbanStore((state) => state.addColumn)
  const storeUpdateColumn = useKanbanStore((state) => state.updateColumn)
  const removeColumn = useKanbanStore((state) => state.removeColumn)
  const storeReorderColumns = useKanbanStore((state) => state.reorderColumns)
  const addTask = useKanbanStore((state) => state.addTask)
  const storeUpdateTask = useKanbanStore((state) => state.updateTask)
  const removeTask = useKanbanStore((state) => state.removeTask)
  const storeMoveTask = useKanbanStore((state) => state.moveTask)

  const actions = useMemo(() => ({
    setBoard,
    setBoardWithCache,
    setLoading,
    setFetching,
    setError,
    openTaskModal,
    closeTaskModal,
    openColumnModal,
    closeColumnModal,
    openDeleteModal,
    closeDeleteModal,
    setEditingColumn,
    addColumn,
    updateColumn: storeUpdateColumn,
    removeColumn,
    reorderColumns: storeReorderColumns,
    addTask,
    updateTask: storeUpdateTask,
    removeTask,
    moveTask: storeMoveTask,
  }), [
    setBoard,
    setBoardWithCache,
    setLoading,
    setFetching,
    setError,
    openTaskModal,
    closeTaskModal,
    openColumnModal,
    closeColumnModal,
    openDeleteModal,
    closeDeleteModal,
    setEditingColumn,
    addColumn,
    storeUpdateColumn,
    removeColumn,
    storeReorderColumns,
    addTask,
    storeUpdateTask,
    removeTask,
    storeMoveTask,
  ])

  const isMountedRef = useRef(true)
  const currentSlugRef = useRef(slug)

  const fetchBoard = useCallback(async (boardSlug: string, isBackgroundRefresh = false) => {
    if (!isMountedRef.current || currentSlugRef.current !== boardSlug) return

    if (!isBackgroundRefresh) {
      const cached = cacheService.get<BoardDetail>(CacheKeys.board(boardSlug))
      if (cached) {
        actions.setBoard(cached)
        actions.setFetching(true)
      } else {
        actions.setLoading(true)
      }
    } else {
      actions.setFetching(true)
    }

    actions.setError(null)

    try {
      const response = await boardsApi.get(boardSlug)

      if (isMountedRef.current && currentSlugRef.current === boardSlug) {
        actions.setBoardWithCache(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch board:', error)
      
      if (isMountedRef.current && currentSlugRef.current === boardSlug) {
        const currentBoard = useKanbanStore.getState().board
        if (!currentBoard) {
          actions.setError('Failed to load board')
          toast.error('Failed to load board')
        }
      }
    } finally {
      if (isMountedRef.current && currentSlugRef.current === boardSlug) {
        actions.setLoading(false)
        actions.setFetching(false)
      }
    }
  }, [actions])

  useEffect(() => {
    isMountedRef.current = true
    currentSlugRef.current = slug

    if (slug) {
      fetchBoard(slug)
    }

    return () => {
      isMountedRef.current = false
    }
  }, [slug, fetchBoard]) 

  useEffect(() => {
    const handleFocus = () => {
      const currentBoard = useKanbanStore.getState().board
      if (slug && currentBoard && isMountedRef.current) {
        fetchBoard(slug, true)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [slug, fetchBoard]) 

  const createColumn = useCallback(async (data: CreateColumnRequest) => {
    try {
      const response = await columnsApi.create(data)
      actions.addColumn({ ...response.data, tasks: [] })
      toast.success('Column created')
      actions.closeColumnModal()
    } catch (error) {
      console.error('Failed to create column:', error)
      toast.error('Failed to create column')
    }
  }, [actions])

  const updateColumn = useCallback(async (columnId: number, data: UpdateColumnRequest) => {
    try {
      await columnsApi.update(columnId, data)
      actions.updateColumn(columnId, data)
      actions.setEditingColumn(null)
      toast.success('Column updated')
    } catch (error) {
      console.error('Failed to update column:', error)
      toast.error('Failed to update column')
    }
  }, [actions])

  const deleteColumn = useCallback(async (columnId: number) => {
    try {
      await columnsApi.delete(columnId)
      actions.removeColumn(columnId)
      actions.closeDeleteModal()
      toast.success('Column deleted')
    } catch (error) {
      console.error('Failed to delete column:', error)
      toast.error('Failed to delete column')
    }
  }, [actions])

  const reorderColumns = useCallback(async (columnIds: number[]) => {
    const previousBoard = useKanbanStore.getState().board

    actions.reorderColumns(columnIds)

    try {
      await columnsApi.reorder({ column_ids: columnIds })
    } catch (error) {
      console.error('Failed to reorder columns:', error)
      toast.error('Failed to reorder columns')

      if (previousBoard) {
        actions.setBoard(previousBoard)
        cacheService.set(CacheKeys.board(previousBoard.id), previousBoard)
      }
    }
  }, [actions])

  const createTask = useCallback(async (data: CreateTaskRequest) => {
    try {
      const response = await tasksApi.create(data)
      actions.addTask(data.column, response.data)
      toast.success('Task created')
      actions.closeTaskModal()
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    }
  }, [actions])

  const updateTask = useCallback(async (taskId: number, data: UpdateTaskRequest) => {
    try {
      const response = await tasksApi.update(taskId, data)
      actions.updateTask(taskId, response.data)
      toast.success('Task updated')
      actions.closeTaskModal()
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task')
    }
  }, [actions])

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      await tasksApi.delete(taskId)
      actions.removeTask(taskId)
      actions.closeDeleteModal()
      toast.success('Task deleted')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
    }
  }, [actions])

  const moveTask = useCallback(async (taskId: number, data: MoveTaskRequest) => {
    const previousBoard = useKanbanStore.getState().board

    actions.moveTask(taskId, data.column, data.position)

    try {
      await tasksApi.move(taskId, data)
    } catch (error) {
      console.error('Failed to move task:', error)
      toast.error('Failed to move task')

      if (previousBoard) {
        actions.setBoard(previousBoard)
        cacheService.set(CacheKeys.board(previousBoard.id), previousBoard)
      }
    }
  }, [actions])

  const addNote = useCallback(async (taskId: number, content: string) => {
    try {
      const response = await tasksApi.addNote(taskId, content)
      const currentBoard = useKanbanStore.getState().board
      if (currentBoard) {
        const newBoard = {
          ...currentBoard,
          columns: currentBoard.columns.map(col => ({
            ...col,
            tasks: col.tasks.map(t =>
              t.id === taskId
                ? { ...t, notes: [...(t.notes || []), response.data] }
                : t
            )
          }))
        }
        actions.setBoardWithCache(newBoard)
      }
      toast.success('Note added')
      return response.data
    } catch (error) {
      console.error('Failed to add note:', error)
      toast.error('Failed to add note')
      throw error
    }
  }, [actions])

  const deleteNote = useCallback(async (taskId: number, noteId: number) => {
    try {
      await tasksApi.deleteNote(taskId, noteId)
      const currentBoard = useKanbanStore.getState().board
      if (currentBoard) {
        const newBoard = {
          ...currentBoard,
          columns: currentBoard.columns.map(col => ({
            ...col,
            tasks: col.tasks.map(t =>
              t.id === taskId
                ? { ...t, notes: (t.notes || []).filter(n => n.id !== noteId) }
                : t
            )
          }))
        }
        actions.setBoardWithCache(newBoard)
      }
      toast.success('Note deleted')
    } catch (error) {
      console.error('Failed to delete note:', error)
      toast.error('Failed to delete note')
    }
  }, [actions])

  const updateBoard = useCallback(async (updates: { name?: string; description?: string }) => {
    if (!board) return
    try {
      const response = await boardsApi.update(board.slug, updates)
      const updatedBoard = {
        ...board,
        ...response.data,
        columns: board.columns,
      }
      actions.setBoardWithCache(updatedBoard)
      toast.success('Board updated')
      return response.data
    } catch (error) {
      console.error('Failed to update board:', error)
      toast.error('Failed to update board')
      throw error
    }
  }, [board, actions])

  return {
    board,
    isLoading,
    isFetching,
    error,

    selectedTask,
    isTaskModalOpen,
    isColumnModalOpen,
    isDeleteModalOpen,
    deleteTarget,
    editingColumnId,

    openTaskModal: actions.openTaskModal,
    closeTaskModal: actions.closeTaskModal,
    openColumnModal: actions.openColumnModal,
    closeColumnModal: actions.closeColumnModal,
    openDeleteModal: actions.openDeleteModal,
    closeDeleteModal: actions.closeDeleteModal,
    setEditingColumn: actions.setEditingColumn,

    fetchBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    addNote,
    deleteNote,
    updateBoard,
  }
}