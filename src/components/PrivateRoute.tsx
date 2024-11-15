import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

export function PrivateRoute({ children, isAuthenticated }: PrivateRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}