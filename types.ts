export interface Quaternion {
  w: number;
  x: number;
  y: number;
  z: number;
}

export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  SIMULATION = 'SIMULATION',
  VISUALIZER = 'VISUALIZER',
  AI_LAB = 'AI_LAB'
}

export interface SimulationState {
  modulus: number;
  baseP: Quaternion;
  aliceSecret: Quaternion;
  bobSecret: Quaternion;
  alicePublic: Quaternion | null; // A P A^-1
  bobPublic: Quaternion | null;   // B P B^-1
  sharedSecretA: Quaternion | null;
  sharedSecretB: Quaternion | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
