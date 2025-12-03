import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { usePermissions } from '../hooks/usePermissions';
import DashboardLayout from '../components/layout/DashboardLayout';
import { usersApi } from '../api/users';
import { rolesApi } from '../api/roles';
import { auditLogsApi } from '../api/audit-logs';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { can } = usePermissions();

  // Dashboard stats queries
  const { data: usersStats } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => usersApi.getUsers({ page: 1, per_page: 10 }),
  });

  const { data: rolesStats } = useQuery({
    queryKey: ['roles', 'stats'],
    queryFn: () => rolesApi.getRoles({ page: 1, per_page: 10 }),
  });

  const { data: recentAuditLogs } = useQuery({
    queryKey: ['audit-logs', 'recent'],
    queryFn: () => auditLogsApi.getAuditLogs({ page: 1, per_page: 10 }),
  });

  const stats = [
    {
      name: 'Total Users',
      value: usersStats?.data?.pagination?.total || 0,
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      name: 'Active Roles',
      value: rolesStats?.data?.pagination?.total || 0,
      icon: '🔐',
      color: 'bg-green-500',
    },
    {
      name: 'Recent Activity',
      value: recentAuditLogs?.data?.data?.length || 0,
      icon: '📋',
      color: 'bg-purple-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome header */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Here's what's happening with your system today.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-lg sm:text-xl`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="ml-4 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm sm:text-base font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-xl sm:text-2xl font-bold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg sm:text-xl leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            {recentAuditLogs?.data?.data && recentAuditLogs.data.data.length > 0 ? (
              <div className="space-y-3">
                {recentAuditLogs.data.data.map((log) => (
                  <div key={log.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-200 last:border-b-0 space-y-2 sm:space-y-0">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="ml-3 min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {log.event_type}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {log.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 ml-5 sm:ml-0 flex-shrink-0">
                      {new Date(log.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No recent activity found.
              </p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg sm:text-xl leading-6 font-medium text-gray-900 mb-4 sm:mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Create User Action */}
              {can.viewUsers() && (
                <button 
                  onClick={() => navigate('/users')}
                  className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group"
                >
                  <div className="text-center">
                    <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block group-hover:scale-110 transition-transform">👤</span>
                    <span className="text-sm sm:text-base font-medium text-gray-900">Manage Users</span>
                    <p className="text-xs text-gray-500 mt-1">View and manage system users</p>
                  </div>
                </button>
              )}

              {/* Manage Roles Action */}
              {can.viewRoles() && (
                <button 
                  onClick={() => navigate('/roles')}
                  className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group"
                >
                  <div className="text-center">
                    <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block group-hover:scale-110 transition-transform">🔐</span>
                    <span className="text-sm sm:text-base font-medium text-gray-900">Manage Roles</span>
                    <p className="text-xs text-gray-500 mt-1">Configure roles and permissions</p>
                  </div>
                </button>
              )}

              {/* Request Access Action */}
              <button 
                onClick={() => navigate('/request-access')}
                className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group"
              >
                <div className="text-center">
                  <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block group-hover:scale-110 transition-transform">📝</span>
                  <span className="text-sm sm:text-base font-medium text-gray-900">Request Access</span>
                  <p className="text-xs text-gray-500 mt-1">Submit elevated access request</p>
                </div>
              </button>

              {/* View Resources Action */}
              {can.viewResources() && (
                <button 
                  onClick={() => navigate('/resources')}
                  className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group"
                >
                  <div className="text-center">
                    <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block group-hover:scale-110 transition-transform">📁</span>
                    <span className="text-sm sm:text-base font-medium text-gray-900">View Resources</span>
                    <p className="text-xs text-gray-500 mt-1">Browse system resources</p>
                  </div>
                </button>
              )}

              {/* View Audit Logs Action */}
              {can.viewAuditLogs() && (
                <button 
                  onClick={() => navigate('/audit-logs')}
                  className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group"
                >
                  <div className="text-center">
                    <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block group-hover:scale-110 transition-transform">📋</span>
                    <span className="text-sm sm:text-base font-medium text-gray-900">View Audit Logs</span>
                    <p className="text-xs text-gray-500 mt-1">Review system activity</p>
                  </div>
                </button>
              )}

              {/* BRT Analytics Action */}
              <button 
                onClick={() => navigate('/brt-analytics')}
                className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group"
              >
                <div className="text-center">
                  <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block group-hover:scale-110 transition-transform">📊</span>
                  <span className="text-sm sm:text-base font-medium text-gray-900">BRT Analytics</span>
                  <p className="text-xs text-gray-500 mt-1">View BRT statistics and trends</p>
                </div>
              </button>

              {/* BRT Management Action */}
              <button 
                onClick={() => navigate('/brt-management')}
                className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group"
              >
                <div className="text-center">
                  <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block group-hover:scale-110 transition-transform">🎫</span>
                  <span className="text-sm sm:text-base font-medium text-gray-900">Manage BRTs</span>
                  <p className="text-xs text-gray-500 mt-1">Create, update, and delete BRT tickets</p>
                </div>
              </button>

              {/* BRT Redeem Action */}
              <button 
                onClick={() => navigate('/brt-redeem')}
                className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 group"
              >
                <div className="text-center">
                  <span className="text-2xl sm:text-3xl mb-2 sm:mb-3 block group-hover:scale-110 transition-transform">💰</span>
                  <span className="text-sm sm:text-base font-medium text-gray-900">Redeem BRT</span>
                  <p className="text-xs text-gray-500 mt-1">Redeem BRT with reservation code</p>
                </div>
              </button>

              {/* Placeholder if no actions available */}
              {!can.viewUsers() && !can.viewRoles() && !can.viewResources() && !can.viewAuditLogs() && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p className="text-sm">No quick actions available based on your current permissions.</p>
                  <p className="text-xs mt-1">Contact your administrator for more access.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;