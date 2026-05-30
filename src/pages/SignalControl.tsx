import { useEffect, useState } from 'react';
import { Power, Timer, Activity, Zap, RefreshCw, Search, Download } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../lib/api';
import socket from '../lib/socket';

export default function SignalControl() {
  const [signals, setSignals] = useState<any>({});
  const [cameras, setCameras] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.get('/cameras'),
      api.get('/signals')
    ]).then(([camRes, sigRes]) => {
      if (!isMounted) return;
      setCameras(camRes.data || []);
      setSignals(sigRes.data || {});
    }).catch(err => {
      console.warn('[Signals] Data fetch failed:', err);
    });

    socket.on('signalUpdate', (data) => {
      if (!isMounted || !data) return;
      setSignals((prev: any) => ({ ...prev, [data.cameraId]: data }));
    });

    return () => {
      isMounted = false;
      socket.off('signalUpdate');
    };
  }, []);

  const handleManualOverride = (cameraId: string, state: string) => {
    api.post('/signals/override', { cameraId, state, duration: 30 }).then(res => {
      setSignals((prev: any) => ({ ...prev, [cameraId]: res.data }));
    });
  };

  const handleExportCSV = (camera: any) => {
    const timestamp = new Date().toISOString();
    const signal = signals[camera.id] || { state: 'red', mode: 'auto' };
    
    // Generate mock history data
    const rows = [
      ['Timestamp', 'Node Name', 'Location', 'State', 'Mode', 'Density'],
      [timestamp, camera.name, camera.location, signal.state, signal.mode, '74%'],
      [new Date(Date.now() - 30000).toISOString(), camera.name, camera.location, 'yellow', 'auto', '68%'],
      [new Date(Date.now() - 90000).toISOString(), camera.name, camera.location, 'green', 'auto', '82%'],
      [new Date(Date.now() - 150000).toISOString(), camera.name, camera.location, 'red', 'auto', '45%'],
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `signal_history_${camera.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCameras = (Array.isArray(cameras) ? cameras : []).filter(cam => 
    cam.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cam.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-light text-white italic">Synchronized <span className="font-bold not-italic">Traffic Pulse</span></h2>
          <p className="text-slate-500 text-sm">Autonomous adaptive signal timing and manual system overrides.</p>
        </div>

        <div className="relative group w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text"
            placeholder="Search signals or sectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 glass-dark rounded-2xl text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all border border-white/5 placeholder:text-slate-600"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        {(Array.isArray(filteredCameras) ? filteredCameras : []).map(camera => {
          const signal = signals[camera.id] || { state: 'red', duration: 30, mode: 'auto' };
          return (
            <motion.div
              layout
              key={camera.id}
              className="glass rounded-[1.5rem] md:rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col lg:flex-row gap-6 md:gap-8 group hover:bg-white/10 transition-colors border border-white/5"
            >
              <div className="flex-1 space-y-6 md:space-y-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${signal.mode === 'auto' ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {signal.mode} Control Mode
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white">{camera.name}</h3>
                    <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-widest leading-none">{camera.location}</p>
                  </div>
                  
                  <div className="relative group/tooltip">
                    <div className="absolute -top-10 right-0 bg-slate-900 border border-white/10 px-3 py-2 rounded-lg text-[10px] whitespace-nowrap pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-20 shadow-2xl">
                      Export signal event logs (.csv)
                    </div>
                    <button 
                      onClick={() => handleExportCSV(camera)}
                      className="p-2.5 md:p-3 glass-dark hover:bg-white/5 text-slate-500 hover:text-cyan-400 rounded-xl md:rounded-2xl border border-white/5 transition-all shadow-xl active:scale-90"
                    >
                      <Download size={16} md:size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 glass-dark p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1 group/tooltip relative group-hover:bg-white/5 transition-colors">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-3 py-2 rounded-lg text-[10px] w-32 text-center pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-20 shadow-2xl">
                      Next phase transition countdown
                    </div>
                    <Timer size={16} md:size={18} className="text-slate-500" />
                    <span className="text-xl md:text-2xl font-black text-white font-mono leading-none">{signal.duration}s</span>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Cycle Delta</span>
                  </div>
                  <div className="flex-1 glass-dark p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1 group/tooltip relative group-hover:bg-white/5 transition-colors">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-3 py-2 rounded-lg text-[10px] w-32 text-center pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-20 shadow-2xl">
                      Real-time lane density (Neural)
                    </div>
                    <Activity size={16} md:size={18} className="text-slate-500" />
                    <span className="text-xl md:text-2xl font-black text-cyan-400 font-mono leading-none">74%</span>
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Current Load</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {(['red', 'yellow', 'green'] as const).map(color => (
                    <div key={color} className="relative group/tooltip">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-3 py-2 rounded-lg text-[10px] whitespace-nowrap pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-20 shadow-2xl">
                        {color === 'red' ? 'Force stop' : color === 'yellow' ? 'Transition' : 'Authorize'}
                      </div>
                      <button
                        onClick={() => handleManualOverride(camera.id, color)}
                        className={`w-full py-2.5 md:py-3.5 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.15em] transition-all relative overflow-hidden ${
                          signal.state === color 
                          ? (color === 'red' ? 'bg-red-500 text-white' : color === 'yellow' ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 text-white')
                          : 'bg-white/5 text-slate-500 hover:bg-white/10'
                        }`}
                      >
                        {color}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-32 glass-dark rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 flex lg:flex-col items-center justify-between border border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r lg:bg-gradient-to-b from-white/5 to-transparent opacity-50" />
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: signal.state === 'red' ? '#ef4444' : '#0f172a',
                    boxShadow: signal.state === 'red' 
                      ? '0 0 20px md:0 0 40px rgba(239, 68, 68, 0.7), inset 0 0 10px rgba(255,255,255,0.2)' 
                      : 'inset 0 4px 6px rgba(0,0,0,0.4)',
                    scale: signal.state === 'red' ? [1.02, 1.08, 1.02] : 0.9,
                    opacity: signal.state === 'red' ? 1 : 0.15
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="w-10 h-10 md:w-16 md:h-16 rounded-full relative" 
                />
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: signal.state === 'yellow' ? '#fbbf24' : '#0f172a',
                    boxShadow: signal.state === 'yellow' 
                      ? '0 0 20px md:0 0 40px rgba(251, 191, 36, 0.7), inset 0 0 10px rgba(255,255,255,0.2)' 
                      : 'inset 0 4px 6px rgba(0,0,0,0.4)',
                    scale: signal.state === 'yellow' ? [1.02, 1.08, 1.02] : 0.9,
                    opacity: signal.state === 'yellow' ? 1 : 0.15
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="w-10 h-10 md:w-16 md:h-16 rounded-full relative" 
                />
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: signal.state === 'green' ? '#10b981' : '#0f172a',
                    boxShadow: signal.state === 'green' 
                      ? '0 0 20px md:0 0 40px rgba(16, 185, 129, 0.7), inset 0 0 10px rgba(255,255,255,0.2)' 
                      : 'inset 0 4px 6px rgba(0,0,0,0.4)',
                    scale: signal.state === 'green' ? [1.02, 1.08, 1.02] : 0.9,
                    opacity: signal.state === 'green' ? 1 : 0.15
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="w-10 h-10 md:w-16 md:h-16 rounded-full relative" 
                />
              </div>
            </motion.div>
          );
        })}
        {filteredCameras.length === 0 && (
          <div className="xl:col-span-2 py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-slate-700 border border-white/5">
              <Search size={32} />
            </div>
            <div>
              <p className="text-white font-bold tracking-tight uppercase text-xs">No Signal Nodes Found</p>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Refine your search parameters or check system connectivity</p>
            </div>
          </div>
        )}
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
          <div className="relative group/tooltip">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl text-[10px] w-48 text-center pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-20 shadow-2xl">
              Reset neural timing models and synchronize intersection nodes
            </div>
            <button className="flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-cyan-400 transition-all active:scale-95 shadow-2xl">
              <RefreshCw size={18} />
              System Recalibrate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
