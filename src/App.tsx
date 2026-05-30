import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Navigation from './components/Navigation';
import NotificationCenter from './components/NotificationCenter';
import Home from './pages/Home';
import TrafficMonitor from './pages/TrafficMonitor';
import SignalControl from './pages/SignalControl';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';

const ProtectedRoute = ({ children }: { children: any }) => {
  // Authentication disabled per user request to allow direct access
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 1.01 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/monitor" 
            element={
              <ProtectedRoute>
                <TrafficMonitor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/signals" 
            element={
              <ProtectedRoute>
                <SignalControl />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30">
        <div className="mesh-bg" />
        <Navigation />
        <NotificationCenter />
        <main className="flex-1 md:ml-72 pt-20 pb-6 px-4 md:px-10 relative z-10 overflow-hidden">
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}
