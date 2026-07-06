'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const sidebarItems = [
  { href: '/admin', label: 'داشبورد', icon: '📊' },
  { href: '/admin/contents', label: 'مدیریت محتوا', icon: '📝' },
  { href: '/admin/courses', label: 'مدیریت دوره‌ها', icon: '📚' },
  { href: '/admin/users', label: 'مدیریت کاربران', icon: '👥' },
  { href: '/admin/consultations', label: 'مشاوره‌ها', icon: '📞' },
  { href: '/admin/orders', label: 'سفارش‌ها', icon: '🛒' },
  { href: '/admin/chatbot', label: 'پرسش و پاسخ', icon: '🤖' },
  { href: '/admin/audit-logs', label: 'گزارش فعالیت', icon: '📋' },
  { href: '/admin/settings', label: 'تنظیمات', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : false,
  );

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) router.push('/');
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#D4A843] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#111111]">
      <aside className={`bg-[#0A0A0A] border-l border-[#D4A843]/10 ${sidebarOpen ? 'w-64' : 'w-0 md:w-16'} transition-all overflow-hidden`}>
        <div className="p-4 border-b border-[#D4A843]/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-[#F0D68A] to-[#B8862D] rounded-lg flex items-center justify-center text-[#111111] font-black text-xs">آ</div>
            <h2 className="font-bold text-[#D4A843] text-sm whitespace-nowrap">پنل مدیریت</h2>
          </div>
        </div>
        <nav className="p-2 space-y-0.5">
          {sidebarItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 p-2.5 rounded-lg text-xs transition-all ${
                  isActive ? 'bg-[#D4A843]/15 text-[#D4A843] border-r-2 border-[#D4A843]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <span>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </div>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 bg-[#D4A843] text-[#111111] w-12 h-12 rounded-full shadow-lg flex items-center justify-center font-bold"
      >
        ☰
      </button>
    </div>
  );
}
