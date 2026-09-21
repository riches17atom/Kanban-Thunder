import { create } from 'zustand'
import axios from 'axios'
import { cacheService } from '@/services/cache.service'
import { authApi } from '@/api/endpoints/auth'
import type { User } from '../../../api/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  showSessionExpired: boolean
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setShowSessionExpired: (show: boolean) => void
  login: (user: User, tokens: { access: string }) => void
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

// Track whether initialize has already run in this page lifecycle.
// This prevents double-calling refresh (e.g. from React StrictMode double-invoke
// or multiple component mounts) which would blacklist a token that was just rotated.
let initializeCalled = false

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
  showSessionExpired: false,

  setUser: (user) => set({ user }),

  setAccessToken: (accessToken) => set({ accessToken }),

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setShowSessionExpired: (show) => set({ showSessionExpired: show }),

  login: (user, tokens) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, accessToken: tokens.access, isAuthenticated: true })
  },

  logout: async () => {
    initializeCalled = false  // allow re-initialization after logout
    cacheService.clearUserCache()
    localStorage.removeItem('user')
    set({ user: null, accessToken: null, isAuthenticated: false })
    try {
      await authApi.logout()
    } catch (err) {
      console.error('Backend logout failed:', err)
    }
  },

  initialize: async () => {
    // Already initialized this page lifecycle — skip to prevent
    // double refresh-token rotation (StrictMode, multiple mounts, etc.)
    if (initializeCalled) return
    initializeCalled = true

    // If we already have a valid access token in memory (e.g. login just happened),
    // there's nothing to do.
    const { accessToken } = get()
    if (accessToken) {
      set({ isInitializing: false })
      return
    }

    set({ isInitializing: true })

    // Use raw axios (not the intercepted client) so the 401 response-interceptor
    // doesn't fire during initialization and trigger a premature logout loop.
    try {
      const response = await axios.post<{
        data: { user: User; tokens: { access: string } }
      }>(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`,
        {},
        { withCredentials: true }
      )

      const { user, tokens } = response.data.data
      localStorage.setItem('user', JSON.stringify(user))
      set({
        user,
        accessToken: tokens.access,
        isAuthenticated: true,
        isInitializing: false,
      })
    } catch (error: unknown) {
      const status =
        error &&
        typeof error === 'object' &&
        'response' in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined

      // 429 — rate limited: fall back to cached user so the UI doesn't flash logout.
      if (status === 429) {
        const cachedUser = localStorage.getItem('user')
        if (cachedUser) {
          try {
            const user = JSON.parse(cachedUser) as User
            set({ user, isAuthenticated: true, isInitializing: false })
            return
          } catch { /* malformed cache */ }
        }
        set({ isInitializing: false })
        return
      }

      // No response (network/CORS error): don't log out — restore from cache.
      if (!status) {
        const cachedUser = localStorage.getItem('user')
        if (cachedUser) {
          try {
            const user = JSON.parse(cachedUser) as User
            set({ user, isAuthenticated: false, isInitializing: false })
            return
          } catch { /* malformed cache */ }
        }
      }

      // 401 — refresh token genuinely invalid/expired: clear everything.
      cacheService.clearAllCache()
      localStorage.removeItem('user')
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isInitializing: false,
      })
    }
  },
}))