'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface AuditLog {
  id: number;
  actorId: number;
  action: string;
  entityType: string;
  entityId: number;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string;
  createdAt: string;
  actor?: { firstName: string; lastName: string };
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AuditLog[]>('/audit')
      .then(d => setLogs(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#D4A843] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-white">گزارش فعالیت</h1>
      <div className="bg-[#0A0A0A] border border-[#D4A843]/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#0A0A0A]">
              <tr className="border-b border-[#D4A843]/10 text-right">
                <th className="p-3 text-gray-400 font-bold">کاربر</th>
                <th className="p-3 text-gray-400 font-bold">عملیات</th>
                <th className="p-3 text-gray-400 font-bold">موضوع</th>
                <th className="p-3 text-gray-400 font-bold">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: AuditLog) => (
                <tr key={log.id} className="border-b border-[#D4A843]/5 hover:bg-[#D4A843]/5">
                  <td className="p-3 text-gray-300">{log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : `#${log.actorId}`}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300">{log.action}</span>
                  </td>
                  <td className="p-3 text-gray-400 text-xs">{log.entityType} #{log.entityId}</td>
                  <td className="p-3 text-gray-500 text-xs">{new Date(log.createdAt).toLocaleDateString('fa-IR')} {new Date(log.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">فعالیتی یافت نشد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
