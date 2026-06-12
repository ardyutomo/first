import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const pageTitles = {
  '/': 'Dashboard',
  '/rapat': 'Data Rapat',
  '/karangan-bunga': 'Data Karangan Bunga',
  '/keperluan-pendukung': 'Data Keperluan Pendukung',
  '/perjadin': 'Data Perjalanan Dinas',
};

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'Sistem Informasi Manajemen';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
