import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Flower2,
  Package,
  Plane,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/rapat', icon: Users, label: 'Rapat' },
  { to: '/karangan-bunga', icon: Flower2, label: 'Karangan Bunga' },
  { to: '/keperluan-pendukung', icon: Package, label: 'Keperluan Pendukung' },
  { to: '/perjadin', icon: Plane, label: 'Perjalanan Dinas' },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`bg-blue-900 text-white flex flex-col h-screen sticky top-0 transition-all duration-300 shrink-0
        ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-blue-800">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-blue-900 font-black text-xs">SIM</span>
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-white truncate">Sistem Informasi</p>
              <p className="text-xs text-blue-300 truncate">Manajemen</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-blue-900 font-black text-xs">SIM</span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="text-blue-300 hover:text-white hover:bg-blue-800 rounded-lg p-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {collapsed && (
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-full py-2 mb-2 text-blue-300 hover:text-white hover:bg-blue-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 group
              ${isActive
                ? 'bg-blue-800 text-white shadow-lg'
                : 'text-blue-200 hover:bg-blue-800/60 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-blue-800">
          <p className="text-xs text-blue-400 text-center">© 2024 SIM Pemerintahan</p>
        </div>
      )}
    </aside>
  );
}
