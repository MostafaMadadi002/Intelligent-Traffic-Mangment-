import { useEffect, useState, useRef } from 'react';
import { Camera, Car, Truck, Bike, Bus, Activity, Maximize2, Server, Globe, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import socket from '../lib/socket';
import api from '../lib/api';
import SimulationControl from '../components/SimulationControl';

export default function TrafficMonitor() {
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [detection, setDetection] = useState<any>(null);
  const [streamInfo, setStreamInfo] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let isMounted = true;
    api.get('/cameras').then(res => {
      if (!isMounted) return;
      const data = res.data || [];
      setCameras(data);
      if (data.length > 0) setSelectedCamera(data[0]);
    }).catch(err => {
      console.warn('[Monitor] Camera fetch failed, using fallback');
      const fallback = [{ id: 'node-alpha', name: 'North Corridor', location: 'Sector 7', status: 'active' }];
      setCameras(fallback);
      setSelectedCamera(fallback[0]);
    });

    socket.on('trafficUpdate', (data) => {
      if (!isMounted || !data) return;
      if (selectedCamera && data.cameraId === selectedCamera.id) {
        setDetection(data);
        setHistory(prev => {
          const current = Array.isArray(prev) ? prev : [];
          return [data, ...current].slice(0, 5);
        });
      }
    });

    return () => {
      isMounted = false;
      socket.off('trafficUpdate');
    };
  }, [selectedCamera]);

  useEffect(() => {
    if (selectedCamera && selectedCamera.id && !selectedCamera.id.startsWith('node-')) {
      api.get(`/cameras/${selectedCamera.id}/stream`).then(res => {
        setStreamInfo(res.data);
      }).catch(() => {
        setStreamInfo({ metadata: { codec: 'H.264', fps: 30, bitrate: '4.2 Mbps', resolution: '1080p' } });
      });
    }
  }, [selectedCamera]);

  const filteredCameras = (Array.isArray(cameras) ? cameras : []).filter(cam => {
    const matchStatus = statusFilter === 'all' || cam.status === statusFilter;
    const matchLocation = locationFilter === 'all' || cam.location === locationFilter;
    return matchStatus && matchLocation;
  });

  const locations = Array.from(new Set((Array.isArray(cameras) ? cameras : []).filter(c => !!c).map(cam => cam.location))).filter(Boolean);

  return (
    <div className="space-y-8">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 py-6 border-b border-white/10">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl md:text-3xl font-light text-white leading-tight">Live <span className="font-bold">Neural Monitoring</span></h2>
          <p className="text-slate-500 text-[10px] md:text-sm uppercase tracking-widest font-bold">Real-time object detection nodes.</p>
        </div>

        <div className="hidden 2xl:block">
          <SimulationControl />
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="2xl:hidden mb-2">
             <SimulationControl />
          </div>
          <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 overflow-x-auto no-scrollbar">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[10px] md:text-xs font-bold text-slate-300 px-3 py-2 outline-none cursor-pointer hover:text-white transition-colors uppercase tracking-widest min-w-[100px]"
            >
              <option value="all" className="bg-slate-900">Status: All</option>
              <option value="active" className="bg-slate-900">Status: Active</option>
              <option value="inactive" className="bg-slate-300 text-slate-900">Status: Inactive</option>
            </select>

            <select 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-transparent text-[10px] md:text-xs font-bold text-slate-300 px-3 py-2 outline-none cursor-pointer hover:text-white transition-colors uppercase tracking-widest border-l border-white/10 min-w-[120px]"
            >
              <option value="all" className="bg-slate-900">Region: All</option>
              {locations.map(loc => (
                <option key={loc} value={loc} className="bg-slate-900">{loc}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 glass-dark p-1.5 rounded-2xl border border-white/5 shadow-2xl overflow-x-auto no-scrollbar max-w-full">
            {(Array.isArray(filteredCameras) ? filteredCameras : []).map(cam => cam && (
              <button
                key={cam.id}
                onClick={() => setSelectedCamera(cam)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCamera?.id === cam.id 
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {cam.name}
              </button>
            ))}
            {filteredCameras.length === 0 && (
              <span className="px-5 py-2.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">No nodes match filter</span>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video min-h-[220px] md:min-h-0 bg-slate-950 rounded-[1.5rem] md:rounded-3xl overflow-hidden glass shadow-2xl border border-white/10">
            {selectedCamera ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={selectedCamera.videoUrl}
                  className="w-full h-full object-cover opacity-60 mix-blend-screen"
                />
                
                {/* Simulated Bounding Boxes */}
                <div className="absolute inset-0 pointer-events-none">
                  <AnimatePresence>
                    {detection && [1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.8, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="bounding-box border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                        style={{
                          top: `${20 + i * 15 + (Math.random() * 5)}%`,
                          left: `${15 + i * 20 + (Math.random() * 5)}%`,
                          width: '80px',
                          height: '60px',
                        }}
                      >
                        <span className="absolute -top-4 left-0 bg-cyan-400 text-slate-950 text-[7px] px-1 font-black uppercase rounded-t-sm">
                          TRUCK 98%
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                <div className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-[9px] md:text-[10px] font-black tracking-[0.2em] uppercase whitespace-nowrap">Live Signal</span>
                </div>
                
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 flex flex-wrap gap-3 md:gap-4">
                  <div className="glass-dark backdrop-blur-md px-3 md:px-5 py-2 md:py-3 rounded-[1rem] md:rounded-2xl border border-white/10">
                     <p className="text-[8px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5 md:mb-1 leading-none">Node</p>
                     <p className="text-sm md:text-xl font-bold text-white leading-none">{selectedCamera?.id ? selectedCamera.id.split('-')[0] : '---'}</p>
                  </div>
                  <div className="glass-dark backdrop-blur-md px-3 md:px-5 py-2 md:py-3 rounded-[1rem] md:rounded-2xl border border-white/10">
                     <p className="text-[8px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5 md:mb-1 leading-none">Load</p>
                     <p className="text-sm md:text-xl font-bold text-cyan-400 leading-none">{detection?.density || 0}%</p>
                  </div>
                </div>

                <button className="absolute bottom-4 right-4 md:bottom-6 md:right-6 p-2 md:p-3 glass-dark hover:bg-white/10 rounded-xl md:rounded-2xl transition-all text-white border border-white/10 group">
                  <Maximize2 size={20} className="group-hover:scale-110 transition-transform" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                <Camera size={48} className="text-slate-800" />
                <p className="font-medium">No system node selected</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Passenger Cars', count: detection?.vehicleCounts?.car || 0, icon: Car, color: 'cyan' },
              { label: 'Public Transit', count: detection?.vehicleCounts?.bus || 0, icon: Bus, color: 'indigo' },
              { label: 'Logistics Trucks', count: detection?.vehicleCounts?.truck || 0, icon: Truck, color: 'slate' },
              { label: 'Micro-mobility', count: detection?.vehicleCounts?.motorcycle || 0, icon: Bike, color: 'emerald' },
            ].map(cls => (
              <div key={cls.label} className="glass p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                   <cls.icon size={18} className={`text-${cls.color}-400 group-hover:scale-110 transition-transform`} />
                   <span className="text-2xl font-black text-white font-mono">{cls.count}</span>
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{cls.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 border border-white/5">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8 font-mono flex items-center gap-2">
              <Server size={16} className="text-cyan-400" />
              Stream Analytics
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Codec</p>
                  <p className="text-xs font-bold text-white font-mono">{streamInfo?.metadata?.codec || 'H.264'}</p>
               </div>
               <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">FPS</p>
                  <p className="text-xs font-bold text-white font-mono">{streamInfo?.metadata?.fps || 30}</p>
               </div>
               <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Bitrate</p>
                  <p className="text-xs font-bold text-cyan-400 font-mono">{streamInfo?.metadata?.bitrate || '0.0 Mbps'}</p>
               </div>
               <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Res</p>
                  <p className="text-xs font-bold text-white font-mono">{streamInfo?.metadata?.resolution || '1080p'}</p>
               </div>
            </div>
            
            <div className="space-y-8">
              {[
                { name: 'Core Density', value: detection?.density || 10, color: 'cyan' },
                { name: 'Peripheral Flow', value: Math.max(0, (detection?.density || 20) - 10), color: 'indigo' },
                { name: 'Auxiliary Load', value: Math.max(0, (detection?.density || 30) - 20), color: 'slate' },
              ].map(lane => (
                <div key={lane.name} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>{lane.name}</span>
                    <span className="text-white font-mono">{lane.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      animate={{ width: `${lane.value}%` }}
                      className={`h-full bg-gradient-to-r from-${lane.color}-600 to-${lane.color}-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-dark rounded-3xl p-8 border border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-3xl -mr-12 -mt-12" />
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6 relative z-10">Event Ledger</h3>
            <div className="space-y-6 relative z-10">
              {(Array.isArray(history) ? history : []).map((log, i) => log && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1 - i * 0.2, x: 0 }}
                  key={log.timestamp}
                  className={`border-l-2 border-cyan-500/30 pl-4 py-1 transition-opacity duration-500`}
                >
                  <p className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-widest">{new Date(log.timestamp).toLocaleTimeString([], {hour12: false})}</p>
                  <p className="text-sm font-semibold text-white">Detection Delta: +{Object.values((log?.vehicleCounts || {}) as Record<string, number>).reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0)} units</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
