import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import socket from '../lib/socket';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notif: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notif, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    socket.on('trafficUpdate', (data) => {
      if (data.density > 80) {
        addNotification({
          title: 'High Density Alert',
          message: `Gridlock detected at node: ${data.cameraId.split('-')[0]} sector.`,
          type: 'warning'
        });
      }
    });

    // Mock an initial notification for demo
    setTimeout(() => {
      addNotification({
        title: 'System Synced',
        message: 'All 12 intersection nodes are currently synchronized with the AI core.',
        type: 'success'
      });
    }, 2000);

    return () => {
      socket.off('trafficUpdate');
    };
  }, []);

  return (
    <div className="fixed top-20 right-6 z-[100] space-y-3 w-80 pointer-events-none">
      <AnimatePresence>
        {notifications.map(notif => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto"
          >
            <div className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex gap-4 ${
              notif.type === 'warning' ? 'bg-red-500/10 border-red-500/20' : 
              notif.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 
              'bg-cyan-500/10 border-cyan-500/20'
            }`}>
              <div className={`mt-0.5 ${
                notif.type === 'warning' ? 'text-red-400' : 
                notif.type === 'success' ? 'text-emerald-400' : 
                'text-cyan-400'
              }`}>
                {notif.type === 'warning' ? <AlertTriangle size={18} /> : 
                 notif.type === 'success' ? <CheckCircle2 size={18} /> : 
                 <Bell size={18} />}
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-white">{notif.title}</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="text-slate-600 hover:text-white transition-colors self-start"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
