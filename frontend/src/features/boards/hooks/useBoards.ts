import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { boardsApi } from '@/api/endpoints/boards'
import type { Board, CreateBoardRequest, UpdateBoardRequest } from '@/api/endpoints/boards'

export const useBoards = () => {
  const [boards, setBoards] = useState<Board[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBoards = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await boardsApi.list()
      setBoards(response.data)
    } catch (err) {
      console.error('Failed to fetch boards:', err)
      setError('Failed to load boards')
      toast.error('Failed to load boards')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createBoard = useCallback(async (data: CreateBoardRequest) => {
    try {
      const response = await boardsApi.create(data)
      setBoards((prev) => [response.data, ...prev])
      toast.success('Board created')
      return response.data
    } catch (err) {
      console.error('Failed to create board:', err)
      toast.error('Failed to create board')
      throw err
    }
  }, [])

  const updateBoard = useCallback(async (id: number, data: UpdateBoardRequest) => {
    try {
      const response = await boardsApi.update(id, data)
      setBoards((prev) =>
        prev.map((board) => (board.id === id ? { ...board, ...response.data } : board))
      )
      toast.success('Board updated')
      return response.data
    } catch (err) {
      console.error('Failed to update board:', err)
      toast.error('Failed to update board')
      throw err
    }
  }, [])

  const deleteBoard = useCallback(async (id: number) => {
    try {
      await boardsApi.delete(id)
      setBoards((prev) => prev.filter((board) => board.id !== id))
      toast.success('Board deleted')
    } catch (err) {
      console.error('Failed to delete board:', err)
      toast.error('Failed to delete board')
      throw err
    }
  }, [])

  const duplicateBoard = useCallback(
    async (id: number) => {
      const originalBoard = boards.find((b) => b.id === id)
      if (!originalBoard) {
        toast.error('Board not found')
        throw new Error('Board not found')
      }

      const copyPattern = new RegExp(
        `^${originalBoard.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\(Copy( \\d+)?\\)$`
      )
      const existingCopies = boards.filter(
        (b) => copyPattern.test(b.name) || b.name === `${originalBoard.name} (Copy)`
      )

      if (existingCopies.length >= 2) {
        toast.error('Maximum 2 copies allowed per board')
        throw new Error('Maximum 2 copies allowed')
      }

      try {
        const response = await boardsApi.duplicate(id)
        setBoards((prev) => [response.data, ...prev])
        toast.success('Board duplicated')
        return response.data
      } catch (err) {
        console.error('Failed to duplicate board:', err)
        toast.error('Failed to duplicate board')
        throw err
      }
    },
    [boards]
  )

  return {
    boards,
    isLoading,
    error,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    duplicateBoard,
  }
}