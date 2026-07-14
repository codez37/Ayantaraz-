'use client';

import { AdminLayout } from './layout';

export default function AdminPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-400">Welcome to Ayantaraz Admin Panel</p>
      </div>
    </AdminLayout>
  );
}
