import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

const vertexPassthrough = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Animated stripe field around the desk. */
export const GravityMaterial = shaderMaterial(
  { uTime: 0, uColour: new THREE.Color("#aaaaff") },
  /* glsl */ `
    varying float vZ;
    void main() {
      vZ = position.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    precision lowp float;
    uniform float uTime;
    uniform vec3 uColour;
    varying float vZ;
    void main() {
      float pattern = step(0.6, mod((1.0 - vZ * 2.0) * 10.0 * vZ + uTime * 0.5, 1.0));
      gl_FragColor = vec4(uColour, pattern);
    }
  `,
);

/**
 * Laptop screen. The original ran full 3D Perlin noise per pixel; this uses
 * cheap 2D value noise for a near-identical look at a fraction of the cost.
 */
export const ScreenMaterial = shaderMaterial(
  { uTime: 0 },
  vertexPassthrough,
  /* glsl */ `
    precision lowp float;
    uniform float uTime;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    void main() {
      float n = noise(vUv * 3.0 + uTime * 0.1) * 2.0 - 1.0;
      float stepped = step(0.98, 1.0 - abs(n));
      vec4 a = vec4(1.0, 0.6, 0.4, 1.0);
      vec4 b = vec4(0.4, 0.2, 1.0, 1.0);
      gl_FragColor = mix(a, b, stepped + n);
    }
  `,
);

/** Gradient sky seen through the window portal. */
export const SkyMaterial = shaderMaterial(
  {},
  vertexPassthrough,
  /* glsl */ `
    precision lowp float;
    varying vec2 vUv;
    void main() {
      float circle = distance(vUv, vec2(0.5));
      float sun = mix(step(circle, 0.01), 1.0 - smoothstep(circle, 0.0, 0.01), 0.5);
      vec3 gradient = mix(
        vec3(0.0, 0.0, 0.3),
        vec3(1.0, 0.0, 1.0),
        (sin(vUv.y * 20.0) + 1.0) * 0.5
      );
      gl_FragColor = vec4(mix(gradient, vec3(1.0, 1.0, 0.0), sun), 1.0);
    }
  `,
);

/**
 * Ridge layers (mountains and trees) behind the window. One material drives
 * every layer via uniforms, instead of six near-identical inline shaders.
 */
export const RidgeMaterial = shaderMaterial(
  { uFrequency: 15.0, uWave: 13.0, uOffset: 1.0, uHeight: 12.0, uShade: 0.8 },
  vertexPassthrough,
  /* glsl */ `
    precision lowp float;
    uniform float uFrequency, uWave, uOffset, uHeight, uShade;
    varying vec2 vUv;
    void main() {
      float ridge = abs((0.0 - mod((vUv.x + uOffset) * uFrequency, 2.0)) + 1.0)
                  + ((vUv.y * 25.0) - uHeight + (sin(vUv.x * uWave) * 0.2));
      float stepped = step(ridge, 1.0);
      float depth = smoothstep(0.0, 0.2, distance(vUv, vec2(0.5)));
      vec3 colour = mix(vec3(0.4, 0.0, 0.4), vec3(0.05, 0.02, 0.05), depth) * uShade;
      gl_FragColor = vec4(colour, stepped);
    }
  `,
);

extend({ GravityMaterial, ScreenMaterial, SkyMaterial, RidgeMaterial });
