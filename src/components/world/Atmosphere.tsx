"use client";

import { Sparkles } from "@react-three/drei";

export function Atmosphere() {
  return (
    <>
      {/* Ambient fill */}
      <ambientLight intensity={0.15} color="#6366f1" />

      {/* Main directional (moonlight feel) */}
      <directionalLight
        position={[20, 40, 10]}
        intensity={0.3}
        color="#818cf8"
      />

      {/* Neon accent lights */}
      <pointLight position={[0, 8, 0]} intensity={2} color="#7c3aed" distance={40} decay={2} />
      <pointLight position={[30, 6, -20]} intensity={1.5} color="#06b6d4" distance={30} decay={2} />
      <pointLight position={[-30, 6, 20]} intensity={1.5} color="#a855f7" distance={30} decay={2} />
      <pointLight position={[20, 5, 30]} intensity={1} color="#22d3ee" distance={25} decay={2} />
      <pointLight position={[-20, 5, -30]} intensity={1} color="#8b5cf6" distance={25} decay={2} />

      {/* Floating energy particles */}
      <Sparkles
        count={300}
        scale={[120, 20, 120]}
        size={1.5}
        speed={0.3}
        opacity={0.4}
        color="#7c3aed"
      />
      <Sparkles
        count={150}
        scale={[80, 15, 80]}
        size={1}
        speed={0.5}
        opacity={0.3}
        color="#22d3ee"
      />
    </>
  );
}
