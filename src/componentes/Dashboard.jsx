import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PendingCard from '../components/dashboard/PendingCard';
import CapacityStats from '../components/dashboard/CapacityStats';
import { Calendar, Clock, CheckCircle, Car } from 'lucide-react';

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar datos desde Supabase
  useEffect(() => {
    fetchAppointments();
    
    // Opcional: Escuchar cambios en tiempo real
    const subscription = supabase
      .channel('appointments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchAppointments)
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  async function fetchAppointments() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setAppointments(data);
    setLoading(false);
  }

  // 2. Lógica para actualizar (Confirmar/Rechazar/Finalizar)
  async function handleUpdateStatus(id, newStatus, points = 0) {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus, points: points })
      .eq('id', id);

    if (error) alert("Error al actualizar: " + error.message);
  }

  // 3. Cálculos de capacidad
  const today = new Date().toISOString().split('T')[0];
  const confirmedToday = appointments.filter(a => a.date === today && a.status === 'confirmado');
  const dailyPoints = confirmedToday.reduce((acc, curr) => acc + (curr.points || 0), 0);

  if (loading) return <div className="p-10 text-zinc-500 animate-pulse">Cargando taller...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Encabezado con Stats de Capacidad */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">Panel de Control</h1>
          <p className="text-zinc-500 text-sm">Gestión de flujo de trabajo y capacidad</p>
        </div>
        <CapacityStats current={dailyPoints} max={8} />
      </header>

      <div className="grid grid-cols-1 gap-10">
        
        {/* SECCIÓN 1: SOLICITUDES ENTRANTE */}
        <section>
          <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-4">
            <Clock size={14} /> Solicitudes por Revisar
          </h3>
          <div className="grid gap-4">
            {appointments.filter(a => a.status === 'pendiente').map(app => (
              <PendingCard 
                key={app.id} 
                app={app} 
                onAccept={(id, pts) => handleUpdateStatus(id, 'confirmado', pts)}
                onReject={(id) => handleUpdateStatus(id, 'rechazado')}
              />
            ))}
            {appointments.filter(a => a.status === 'pendiente').length === 0 && (
              <p className="text-zinc-700 italic border border-dashed border-zinc-800 p-6 rounded-2xl text-center">
                No hay nuevas solicitudes.
              </p>
            )}
          </div>
        </section>

        {/* SECCIÓN 2: AGENDA CONFIRMADA */}
        <section>
          <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-4">
            <Calendar size={14} /> Turnos Confirmados (Hoy)
          </h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden divide-y divide-zinc-800 shadow-2xl">
            {confirmedToday.map(app => (
              <div key={app.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-zinc-800 rounded-xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                    <Car size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase italic">{app.vehicle}</h4>
                    <p className="text-zinc-500 text-xs">{app.customer} • <span className="text-zinc-400">{app.service}</span></p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="block text-[10px] font-black text-zinc-600 uppercase">Carga</span>
                    <span className="text-sm font-black text-red-500">{app.points} PTS</span>
                  </div>
                  <button 
                    onClick={() => handleUpdateStatus(app.id, 'completado', app.points)}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all"
                  >
                    <CheckCircle size={16} /> FINALIZAR
                  </button>
                </div>
              </div>
            ))}
            {confirmedToday.length === 0 && (
              <p className="p-10 text-center text-zinc-600 italic">No hay trabajos programados para hoy.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}