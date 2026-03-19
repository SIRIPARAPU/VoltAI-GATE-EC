"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Generate circuit trace line segments
function generateCircuitPaths(): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const rng = (seed: number) => {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  };
  const rand = rng(42);

  // Main arteries
  for (let i = 0; i < 30; i++) {
    const startX = (rand() - 0.5) * 120;
    const startZ = (rand() - 0.5) * 120;
    let cx = startX;
    let cz = startZ;

    for (let seg = 0; seg < 8; seg++) {
      const nx = cx + (rand() > 0.5 ? 1 : -1) * (2 + rand() * 6);
      const nz = cz + (rand() > 0.5 ? 1 : -1) * (2 + rand() * 6);
      // Axis-aligned segments (PCB style)
      if (rand() > 0.5) {
        points.push(new THREE.Vector3(cx, 0.02, cz), new THREE.Vector3(nx, 0.02, cz));
        points.push(new THREE.Vector3(nx, 0.02, cz), new THREE.Vector3(nx, 0.02, nz));
      } else {
        points.push(new THREE.Vector3(cx, 0.02, cz), new THREE.Vector3(cx, 0.02, nz));
        points.push(new THREE.Vector3(cx, 0.02, nz), new THREE.Vector3(nx, 0.02, nz));
      }
      cx = nx;
      cz = nz;
    }
  }
  return points;
}

export function PCBTerrain() {
  const circuitRef = useRef<THREE.LineSegments>(null);
  const circuitPoints = useMemo(() => generateCircuitPaths(), []);

  const circuitGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(circuitPoints);
    return geom;
  }, [circuitPoints]);

  // Animate circuit glow
  useFrame(({ clock }) => {
    if (circuitRef.current) {
      const mat = circuitRef.current.material as THREE.LineBasicMaterial;
      const pulse = 0.6 + 0.4 * Math.sin(clock.elapsedTime * 1.5);
      mat.opacity = pulse;
    }
  });

  return (
    <group>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[140, 140, 64, 64]} />
        <meshStandardMaterial
          color="#050a05"
          roughness={0.9}
          metalness={0.3}
        />
      </mesh>

      {/* Subtle elevated panels */}
      {Array.from({ length: 40 }).map((_, i) => {
        const x = ((i * 7 + 13) % 120) - 60;
        const z = ((i * 11 + 29) % 120) - 60;
        const w = 2 + (i % 5) * 1.5;
        const h = 2 + (i % 4) * 1.2;
        return (
          <mesh key={`panel-${i}`} position={[x, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w, h]} />
            <meshStandardMaterial color="#0a140a" roughness={0.8} metalness={0.4} />
          </mesh>
        );
      })}

      {/* Grid lines */}
      <gridHelper
        args={[140, 70, "#0a2a0a", "#071507"]}
        position={[0, 0.01, 0]}
      />

      {/* Circuit trace lines */}
      <lineSegments ref={circuitRef} geometry={circuitGeom}>
        <lineBasicMaterial
          color="#00ffcc"
          transparent
          opacity={0.7}
          linewidth={1}
        />
      </lineSegments>

      {/* Secondary circuit traces (purple) */}
      <lineSegments geometry={circuitGeom} position={[5, 0, 3]} rotation={[0, Math.PI / 6, 0]}>
        <lineBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.3}
          linewidth={1}
        />
      </lineSegments>
    </group>
  );
}
