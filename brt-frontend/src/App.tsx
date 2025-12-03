
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './utils/queryClient';
import { AuthProvider } from './features/auth/AuthProvider';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import LoginForm from './components/forms/LoginForm';
import RegisterForm from './components/forms/RegisterForm';
import Dashboard from './containers/Dashboard';
import BRTAnalyticsDashboard from './containers/BRTAnalyticsDashboard';
import BRTManagement from './containers/BRTManagement';
import BRTRedeemPage from './containers/BRTRedeemPage';
import UsersPage from './containers/UsersPage';
import RolesPage from './containers/RolesPage';
import ResourcesPage from './containers/ResourcesPage';
import AuditLogsPage from './containers/AuditLogsPage';
import RequestAccessPage from './containers/RequestAccessPage';
import AccessRequestManagementPage from './containers/AccessRequestManagementPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-gray-50 overflow-x-hidden">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              
              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/users"
                element={
                  <ProtectedRoute requiredPermission="users:read">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/roles"
                element={
                  <ProtectedRoute requiredPermission="roles:read">
                    <RolesPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/resources"
                element={
                  <ProtectedRoute requiredPermission="resources:read">
                    <ResourcesPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute requiredPermission="audit:read">
                    <AuditLogsPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/request-access"
                element={
                  <ProtectedRoute>
                    <RequestAccessPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/manage-access-requests"
                element={
                  <ProtectedRoute requiredPermission="access-requests:approve">
                    <AccessRequestManagementPage />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/brt-analytics"
                element={
                  <ProtectedRoute>
                    <BRTAnalyticsDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/brt-management"
                element={
                  <ProtectedRoute>
                    <BRTManagement />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/brt-redeem"
                element={
                  <ProtectedRoute>
                    <BRTRedeemPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
            </div>
          </NotificationProvider>
        </AuthProvider>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
