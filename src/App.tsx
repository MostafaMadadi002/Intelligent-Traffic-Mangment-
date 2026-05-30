import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import NotificationCenter from './components/NotificationCenter';
import Home from './pages/Home';
import TrafficMonitor from './pages/TrafficMonitor';
import SignalControl from './pages/SignalControl';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';

const ProtectedRoute = ({ children }: { children: any }) => {
  return children;
};

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30">
        <div className="mesh-bg" />
        <Navigation />
        <NotificationCenter />
        <main className="flex-1 md:ml-72 pt-20 pb-6 px-4 md:px-10 relative z-10 overflow-hidden">
          <Routes>
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route 
              path="/" 
              element={<Home />} 
            />
            <Route 
              path="/monitor" 
              element={<TrafficMonitor />} 
            />
            <Route 
              path="/signals" 
              element={<SignalControl />} 
            />
            <Route 
              path="/analytics" 
              element={<Analytics />} 
            />
            <Route 
              path="/admin" 
              element={<AdminPanel />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
