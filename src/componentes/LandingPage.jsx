import React, { useState } from 'react';
import { Car, Wrench, ShieldCheck, ChevronRight, Clock } from 'lucide-react';

// --- COMPONENTE LANDING (Dentro del mismo archivo para probar) ---
const LandingPage = ({ onAdminEnter }) => (
  <div className="min-h-screen bg-zinc-950 text-white font-sans">
    <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-white/5">
      <h1 className="text-2xl font-black italic tracking-tighter text-red-600">SPRINT OIL</h1>
      <button onClick={onAdminEnter} className="text-xs font-bold text-zinc-500 hover:text-white uppercase">
        Acceso Mecánico
      </button>
    </nav>

    <section className="py-20 px-6 max-w-7xl mx-auto text-center">
      <span className="text-red-600 font-black tracking-[0.3em] text-xs uppercase">Concepción del Uruguay</span>
      <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none mt-4 mb-6">
        Tu vehículo en <br /> <span className="text-zinc-500">manos expertas.</span>
      </h2>
      <p className="text-zinc-400 text-lg max-w-md mx-auto mb-10">
        Especialistas en mantenimiento y mecánica integral. Agendá tu turno online.
      </p>
      <button className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-full font-black italic uppercase transition-all shadow-xl shadow-red-600/20">
        Agendar Turno
      </button>
    </section>

    <section className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6 py-10">
      <div className="p-8 border border-zinc-800 rounded-3xl bg-zinc-900/50">
        <ShieldCheck className="text-red-600 mb-4" />
        <h4 className="font-black italic uppercase mb-2">Garantía</h4>
        <p className="text-zinc-500 text-sm">Respaldo técnico en cada trabajo.</p>
      </div>
      <div className="p-8 border border-zinc-800 rounded-3xl bg-zinc-900/50">
        <Wrench className="text-red-600 mb-4" />
        <h4 className="font-black italic uppercase mb-2">Repuestos</h4>
        <p className="text-zinc-500 text-sm">Calidad original asegurada.</p>
      </div>
      <div className="p-8 border border-zinc-800 rounded-3xl bg-zinc-900/50">
        <Car className="text-red-600 mb-4" />
        <h4 className="font-black italic uppercase mb-2">Scanner</h4>
        <p className="text-zinc-500 text-sm">Diagnóstico computarizado.</p>
      </div>
    </section>
  </div>
);

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [view, setView] = useState('landing');

  return (
    <>
      {view === 'landing' ? (
        <LandingPage onAdminEnter={() => setView('dashboard')} />
      ) : (
        <div className="h-screen bg-zinc-950 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-black">PANEL DE CONTROL</h1>
            <p className="text-zinc-500 mb-6">Próximamente conectaremos el Dashboard...</p>
            <button onClick={() => setView('landing')} className="text-red-500 font-bold">Volver</button>
          </div>
        </div>
      )}
    </>
  );
}