import { useEffect, useState } from 'react';
import { Power, Timer, Activity, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../lib/api';
import socket from '../lib/socket';

export default function SignalControl() {
  const [signals, setSignals] = useState<any>({});
  const [cameras, setCameras] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/cameras'),
      api.get('/api/signals')
    ]).then(([camRes, sigRes]) => {
      setCameras(camRes.data);
      setSignals(sigRes.data);
    });

    socket.on('signalUpdate', (data) => {
      setSignals((prev: any) => ({ ...prev, [data.cameraId]: data }));
    });

    return () => {
      socket.off('signalUpdate');
    };
  }, []);

  const handleManualOverride = (cameraId: string, state: string) => {
    api.post('/api/signals/override', { cameraId, state, duration: 30 }).then(res => {
      setSignals((prev: any) => ({ ...prev, [cameraId]: res.data }));
    });
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-light text-white italic">Synchronized <span className="font-bold not-italic">Traffic Pulse</span></h2>
        <p className="text-slate-500 text-sm">Autonomous adaptive signal timing and manual system overrides.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {cameras.map(camera => {
          const signal = signals[camera.id] || { state: 'red', duration: 30, mode: 'auto' };
          return (
            <motion.div
              layout
              key={camera.id}
              className="glass rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row gap-8 group hover:bg-white/10 transition-colors"
            >
              <div className="flex-1 space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${signal.mode === 'auto' ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      {signal.mode} Control Mode
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{camera.name}</h3>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{camera.location}</p>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 glass-dark p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1 group-hover:bg-white/5 transition-colors">
                    <Timer size={18} className="text-slate-500" />
                    <span className="text-2xl font-black text-white font-mono">{signal.duration}s</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Cycle Delta</span>
                  </div>
                  <div className="flex-1 glass-dark p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1 group-hover:bg-white/5 transition-colors">
                    <Activity size={18} className="text-slate-500" />
                    <span className="text-2xl font-black text-cyan-400 font-mono">74%</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Current Load</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(['red', 'yellow', 'green'] as const).map(color => (
                    <button
                      key={color}
                      onClick={() => handleManualOverride(camera.id, color)}
                      className={`py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative overflow-hidden ${
                        signal.state === color 
                        ? (color === 'red' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 
                           color === 'yellow' ? 'bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.4)]' : 
                           'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]')
                        : 'bg-white/5 text-slate-500 hover:bg-white/10'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-32 glass-dark rounded-full p-6 flex flex-col items-center justify-around border border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: signal.state === 'red' ? '#ef4444' : '#0f172a',
                    boxShadow: signal.state === 'red' 
                      ? '0 0 35px rgba(239, 68, 68, 0.6), inset 0 0 10px rgba(255,255,255,0.2)' 
                      : 'inset 0 4px 6px rgba(0,0,0,0.4)',
                    scale: signal.state === 'red' ? [1.05, 1.12, 1.05] : 0.95,
                    opacity: signal.state === 'red' ? 1 : 0.4
                  }}
                  transition={{ 
                    backgroundColor: { duration: 0.6 },
                    boxShadow: { duration: 0.6 },
                    opacity: { duration: 0.6 },
                    scale: signal.state === 'red' 
                      ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } 
                      : { duration: 0.4 }
                  }}
                  className="w-16 h-16 rounded-full relative" 
                />
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: signal.state === 'yellow' ? '#fbbf24' : '#0f172a',
                    boxShadow: signal.state === 'yellow' 
                      ? '0 0 35px rgba(251, 191, 36, 0.6), inset 0 0 10px rgba(255,255,255,0.2)' 
                      : 'inset 0 4px 6px rgba(0,0,0,0.4)',
                    scale: signal.state === 'yellow' ? [1.05, 1.12, 1.05] : 0.95,
                    opacity: signal.state === 'yellow' ? 1 : 0.4
                  }}
                  transition={{ 
                    backgroundColor: { duration: 0.6 },
                    boxShadow: { duration: 0.6 },
                    opacity: { duration: 0.6 },
                    scale: signal.state === 'yellow' 
                      ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } 
                      : { duration: 0.4 }
                  }}
                  className="w-16 h-16 rounded-full relative" 
                />
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: signal.state === 'green' ? '#10b981' : '#0f172a',
                    boxShadow: signal.state === 'green' 
                      ? '0 0 35px rgba(16, 185, 129, 0.6), inset 0 0 10px rgba(255,255,255,0.2)' 
                      : 'inset 0 4px 6px rgba(0,0,0,0.4)',
                    scale: signal.state === 'green' ? [1.05, 1.12, 1.05] : 0.95,
                    opacity: signal.state === 'green' ? 1 : 0.4
                  }}
                  transition={{ 
                    backgroundColor: { duration: 0.6 },
                    boxShadow: { duration: 0.6 },
                    opacity: { duration: 0.6 },
                    scale: signal.state === 'green' 
                      ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } 
                      : { duration: 0.4 }
                  }}
                  className="w-16 h-16 rounded-full relative" 
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass rounded-3xl p-10 text-white relative overflow-hidden border border-white/10 group">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-cyan-500/10 -skew-x-12 blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 glass-dark rounded-2xl text-cyan-400 border border-white/10">
                  <Zap size={24} className="animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Adaptive Neural Logic</h3>
              </div>
              <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                The centralized AI core dynamically modulates signal intervals based on vision-extracted density metrics. 
                Urban flow efficiency has stabilized at <span className="text-cyan-400 font-bold font-mono">+28.4%</span> across the northern corridor.
              </p>
          </div>
          <button className="flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-400 transition-all active:scale-95 shadow-2xl">
            <RefreshCw size={18} />
            System Recalibrate
          </button>
        </div>
      </div>
    </div>
  );
}
