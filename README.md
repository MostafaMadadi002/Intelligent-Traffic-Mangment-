# TrafficFlow - Intelligent Urban Traffic Management System

TrafficFlow is a comprehensive smart-city solution designed to optimize urban traffic density and reduce intersection wait times. Developed as an advanced technical project, this system demonstrates the integration of real-time telemetry, computer vision simulation, and adaptive decision-making algorithms.

## 🚦 System Overview

The platform serves as a centralized "Traffic Operations Center" (TOC) that connects to edge-deployed cameras and sensors. It focuses on three core pillars:
1.  **Visibility**: Real-time monitoring of vehicle counts and lane density.
2.  **Adaptability**: Autonomous signal timing adjustments based on live traffic weight.
3.  **Analytics**: Long-term data aggregation to identify congestion patterns.

---

## ✨ Key Features

### 1. Real-time Detection & Monitoring
The system ingests high-frequency telemetry from camera nodes. 
- **Object Classification**: Tracks counts for cars, trucks, motorcycles, and buses.
- **Density Calculation**: Computes a "Traffic Weight" (0-100) used to determine congestion severity.
- **Live Video Integration**: Simulates H.264 streams to provide operators with visual verification.

### 2. Adaptive Signal Control (AI-Driven)
The core of the system is the **Adaptive Logic Engine**:
- **Auto-Timing**: The system automatically extends "Green" phases for high-density lanes and shortens wait times for empty roads.
- **Smooth Transitions**: Utilizes `framer-motion` for hardware-accelerated fade transitions and pulsing effects on the signal lights, ensuring clear phase identification for operators.
- **Manual Overrides**: Authorized admin users can instantly force signal states (Red/Yellow/Green) during emergencies.

### 3. Analytics & Visualization
- **Hourly Trends**: A dynamic charting module visualizing traffic throughput over a 24-hour cycle.
- **Density Heatmaps**: Highlights peak congestion times and vulnerable intersections.
- **Deployment Metrics**: Real-time status tracking of all active camera nodes across the suburb and downtown sectors.

### 4. Enterprise-Grade Security & UI
- **JWT Authentication**: Secure login flow for traffic engineers and system admins.
- **Responsive "Glass-Dark" UI**: A polished, modern interface with glassmorphism effects, optimized for both desktop command centers and mobile field access.
- **Socket.io Integration**: Zero-latency synchronization across all connected clients for signal state changes and telemetry updates.

---

## 🛠 Technical Architecture

- **Frontend**: React 19, TypeScript, **Vite**, **Tailwind CSS**.
- **Animations**: **Framer Motion** (Spring-physics transitions and active-phase pulsing).
- **Backend**: **Node.js (Express)** with strict TypeScript typing.
- **Real-time**: **Socket.io** for bi-directional state synchronization.
- **State Engine**: High-performance In-Memory database for ultra-low latency response during internship/prototype demonstration.
- **Icons**: **Lucide React**.

---

## 🚀 How It Works

1.  **Ingestion**: A camera node POSTs telemetry data to `/api/telemetry`.
2.  **Processing**: The server updates the in-memory state and broadcasts the new density to the frontend via WebSockets.
3.  **Decision**: The Adaptive Engine evaluates if the current signal phase matches the traffic weight (e.g., if density > 70, transition to Green).
4.  **Feedback**: The `SignalControl` component reflects the state change with smooth, interpolated animations.

---

## 👨‍💻 Internship Focus
This project demonstrates proficiency in:
- Full-stack TypeScript architecture.
- Designing low-latency WebSocket communication protocols.
- Creating high-fidelity, responsive User Interfaces with complex state management.
- Implementing rule-based decision algorithms for IoT applications.
