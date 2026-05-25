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
    <div className="mt-auto pt-6 space-y-4 pb-4">
      <div className="px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Core Engine</span>
          </div>
          <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-tighter">Active</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/[0.03] p-2 rounded-xl border border-white/5 flex flex-col gap-1 hover:bg-white/[0.05] transition-colors group/stat">
            <Cpu size={12} className="text-cyan-400 group-hover/stat:scale-110 transition-transform" />
            <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Neural</span>
            <span className="text-[10px] font-bold text-white font-mono">14.2%</span>
          </div>
          <div className="bg-white/[0.03] p-2 rounded-xl border border-white/5 flex flex-col gap-1 hover:bg-white/[0.05] transition-colors group/stat">
            <Database size={12} className="text-indigo-400 group-hover/stat:scale-110 transition-transform" />
            <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Net</span>
            <span className="text-[10px] font-bold text-white font-mono">18ms</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <Wifi size={10} className="text-slate-600" />
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Uptime</span>
          </div>
          <span className="text-[10px] font-bold text-slate-300 font-mono tracking-tighter">{uptime}</span>
        </div>
      </div>

      <div className="px-2 flex items-center gap-3 group/secure cursor-help">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover/secure:bg-cyan-500/20 transition-all duration-300">
          <ShieldCheck size={16} className="group-hover/secure:rotate-12 transition-transform" />
        </div>
        <div>
          <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Matrix Secure</p>
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter mt-1">L3 Encrypted</p>
        </div>
      </div>
    </div>
  );
}
