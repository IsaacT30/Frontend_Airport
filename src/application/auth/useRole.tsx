import { useAuth } from './useAuth';

export type UserRole = 'ADMIN' | 'EDITOR' | 'OPERADOR' | 'CLIENTE';

export const useRole = () => {
  const { user } = useAuth();

  const getUserRole = (): UserRole | null => {
    if (!user) return null;
    
    // Si el usuario es superuser o staff, es ADMIN
    if (user.is_superuser || user.is_staff) {
      return 'ADMIN';
    }
    
    // Si tiene un campo role
    if (user.role) {
      return user.role.toUpperCase() as UserRole;
    }
    
    // Si tiene un array de roles, tomar el primero
    if (user.roles && user.roles.length > 0) {
      return user.roles[0].toUpperCase() as UserRole;
    }
    
    // Por defecto, es CLIENTE
    return 'CLIENTE';
  };

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    const userRole = getUserRole();
    if (!userRole) return false;

    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return requiredRoles.includes(userRole);
  };

  const canCreate = (): boolean => {
    return hasRole(['ADMIN', 'EDITOR', 'OPERADOR']);
  };

  const canEdit = (): boolean => {
    return hasRole(['ADMIN', 'EDITOR']);
  };

  const canDelete = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canView = (): boolean => {
    return hasRole(['ADMIN', 'EDITOR', 'OPERADOR', 'CLIENTE']);
  };

  const canChangeStatus = (): boolean => {
    return hasRole(['ADMIN', 'OPERADOR']);
  };

  return {
    role: getUserRole(),
    hasRole,
    canCreate,
    canEdit,
    canDelete,
    canView,
    canChangeStatus,
    isAdmin: hasRole('ADMIN'),
    isEditor: hasRole('EDITOR'),
    isOperador: hasRole('OPERADOR'),
    isCliente: hasRole('CLIENTE'),
  };
};
