import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Quaternion } from '../types';

// Fix for "Property does not exist on type JSX.IntrinsicElements"
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      gridHelper: any;
      group: any;
      mesh: any;
      coneGeometry: any;
      meshStandardMaterial: any;
    }
  }
}

// Augment React's internal JSX namespace as well (for React 18+ / strict configs)
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      gridHelper: any;
      group: any;
      mesh: any;
      coneGeometry: any;
      meshStandardMaterial: any;
    }
  }
}

interface VisualizerProps {
  base: Quaternion;
  transformed?: Quaternion; // The result after conjugation (Public Key)
  sharedA?: Quaternion;     // Alice's computed shared secret
  sharedB?: Quaternion;     // Bob's computed shared secret
}

const VectorArrow = ({ position, direction, color, label }: { position: [number, number, number], direction: [number, number, number], color: string, label: string }) => {
  const endPoint = new THREE.Vector3(
    position[0] + direction[0],
    position[1] + direction[1],
    position[2] + direction[2]
  );
  
  return (
    <group>
      <Line
        points={[position, [endPoint.x, endPoint.y, endPoint.z]]}
        color={color}
        lineWidth={3}
      />
      <mesh position={[endPoint.x, endPoint.y, endPoint.z]}>
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[endPoint.x, endPoint.y + 0.3, endPoint.z]}
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

const Scene = ({ base, transformed, sharedA, sharedB }: { base: Quaternion, transformed?: Quaternion, sharedA?: Quaternion, sharedB?: Quaternion }) => {
  // Normalize for visualization so they fit in the scene
  const normalize = (q: Quaternion): [number, number, number] => {
    const mag = Math.sqrt(q.x*q.x + q.y*q.y + q.z*q.z) || 1;
    const scale = 2; 
    return [(q.x / mag) * scale, (q.y / mag) * scale, (q.z / mag) * scale];
  };

  const baseVec = useMemo(() => normalize(base), [base]);
  const transVec = useMemo(() => transformed ? normalize(transformed) : null, [transformed]);
  const sharedAVec = useMemo(() => sharedA ? normalize(sharedA) : null, [sharedA]);
  const sharedBVec = useMemo(() => sharedB ? normalize(sharedB) : null, [sharedB]);

  // Axis lines
  const axisLength = 3;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <gridHelper args={[10, 10, 0x1e293b, 0x1e293b]} position={[0, -1, 0]} />
      
      {/* Axes */}
      <VectorArrow position={[0, 0, 0]} direction={[axisLength, 0, 0]} color="#ef4444" label="i" />
      <VectorArrow position={[0, 0, 0]} direction={[0, axisLength, 0]} color="#22c55e" label="j" />
      <VectorArrow position={[0, 0, 0]} direction={[0, 0, axisLength]} color="#3b82f6" label="k" />

      {/* Quaternions */}
      <VectorArrow position={[0, 0, 0]} direction={baseVec} color="#fbbf24" label="Base (G)" />
      
      {/* Only show public transformed vector if we are not yet showing shared secrets, or if desired to show all */}
      {transVec && !sharedAVec && (
        <VectorArrow position={[0, 0, 0]} direction={transVec} color="#10b981" label="Public (T)" />
      )}

      {sharedAVec && (
        <VectorArrow position={[0, 0, 0]} direction={sharedAVec} color="#ec4899" label="Shared A" />
      )}
      
      {sharedBVec && (
        <VectorArrow position={[0, 0, 0]} direction={sharedBVec} color="#3b82f6" label="Shared B" />
      )}

      {/* Origin Sphere */}
      <Sphere args={[0.1, 16, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial color="white" />
      </Sphere>
    </>
  );
};

export const Visualizer3D: React.FC<VisualizerProps> = (props) => {
  return (
    <div className="w-full h-[400px] bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800 relative">
      <Canvas camera={{ position: [4, 3, 5], fov: 50 }}>
        <Scene {...props} />
        <OrbitControls autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      <div className="absolute bottom-2 left-2 pointer-events-none bg-slate-900/80 p-2 rounded text-[10px] text-slate-400">
         <div className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-400 rounded-full"></div> Base G</div>
         {!props.sharedA && <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Public T</div>}
         {props.sharedA && <div className="flex items-center gap-1"><div className="w-2 h-2 bg-pink-500 rounded-full"></div> Shared A</div>}
         {props.sharedB && <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Shared B</div>}
      </div>
    </div>
  );
};