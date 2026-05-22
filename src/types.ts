/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VehicleCounts {
  car: number;
  motorcycle: number;
  truck: number;
  bus: number;
  [key: string]: number;
}

export type CongestionLevel = 'low' | 'medium' | 'high';
export type SignalState = 'red' | 'yellow' | 'green';
export type ControlMode = 'auto' | 'manual';

export interface Camera {
  id: string;
  name: string;
  location: string;
  videoUrl: string;
  status: 'active' | 'inactive';
}

export interface TrafficData {
  cameraId: string;
  timestamp: string;
  vehicleCounts: VehicleCounts;
  density: number;
  congestionLevel: CongestionLevel;
}

export interface SignalData {
  cameraId: string;
  timestamp: string;
  state: SignalState;
  duration: number;
  mode: ControlMode;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'operator';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
