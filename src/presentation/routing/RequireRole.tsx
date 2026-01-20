import { Navigate } from 'react-router-dom';
import { useAuth } from '../../application/auth/useAuth';
import { useRole, UserRole } from '../../application/auth/useRole';

interface RequireRoleProps {
  children: JSX.Element;
  roles: UserRole | UserRole[];
  fallback?: JSX.Element;
}

export const RequireRole = ({ children, roles, fallback }: RequireRoleProps) => {
  const { isAuthenticated, loading } = useAuth();
  const { hasRole } = useRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(roles)) {
    if (fallback) {
      return fallback;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta sección.
          </p>
          <a
            href="/dashboard"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 inline-block"
          >
            Volver al Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};
