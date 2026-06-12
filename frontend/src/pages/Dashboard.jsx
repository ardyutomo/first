import { useState, useEffect } from 'react';
import { Users, Flower2, Package, Plane, TrendingUp, Calendar, Database } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const statCards = [
  {
    key: 'rapat',
    label: 'Data Rapat',
    icon: Users,
    color: 'blue',
    endpoint: '/rapat',
    description: 'Total pengajuan rapat',
  },
  {
    key: 'karangan_bunga',
    label: 'Karangan Bunga',
    icon: Flower2,
    color: 'pink',
    endpoint: '/karangan-bunga',
    description: 'Total pengajuan karangan bunga',
  },
  {
    key: 'keperluan_pendukung',
    label: 'Keperluan Pendukung',
    icon: Package,
    color: 'amber',
    endpoint: '/keperluan-pendukung',
    description: 'Total keperluan pendukung',
  },
  {
    key: 'perjadin',
    label: 'Perjalanan Dinas',
    icon: Plane,
    color: 'green',
    endpoint: '/perjadin',
    description: 'Total perjalanan dinas',
  },
];

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-800',
    text: 'text-blue-800',
    border: 'border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
  },
  pink: {
    bg: 'bg-pink-50',
    icon: 'bg-pink-600',
    text: 'text-pink-700',
    border: 'border-pink-100',
    badge: 'bg-pink-100 text-pink-700',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-500',
    text: 'text-amber-700',
    border: 'border-amber-100',
    badge: 'bg-amber-100 text-amber-700',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-600',
    text: 'text-green-700',
    border: 'border-green-100',
    badge: 'bg-green-100 text-green-700',
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(statCards.map(card =>
      api.get(card.endpoint).then(res => ({ key: card.key, total: res.data.total }))
    ))
      .then(results => {
        const c = {};
        results.forEach(r => { c[r.key] = r.total; });
        setCounts(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '30px 30px'
          }} />
        </div>
        <div className="relative flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">Selamat Datang, {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1)}!</h2>
            <p className="text-blue-200 text-sm mt-1">{today}</p>
            <p className="text-blue-100 text-sm mt-3">
              Sistem Informasi Manajemen Pemerintahan — Kelola data operasional dengan mudah dan efisien.
            </p>
          </div>
          <div className="hidden md:flex w-16 h-16 bg-yellow-400 rounded-2xl items-center justify-center shadow-lg shrink-0">
            <span className="text-blue-900 font-black text-lg">SIM</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const c = colorMap[card.color];
          const Icon = card.icon;
          const count = counts[card.key];
          return (
            <div key={card.key} className={`bg-white rounded-xl border ${c.border} p-5 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 ${c.icon} rounded-xl flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.badge}`}>
                  Total
                </span>
              </div>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1" />
              ) : (
                <p className={`text-3xl font-bold ${c.text}`}>{count ?? 0}</p>
              )}
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Total Semua Data</p>
            <p className="text-2xl font-bold text-blue-800">
              {loading ? '...' : Object.values(counts).reduce((a, b) => a + b, 0)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Tahun Anggaran</p>
            <p className="text-2xl font-bold text-green-700">{new Date().getFullYear()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Status Sistem</p>
            <p className="text-sm font-bold text-green-600 flex items-center gap-1 mt-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Aktif & Berjalan
            </p>
          </div>
        </div>
      </div>

      {/* Quick Guide */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-800 rounded-full inline-block" />
          Panduan Penggunaan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Data Rapat', desc: 'Kelola pengajuan kegiatan rapat beserta nominal anggaran.' },
            { title: 'Karangan Bunga', desc: 'Catat pengajuan karangan bunga dengan pesan dan pengirim.' },
            { title: 'Keperluan Pendukung', desc: 'Daftarkan kebutuhan pendukung kegiatan operasional.' },
            { title: 'Perjalanan Dinas', desc: 'Manajemen perjalanan dinas beserta kota tujuan dan jadwal.' },
          ].map(item => (
            <div key={item.title} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="w-2 h-2 bg-blue-800 rounded-full mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
