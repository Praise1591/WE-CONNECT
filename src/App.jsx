import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Material from './components/Dashboard/Material'
import SchoolSearch from './components/Dashboard/SchoolSearch';
import Download from './components/Dashboard/Download';

const brands = [
  {label: 'Rivers State University', value: 'rivers state university'},
  {label: 'University of Cross Rivers State', value: 'university of cross rivers state'},
  {label: 'Convenant University', value: 'convenant university'},
  {label: 'University of Port Harcourt', value: 'university of portharcourt'},
  {label: 'Babcock University', value: 'babcock university'},
  {label: 'Petroleum Training Institute Effurun', value: 'petroleum training institute'},
  {label: 'Delta State University', value: 'delta state university'},
  {label: 'Lagos State University', value: 'lagos state university'},
  {label: 'kaduna State University', value: 'kaduna state university'},
  {label: 'landmark University', value: 'landmark university'},
]

function App() {
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [currentPage, SetCurrentPage] = useState("dashboard", "analytics");

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500'>
      <div className='flex h-screen overflow-hidden'>
        <Sidebar 
          collapsed= {sideBarCollapsed}
          onToggle = {() => setSideBarCollapsed(sideBarCollapsed)}
          currentPage = {currentPage}
          onPageChange ={SetCurrentPage}
          />
        <div className='flex-1 flex flex-col overflow-hidden'>
          <Header sidebarCollapsed={sideBarCollapsed} 
          onToggleSidebar={()=>setSideBarCollapsed(!sideBarCollapsed)}/>
          <main className='flex-1 overflow-y-auto bg-transparent'>
            <div className='p-6 space-y-6'>
              {currentPage === "dashboard" && <Dashboard />}
              {currentPage === "analytics" && <Material />}
              {currentPage === "users" && <Download />}
              {currentPage === "ecommerce" && <SchoolSearch options={brands}/>}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App