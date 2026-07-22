'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/types';

const roleLabels: Record<string, string> = {
  user: 'کاربر', consultant: 'مشاور', content_manager: 'مدیر محتوا', admin: 'مدیر',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: User[] } | User[]>('/admin/users')
      .then(d => setUsers(Array.isArray(d) ? d : (d as { data: User[] }).data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleBlock = async (id: number, current: boolean) => {
    try {
      await api.patch(`/admin/users/${id}/block`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !current } : u));
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-white">مدیریت کاربران</h1>
      <div className="bg-[#0B0B0C] border border-[#C9A227]/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#C9A227]/10 text-right">
                <th className="p-3 text-gray-400 font-bold">تلفن</th>
                <th className="p-3 text-gray-400 font-bold">نام</th>
                <th className="p-3 text-gray-400 font-bold">نقش</th>
                <th className="p-3 text-gray-400 font-bold">وضعیت</th>
                <th className="p-3 text-gray-400 font-bold">تاریخ ثبت‌نام</th>
                <th className="p-3 text-gray-400 font-bold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: User) => (
                <tr key={u.id} className="border-b border-[#C9A227]/5 hover:bg-[#C9A227]/5">
                  <td className="p-3 text-gray-300" dir="ltr">{u.phone}</td>
                  <td className="p-3 text-gray-300">{u.firstName || u.lastName ? `${u.firstName} ${u.lastName}` : '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      u.role === 'admin' ? 'bg-red-900/50 text-red-400' :
                      u.role === 'content_manager' ? 'bg-blue-900/50 text-blue-400' :
                      u.role === 'consultant' ? 'bg-purple-900/50 text-purple-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>{roleLabels[u.role] || u.role}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${u.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                      {u.isActive ? 'فعال' : 'مسدود'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('fa-IR')}</td>
                  <td className="p-3">
                    <button onClick={() => toggleBlock(u.id, !u.isActive)}
                      className={`px-2 py-1 rounded text-xs ${u.isActive ? 'bg-red-900/50 text-red-400 hover:bg-red-900/70' : 'bg-green-900/50 text-green-400 hover:bg-green-900/70'}`}>
                      {u.isActive ? 'مسدود' : 'رفع مسدودیت'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">کاربری یافت نشد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
