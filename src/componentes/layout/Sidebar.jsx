import React from 'react';
import { LayoutDashboard, History, LogOut, Settings } from 'lucide-react';

export default function Sidebar({ currentView, setView }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'history', label: 'Historial', icon: <History size={20} /> },
  ];

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col p-6">
      {/* Logo */}
      <div className="mb-12">
        <h2 className="text-2xl font-black italic tracking-tighter text-red-600 uppercase">
          Sprint Oil
        </h2>
        <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Admin Panel</p>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              currentView === item.id 
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Botones Inferiores */}
      <div className="pt-6 border-t border-zinc-800 space-y-4">
        <button className="flex items-center gap-3 px-4 py-2 w-full text-zinc-600 hover:text-white transition-colors text-sm font-medium">
          <Settings size={18} /> Configuración
        </button>
        <button 
          onClick={() => setView('landing')}
          className="flex items-center gap-3 px-4 py-2 w-full text-zinc-600 hover:text-red-500 transition-colors text-sm font-bold"
        >
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}