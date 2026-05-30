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
    let isMounted = true;
    console.log('[Home] Initializing data sequence...');

    api.get('/cameras').then(res => {
      if (!isMounted) return;
      const cameraData: Camera[] = res.data || [];
      console.log('[Home] Cameras loaded:', cameraData.length);
      setCameras(cameraData);
      setStats(prev => ({ 
        ...prev, 
        activeCameras: cameraData.filter((c: any) => c.status === 'active').length 
      }));
      
      // Initialize stats safely
      const initialStats: Record<string, { density: number; flow: number }> = {};
      cameraData.forEach(cam => {
        if (cam && cam.id) {
          initialStats[cam.id] = { 
            density: Math.floor(Math.random() * 30), 
            flow: Math.floor(Math.random() * 20) + 10 
          };
        }
      });
      setCameraStats(initialStats);
    }).catch(err => {
      console.error('[Home] Failed to load cameras:', err);
      // Mock fallback for Safe Mode
      setCameras([
        { id: 'cam-mock-1', name: 'Main St & 5th Header', location: 'Downtown', status: 'active', videoUrl: '' },
        { id: 'cam-mock-2', name: 'Broadway & 42nd', location: 'Theater District', status: 'active', videoUrl: '' }
      ]);
    });

    socket.on('trafficUpdate', (data) => {
      if (!isMounted || !data) return;
      
      try {
        const counts = data.vehicleCounts || {};
        const vehicleCount = Object.values(counts as Record<string, number>).reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
        
        setStats(prev => ({
          ...prev,
          totalVehicles: prev.totalVehicles + vehicleCount,
          avgDensity: (prev.avgDensity + (data.density || 0)) / 2
        }));

        if (data.cameraId) {
          setCameraStats(prev => ({
            ...prev,
            [data.cameraId]: {
              density: data.density || 0,
              flow: vehicleCount * 4
            }
          }));
        }
      } catch (e) {
        console.warn('[Home] Failed to parse socket update:', e);
      }
    });

    return () => {
      isMounted = false;
      socket.off('trafficUpdate');
    };
  }, []);

  const sortedCameras = useMemo(() => {
    return [...cameras].sort((a, b) => {
      const densityA = cameraStats[a.id]?.density || 0;
      const densityB = cameraStats[b.id]?.density || 0;
      return densityB - densityA;
    });
  }, [cameras, cameraStats]);

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

  const handleRecalibrate = () => {
    // Calibration logic simplified to just logs as overlay is removed
    console.log("Recalibrating matrices...");
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:mb-8 relative z-10 mb-6 px-1">
              <div className="flex items-center gap-3">
                <MapIcon className="text-cyan-400 shrink-0" size={20} />
                <h3 className="text-lg md:text-xl font-bold truncate">Intersection Overview</h3>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">Congested</span>
                 </div>
                 <div className="h-4 w-[1px] bg-white/10" />
                 <button className="text-[10px] md:text-xs font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap">Digital Twin</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <AnimatePresence mode="popLayout">
                {sortedCameras.map((camera) => (
                  <motion.div
                    layout
                    key={camera.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 rounded-2xl bg-white/[0.03] backdrop-blur-md hover:bg-white/10 transition-all duration-300 group border border-white/5 shadow-xl gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 shrink-0 glass-dark rounded-xl flex items-center justify-center relative overflow-hidden">
                         <div className={`absolute inset-0 opacity-20 ${getHeatColor(cameraStats[camera.id]?.density || 0)}`} />
                        <Signal size={20} className={camera.status === 'active' ? 'text-emerald-400 relative z-10' : 'text-slate-600 relative z-10'} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white text-sm truncate">{camera.name}</p>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <p className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-slate-500 truncate max-w-[80px] sm:max-w-none">{camera.location}</p>
                          <span className="w-1 h-1 rounded-full bg-slate-700 hidden sm:block" />
                          <p className={`text-[9px] md:text-[10px] font-black uppercase whitespace-nowrap ${cameraStats[camera.id]?.density > 70 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {cameraStats[camera.id]?.density || 0}% Load
                          </p>
                        </div>
                        {/* Density Progress Bar */}
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${cameraStats[camera.id]?.density || 0}%` }}
                            className={`h-full ${getHeatColor(cameraStats[camera.id]?.density || 0)} shadow-[0_0_8px_currentColor]`}
                            transition={{ type: "spring", stiffness: 40, damping: 12 }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <div className="flex flex-col items-start sm:items-end">
                        <p className="text-sm md:text-base font-mono font-bold text-white leading-none">{cameraStats[camera.id]?.flow || 0}</p>
                        <p className="text-[8px] uppercase font-bold text-slate-500 tracking-tighter mt-1">Vehicles/Min</p>
                      </div>
                      <div className="sm:hidden">
                         <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${(cameraStats[camera.id]?.density || 0) > 70 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                           { (cameraStats[camera.id]?.density || 0) > 70 ? 'Congested' : 'Clear' }
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
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
