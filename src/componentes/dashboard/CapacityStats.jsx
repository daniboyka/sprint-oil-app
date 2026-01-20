export default function CapacityStats({ current, max }) {
  const percentage = (current / max) * 100;
  const isOverloaded = current >= max;

  return (
    <div className={`p-4 rounded-2xl border transition-all ${isOverloaded ? 'bg-red-600/10 border-red-600' : 'bg-zinc-900 border-zinc-800'}`}>
      <div className="flex justify-between items-end mb-2 gap-8">
        <div>
          <p className="text-[10px] font-black text-zinc-500 uppercase">Disponibilidad</p>
          <p className={`text-2xl font-black tracking-tighter ${isOverloaded ? 'text-red-600' : 'text-white'}`}>
            {current} / {max} <span className="text-xs text-zinc-600">pts</span>
          </p>
        </div>
      </div>
      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${isOverloaded ? 'bg-red-600' : 'bg-red-500'}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}