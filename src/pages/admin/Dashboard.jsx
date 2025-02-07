import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCars: 0,
    activeRentals: 0,
    totalUsers: 0,
    pendingDamages: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: carsCount },
        { count: rentalsCount },
        { count: usersCount },
        { count: damagesCount }
      ] = await Promise.all([
        supabase.from('cars').select('*', { count: 'exact' }),
        supabase.from('rentals').select('*', { count: 'exact' }).eq('status', 'active'),
        supabase.from('users').select('*', { count: 'exact' }),
        supabase.from('damages').select('*', { count: 'exact' }).eq('status', 'pending')
      ]);

      setStats({
        totalCars: carsCount,
        activeRentals: rentalsCount,
        totalUsers: usersCount,
        pendingDamages: damagesCount
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Cars" value={stats.totalCars} />
        <StatCard title="Active Rentals" value={stats.activeRentals} />
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Pending Damages" value={stats.pendingDamages} />
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}