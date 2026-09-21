import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { authApi } from '@/api/endpoints/auth'
import { useAuthStore } from '../store/authStore'
import { loginSchema, type LoginFormData } from '../schemas/authSchemas'
import { useLogin } from '../hooks/useLogin'

export const LoginForm = () => {
  const { handleLogin, isLoading } = useLogin()
  const [showPassword, setShowPassword] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const isSubmitting = isLoading || isGoogleLoading

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    handleLogin(data)
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential
    if (!idToken) return
    
    setIsGoogleLoading(true)
    try {
      const response = await authApi.googleLogin(idToken)
      login(response.data.user, response.data.tokens)
      toast.success('Google login successful!')
      const from = (location.state as any)?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (error: unknown) {
      console.error('Google login error:', error)
      toast.error('Google login failed. Please try again.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Mail className="h-4 w-4" />
          </div>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            disabled={isSubmitting}
            className={`w-full pl-10 pr-4 py-2.5 bg-[var(--bg-surface-2)] border ${
              errors.email ? 'border-red-500/80 focus:ring-red-500/20' : 'border-[var(--border-subtle)] focus:border-violet-500/80 focus:ring-violet-500/20'
            } rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        </div>
        {errors.email && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Lock className="h-4 w-4" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password')}
            disabled={isSubmitting}
            className={`w-full pl-10 pr-10 py-2.5 bg-[var(--bg-surface-2)] border ${
              errors.password ? 'border-red-500/80 focus:ring-red-500/20' : 'border-[var(--border-subtle)] focus:border-violet-500/80 focus:ring-violet-500/20'
            } rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:ring-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] text-white font-semibold rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
        <span className="mx-3 text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Or continue with</span>
        <div className="flex-grow border-t border-[var(--border-subtle)]"></div>
      </div>

      {/* Google Login Button */}
      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            toast.error('Google Sign-In failed')
          }}
          useOneTap
          theme="filled_black"
          shape="pill"
          width="376"
        />
      </div>

      {/* Redirect Link */}
      <p className="text-center text-xs text-[var(--text-secondary)] mt-4">
        Don't have an account?{' '}
        <Link 
          to="/register" 
          state={location.state}
          className="text-[var(--accent)] hover:text-[var(--accent-light)] font-semibold hover:underline transition-colors"
        >
          Sign up
        </Link>
      </p>
    </form>
  )
}