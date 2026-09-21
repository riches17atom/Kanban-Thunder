import api from '../client'
import type { ApiResponse } from '../types'
import type { Task, TaskNote } from './boards'

export interface CreateTaskRequest {
  column: number
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  due_date?: string | null
  assignee?: number | null
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  due_date?: string | null
  assignee?: number | null
}

export interface MoveTaskRequest {
  column: number
  position: number
}

export interface ReorderTasksRequest {
  task_ids: number[]
}

export interface BulkMoveTasksRequest {
  task_ids: number[]
  column: number
}

export const tasksApi = {
  list: async (params?: { column?: number; board?: number; priority?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.column) searchParams.append('column', String(params.column))
    if (params?.board) searchParams.append('board', String(params.board))
    if (params?.priority) searchParams.append('priority', params.priority)
    
    const queryString = searchParams.toString()
    const url = queryString ? `/tasks/?${queryString}` : '/tasks/'
    const response = await api.get<ApiResponse<Task[]>>(url)
    return response.data
  },

  get: async (id: number) => {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}/`)
    return response.data
  },

  create: async (data: CreateTaskRequest) => {
    const response = await api.post<ApiResponse<Task>>('/tasks/', data)
    return response.data
  },

  update: async (id: number, data: UpdateTaskRequest) => {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}/`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/tasks/${id}/`)
    return response.data
  },

  move: async (id: number, data: MoveTaskRequest) => {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}/move/`, data)
    return response.data
  },

  reorder: async (data: ReorderTasksRequest) => {
    const response = await api.post<ApiResponse>('/tasks/reorder/', data)
    return response.data
  },

  bulkMove: async (data: BulkMoveTasksRequest) => {
    const response = await api.post<ApiResponse>('/tasks/bulk_move/', data)
    return response.data
  },

  addNote: async (taskId: number, content: string) => {
    const response = await api.post<ApiResponse<TaskNote>>(`/tasks/${taskId}/notes/`, { content })
    return response.data
  },

  deleteNote: async (taskId: number, noteId: number) => {
    const response = await api.delete<ApiResponse>(`/tasks/${taskId}/notes/${noteId}/`)
    return response.data
  },
}