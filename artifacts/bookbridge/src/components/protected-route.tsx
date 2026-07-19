import { ReactNode } from 'react';
import { useAuth } from './auth-provider';
import { useLocation } from 'wouter';

export function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode, adminOnly?: boolean }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // We defer the location change to avoid React state update warnings during render
    setTimeout(() => setLocation('/login'), 0);
    return null;
  }

  if (adminOnly && user?.role !== 'admin') {
    setTimeout(() => setLocation('/dashboard'), 0);
    return null;
  }

  return <>{children}</>;
}
