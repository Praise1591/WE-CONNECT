// App.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Material from './components/Dashboard/Material';
import Download from './components/Dashboard/Download';
import Favorites from './components/Dashboard/Favorites';
import SettingsPage from './components/Dashboard/SettingsPage';
import Connect from './components/Dashboard/Connect';

function App() {
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    setCurrentPage('dashboard');
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const path = page === 'dashboard' ? '/' : `/${page}`;
    window.history.pushState({}, '', path);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/settings') setCurrentPage('settings');
      else if (path === '/materials') setCurrentPage('materials');
      else if (path === '/downloads') setCurrentPage('downloads');
      else if (path === '/favorites') setCurrentPage('favorites');
      else if (path === '/connect') setCurrentPage('connect');
      else setCurrentPage('dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          collapsed={sideBarCollapsed}
          onToggle={() => setSideBarCollapsed(!sideBarCollapsed)}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            sidebarCollapsed={sideBarCollapsed}
            onToggleSidebar={() => setSideBarCollapsed(!sideBarCollapsed)}
          />
          <main className="flex-1 overflow-y-auto bg-transparent">
            <div className="p-6 space-y-6">
              {currentPage === 'dashboard' && <Dashboard />}
              {currentPage === 'materials' && <Material />}
              {currentPage === 'downloads' && <Download />}
              {currentPage === 'favorites' && <Favorites />}
              {currentPage === 'settings' && <SettingsPage />}
              {currentPage === 'connect' && <Connect />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;