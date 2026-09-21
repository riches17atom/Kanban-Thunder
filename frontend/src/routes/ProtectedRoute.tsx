import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        flexDirection: 'column',
        gap: 16,
      }}>
        {/* Spinning ring */}
        <div style={{ position: 'relative', width: 44, height: 44 }}>
          <svg
            style={{ animation: 'spin 0.9s linear infinite' }}
            width="44"
            height="44"
            viewBox="0 0 44 44"
            fill="none"
          >
            <circle
              cx="22" cy="22" r="18"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="4"
            />
            <path
              d="M22 4a18 18 0 0118 18"
              stroke="url(#grad)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <p style={{
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          animation: 'fadeIn 0.5s ease',
        }}>
          Restoring your session…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};