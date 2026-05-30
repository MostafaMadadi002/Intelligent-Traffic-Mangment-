import React, { useEffect, useState } from 'react';
import { Camera, Plus, Trash2, Edit2, Shield, Settings, Database, Activity, Search } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../lib/api';

export default function AdminPanel() {
  const [cameras, setCameras] = useState<any[]>([]);
  const [newCam, setNewCam] = useState({ name: '', location: '', videoUrl: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = () => {
    api.get('/cameras').then(res => setCameras(res.data));
  };

  const handleAddCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCam.name || !newCam.videoUrl) return;
    setLoading(true);
    try {
      await api.post('/cameras', newCam);
      setNewCam({ name: '', location: '', videoUrl: '' });
      fetchCameras();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCameras = (Array.isArray(cameras) ? cameras : []).filter(cam => 
    cam && (
      cam.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      cam.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this camera?')) return;
    try {
      await api.delete(`/cameras/${id}`);
      fetchCameras();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="px-2 py-0.5 glass text-cyan-400 text-[9px] font-black uppercase tracking-[0.2em] rounded">Root Privileges</div>
            <Shield size={14} className="text-cyan-500" />
          </div>
          <h2 className="text-3xl font-light text-white italic">Node <span className="font-bold not-italic">Infrastructure Console</span></h2>
          <p className="text-slate-500 text-sm">Configure camera telemetry, user access, and system kernel parameters.</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 glass-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-2xl border border-white/5">
             <Settings size={18} />
             Kernel Config
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="glass rounded-3xl shadow-2xl overflow-hidden border border-white/10">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold flex items-center gap-3">
                  <Camera size={20} className="text-cyan-400" />
                  System Nodes
                </h3>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{filteredCameras.length} Active Modules</span>
              </div>
              
              <div className="relative group w-full md:w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search nodes or sectors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 glass-dark rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all border border-white/5"
                />
              </div>
            </div>
            <div className="divide-y divide-white/5">
            {(Array.isArray(filteredCameras) ? filteredCameras : []).map(cam => cam && (
                <div key={cam.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 glass-dark rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                      <Camera size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{cam.name}</h4>
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">{cam.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2.5 glass-dark text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 rounded-xl transition-all border border-white/5">
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cam.id)}
                      className="p-2.5 glass-dark text-slate-500 hover:text-red-400 hover:border-red-500/30 rounded-xl transition-all border border-white/5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="glass rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-3xl -mr-12 -mt-12" />
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2 relative z-10">
               <Plus size={20} className="text-cyan-400" />
               Provision Module
             </h3>
             <form onSubmit={handleAddCamera} className="space-y-6 relative z-10">
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-600 pl-1 tracking-[0.2em]">Node Identifier</label>
                  <input 
                    value={newCam.name}
                    onChange={e => setNewCam({...newCam, name: e.target.value})}
                    placeholder="Intersection 084-Delta"
                    className="w-full px-5 py-4 glass-dark text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-mono text-sm placeholder:text-slate-700" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-600 pl-1 tracking-[0.2em]">Sector Assignment</label>
                  <input 
                    value={newCam.location}
                    onChange={e => setNewCam({...newCam, location: e.target.value})}
                    placeholder="Downtown Quadrant 4"
                    className="w-full px-5 py-4 glass-dark text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-mono text-sm placeholder:text-slate-700" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-600 pl-1 tracking-[0.2em]">Telemetry Source</label>
                  <input 
                    value={newCam.videoUrl}
                    onChange={e => setNewCam({...newCam, videoUrl: e.target.value})}
                    placeholder="rtsp://neural.hub/node84"
                    className="w-full px-5 py-4 glass-dark text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-mono text-sm placeholder:text-slate-700" 
                  />
               </div>
               <button 
                 disabled={loading}
                 className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95 disabled:opacity-50"
               >
                 {loading ? 'Processing Protocol...' : 'Initialize Node'}
               </button>
             </form>
           </div>

           <div className="glass-dark rounded-3xl p-8 text-white space-y-6 overflow-hidden relative border border-white/5 shadow-inner">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mb-16 -mr-16" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                <Database size={18} className="text-indigo-400" />
                Telemetry Vault
              </h3>
              <div className="space-y-4 relative z-10">
                 {[
                   { label: 'Storage Cluster', val: '4.2 TB', icon: Activity },
                   { label: 'Neural Uplink', val: 'Active', icon: Shield },
                 ].map(item => (
                   <div key={item.label} className="flex items-center justify-between p-4 glass rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <item.icon size={16} className="text-slate-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-white">{item.val}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
