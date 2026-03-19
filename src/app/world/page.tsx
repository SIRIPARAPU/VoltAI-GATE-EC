"use client";

import { Canvas } from "@react-three/fiber";
import { WalkerControls } from "@/components/world/WalkerControls";
import { PCBTerrain } from "@/components/world/PCBTerrain";
import { SubjectZones } from "@/components/world/SubjectZones";
import { Atmosphere } from "@/components/world/Atmosphere";
import { HUD } from "@/components/world/HUD";

export default function WorldPage() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ fov: 70, near: 0.1, far: 200, position: [0, 2.5, 30] }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor("#020005");
          gl.toneMapping = 1; // ACESFilmicToneMapping
          gl.toneMappingExposure = 1.2;
        }}
      >
        <fog attach="fog" args={["#08001a", 15, 80]} />
        <Atmosphere />
        <PCBTerrain />
        <SubjectZones />
        <WalkerControls />
      </Canvas>
      <HUD />
    </div>
  );
}
