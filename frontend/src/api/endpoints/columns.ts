import api from '../client'
import type { ApiResponse } from '../types'
import type { Column } from './boards'

export interface CreateColumnRequest {
  board: number
  name: string
}

export interface UpdateColumnRequest {
  name: string
}

export interface ReorderColumnsRequest {
  column_ids: number[]
}

export const columnsApi = {
  list: async (boardId?: number) => {
    const params = boardId ? `?board=${boardId}` : ''
    const response = await api.get<ApiResponse<Column[]>>(`/columns/${params}`)
    return response.data
  },

  get: async (id: number) => {
    const response = await api.get<ApiResponse<Column>>(`/columns/${id}/`)
    return response.data
  },

  create: async (data: CreateColumnRequest) => {
    const response = await api.post<ApiResponse<Column>>('/columns/', data)
    return response.data
  },

  update: async (id: number, data: UpdateColumnRequest) => {
    const response = await api.patch<ApiResponse<Column>>(`/columns/${id}/`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/columns/${id}/`)
    return response.data
  },

  reorder: async (data: ReorderColumnsRequest) => {
    const response = await api.post<ApiResponse>('/columns/reorder/', data)
    return response.data
  },
}