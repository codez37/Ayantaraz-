'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';

export function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ direction: 'rtl' }}>
      <aside className={sidebarOpen ? 'fixed top-0 left-0 h-full bg-[#1a1a1a] border-r border-[#2a2a2a] z-50 w-64 transition-all duration-300' : 'fixed top-0 left-0 h-full bg-[#1a1a1a] border-r border-[#2a2a2a] z-50 w-16 transition-all duration-300'}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFA000] rounded-lg flex items-center justify-center">
              <span className="text-[#0a0a0a] font-bold text-sm">A</span>
            </div>
            {sidebarOpen && <span className="font-bold text-sm">Admin Panel</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white text-xl">
            {sidebarOpen ? String.fromCharCode(8592) : String.fromCharCode(8594)}
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {[
            { path: '/admin/dashboard', icon: 'HOME', label: 'Dashboard' },
            { path: '/admin/users', icon: 'USERS', label: 'Users' },
            { path: '/admin/courses', icon: 'BOOK', label: 'Courses' },
            { path: '/admin/orders', icon: 'LIST', label: 'Orders' },
            { path: '/admin/settings', icon: 'SETT', label: 'Settings' },
          ].map((item) => (
            <Link key={item.path} href={item.path} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2a2a2a] transition-colors">
              <span className="text-xs">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>
      <main className={sidebarOpen ? 'min-h-screen transition-all duration-300 pr-64' : 'min-h-screen transition-all duration-300 pr-16'}>
        <header className="h-16 border-b border-[#2a2a2a] flex items-center justify-between px-6">
          <div></div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Admin</span>
            <div className="w-10 h-10 bg-[#2a2a2a] rounded-full"></div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;
