# Intelligent Traffic Management Platform

A high-performance, real-time smart city platform for urban traffic optimization.

## Features
- **Real-time Monitoring**: Neural object detection and lane segmentation.
- **Adaptive Signaling**: AI-driven signal cycles that minimize wait times.
- **Advanced Analytics**: Longitudinal telemetry and predictive congestion models.
- **Admin Console**: Secure node provisioning and infrastructure management.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Framer Motion, Socket.io-client.
- **Backend**: Node.js (Express), Socket.io, Firebase Admin SDK.
- **Database**: Google Cloud Firestore (Server-side persistence).
- **Secondary AI Service**: Python (FastAPI + YOLOv8).

## Demo Credentials
Access the admin portal with:
- **Email**: `admin@example.com`
- **Password**: `admin123`

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and configure:
- `JWT_SECRET`: Secret for signing tokens.
- `GEMINI_API_KEY`: For AI-enhanced reporting (optional).

### 2. Installation
```bash
npm install
```

### 3. Running the App
```bash
# Start development server (Node + Vite)
npm run dev
```

### 4. Python Service (Optional)
```bash
cd python_service
pip install -r requirements.txt
python main.py
```

## Security
- **JWT Auth**: Protected API routes for signal overrides and site management.
- **Firestore Rules**: Granular security rules for log integrity and user profiles.
