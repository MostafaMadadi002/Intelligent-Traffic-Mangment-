import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// --- In-Memory Data Storage ---
const db = {
  simulation: {
    pattern: 'normal' as 'normal' | 'rush_hour' | 'night' | 'accident',
    intensity: 1.0,
    isActive: true
  },
  cameras: [
    { 
      id: 'cam-1', 
      name: 'Main St & 5th Ave', 
      location: 'Downtown', 
      videoUrl: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s.mp4', 
      status: 'active', 
      createdAt: new Date(),
      streamMetadata: {
        bitrate: '4.5 Mbps',
        codec: 'H.264',
        resolution: '1920x1080',
        fps: 30
      }
    },
    { 
      id: 'cam-2', 
      name: 'West Blvd & Oak', 
      location: 'Suburb', 
      videoUrl: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s.mp4', 
      status: 'active', 
      createdAt: new Date(),
      streamMetadata: {
        bitrate: '2.8 Mbps',
        codec: 'H.264',
        resolution: '1280x720',
        fps: 24
      }
    },
  ],
  users: [
    { id: 'admin_seed', email: 'mostafamadadi.1382@gmail.com', role: 'admin', createdAt: new Date() }
  ],
  signals: {} as Record<string, any>,
  traffic_logs: [] as any[],
  signal_logs: [] as any[]
};

// Initialize signals for cameras
db.cameras.forEach(cam => {
  db.signals[cam.id] = { state: 'red', duration: 30, mode: 'auto', lastUpdate: new Date().toISOString() };
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_traffic_123';

app.use(express.json());
app.use(cors());

// Seed Initial Data (Now just a console log)
function seedData() {
  console.log('In-memory database initialized with initial seed data.');
}
seedData();

// --- Authentication Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Simulation Control
app.get('/api/simulation/status', (req, res) => {
  res.json(db.simulation);
});

app.post('/api/simulation/control', authenticateToken, (req, res) => {
  const { pattern, intensity, isActive } = req.body;
  
  if (pattern) db.simulation.pattern = pattern;
  if (intensity !== undefined) db.simulation.intensity = intensity;
  if (isActive !== undefined) db.simulation.isActive = isActive;
  
  io.emit('simulationUpdate', db.simulation);
  res.json({ message: 'Simulation parameters updated', current: db.simulation });
});

// Camera Stream Info
app.get('/api/cameras/:id/stream', (req, res) => {
  const camera = db.cameras.find(c => c.id === req.params.id);
  if (!camera) return res.status(404).json({ error: 'Camera not found' });
  
  res.json({
    streamUrl: camera.videoUrl,
    metadata: camera.streamMetadata,
    protocol: 'HLS/WebRTC',
    timestamp: new Date().toISOString()
  });
});

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Checking against in-memory users or hardcoded admin for demo
  if (email === 'admin@example.com' && password === 'admin123') {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET);
    return res.json({ token, user: { email, role: 'admin' } });
  }
  
  const user = db.users.find(u => u.email === email);
  if (user) {
    const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET);
    return res.json({ token, user: { email: user.email, role: user.role } });
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

// Cameras
app.get('/api/cameras', async (req, res) => {
  res.json(db.cameras);
});

app.post('/api/cameras', authenticateToken, async (req, res) => {
  const id = `cam-${Date.now()}`;
  const newCamera = { id, ...req.body, status: 'active', createdAt: new Date() };
  db.cameras.push(newCamera);
  // Initialize signal for the new camera
  db.signals[id] = { state: 'red', duration: 30, mode: 'auto', lastUpdate: new Date().toISOString() };
  res.status(201).json(newCamera);
});

app.delete('/api/cameras/:id', authenticateToken, async (req, res) => {
  db.cameras = db.cameras.filter(c => c.id !== req.params.id);
  delete db.signals[req.params.id];
  res.sendStatus(204);
});

// Signals
app.get('/api/signals', async (req, res) => {
  res.json(db.signals);
});

app.post('/api/signals/override', authenticateToken, async (req, res) => {
  const { cameraId, state, duration } = req.body;
  const update = { 
    state, 
    duration, 
    mode: 'manual',
    lastUpdate: new Date().toISOString() 
  };
  
  db.signals[cameraId] = { ...db.signals[cameraId], ...update };
  db.signal_logs.push({ cameraId, ...update, timestamp: new Date() });
  
  io.emit('signalUpdate', { cameraId, ...update });
  res.json(update);
});

// Analytics
app.get('/api/analytics', async (req, res) => {
  if (db.traffic_logs.length > 0) {
    const logs = db.traffic_logs.slice(-100);
    const data = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: logs.filter(l => new Date(l.timestamp).getHours() === i).length * 10 || Math.floor(Math.random() * 50)
    }));
    return res.json(data);
  }

  // Fallback mock
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const data = hours.map(h => ({
    hour: h,
    count: Math.floor(Math.random() * 500) + (h > 7 && h < 10 ? 400 : 0) + (h > 16 && h < 19 ? 350 : 0)
  }));
  res.json(data);
});

// AI Ingestion Endpoint (For Python service/Edge devices)
app.post('/api/detection/push', async (req, res) => {
  const { cameraId, vehicleCounts, density } = req.body;
  if (!cameraId || !vehicleCounts) {
    return res.status(400).json({ error: 'Missing required detection fields' });
  }

  const detectionData = {
    cameraId,
    timestamp: new Date(),
    vehicleCounts,
    density: density || 0
  };

  db.traffic_logs.push(detectionData);
  io.emit('trafficUpdate', { ...detectionData, timestamp: new Date().toISOString() });
  res.json({ status: 'telemetry_ingested' });
});

app.get('/api/reports/daily', (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=traffic_report.csv');
  const csv = "Hour,Camera,VehicleCount,Density%\n" + 
    Array.from({length: 10}, (_, i) => `${i},cam-1,${Math.floor(Math.random()*100)},${(Math.random()*80).toFixed(1)}`).join("\n");
  res.send(csv);
});

// --- Detailed logging middleware ---
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server Internal Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ 
    error: 'Internal Server Error', 
    details: err.message, 
    code: err.code 
  });
});

// --- Real-time Simulation Engine ---
setInterval(async () => {
  try {
    if (db.cameras.length === 0 || !db.simulation.isActive) return;
    
    const camera = db.cameras[Math.floor(Math.random() * db.cameras.length)];
    const cameraId = camera.id;
    
    // Pattern based density calculation
    let baseDensity = 30;
    if (db.simulation.pattern === 'rush_hour') baseDensity = 75;
    if (db.simulation.pattern === 'night') baseDensity = 5;
    if (db.simulation.pattern === 'accident') baseDensity = 90;
    
    const densityNoise = (Math.random() * 20) - 10;
    const finalDensity = Math.max(0, Math.min(100, (baseDensity + densityNoise) * db.simulation.intensity));

    const detectionData = {
      cameraId,
      timestamp: new Date(),
      vehicleCounts: {
        car: Math.floor((finalDensity / 5) * (Math.random() * 1.5)),
        motorcycle: Math.floor((finalDensity / 10) * (Math.random() * 1.5)),
        truck: Math.floor((finalDensity / 20) * (Math.random() * 1.5)),
        bus: Math.floor((finalDensity / 30) * (Math.random() * 1.5)),
      },
      density: Math.floor(finalDensity),
    };

    // Save In-Memory
    db.traffic_logs.push(detectionData);

    // Push to clients
    io.emit('trafficUpdate', { ...detectionData, timestamp: new Date().toISOString() });

    // Auto-adjust signal
    const signal = db.signals[cameraId] || { state: 'red', duration: 30, mode: 'auto' };

    if (signal && signal.mode === 'auto') {
      const density = detectionData.density;
      let newState = signal.state;
      let newDuration = signal.duration;

      if (density > 70) {
        newState = 'green';
        newDuration = 60;
      } else if (density < 20) {
        newDuration = 20;
      }

      if (newState !== signal.state || newDuration !== signal.duration) {
        const update = { state: newState, duration: newDuration, lastUpdate: new Date().toISOString() };
        db.signals[cameraId] = { ...db.signals[cameraId], ...update };
        db.signal_logs.push({ cameraId, ...update, timestamp: new Date() });
        io.emit('signalUpdate', { cameraId, ...update });
      }
    }
  } catch (err: any) {
    console.error('Simulation Error:', err);
  }
}, 8000);

// --- Vite Middleware & Static Assets ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Traffic Management Server running on port ${PORT}`);
  });
}

startServer();
