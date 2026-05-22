import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('traffic_token', res.data.token);
      localStorage.setItem('traffic_user', JSON.stringify(res.data.user));
      navigate('/admin');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center -mt-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-4"
      >
        <div className="glass rounded-[40px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden border border-white/10 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 -mr-32 -mt-32 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />
          
          <div className="relative z-10 space-y-10">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-cyan-500 rounded-3xl flex items-center justify-center text-slate-950 font-black text-4xl mx-auto shadow-[0_0_40px_rgba(6,182,212,0.4)] mb-8 transform hover:rotate-12 transition-transform cursor-pointer">T</div>
              <h1 className="text-4xl font-light text-white tracking-tight italic">System <span className="font-bold not-italic">Authentication</span></h1>
              <p className="text-slate-500 text-sm font-medium">Provision node access via secure credential verification.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-2">Access ID</label>
                <div className="relative group/field">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-cyan-500 transition-colors" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-black/20 border border-white/5 rounded-3xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:bg-black/30 transition-all font-medium text-white placeholder:text-slate-800"
                    placeholder="admin@cluster.io"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] pl-2">Security Key</label>
                <div className="relative group/field">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-cyan-500 transition-colors" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-black/20 border border-white/5 rounded-3xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:bg-black/30 transition-all font-medium text-white placeholder:text-slate-800"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-red-400 text-xs font-black uppercase tracking-widest bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full py-5 bg-white text-slate-950 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-cyan-400 transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                Access Console
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="pt-6 text-center">
              <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">Test: admin@example.com <span className="mx-2 text-slate-800">/</span> admin123</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
