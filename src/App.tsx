import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import NotificationCenter from './components/NotificationCenter';
import Home from './pages/Home';
import TrafficMonitor from './pages/TrafficMonitor';
import SignalControl from './pages/SignalControl';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import { useEffect } from 'react';
import { LanguageProvider, useLanguage } from './locales/LanguageContext';

function AppContent() {
  const { language } = useLanguage();
  const isRtl = language === 'fa';

  return (
    <div className={`flex min-h-screen bg-[#020617] text-slate-200 ${isRtl ? 'font-farsi' : 'font-sans'} selection:bg-cyan-500/30`}>
      <div className="mesh-bg" />
      <Navigation />
      <NotificationCenter />
      <main className={`flex-1 ${isRtl ? 'md:mr-72' : 'md:ml-72'} pt-20 pb-6 px-4 md:px-10 relative z-10 overflow-hidden`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/monitor" element={<TrafficMonitor />} />
          <Route path="/signals" element={<SignalControl />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    console.log('[App] Core application mounted');
  }, []);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <AppContent />
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
