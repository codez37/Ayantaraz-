'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const adminItems = [
  { path: '/', icon: '🏠', label: 'صفحه اصلی' },
  { path: '/admin/dashboard', icon: '📊', label: 'داشبورد' },
  { path: '/admin/users', icon: '👥', label: 'کاربران' },
  { path: '/admin/contents', icon: '📝', label: 'محتوا و مینی‌بوک' },
  { path: '/admin/courses', icon: '📚', label: 'دوره‌ها' },
  { path: '/admin/consultations', icon: '📞', label: 'مشاوره‌ها' },
  { path: '/admin/chatbot', icon: '🤖', label: 'دانشنامه چت‌بات' },
  { path: '/admin/orders', icon: '🧾', label: 'سفارش‌ها' },
  { path: '/admin/audit-logs', icon: '🛡️', label: 'لاگ امنیتی' },
  { path: '/admin/settings', icon: '⚙️', label: 'تنظیمات' },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, user?.role, router]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4A843] border-t-transparent" /></div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white" dir="rtl">
      <aside className={`fixed right-0 top-0 z-50 h-full border-l border-[#D4A843]/10 bg-[#111111] transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="flex h-16 items-center justify-between border-b border-[#D4A843]/10 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F0D68A] to-[#B8862D] font-black text-[#0A0A0A]">
              آ
            </div>
            {sidebarOpen && <span className="text-sm font-black text-[#F0D68A]">پنل مدیریت آیان تراز</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-2 text-[#D4A843] hover:bg-[#D4A843]/10" aria-label="تغییر منو">
            {sidebarOpen ? '›' : '‹'}
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {adminItems.map((item) => (
            <Link key={item.path} href={item.path} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-[#D4A843]/10 hover:text-[#F0D68A]">
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>
      <main className={`min-h-screen transition-all duration-300 ${sidebarOpen ? 'pr-72' : 'pr-20'}`}>
        <header className="flex h-16 items-center justify-between border-b border-[#D4A843]/10 px-6">
          <Link href="/" className="text-sm font-bold text-[#D4A843] hover:text-[#F0D68A]">بازگشت به صفحه اصلی</Link>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{user.firstName || user.phone}</span>
            <span className="rounded-full border border-[#D4A843]/20 px-3 py-1 text-[#F0D68A]">مدیر</span>
          </div>
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;
