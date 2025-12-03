import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import DashboardLayout from '../components/layout/DashboardLayout';
import { brtApi } from '../api/brt';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface RealtimeStatus {
  isConnected: boolean;
  lastUpdate?: Date;
}

const BRTAnalyticsDashboard: React.FC = () => {
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>({
    isConnected: false,
  });

  const { 
    data: dashboardData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['brt-dashboard'],
    queryFn: () => brtApi.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: trendsData } = useQuery({
    queryKey: ['brt-trends'],
    queryFn: () => brtApi.getTrends('daily', 7),
    refetchInterval: 30000,
  });

  // Debug logging
  console.log('🔍 Dashboard Debug:', {
    dashboardData,
    isLoading,
    error,
    hasData: !!dashboardData?.data,
    structure: dashboardData
  });

  useEffect(() => {
    // Initialize Pusher for real-time updates (optional)
    // This would require proper Pusher configuration
    const initRealtimeUpdates = () => {
      try {
        // Pusher integration would go here
        setRealtimeStatus({ isConnected: true, lastUpdate: new Date() });
      } catch (error) {
        console.log('Real-time updates not configured, using polling');
        setRealtimeStatus({ isConnected: false });
      }
    };

    initRealtimeUpdates();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-red-600">Error: {error.message}</p>
          <button 
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-600">No dashboard data available</p>
          <button 
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const stats = dashboardData.data || dashboardData;

  // Prepare chart data
  const statusChartData = {
    labels: ['Active', 'Expired', 'Redeemed'],
    datasets: [{
      data: [
        stats.charts.status_distribution.active,
        stats.charts.status_distribution.expired,
        stats.charts.status_distribution.redeemed
      ],
      backgroundColor: ['#10B981', '#EF4444', '#06B6D4'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const dailyChartData = {
    labels: stats.charts.daily_creation.map(d => 
      new Date(d.date).toLocaleDateString()
    ).reverse(),
    datasets: [{
      label: 'BRTs Created',
      data: stats.charts.daily_creation.map(d => d.count).reverse(),
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            🎫 BRT Analytics Dashboard
          </h1>
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
            Last updated: {new Date(stats.generated_at).toLocaleString()}
          </div>
        </div>

        {/* Real-time Status Indicator */}
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            realtimeStatus.isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {realtimeStatus.isConnected ? '🟢 Real-time Connected' : '🟡 Polling Mode'}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            📊 Overview Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total BRTs', value: stats.overview.total_brts, color: 'bg-blue-500' },
              { label: 'Active', value: stats.overview.active_brts, color: 'bg-green-500' },
              { label: 'Expired', value: stats.overview.expired_brts, color: 'bg-red-500' },
              { label: 'Redeemed', value: stats.overview.redeemed_brts, color: 'bg-cyan-500' },
              { label: 'Total Value', value: `$${stats.overview.total_reserved_amount}`, color: 'bg-purple-500' },
              { label: 'Users', value: stats.overview.total_users, color: 'bg-indigo-500' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl mx-auto mb-2`}>
                  <span className="text-2xl font-bold">{typeof stat.value === 'number' ? stat.value : stat.value.slice(1)}</span>
                </div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              📈 Status Distribution
            </h3>
            <div className="h-64">
              <Doughnut data={statusChartData} options={chartOptions} />
            </div>
          </div>

          {/* Daily Creation Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              📈 Daily BRT Creation (Last 30 Days)
            </h3>
            <div className="h-64">
              <Line data={dailyChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Time Period Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: '📅 Today\'s Activity', data: stats.time_periods.today },
            { title: '📊 This Week', data: stats.time_periods.this_week },
            { title: '📈 This Month', data: stats.time_periods.this_month },
          ].map((period, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{period.title}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg">
                  <div className="text-2xl font-bold">{period.data.brts_created}</div>
                  <div className="text-sm opacity-90">BRTs Created</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg">
                  <div className="text-2xl font-bold">${period.data.reserved_amount}</div>
                  <div className="text-sm opacity-90">Value</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Users and Recent Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🏆 Top Users
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.top_users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-indigo-500">
                  <div>
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <div className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {user.brt_count} BRTs
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              📊 Recent Trends (Last 7 Days)
            </h3>
            <div className="space-y-3">
              {trendsData?.data?.trends?.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <strong className="text-gray-900">{trend.period}</strong>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                      trend.status === 'active' ? 'bg-green-100 text-green-800' :
                      trend.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {trend.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{trend.count} BRTs</div>
                    <div className="text-sm text-gray-500">${trend.total_amount}</div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-500">
                  No trend data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BRTAnalyticsDashboard;