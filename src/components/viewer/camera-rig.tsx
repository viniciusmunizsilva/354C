"use client";

/* eslint-disable react-hooks/immutability --
 * This component intentionally drives the R3F camera. The camera is owned by
 * the Three.js renderer (an external system), not React state, so mutating it
 * from an effect is the idiomatic way to frame a model. */

import { useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export type ViewMode = "perspective" | "top";

interface CameraRigProps {
  object: THREE.Object3D;
  view: ViewMode;
  /** Increment to re-run framing (recenter button). */
  fitSignal: number;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

/**
 * Frames the camera to the model's bounding box, independent of the model's
 * original scale or origin, and re-frames on view change / recenter.
 */
export function CameraRig({
  object,
  view,
  fitSignal,
  controlsRef,
}: CameraRigProps) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  useEffect(() => {
    const controls = controlsRef.current;
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = Math.max(sphere.radius, 0.001);

    const fov = (camera.fov * Math.PI) / 180;
    const distance = (radius / Math.sin(fov / 2)) * 1.25;

    const dir =
      view === "top"
        ? new THREE.Vector3(0, 1, 0.0001)
        : new THREE.Vector3(1, 0.7, 1).normalize();

    camera.position.copy(center).addScaledVector(dir, distance);
    camera.near = Math.max(radius / 100, 0.01);
    camera.far = radius * 100;
    camera.updateProjectionMatrix();
    camera.lookAt(center);

    if (controls) {
      controls.target.copy(center);
      controls.minDistance = radius * 0.2;
      controls.maxDistance = radius * 20;
      controls.update();
    }
  }, [object, view, fitSignal, camera, controlsRef]);

  return null;
}
