"use client";

import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const SPEED = 8;
const MOUSE_SENSITIVITY = 0.002;
const DAMPING = 0.88;
const PLAYER_HEIGHT = 2.5;
const BOUNDARY = 60;

export function WalkerControls() {
  const { camera, gl } = useThree();

  const velocity = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const keys = useRef<Set<string>>(new Set());
  const isLocked = useRef(false);

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, PLAYER_HEIGHT, 30);
    euler.current.set(0, 0, 0);
  }, [camera]);

  // Pointer lock
  const lockPointer = useCallback(() => {
    gl.domElement.requestPointerLock();
  }, [gl]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("click", lockPointer);

    const onLockChange = () => {
      isLocked.current = document.pointerLockElement === canvas;
    };
    document.addEventListener("pointerlockchange", onLockChange);

    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked.current) return;
      euler.current.y -= e.movementX * MOUSE_SENSITIVITY;
      euler.current.x -= e.movementY * MOUSE_SENSITIVITY;
      euler.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, euler.current.x));
    };
    document.addEventListener("mousemove", onMouseMove);

    const onKeyDown = (e: KeyboardEvent) => keys.current.add(e.code);
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      canvas.removeEventListener("click", lockPointer);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [gl, lockPointer]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const k = keys.current;

    // Movement direction
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const accel = new THREE.Vector3();
    if (k.has("KeyW") || k.has("ArrowUp")) accel.add(forward);
    if (k.has("KeyS") || k.has("ArrowDown")) accel.sub(forward);
    if (k.has("KeyD") || k.has("ArrowRight")) accel.add(right);
    if (k.has("KeyA") || k.has("ArrowLeft")) accel.sub(right);

    if (accel.length() > 0) {
      accel.normalize().multiplyScalar(SPEED * dt);
      velocity.current.add(accel);
    }

    velocity.current.multiplyScalar(DAMPING);
    camera.position.add(velocity.current);

    // Clamp boundaries
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -BOUNDARY, BOUNDARY);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -BOUNDARY, BOUNDARY);
    camera.position.y = PLAYER_HEIGHT;

    // Apply rotation
    camera.quaternion.setFromEuler(euler.current);
  });

  return null;
}
