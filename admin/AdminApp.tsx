import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminGuard } from './AdminGuard';
import { AdminDashboard } from './AdminDashboard';

export const AdminApp: React.FC = () => {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (path.startsWith('/admin/login')) {
    return <AdminLogin />;
  }

  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
};
