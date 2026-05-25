import { useState, useEffect } from 'react';
import { ShieldCheck, Database, Cpu, Wifi } from 'lucide-react';
import { motion } from 'motion/react';

export default function SystemStatus() {
  const [uptime, setUptime] = useState('00:00:00');
  const [startTime] = useState(Date.now() - 12450000); // Mocking ~3.5 hours uptime

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Date.now() - startTime;
      const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setUptime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="mt-auto pt-6 space-y-4">
      <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Engine Status</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">Live</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col gap-1">
            <Cpu size={12} className="text-cyan-400" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">AI Load</span>
            <span className="text-[10px] font-bold text-white font-mono">14.2%</span>
          </div>
          <div className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col gap-1">
            <Database size={12} className="text-indigo-400" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Sync Latency</span>
            <span className="text-[10px] font-bold text-white font-mono">18ms</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <Wifi size={10} className="text-slate-500" />
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">System Uptime</span>
          </div>
          <span className="text-[10px] font-bold text-white font-mono">{uptime}</span>
        </div>
      </div>

      <div className="px-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
          <ShieldCheck size={16} />
        </div>
        <div>
          <p className="text-[10px] font-black text-white uppercase tracking-widest">Secure Matrix</p>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">L3 Encryption Active</p>
        </div>
      </div>
    </div>
  );
}
