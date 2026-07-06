'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface KnowledgeEntry {
  id: number;
  question: string;
  answer: string;
  category: string;
  riskLevel: string;
  isActive: boolean;
}

const riskLevelLabels: Record<string, string> = {
  high: 'بالا', medium: 'متوسط', low: 'پایین', forbidden: 'ممنوع',
};

export default function AdminChatbotPage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<KnowledgeEntry[]>('/chatbot/knowledge')
      .then(d => setEntries(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#D4A843] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black text-white">دانشنامه چت‌بات</h1>
      <div className="bg-[#0A0A0A] border border-[#D4A843]/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D4A843]/10 text-right">
                <th className="p-3 text-gray-400 font-bold">سوال</th>
                <th className="p-3 text-gray-400 font-bold">دسته</th>
                <th className="p-3 text-gray-400 font-bold">سطح ریسک</th>
                <th className="p-3 text-gray-400 font-bold">فعال</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e: KnowledgeEntry) => (
                <tr key={e.id} className="border-b border-[#D4A843]/5 hover:bg-[#D4A843]/5">
                  <td className="p-3 text-gray-300 max-w-[300px] truncate">{e.question}</td>
                  <td className="p-3 text-gray-400">{e.category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      e.riskLevel === 'high' || e.riskLevel === 'forbidden' ? 'bg-red-900/50 text-red-400' :
                      e.riskLevel === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-green-900/50 text-green-400'
                    }`}>{riskLevelLabels[e.riskLevel] || e.riskLevel}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${e.isActive ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                      {e.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">موردی یافت نشد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
