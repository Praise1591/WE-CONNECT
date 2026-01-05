// App.jsx — With React Toastify Integrated and Updated
import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Material from './components/Dashboard/Material';
import Favorites from './components/Dashboard/Favorites';
import SettingsPage from './components/Dashboard/SettingsPage';
import Connect from './components/Dashboard/Connect';
import Notification from './components/Dashboard/Notifications';
import DownloadsPage from './components/Dashboard/DownloadsPage';
import MonetaryValue from './components/Dashboard/MonetaryValue';
import About from './components/Dashboard/About';
import AuthForm from './components/Dashboard/AuthForm';
import UploadsData from './components/Dashboard/UploadsData';

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
      const path = window.location.pathname.slice(1); // remove leading slash
      const validPages = ['settings', 'materials', 'downloads', 'favorites', 'notifications', 'connect', 'monetary'];
      if (validPages.includes(path)) {
        setCurrentPage(path);
      } else {
        setCurrentPage('dashboard');
      }
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
              {currentPage === 'downloads' && <DownloadsPage />}
              {currentPage === 'favorites' && <Favorites />}
              {currentPage === 'notifications' && <Notification />}
              {currentPage === 'settings' && <SettingsPage />}
              {currentPage === 'connect' && <Connect />}
              {currentPage === 'upload' && <UploadsData />}
              {currentPage === 'monetary' && <MonetaryValue />}
              {currentPage === 'about' && <About />}
              
            </div>
          </main>
        </div>
      </div>

      {/* React Toastify Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="rounded-xl shadow-2xl"
      />
    </div>
  );
}

export default App;