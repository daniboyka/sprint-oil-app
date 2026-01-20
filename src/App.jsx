import React, { useState, useEffect } from "react";
import {
  Car,
  Clock,
  CheckCircle,
  Send,
  User,
  MessageSquare,
  Search,
} from "lucide-react";
import { supabase } from "./lib/Supabase.jsx";

export default function App() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState('activos');
  
  // Estados Formulario y Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clienteData, setClienteData] = useState({
    nombre: "", phone: "", auto: "", servicio: "Service Completo", patent: "", date: "", mensaje: "",
  });

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Función para manejar la instalación
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  // 1. Manejo de URL (#admin)
  useEffect(() => {
    const checkHash = () => setIsAdmin(window.location.hash === "#admin");
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  // 2. MOTOR DE SESIÓN Y DATOS (Optimizado para Incógnito)
  useEffect(() => {
    const inicializarApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) obtenerTurnos();
    };
    inicializarApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) obtenerTurnos();
    });
    return () => subscription.unsubscribe();
  }, []);

  const obtenerTurnos = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("date", { ascending: true })
      .order("created_at", { ascending: false });
    if (!error) setAppointments(data);
  };

  // 3. LÓGICA DE FILTRADO (Buscador + Tabs)
  const turnosFiltrados = appointments.filter(app => {
    const coincideTab = tab === 'activos' ? app.status !== 'finalizado' : app.status === 'finalizado';
    const coincideBusqueda = 
      app.patent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    return coincideTab && coincideBusqueda;
  });

  // --- FUNCIONES DE ACCIÓN ---
  const enviarSolicitudCliente = async (e) => {
    e.preventDefault();
    const patenteLimpia = clienteData.patent.replace(/[-\s]/g, "").toUpperCase();
    const { error } = await supabase.from("appointments").insert([{
        customer: clienteData.nombre, phone: clienteData.phone, vehicle: clienteData.auto,
        patent: patenteLimpia, service: clienteData.servicio, message: clienteData.mensaje, date: clienteData.date,
    }]);
    if (!error) {
      alert("¡Turno enviado correctamente!");
      setClienteData({ nombre: "", phone: "", auto: "", patent: "", servicio: "Service Completo", mensaje: "", date: "" });
      obtenerTurnos();
    }
  };

  const finalizarTurno = async (id) => {
    const { error } = await supabase.from("appointments").update({ status: "finalizado" }).eq("id", id);
    if (!error) obtenerTurnos();
  };

  const confirmarTurno = async (id, ptsAsignados) => {
    const { error } = await supabase.from("appointments").update({ status: "confirmado", points: ptsAsignados }).eq("id", id);
    if (!error) obtenerTurnos();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Error: " + error.message);
  };

  const puntosTotales = appointments
    .filter((a) => a.status === "confirmado")
    .reduce((acc, el) => acc + (el.points || 0), 0);

  return (
    
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans flex flex-col items-center bg-cover bg-center bg-no-repeat bg-fixed" 
         style={{ backgroundImage: "url('/img/fondoLandingPage.png')" }}>
          {showInstallBtn && (
      <div 
        className="w-full bg-red-600 text-white p-3 text-center cursor-pointer animate-pulse sticky top-0 z-50 shadow-lg" 
        onClick={handleInstallClick}
      >
        <p className="font-bold text-sm tracking-widest uppercase italic">
          🏁 ¡Instalá la App de Sprint Oil aquí! 🏁
        </p>
      </div>
      )}
      {isAdmin ? (
        !session ? (
          /* LOGIN - ESTÉTICA ORIGINAL */
          <div className="w-full max-w-md bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800 mt-20 animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black uppercase italic text-red-600">Acceso Privado</h2>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Sprint Oil Management</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" placeholder="admin@sprintoil.com" className="w-full p-4 bg-zinc-800 rounded-2xl outline-none border border-transparent focus:border-red-600 transition-all" onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="••••••••" className="w-full p-4 bg-zinc-800 rounded-2xl outline-none border border-transparent focus:border-red-600 transition-all" onChange={(e) => setPassword(e.target.value)} />
              <button className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl transition-all uppercase italic tracking-wider">Entrar al Taller</button>
            </form>
          </div>
        ) : (
          /* PANEL ADMIN - ESTÉTICA ORIGINAL + BUSCADOR */
          <div className="w-full max-w-2xl mb-12 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-black italic text-red-600 uppercase">Sprint Oil • Panel</h1>
                <div className="flex gap-3 mt-1">
                  <button onClick={() => supabase.auth.signOut()} className="text-[10px] text-zinc-500 hover:text-red-500 transition-colors uppercase font-bold">Cerrar Sesión</button>
                  <span className="text-zinc-800">|</span>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase">{session.user.email}</span>
                </div>
              </div>
              <div className="text-right bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Capacidad Hoy</p>
                <p className="text-xl font-black">{puntosTotales} / 8 PTS</p>
              </div>
            </div>

            {/* BUSCADOR INTEGRADO */}
            <div className="mb-6 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={18} className="text-zinc-500" />
              </div>
              <input
                type="text"
                placeholder="BUSCAR PATENTE O CLIENTE..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-red-600 outline-none uppercase text-xs font-bold tracking-widest"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-4 mb-6 border-b border-zinc-800 pb-2">
              <button onClick={() => setTab('activos')} className={`pb-2 px-1 text-sm font-bold uppercase transition-all ${tab === 'activos' ? 'text-red-600 border-b-2 border-red-600' : 'text-zinc-500'}`}>Activos ({appointments.filter(a => a.status !== 'finalizado').length})</button>
              <button onClick={() => setTab('historial')} className={`pb-2 px-1 text-sm font-bold uppercase transition-all ${tab === 'historial' ? 'text-red-600 border-b-2 border-red-600' : 'text-zinc-500'}`}>Historial ({appointments.filter(a => a.status === 'finalizado').length})</button>
            </div>

            <div className="space-y-4">
              {turnosFiltrados.map((app) => (
                <div key={app.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl relative">
                  <div className="absolute top-5 right-5 text-right">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Fecha Pedida</p>
                    <p className="text-sm font-black text-white bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-700">
                      {app.date ? new Date(app.date + "T00:00:00").toLocaleDateString("es-AR") : "S/F"}
                    </p>
                  </div>

                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                        app.status === "pendiente" ? "bg-yellow-500 text-black" : 
                        app.status === "confirmado" ? "bg-emerald-500 text-black" : "bg-zinc-700 text-zinc-300"
                      }`}>
                        {app.status}
                      </span>
                      <h3 className="text-lg font-bold uppercase mt-2">{app.vehicle} <span className="text-red-500 ml-1">[{app.patent}]</span></h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-zinc-300 font-bold text-sm">{app.customer}</p>
                        <span className="text-zinc-600 text-xs">•</span>
                        <a href={`https://wa.me/${app.phone}`} target="_blank" className="text-emerald-500 text-xs font-bold hover:underline flex items-center gap-1">
                          {app.phone} 📱
                        </a>
                      </div>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-wider mt-1 font-bold">{app.service}</p>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-400 italic mb-4 border-l-2 border-zinc-800 pl-3">"{app.message}"</p>

                  {tab === 'activos' && (
                    <div className="pt-4 border-t border-zinc-800">
                      {app.status === "confirmado" ? (
                        <button onClick={() => finalizarTurno(app.id)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-2 rounded-lg transition-all uppercase">Finalizar Trabajo ✓</button>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <p className="text-[10px] font-bold text-zinc-500 w-full mb-1 uppercase tracking-widest">Asignar carga y confirmar:</p>
                          <button onClick={() => confirmarTurno(app.id, 1)} className="bg-zinc-800 hover:bg-red-600 px-3 py-1 rounded-lg text-[10px] font-bold transition-all text-white">1 PT</button>
                          <button onClick={() => confirmarTurno(app.id, 4)} className="bg-zinc-800 hover:bg-red-600 px-3 py-1 rounded-lg text-[10px] font-bold transition-all text-white">4 PTS</button>
                          <button onClick={() => confirmarTurno(app.id, 8)} className="bg-zinc-800 hover:bg-red-600 px-3 py-1 rounded-lg text-[10px] font-bold transition-all text-white">8 PTS</button>
                        </div>
                      )}
                    </div>
                  )}
                  {tab === 'historial' && (
                    <div className="pt-4 border-t border-zinc-800 flex justify-between items-center text-zinc-600">
                      <span className="text-[10px] font-black uppercase tracking-widest">Completado</span>
                      <span className="text-[10px] font-bold">{new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        /* VISTA CLIENTE - ESTÉTICA ORIGINAL */
        <div className="w-full max-w-md animate-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black italic text-red-600 uppercase tracking-tighter">Sprint Oil</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">Calidad que se siente al acelerar</p>
          </div>
          <div className="bg-white text-black p-8 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic mb-6">Sacar Turno</h2>
            <form onSubmit={enviarSolicitudCliente} className="space-y-4">
              <input required placeholder="Tu nombre" className="w-full border-2 border-zinc-100 p-3 rounded-xl outline-none focus:border-red-600 transition-all text-black" value={clienteData.nombre} onChange={(e) => setClienteData({ ...clienteData, nombre: e.target.value })} />
              <input required type="tel" placeholder="WhatsApp" className="w-full border-2 border-zinc-100 p-3 rounded-xl outline-none focus:border-red-600 transition-all text-black" value={clienteData.phone} onChange={(e) => setClienteData({ ...clienteData, phone: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Auto" className="border-2 border-zinc-100 p-3 rounded-xl outline-none focus:border-red-600 transition-all text-black" value={clienteData.auto} onChange={(e) => setClienteData({ ...clienteData, auto: e.target.value })} />
                <input required placeholder="Patente" className="border-2 border-zinc-100 p-3 rounded-xl outline-none focus:border-red-600 transition-all uppercase text-black" value={clienteData.patent} onChange={(e) => setClienteData({ ...clienteData, patent: e.target.value })} />
              </div>
              <input required type="date" className="w-full border-2 border-zinc-100 p-3 rounded-xl text-black" value={clienteData.date} onChange={(e) => setClienteData({ ...clienteData, date: e.target.value })} />
              <select className="w-full border-2 border-zinc-100 p-3 rounded-xl outline-none bg-white font-bold text-black" value={clienteData.servicio} onChange={(e) => setClienteData({ ...clienteData, servicio: e.target.value })}>
                <option>Service Completo</option>
                <option>Mecánica Ligera</option>
                <option>Mecánica Compleja</option>
              </select>
              <textarea required placeholder="¿Qué le pasa al auto?" className="w-full border-2 border-zinc-100 p-3 rounded-xl outline-none focus:border-red-600 transition-all h-24 resize-none text-black" value={clienteData.mensaje} onChange={(e) => setClienteData({ ...clienteData, mensaje: e.target.value })}></textarea>
              <button className="w-full bg-black text-white font-black py-4 rounded-xl hover:bg-red-600 transition-all uppercase italic tracking-wider">Enviar Solicitud</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}