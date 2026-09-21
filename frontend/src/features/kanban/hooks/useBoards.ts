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
  
  const updateBoard = useCallback(async (slug: string, data: UpdateBoardRequest) => {
    try {
      const response = await boardsApi.update(slug, data)
      setBoards((prev) =>
        prev.map((board) => (board.slug === slug ? { ...board, ...response.data } : board))
      )
      toast.success('Board updated')
      return response.data
    } catch (err) {
      console.error('Failed to update board:', err)
      toast.error('Failed to update board')
      throw err
    }
  }, [])
  
  const deleteBoard = useCallback(async (slug: string) => {
    try {
      await boardsApi.delete(slug)
      setBoards((prev) => prev.filter((board) => board.slug !== slug))
      toast.success('Board deleted')
    } catch (err) {
      console.error('Failed to delete board:', err)
      toast.error('Failed to delete board')
      throw err
    }
  }, [])
  
  const duplicateBoard = useCallback(async (slug: string) => {
    try {
      const response = await boardsApi.duplicate(slug)
      setBoards((prev) => [response.data, ...prev])
      toast.success('Board duplicated')
      return response.data
    } catch (err) {
      console.error('Failed to duplicate board:', err)
      toast.error('Failed to duplicate board')
      throw err
    }
  }, [])
  
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