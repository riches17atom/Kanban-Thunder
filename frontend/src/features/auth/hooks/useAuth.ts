import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, isInitializing, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isInitializing,
    logout,
  };
};