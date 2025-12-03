import type { NavItem } from '../types';

export const navigationConfig: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: 'dashboard',
  },
  {
    name: 'Users',
    path: '/users',
    permission: 'users:read',
    icon: 'users',
    children: [
      {
        name: 'All Users',
        path: '/users',
        permission: 'users:read',
      },
      {
        name: 'Create User',
        path: '/users/create',
        permission: 'users:create',
      },
    ],
  },
  {
    name: 'Roles & Permissions',
    path: '/roles',
    permission: 'roles:read',
    icon: 'shield',
    children: [
      {
        name: 'Roles',
        path: '/roles',
        permission: 'roles:read',
      },
      {
        name: 'Permissions',
        path: '/permissions',
        permission: 'permissions:read',
      },
    ],
  },
  {
    name: 'Resources',
    path: '/resources',
    permission: 'resources:read',
    icon: 'folder',
    children: [
      {
        name: 'All Resources',
        path: '/resources',
        permission: 'resources:read',
      },
      {
        name: 'Create Resource',
        path: '/resources/create',
        permission: 'resources:create',
      },
    ],
  },
  {
    name: 'Audit Logs',
    path: '/audit-logs',
    permission: 'audit:read',
    icon: 'clipboard-list',
  },
  {
    name: 'Admin',
    path: '/admin',
    permission: 'admin:access',
    icon: 'cog',
    children: [
      {
        name: 'System Info',
        path: '/admin/system',
        permission: 'admin:system',
      },
      {
        name: 'Security',
        path: '/admin/security',
        permission: 'admin:security',
      },
    ],
  },
];

// Filter navigation items based on user permissions
export const getFilteredNavigation = (
  navigation: NavItem[],
  hasPermission: (permission: string) => boolean
): NavItem[] => {
  return navigation.reduce<NavItem[]>((filtered, item) => {
    // If item requires permission and user doesn't have it, skip
    if (item.permission && !hasPermission(item.permission)) {
      return filtered;
    }

    // Filter children if they exist
    const filteredItem: NavItem = { ...item };
    if (item.children) {
      filteredItem.children = getFilteredNavigation(item.children, hasPermission);
      // If no children are left after filtering, hide the parent too
      if (filteredItem.children.length === 0) {
        return filtered;
      }
    }

    filtered.push(filteredItem);
    return filtered;
  }, []);
};