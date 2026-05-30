import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, Monitor, Settings, MapPin, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SystemStatus from './SystemStatus';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('traffic_token');

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Live Monitoring', path: '/monitor', icon: Monitor },
    { name: 'Signal Control', path: '/signals', icon: Activity },
    { name: 'Analytics', path: '/analytics', icon: MapPin },
    { name: 'Admin Panel', path: '/admin', icon: Settings },
  ];

  const handleLogout = () => {
    // Logout disabled per user request
    setIsOpen(false);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const NavLinks = () => (
    <div className="flex-1 space-y-1.5 no-scrollbar overflow-y-auto">
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path;
        return (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[inset_0_0_15px_rgba(34,211,238,0.05)]' 
                  : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              <div className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`relative z-10 font-bold text-xs md:text-sm uppercase tracking-widest transition-all duration-300 ${isActive ? 'translate-x-1' : ''}`}>
                {item.name}
              </span>
              
              {isActive && (
                <>
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_15px_#22d3ee]"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                  />
                </>
              )}
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );

  const UserSection = () => {
    let user = null;
    try {
      const userStr = localStorage.getItem('traffic_user');
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.warn('Failed to parse user from localStorage', e);
    }
    const displayName = user?.name || 'System Admin';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
      <div className="pt-6 border-t border-white/5 space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner group/user hover:bg-white/[0.05] transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-xs shadow-lg group-hover/user:scale-105 transition-transform">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Authorized Operative</p>
            <p className="text-xs font-bold text-white truncate">{displayName}</p>
            <p className="text-[9px] text-cyan-400/80 uppercase font-black tracking-[0.15em] mt-1.5 flex items-center gap-1">
               Status: Node Active
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass-dark border-b border-white/5 px-6 flex items-center flex-row-reverse justify-between z-[60] backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10">T</span>
          </div>
          <h1 className="font-black text-lg tracking-tighter uppercase italic">Traffic<span className="text-cyan-400 not-italic">Flow</span></h1>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-400 hover:text-white transition-all active:scale-90"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] md:hidden"
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-[85vw] max-w-80 bg-[#020617] text-white p-6 flex flex-col z-[80] border-r border-white/5 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10 px-2 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center font-bold text-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)]">T</div>
                  <h1 className="font-black text-2xl tracking-tighter uppercase italic text-white flex flex-col leading-none">
                    <span>Traffic</span>
                    <span className="text-cyan-400 not-italic text-sm tracking-[0.3em] ml-1 mt-0.5 opacity-80">Flow Core</span>
                  </h1>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-4">Navigation</div>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
                <NavLinks />
                
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-4">Engine Diagnostics</div>
                  <SystemStatus />
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/5">
                <UserSection />
                <div className="mt-4 flex items-center justify-center gap-4 text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                  <span>v4.2.0-Build</span>
                  <span className="w-1 h-1 rounded-full bg-slate-800" />
                  <span>Secure Node 7</span>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-72 glass-dark text-white p-8 hidden md:flex flex-col z-50 border-r border-white/5 backdrop-blur-3xl">
        <div className="flex items-center gap-3 mb-12 px-2 group cursor-default">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center font-bold text-2xl shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">T</div>
          <h1 className="font-black text-2xl tracking-tighter uppercase italic group-hover:tracking-normal transition-all duration-500">
            Traffic<span className="text-cyan-400 not-italic">Flow</span>
          </h1>
        </div>
        <NavLinks />
        <SystemStatus />
        <UserSection />
      </nav>
    </>
  );
}
