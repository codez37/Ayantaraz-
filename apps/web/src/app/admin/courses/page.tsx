'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Course } from '@/types';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Course[]>('/courses')
      .then(d => setCourses(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#D4A843] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-white">مدیریت دوره‌ها</h1>
      <div className="bg-[#0A0A0A] border border-[#D4A843]/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D4A843]/10 text-right">
                <th className="p-3 text-gray-400 font-bold">عنوان</th>
                <th className="p-3 text-gray-400 font-bold">قیمت</th>
                <th className="p-3 text-gray-400 font-bold">وضعیت</th>
                <th className="p-3 text-gray-400 font-bold">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c: Course) => (
                <tr key={c.id} className="border-b border-[#D4A843]/5 hover:bg-[#D4A843]/5">
                  <td className="p-3 text-gray-300">{c.title}</td>
                  <td className="p-3 text-[#D4A843]">{c.price?.toLocaleString()} ریال</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      c.status === 'published' ? 'bg-green-900/50 text-green-400' :
                      c.status === 'draft' ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>{c.status === 'published' ? 'منتشر شده' : c.status === 'draft' ? 'پیش‌نویس' : c.status}</span>
                  </td>
                  <td className="p-3 text-gray-400 text-xs">{c.publishedAt ? new Date(c.publishedAt).toLocaleDateString('fa-IR') : '-'}</td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">دوره‌ای یافت نشد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
