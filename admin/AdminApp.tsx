import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminGuard } from './AdminGuard';
import { AdminDashboard } from './AdminDashboard';
import { ComeidiansPage } from './pages/ComeidiansPage';
import { ShowsPage } from './pages/ShowsPage';
import { VenuesPage } from './pages/VenuesPage';
import { FestivalsPage } from './pages/FestivalsPage';

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

  const renderPage = () => {
    if (path.startsWith('/admin/comedians')) return <ComeidiansPage currentPath={path} />;
    if (path.startsWith('/admin/shows'))     return <ShowsPage      currentPath={path} />;
    if (path.startsWith('/admin/venues'))    return <VenuesPage     currentPath={path} />;
    if (path.startsWith('/admin/festivals')) return <FestivalsPage  currentPath={path} />;
    return <AdminDashboard currentPath={path} />;
  };

  return (
    <AdminGuard>
      {renderPage()}
    </AdminGuard>
  );
};
