import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface NavItem {
  name: string;
  path: string;
  permission?: string;
  icon?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuthStore();

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: '🏠' },
    { name: 'BRT Analytics', path: '/brt-analytics', icon: '📊' },
    { name: 'Manage BRTs', path: '/brt-management', icon: '🎫' },
    { name: 'Redeem BRT', path: '/brt-redeem', icon: '💰' },
    { name: 'Users', path: '/users', permission: 'users:read', icon: '👥' },
    { name: 'Roles', path: '/roles', permission: 'roles:read', icon: '🔐' },
    { name: 'Resources', path: '/resources', permission: 'resources:read', icon: '📁' },
    { name: 'Audit Logs', path: '/audit-logs', permission: 'audit:read', icon: '📋' },
    { name: 'Request Access', path: '/request-access', icon: '🔑' },
    { name: 'Manage Access Requests', path: '/manage-access-requests', permission: 'access-requests:approve', icon: '✅' },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`bg-gray-900 text-white w-64 min-h-screen flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Mobile close button */}
      <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">UGG HQ Admin</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Desktop logo */}
      <div className="hidden lg:block p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">UGG HQ Admin</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <span className="truncate">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-gray-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md shrink-0"
            title="Logout"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;