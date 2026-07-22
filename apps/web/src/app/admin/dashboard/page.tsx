'use client';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Users', value: '24', color: '#C9A227' },
          { title: 'Courses', value: '12', color: '#A0781E' },
          { title: 'Orders', value: '48', color: '#4CAF50' },
          { title: 'Revenue', value: '120M', color: '#2196F3' },
        ].map((stat, index) => (
          <div key={index} className="bg-[#121212] p-6 rounded-lg border border-[#1A1A1A]">
            <div className="text-sm text-gray-400">{stat.title}</div>
            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
