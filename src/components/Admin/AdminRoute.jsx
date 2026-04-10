// components/Admin/AdminRoute.jsx
import React from 'react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminLogin';

function AdminRoute() {
  const { isAdmin, loading, logout } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLogin onLogin={() => window.location.reload()} />;
  }

  return <AdminDashboard onLogout={logout} />;
}

export default AdminRoute;