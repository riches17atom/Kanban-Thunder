import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Dashboard } from '@/pages/Dashboard'
import { Board } from '@/pages/Board'
import { JoinBoard } from '@/pages/JoinBoard'
import { Terms } from '@/pages/Terms'
import { Privacy } from '@/pages/Privacy'
import { About } from '@/pages/About'
import { Contact } from '@/pages/Contact'
import { Blog } from '@/pages/Blog'
import { BlogPost } from '@/pages/BlogPost'
import { ProtectedRoute } from './ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/boards/:slug',
    element: (
      <ProtectedRoute>
        <Board />
      </ProtectedRoute>
    ),
  },
  {
    path: '/join/:token',
    element: (
      <ProtectedRoute>
        <JoinBoard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/terms',
    element: <Terms />,
  },
  {
    path: '/privacy',
    element: <Privacy />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/contact',
    element: <Contact />,
  },
  {
    path: '/blog',
    element: <Blog />,
  },
  {
    path: '/blog/:slug',
    element: <BlogPost />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])