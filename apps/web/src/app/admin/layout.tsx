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
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C9A227] border-t-transparent" /></div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white" dir="rtl">
      <aside className={`fixed right-0 top-0 z-50 h-full border-l border-[#C9A227]/10 bg-[#121212] transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="flex h-16 items-center justify-between border-b border-[#C9A227]/10 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFB71A] to-[#FFA000] font-black text-[#0B0B0C]">
              آ
            </div>
            {sidebarOpen && <span className="text-sm font-black text-[#FFB71A]">پنل مدیریت آیان تراز</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-2 text-[#C9A227] hover:bg-[#C9A227]/10" aria-label="تغییر منو">
            {sidebarOpen ? '›' : '‹'}
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {adminItems.map((item) => (
            <Link key={item.path} href={item.path} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-[#C9A227]/10 hover:text-[#FFB71A]">
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>
      <main className={`min-h-screen transition-all duration-300 ${sidebarOpen ? 'pr-72' : 'pr-20'}`}>
        <header className="flex h-16 items-center justify-between border-b border-[#C9A227]/10 px-6">
          <Link href="/" className="text-sm font-bold text-[#C9A227] hover:text-[#FFB71A]">بازگشت به صفحه اصلی</Link>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{user.firstName || user.phone}</span>
            <span className="rounded-full border border-[#C9A227]/20 px-3 py-1 text-[#FFB71A]">مدیر</span>
          </div>
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;
