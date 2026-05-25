import { useEffect, useState, useMemo } from 'react';
import { Activity, Car, Signal, Users, AlertTriangle, Zap, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../lib/api';
import socket from '../lib/socket';
import { Camera } from '../types';

export default function Home() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [cameraStats, setCameraStats] = useState<Record<string, { density: number; flow: number }>>({});
  const [stats, setStats] = useState({
    totalVehicles: 0,
    avgDensity: 0,
    activeCameras: 0,
    congestionAlerts: 0
  });

  useEffect(() => {
    api.get('/cameras').then(res => {
      const cameraData: Camera[] = res.data;
      setCameras(cameraData);
      setStats(prev => ({ ...prev, activeCameras: cameraData.filter((c: any) => c.status === 'active').length }));
      
      // Initialize stats
      const initialStats: Record<string, { density: number; flow: number }> = {};
      cameraData.forEach(cam => {
        initialStats[cam.id] = { density: Math.floor(Math.random() * 30), flow: Math.floor(Math.random() * 20) + 10 };
      });
      setCameraStats(initialStats);
    });

    socket.on('trafficUpdate', (data) => {
      const vehicleCount = Object.values(data.vehicleCounts as Record<string, number>).reduce((a, b) => a + b, 0);
      
      setStats(prev => ({
        ...prev,
        totalVehicles: prev.totalVehicles + vehicleCount,
        avgDensity: (prev.avgDensity + data.density) / 2
      }));

      setCameraStats(prev => ({
        ...prev,
        [data.cameraId]: {
          density: data.density,
          flow: vehicleCount * 4 // Extrapolate to flow rate
        }
      }));
    });

    return () => {
      socket.off('trafficUpdate');
    };
  }, []);

  const heatmapPoints = useMemo(() => {
    return cameras.map((cam, index) => {
      // Mock coordinates distributed across a grid
      const x = 20 + (index % 3) * 30 + (Math.sin(index) * 5);
      const y = 20 + Math.floor(index / 3) * 40 + (Math.cos(index) * 5);
      return {
        id: cam.id,
        x: `${x}%`,
        y: `${y}%`,
        density: cameraStats[cam.id]?.density || 0,
        name: cam.name
      };
    });
  }, [cameras, cameraStats]);

  const getHeatColor = (density: number) => {
    if (density > 70) return 'bg-red-500';
    if (density > 40) return 'bg-amber-400';
    return 'bg-emerald-400';
  };

  const getHeatShadow = (density: number) => {
    if (density > 70) return '0 0 40px rgba(239, 68, 68, 0.8)';
    if (density > 40) return '0 0 40px rgba(251, 191, 36, 0.8)';
    return '0 0 40px rgba(16, 185, 129, 0.8)';
  };

  const [isRecalibrating, setIsRecalibrating] = useState(false);

  const handleRecalibrate = () => {
    setIsRecalibrating(true);
    setTimeout(() => setIsRecalibrating(false), 3000);
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <AnimatePresence>
        {isRecalibrating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#020617]/90 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto p-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 md:w-24 md:h-24 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full mb-8"
            />
            <div className="text-center space-y-2">
              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest">Neural Recalibration</h3>
              <p className="text-slate-500 font-mono text-[10px] md:text-sm animate-pulse">SYNCHRONIZING INTERSECTION MATRICES...</p>
            </div>
            <div className="mt-12 w-full max-w-xs h-1 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3 }}
                className="h-full bg-cyan-500 shadow-[0_0_15px_#06b6d4]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8 pb-6 border-b border-white/5 relative gap-6">
        <div className="absolute -bottom-[1px] left-0 w-32 h-[2px] bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
        <div>
          <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight italic leading-tight">Urban <span className="font-black not-italic text-cyan-400">Control Matrix</span></h2>
          <p className="text-slate-500 text-[10px] md:text-sm mt-1 uppercase tracking-widest font-bold font-mono">Operations Command Center [Sector 04]</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex flex-col items-start md:items-end">
            <div className="flex items-center gap-2">
              <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Global AI Engine</span>
              <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] animate-pulse" />
            </div>
            <span className="text-[10px] md:text-xs font-mono text-white mt-0.5 whitespace-nowrap">LATENCY: 14.4ms</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
          <div className="glass-dark border border-white/10 px-4 md:px-6 py-2 md:py-3 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">System UTC</span>
            <span className="text-[10px] md:text-xs font-bold font-mono text-white">{new Date().toLocaleTimeString([], { hour12: false })}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 relative overflow-hidden group">
            {/* HeatMap Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]" />
              <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            </div>

            <div className="absolute inset-0 z-0 opacity-40">
              {heatmapPoints.map((point) => (
                <motion.div
                  key={point.id}
                  initial={false}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3],
                    boxShadow: getHeatShadow(point.density)
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: Math.random() * 2
                  }}
                  style={{ left: point.x, top: point.y }}
                  className={`absolute w-8 h-8 md:w-12 md:h-12 rounded-full blur-xl md:blur-2xl ${getHeatColor(point.density)}`}
                />
              ))}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:mb-8 relative z-10 mb-6">
              <div className="flex items-center gap-3">
                <MapIcon className="text-cyan-400" size={20} md:size={24} />
                <h3 className="text-lg md:text-xl font-bold">Intersection Overview</h3>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500">Congested</span>
                 </div>
                 <div className="h-4 w-[1px] bg-white/10" />
                 <button className="text-[10px] md:text-xs font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors">Digital Twin</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 relative z-10">
              {cameras.map((camera) => (
                <div key={camera.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] backdrop-blur-md hover:bg-white/10 transition-all duration-300 group border border-white/5 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 glass-dark rounded-xl flex items-center justify-center relative overflow-hidden">
                       <div className={`absolute inset-0 opacity-20 ${getHeatColor(cameraStats[camera.id]?.density || 0)}`} />
                      <Signal size={20} className={camera.status === 'active' ? 'text-emerald-400 relative z-10' : 'text-slate-600 relative z-10'} />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{camera.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[8px] uppercase font-bold tracking-widest text-slate-500">{camera.location}</p>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <p className={`text-[8px] font-black uppercase ${cameraStats[camera.id]?.density > 70 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {cameraStats[camera.id]?.density || 0}% Load
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-xs font-mono font-bold text-white">{cameraStats[camera.id]?.flow || 0}</p>
                    <p className="text-[7px] uppercase font-bold text-slate-500 tracking-tighter">Veh/Min</p>
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
              <button 
                onClick={handleRecalibrate}
                className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-black uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
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
