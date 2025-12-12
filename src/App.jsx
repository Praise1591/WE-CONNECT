import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Material from './components/Dashboard/Material'
import SchoolSearch from './components/Dashboard/SchoolSearch';

const brands = [
  {label: 'Rivers State University', value: 'rsu'},
  {label: 'University of Cross Rivers State', value: 'cross'},
  {label: 'Convenant University', value: 'convenant'},
  {label: 'University of Port Harcourt', value: 'uniport'},
  {label: 'Babcock University', value: 'babcock'},
  {label: 'Petroleum Training Institute Effurun', value: 'pti'},
  {label: 'Delta State University', value: 'delsuu'},
  {label: 'Lagos State University', value: 'unnilag'},
  {label: 'kaduna State University', value: 'kaduna'},
  {label: 'landmark University', value: 'landmark'},
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
              
              {currentPage === "ecommerce" && <SchoolSearch options={brands}/>}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App