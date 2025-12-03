import { useMemo } from 'react';
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user, hasPermission, hasAnyPermission, hasRole } = useAuth();

  // Memoized permission checks for better performance
  const permissions = useMemo(() => {
    if (!user?.roles) return [];
    
    return user.roles.reduce<string[]>((acc, role) => {
      if (role.permissions) {
        acc.push(...role.permissions.map(p => p.name));
      }
      return acc;
    }, []);
  }, [user?.roles]);

  const roles = useMemo(() => {
    if (!user?.roles) return [];
    return user.roles.map(role => role.name);
  }, [user?.roles]);

  // Common permission checks
  const can = {
    // User permissions
    createUsers: () => hasPermission('users:create'),
    viewUsers: () => hasPermission('users:read') || hasPermission('users:list'),
    updateUsers: () => hasPermission('users:update'),
    deleteUsers: () => hasPermission('users:delete'),

    // Role permissions
    createRoles: () => hasPermission('roles:create'),
    viewRoles: () => hasPermission('roles:read') || hasPermission('roles:list'),
    updateRoles: () => hasPermission('roles:update'),
    deleteRoles: () => hasPermission('roles:delete'),

    // Permission permissions
    createPermissions: () => hasPermission('permissions:create'),
    viewPermissions: () => hasPermission('permissions:read') || hasPermission('permissions:list'),
    updatePermissions: () => hasPermission('permissions:update'),
    deletePermissions: () => hasPermission('permissions:delete'),

    // Resource permissions
    createResources: () => hasPermission('resources:create'),
    viewResources: () => hasPermission('resources:read') || hasPermission('resources:list'),
    updateResources: () => hasPermission('resources:update'),
    deleteResources: () => hasPermission('resources:delete'),

    // Audit permissions
    viewAuditLogs: () => hasPermission('audit:read') || hasPermission('audit:list'),

    // Admin permissions
    accessAdmin: () => hasRole('admin') || hasRole('super-admin'),
    manageSecurity: () => hasAnyPermission(['security:manage', 'admin:all']),
  };

  return {
    permissions,
    roles,
    hasPermission,
    hasAnyPermission,
    hasRole,
    can,
  };
};