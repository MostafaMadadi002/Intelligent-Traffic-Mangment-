import { useEffect, useState } from 'react';
import { Activity, Car, Signal, Users, AlertTriangle, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../lib/api';
import socket from '../lib/socket';

export default function Home() {
  const [cameras, setCameras] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    avgDensity: 0,
    activeCameras: 0,
    congestionAlerts: 0
  });

  useEffect(() => {
    api.get('/cameras').then(res => {
      setCameras(res.data);
      setStats(prev => ({ ...prev, activeCameras: res.data.filter((c: any) => c.status === 'active').length }));
    });

    socket.on('trafficUpdate', (data) => {
      setStats(prev => ({
        ...prev,
        totalVehicles: prev.totalVehicles + Object.values(data.vehicleCounts as Record<string, number>).reduce((a, b) => a + b, 0),
        avgDensity: (prev.avgDensity + data.density) / 2
      }));
    });

    return () => {
      socket.off('trafficUpdate');
    };
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-light text-white italic">Intelligent <span className="font-bold not-italic">Network Status</span></h2>
          <p className="text-slate-500 text-sm">Real-time overview of urban transport infrastructure and congestion metrics.</p>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">System Load</p>
            <p className="text-xl font-mono text-emerald-400">0.42ms Latency</p>
          </div>
          <div className="h-10 w-[1px] bg-white/10 hidden sm:block"></div>
          <div className="flex flex-col items-end">
            <p className="text-xs text-slate-400">May 22 — 11:23</p>
            <p className="text-xs text-emerald-500 flex items-center gap-1">
              <span className="status-indicator bg-emerald-500"></span> All Signals Operational
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Vehicles', value: stats.totalVehicles, icon: Car, color: 'cyan' },
          { label: 'Avg Density', value: `${stats.avgDensity.toFixed(1)}%`, icon: Activity, color: 'emerald' },
          { label: 'Active Cameras', value: stats.activeCameras, icon: Users, color: 'indigo' },
          { label: 'Congestion Alerts', value: stats.congestionAlerts, icon: AlertTriangle, color: 'amber' }
        ].map((item, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={item.label}
            className="glass p-6 rounded-3xl hover:bg-white/10 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                <item.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase text-slate-500">{item.label}</p>
                <p className="text-2xl font-bold text-white">{item.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-xl font-bold">Intersection Overview</h3>
              <button className="text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors">View System Map</button>
            </div>
            <div className="space-y-4 relative z-10">
              {cameras.map((camera) => (
                <div key={camera.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 group border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 glass-dark rounded-xl flex items-center justify-center">
                      <Signal size={20} className={camera.status === 'active' ? 'text-emerald-400 shadow-[0_0_10px_#10b981]' : 'text-slate-600'} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{camera.name}</p>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{camera.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-white">32 Vehicles/min</p>
                      <p className="text-[8px] uppercase font-bold text-slate-500 tracking-tighter">Current Flow Rate</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      camera.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-white/5'
                    }`}>
                      {camera.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-dark rounded-3xl p-8 text-white relative overflow-hidden group border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-cyan-500/30 transition-colors" />
            <div className="relative z-10 space-y-6">
              <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight mb-2">AI Optimization</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Smart controllers are active across 12 sectors, reducing idle times by <span className="text-cyan-400">22%</span> since calibration.</p>
              </div>
              <button className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-black uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                Recalibrate System
              </button>
            </div>
          </div>

          <div className="glass rounded-3xl p-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 font-mono">Infrastructure Status</h3>
            <div className="space-y-6">
              {[
                { label: 'System Health', status: 'Optimal', color: 'emerald' },
                { label: 'Network Latency', status: '24ms', color: 'cyan' },
                { label: 'Vision Uptime', status: '99.8%', color: 'indigo' }
              ].map(status => (
                <div key={status.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">{status.label}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${status.color}-400 shadow-[0_0_8px_currentColor] animate-pulse`} />
                    <span className="text-xs font-bold text-white font-mono">{status.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
