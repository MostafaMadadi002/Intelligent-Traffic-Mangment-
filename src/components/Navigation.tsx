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
  ];

  if (isAuthenticated) {
    navItems.push({ name: 'Admin Panel', path: '/admin', icon: Settings });
  }

  const handleLogout = () => {
    localStorage.removeItem('traffic_token');
    localStorage.removeItem('traffic_user');
    navigate('/login');
    setIsOpen(false);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const NavLinks = () => (
    <div className="flex-1 space-y-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
              isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={20} className={isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'} />
            <span className="font-medium">{item.name}</span>
            {isActive && (
              <motion.div
                layoutId="active-nav"
                className="absolute left-[-24px] w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
              />
            )}
          </Link>
        );
      })}
    </div>
  );

  const UserSection = () => {
    const userStr = localStorage.getItem('traffic_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const displayName = user?.name || 'System Admin';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
      <div className="pt-6 border-t border-white/5 space-y-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-xs">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{displayName}</p>
              <button 
                onClick={handleLogout}
                className="text-[10px] text-red-500 hover:text-red-400 transition-colors uppercase font-black tracking-widest mt-1"
              >
                Terminate Session
              </button>
            </div>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Settings size={20} />
            <span className="font-medium">Admin Access</span>
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass-dark border-b border-white/5 px-6 flex items-center flex-row-reverse justify-between z-[60]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-bold text-xl">T</div>
          <h1 className="font-bold text-lg tracking-tight uppercase">TrafficFlow</h1>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] md:hidden"
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 glass-dark text-white p-6 flex flex-col z-[80] md:hidden border-r border-white/10"
            >
              <div className="flex items-center gap-3 mb-10 px-2 mt-4">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(6,182,212,0.5)]">T</div>
                <h1 className="font-bold text-xl tracking-tight uppercase">TrafficFlow</h1>
              </div>
              <NavLinks />
              <SystemStatus />
              <UserSection />
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-64 glass-dark text-white p-6 hidden md:flex flex-col z-50 border-r border-white/5">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(6,182,212,0.5)]">T</div>
          <h1 className="font-bold text-xl tracking-tight uppercase">TrafficFlow</h1>
        </div>
        <NavLinks />
        <SystemStatus />
        <UserSection />
      </nav>
    </>
  );
}
