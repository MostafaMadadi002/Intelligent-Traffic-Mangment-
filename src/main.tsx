import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Force bypass authentication at the earliest possible entry point
if (typeof window !== 'undefined') {
  try {
    if (!localStorage.getItem('traffic_token')) {
      localStorage.setItem('traffic_token', 'bypass-active');
      localStorage.setItem('traffic_user', JSON.stringify({ 
        name: 'System Administrator', 
        email: 'admin@cluster.io', 
        role: 'admin' 
      }));
    }
  } catch (e) {
    console.warn('LocalStorage initialization failed', e);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
