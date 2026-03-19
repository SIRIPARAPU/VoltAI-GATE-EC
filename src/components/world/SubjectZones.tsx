"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";

// ── Subject zone definitions ───────────────────────────────
const ZONES = [
  { id: "maths",           name: "Engineering Mathematics", pos: [0, 0, 0]    as [number,number,number] },
  { id: "aptitude",        name: "General Aptitude",        pos: [0, 0, 28]   as [number,number,number] },
  { id: "analog",          name: "Analog Circuits",         pos: [22, 0, 14]  as [number,number,number] },
  { id: "digital",         name: "Digital Circuits",        pos: [-22, 0, 14] as [number,number,number] },
  { id: "network-theory",  name: "Network Theory",          pos: [28, 0, -10] as [number,number,number] },
  { id: "edc",             name: "Electronic Devices",      pos: [-28, 0, -10]as [number,number,number] },
  { id: "communication",   name: "Communication Systems",   pos: [18, 0, -26] as [number,number,number] },
  { id: "control-systems", name: "Control Systems",         pos: [-18, 0, -26]as [number,number,number] },
  { id: "signals-systems", name: "Signals & Systems",       pos: [36, 0, 2]   as [number,number,number] },
  { id: "emft",            name: "Electromagnetics (EMFT)", pos: [-36, 0, 2]  as [number,number,number] },
];

// ── Individual Subject Structure ───────────────────────────
function SubjectZone({
  id, name, pos, index,
}: {
  id: string; name: string; pos: [number, number, number]; index: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const emissiveRef = useRef(0.2);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const { camera } = useThree();

  // Proximity glow
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const dist = camera.position.distanceTo(new THREE.Vector3(...pos));
    const proximity = THREE.MathUtils.clamp(1 - dist / 25, 0, 1);
    const pulse = 0.1 + 0.15 * Math.sin(clock.elapsedTime * 2 + index);
    emissiveRef.current = 0.15 + proximity * 0.6 + (hovered ? 0.4 : 0) + pulse;

    // Gentle hover levitation
    groupRef.current.position.y = pos[1] + (hovered ? 0.15 * Math.sin(clock.elapsedTime * 3) : 0);
  });

  const handleClick = () => {
    router.push(`/subject/${id}`);
  };

  const baseColor = useMemo(() => {
    const colors = [
      "#7c3aed", "#06b6d4", "#f59e0b", "#10b981",
      "#8b5cf6", "#ec4899", "#22d3ee", "#f97316",
      "#6366f1", "#14b8a6",
    ];
    return colors[index % colors.length];
  }, [index]);

  return (
    <group ref={groupRef} position={pos}>
      {/* Point light for zone */}
      <pointLight
        position={[0, 5, 0]}
        intensity={emissiveRef.current * 3}
        color={baseColor}
        distance={18}
        decay={2}
      />

      {/* Structure geometry — unique per subject */}
      {index === 0 && <ProcessorTower color={baseColor} emissive={emissiveRef} hovered={hovered} />}
      {index === 1 && <GatewayArch color={baseColor} emissive={emissiveRef} hovered={hovered} />}
      {index === 2 && <WaveformTerrain color={baseColor} emissive={emissiveRef} hovered={hovered} />}
      {index === 3 && <LogicGridCity color={baseColor} emissive={emissiveRef} hovered={hovered} />}
      {index === 4 && <NodeNetwork color={baseColor} emissive={emissiveRef} hovered={hovered} />}
      {index === 5 && <SemiconductorChamber color={baseColor} emissive={emissiveRef} hovered={hovered} />}
      {index === 6 && <AntennaTowers color={baseColor} emissive={emissiveRef} hovered={hovered} />}
      {index === 7 && <FeedbackRings color={baseColor} emissive={emissiveRef} hovered={hovered} />}
      {index === 8 && <SignalTunnel color={baseColor} emissive={emissiveRef} hovered={hovered} />}
      {index === 9 && <WaveField color={baseColor} emissive={emissiveRef} hovered={hovered} />}

      {/* Clickable hitbox */}
      <mesh
        position={[0, 3, 0]}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
      >
        <boxGeometry args={[6, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Floating label */}
      <Text
        position={[0, 8, 0]}
        fontSize={0.6}
        color={hovered ? "#ffffff" : "#c4b5fd"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {name}
      </Text>
      {hovered && (
        <Text
          position={[0, 7.2, 0]}
          fontSize={0.35}
          color="#67e8f9"
          anchorX="center"
          anchorY="middle"
        >
          Click to enter
        </Text>
      )}

      {/* Ground glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[3.5, 4.2, 32]} />
        <meshBasicMaterial color={baseColor} transparent opacity={hovered ? 0.4 : 0.15} />
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════
// 10 UNIQUE STRUCTURES
// ═══════════════════════════════════════════════════════════

type StructProps = { color: string; emissive: React.RefObject<number>; hovered: boolean };

// 1. Engineering Mathematics → Central Processor Tower
function ProcessorTower({ color, hovered }: StructProps) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.15;
  });
  return (
    <group ref={ref}>
      {/* Main tower */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[2, 6, 2]} />
        <meshStandardMaterial color="#0a0a0a" emissive={color} emissiveIntensity={hovered ? 0.8 : 0.3} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Top prism */}
      <mesh position={[0, 6.5, 0]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.8} />
      </mesh>
      {/* Base rings */}
      {[0.5, 1.2, 2].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.8 - i * 0.2, 0.08, 8, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// 2. Aptitude → Gateway Arch
function GatewayArch({ color, hovered }: StructProps) {
  return (
    <group>
      {/* Left pillar */}
      <mesh position={[-2, 2.5, 0]}>
        <boxGeometry args={[0.6, 5, 0.6]} />
        <meshStandardMaterial color="#111" emissive={color} emissiveIntensity={hovered ? 0.7 : 0.25} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Right pillar */}
      <mesh position={[2, 2.5, 0]}>
        <boxGeometry args={[0.6, 5, 0.6]} />
        <meshStandardMaterial color="#111" emissive={color} emissiveIntensity={hovered ? 0.7 : 0.25} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Arch top */}
      <mesh position={[0, 5.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[2, 0.25, 8, 16, Math.PI]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.9} />
      </mesh>
      {/* Portal glow */}
      <mesh position={[0, 2.5, 0]}>
        <planeGeometry args={[3.5, 4.5]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.15 : 0.05} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// 3. Analog Circuits → Waveform Terrain
function WaveformTerrain({ color, hovered }: StructProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry as THREE.PlaneGeometry;
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 1.5 + clock.elapsedTime * 2) * 0.5 + Math.cos(y * 1.2 + clock.elapsedTime) * 0.3);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.5, 0]}>
      <planeGeometry args={[8, 8, 24, 24]} />
      <meshStandardMaterial color="#0a0a0a" emissive={color} emissiveIntensity={hovered ? 0.7 : 0.3} wireframe side={THREE.DoubleSide} />
    </mesh>
  );
}

// 4. Digital Circuits → Logic Grid City
function LogicGridCity({ color, hovered }: StructProps) {
  const blocks = useMemo(() => {
    const b: Array<{ x: number; z: number; h: number }> = [];
    for (let gx = -2; gx <= 2; gx++) {
      for (let gz = -2; gz <= 2; gz++) {
        b.push({ x: gx * 1.2, z: gz * 1.2, h: 0.5 + Math.abs((gx + gz) % 4) * 0.8 });
      }
    }
    return b;
  }, []);
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const on = Math.sin(clock.elapsedTime * 2 + i * 0.5) > 0;
      mat.emissiveIntensity = on ? (hovered ? 0.9 : 0.5) : 0.05;
    });
  });
  return (
    <group ref={ref}>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[0.9, b.h, 0.9]} />
          <meshStandardMaterial color="#111" emissive={color} emissiveIntensity={0.3} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// 5. Network Theory → Interconnected Node Network
function NodeNetwork({ color, hovered }: StructProps) {
  const nodes = useMemo(() => {
    const n: [number, number, number][] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 2 + (i % 3);
      n.push([Math.cos(angle) * r, 1 + (i % 3) * 1.5, Math.sin(angle) * r]);
    }
    return n;
  }, []);
  const lines = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.6) {
          pts.push(new THREE.Vector3(...nodes[i]), new THREE.Vector3(...nodes[j]));
        }
      }
    }
    return pts;
  }, [nodes]);
  const lineGeom = useMemo(() => new THREE.BufferGeometry().setFromPoints(lines), [lines]);
  return (
    <group>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1 : 0.4} />
        </mesh>
      ))}
      <lineSegments geometry={lineGeom}>
        <lineBasicMaterial color={color} transparent opacity={hovered ? 0.7 : 0.3} />
      </lineSegments>
    </group>
  );
}

// 6. Electronic Devices → Semiconductor Chamber (layered slabs)
function SemiconductorChamber({ color, hovered }: StructProps) {
  return (
    <group>
      {[0, 1.2, 2.4, 3.6, 4.8].map((y, i) => (
        <mesh key={i} position={[0, y + 0.3, 0]}>
          <boxGeometry args={[4 - i * 0.4, 0.2, 4 - i * 0.4]} />
          <meshStandardMaterial
            color="#0a0a0a"
            emissive={color}
            emissiveIntensity={hovered ? 0.6 + i * 0.1 : 0.2 + i * 0.05}
            transparent
            opacity={0.85}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// 7. Communication Systems → Antenna Towers
function AntennaTowers({ color, hovered }: StructProps) {
  const ringsRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ringsRef.current) return;
    ringsRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const s = 1 + ((clock.elapsedTime * 0.5 + i * 0.3) % 2) * 2;
      child.scale.set(s, s, s);
      if (mesh.material) {
        (mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - s / 5);
      }
    });
  });
  return (
    <group>
      {/* Tower */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.1, 0.3, 7, 8]} />
        <meshStandardMaterial color="#222" emissive={color} emissiveIntensity={hovered ? 0.6 : 0.2} metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Antenna top */}
      <mesh position={[0, 7.2, 0]}>
        <coneGeometry args={[0.4, 0.8, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
      {/* Wave rings */}
      <group ref={ringsRef} position={[0, 6.5, 0]}>
        {[0, 1, 2].map(i => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.04, 8, 24]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// 8. Control Systems → Rotating Feedback Rings
function FeedbackRings({ color, hovered }: StructProps) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      child.rotation.x = clock.elapsedTime * (0.3 + i * 0.2);
      child.rotation.z = clock.elapsedTime * (0.2 + i * 0.15);
    });
  });
  return (
    <group ref={ref} position={[0, 3, 0]}>
      {[1.5, 2.2, 3].map((r, i) => (
        <mesh key={i}>
          <torusGeometry args={[r, 0.1, 8, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.8 : 0.35} transparent opacity={0.8 - i * 0.15} />
        </mesh>
      ))}
    </group>
  );
}

// 9. Signals & Systems → Signal Flow Tunnel
function SignalTunnel({ color, hovered }: StructProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.3 + 0.3 * Math.sin(clock.elapsedTime * 3);
  });
  return (
    <group>
      <mesh ref={ref} position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2, 2, 6, 16, 1, true]} />
        <meshStandardMaterial
          color="#0a0a0a"
          emissive={color}
          emissiveIntensity={0.3}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Inner glow core */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 1.5 : 0.6} />
      </mesh>
    </group>
  );
}

// 10. Electromagnetics → Wave Field (animated ripple)
function WaveField({ color, hovered }: StructProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry as THREE.PlaneGeometry;
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      pos.setZ(i, Math.sin(dist * 2 - clock.elapsedTime * 3) * 0.4 * Math.exp(-dist * 0.15));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
      <planeGeometry args={[10, 10, 32, 32]} />
      <meshStandardMaterial
        color="#050505"
        emissive={color}
        emissiveIntensity={hovered ? 0.7 : 0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════
export function SubjectZones() {
  return (
    <group>
      {ZONES.map((zone, i) => (
        <SubjectZone key={zone.id} id={zone.id} name={zone.name} pos={zone.pos} index={i} />
      ))}
    </group>
  );
}
