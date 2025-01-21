import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  // Render children if authenticated
  return <>{children}</>;
} 