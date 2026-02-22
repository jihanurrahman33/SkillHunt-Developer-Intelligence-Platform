import { useAuth } from '@/features/auth/context/AuthContext';

export default function useAuthHook() {
  const { user, loading } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isRecruiter = user?.role === 'recruiter';
  const isAuthenticated = !!user;

  return {
    user,
    loading,
    isAdmin,
    isRecruiter,
    isAuthenticated,
  };
}
