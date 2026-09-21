import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '@/api/endpoints/auth'
import { useAuthStore } from '../store/authStore'
import type { LoginFormData } from '../schemas/authSchemas'

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(data)
      login(response.data.user, response.data.tokens)
      toast.success('Login successful!')
      const from = (location.state as any)?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (error: unknown) {
      console.error('Login error:', error)
      const isAxiosError = error && typeof error === 'object' && 'response' in error
      if (isAxiosError) {
        const axiosError = error as any
        const apiErrors = axiosError.response?.data?.errors
        if (apiErrors && Array.isArray(apiErrors)) {
          apiErrors.forEach((err: any) => {
            if (err.detail) {
              toast.error(err.detail)
            }
          })
        } else {
          toast.error('Login failed. Please check your credentials.')
        }
      } else {
        toast.error('Network error. Please check your connection.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { handleLogin, isLoading }
}