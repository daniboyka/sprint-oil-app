import { LayoutDashboard, LogOut, Car, User, Settings } from 'lucide-react';

const Sidebar = ({ setView }) => {
  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col p-6">
      <h2 className="font-black text-2xl mb-10 text-red-600 italic tracking-tighter">SPRINT OIL</h2>
      
      <nav className="space-y-4 flex-1">
        <button className="flex items-center gap-3 text-red-500 font-bold w-full">
          <LayoutDashboard size={20} /> Dashboard
        </button>
        <button className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors w-full text-left">
          <Car size={20} /> Vehículos
        </button>
        <button className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors w-full text-left">
          <User size={20} /> Clientes
        </button>
      </nav>

      <div className="pt-6 border-t border-zinc-800 space-y-4">
        <button className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors w-full text-left">
          <Settings size={20} /> Configuración
        </button>
        <button 
          onClick={() => setView('landing')}
          className="flex items-center gap-3 text-zinc-500 hover:text-red-500 transition-colors w-full text-left"
        >
          <LogOut size={20} /> Salir
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;