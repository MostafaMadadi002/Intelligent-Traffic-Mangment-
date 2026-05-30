import { useState, useEffect } from 'react';
import { Settings2, Play, Pause, Zap } from 'lucide-react';
import api from '../lib/api';
import socket from '../lib/socket';
import { useLanguage } from '../locales/LanguageContext';

export default function SimulationControl() {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/simulation/status').then(res => {
      setStatus(res.data);
      setLoading(false);
    });

    socket.on('simulationUpdate', (data) => {
      setStatus(data);
    });

    return () => {
      socket.off('simulationUpdate');
    };
  }, []);

  const updateSimulation = async (updates: any) => {
    try {
      await api.post('/simulation/control', updates);
    } catch (err) {
      console.error('Failed to update simulation:', err);
    }
  };

  if (loading || !status) return null;

  const patterns: Record<string, string> = {
    normal: language === 'fa' ? 'عادی' : 'Normal',
    rush_hour: language === 'fa' ? 'ساعت شلوغی' : 'Rush Hour',
    night: language === 'fa' ? 'شب' : 'Night',
    accident: language === 'fa' ? 'تصادف' : 'Accident'
  };

  return (
    <div className="glass px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Settings2 size={16} className="text-cyan-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
           {language === 'fa' ? 'موتور شبیه‌ساز' : 'Simulation Engine'}
        </span>
      </div>

      <div className="h-6 w-[1px] bg-white/10" />

      <div className="flex items-center gap-4">
        {(['normal', 'rush_hour', 'night', 'accident'] as const).map(p => (
          <button
            key={p}
            onClick={() => updateSimulation({ pattern: p })}
            className={`text-[9px] font-bold uppercase tracking-tighter px-3 py-1 rounded-md border transition-all ${
              status.pattern === p 
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
              : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
            }`}
          >
            {patterns[p]}
          </button>
        ))}
      </div>

      <div className="h-6 w-[1px] bg-white/10" />

      <div className="flex items-center gap-3">
        <button
          onClick={() => updateSimulation({ isActive: !status.isActive })}
          className={`p-2 rounded-xl transition-all ${
            status.isActive 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {status.isActive ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Zap size={10} className={status.isActive ? 'text-emerald-400 animate-pulse' : 'text-slate-600'} />
            <span className="text-[8px] font-black uppercase tracking-widest text-white">
              {status.isActive 
                ? (language === 'fa' ? 'فعال' : 'Active') 
                : (language === 'fa' ? 'متوقف' : 'Paused')}
            </span>
          </div>
          <span className="text-[7px] font-bold text-slate-600 uppercase tracking-tighter">Instance v4.2S</span>
        </div>
      </div>
    </div>
  );
}
