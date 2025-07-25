"use client";
import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Shader code
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

uniform vec2 uMouse;
uniform float uTime;
uniform float uGridSize;

varying vec2 vUv;

void main() {
  // Grid of plus signs
  vec2 gridUV = fract(vUv * uGridSize);
  vec2 centered = abs(gridUV - 0.5);

  float distToMouse = distance(vUv, uMouse);
  float shrink = mix(0.25, 0.05, smoothstep(0.0, 0.1, distToMouse));
  float thickness = 0.02;

  float h = smoothstep(thickness, 0.0, centered.y) * step(centered.x, shrink);
  float v = smoothstep(thickness, 0.0, centered.x) * step(centered.y, shrink);
  float plus = max(h, v);

  gl_FragColor = vec4(vec3(1.0) * plus, plus);
}
`;

export function Floor({
  size = [20, 20],
  position = [0, 0, 0],
  rotation = [-Math.PI / 2, 0, 0],
}) {
  const meshRef = useRef();
  const materialRef = useRef();
  const { camera } = useThree();

  // Memoize the uniforms to prevent unnecessary re-renders
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uGridSize: { value: 100.0 },
    }),
    []
  );

  // Update the shader uniforms on each frame
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    // Update uTime
    uniforms.uTime.value = state.clock.elapsedTime;

    // Raycast to get UV of the intersection point, if any
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(state.pointer, camera);
    const intersection = raycaster.intersectObject(meshRef.current);

    if (intersection.length > 0) {
      const uv = intersection[0].uv;
      if (uv) {
        uniforms.uMouse.value.set(uv.x, uv.y);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
