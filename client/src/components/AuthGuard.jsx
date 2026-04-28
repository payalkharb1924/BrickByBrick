import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function AuthGuard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
