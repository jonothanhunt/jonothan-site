"use client";
import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, extend, useThree, useLoader } from "@react-three/fiber";
import {
  useGLTF,
  shaderMaterial,
  MeshPortalMaterial,
  Sky,
  Grid,
  Float,
} from "@react-three/drei";
// import glsl from "babel-plugin-glsl/macro";
import * as THREE from "three";
// import { useLightMode } from "../context/LightModeContext";

export function Model(props) {
  // const isLightMode = useLightMode();
  const sceneRef = useRef();
  const portalRefForeground = useRef();
  const portalRefBackground = useRef();
  const { nodes, materials } = useGLTF("/desk.glb");
  const gravityRef = useRef();
  const { mouse } = useThree();
  const smoothMouseX = useRef(0);
  const smoothMouseY = useRef(0);
  const printerBedRef = useRef();
  const printerArmRef = useRef();
  const printerHeadRef = useRef();
  const screenRef = useRef();

  const startTime = useMemo(() => Date.now(), []);

  const grid = {
    cellSize: 0.5,
    cellThickness: 1.2,
    cellColor: "#6f6f6f",
    sectionSize: 1,
    sectionThickness: 1.2,
    sectionColor: "#9d4b4b",
    fadeDistance: 50,
    fadeStrength: 1,
    followCamera: true,
    infiniteGrid: true,
  };

  const GravityMaterial = shaderMaterial(
    {
      uTime: 0,
      uColour: new THREE.Color("#aaaaff"),
    },
    `
        varying float vZ;
    
        void main() {
            vZ = position.y; // Pass Z position to the fragment shader
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
    `
        precision lowp float;
        uniform float uTime;
        uniform vec3 uColour;
        varying float vZ;
    
    
        void main() {
            float frequency = 10.0;
            float speed = 0.5;
    
            // Moving pattern along Z axis using uTime for animation
            float pattern = step(0.6, mod((1.0 - vZ * 2.0) * frequency * vZ + uTime * speed, 1.0));
    
            gl_FragColor = vec4(uColour, pattern);
        }
      `
  );
  extend({ GravityMaterial });

  const ScreenMaterial = shaderMaterial(
    {
      uTime: 0,
      uIntensity: 0.1,
    },
    `
        precision lowp float;
    
        varying vec2 vUv;
    
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUv = uv;
        }
    
        `,
    `
        uniform float uIntensity;
        uniform float uTime;
    
        varying vec2 vUv;
        varying float vDisplacement;
    
        // Classic Perlin 3D Noise 
        // by Stefan Gustavson
        //
        vec4 permute(vec4 x) {
            return mod(((x*34.0)+1.0)*x, 289.0);
        }
    
        vec4 taylorInvSqrt(vec4 r) {
            return 1.79284291400159 - 0.85373472095314 * r;
        }
    
        vec3 fade(vec3 t) {
            return t*t*t*(t*(t*6.0-15.0)+10.0);
        }
    
        float cnoise(vec3 P) {
            vec3 Pi0 = floor(P); // Integer part for indexing
            vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
            Pi0 = mod(Pi0, 289.0);
            Pi1 = mod(Pi1, 289.0);
            vec3 Pf0 = fract(P); // Fractional part for interpolation
            vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.yy, Pi1.yy);
            vec4 iz0 = Pi0.zzzz;
            vec4 iz1 = Pi1.zzzz;
    
            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);
    
            vec4 gx0 = ixy0 / 7.0;
            vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);
    
            vec4 gx1 = ixy1 / 7.0;
            vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
            gx1 = fract(gx1);
            vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
            vec4 sz1 = step(gz1, vec4(0.0));
            gx1 -= sz1 * (step(0.0, gx1) - 0.5);
            gy1 -= sz1 * (step(0.0, gy1) - 0.5);
    
            vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
            vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
            vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
            vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
            vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
            vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
            vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
            vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
    
            vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
            g000 *= norm0.x;
            g010 *= norm0.y;
            g100 *= norm0.z;
            g110 *= norm0.w;
            vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
            g001 *= norm1.x;
            g011 *= norm1.y;
            g101 *= norm1.z;
            g111 *= norm1.w;
    
            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
            float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
            float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
            float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
            float n111 = dot(g111, Pf1);
    
            vec3 fade_xyz = fade(Pf0);
            vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
            vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
            float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
            return 2.2 * n_xyz;
        }
    
        // End of Perlin Noise Code
    
      void main() {
        float strength = cnoise(vec3(vUv * 3.0,uTime * 0.1));
        float line = 1.0 -distance(strength, 0.0);
        float stepped = step(0.98, line);
    
        vec4 color1 = vec4(1.0, .6, .4, 1.0);
        vec4 color2 = vec4(.4, .2, 1.0, 1.0);
    
        gl_FragColor = mix(color1, color2, (stepped + strength));
      }
    
        `
  );
  extend({ ScreenMaterial });

  const getColorForTimeOfDay = (timeInSeconds) => {
    // Time-based transition
    const dayDuration = 60 * 60; // Assume 1 hour for a full cycle (for demonstration)
    const timeInDay = timeInSeconds % dayDuration;
    const progress = timeInDay / dayDuration; // 0 to 1

    const colorStart = new THREE.Color(1.0, 1.0, 1.0); // white
    const colorEnd = new THREE.Color(0.2, 0.0, 0.5); // dark purple

    return colorStart.lerp(colorEnd, progress);
  };

  const { viewport } = useThree();

  const baseScale = 2;

  useFrame((state, delta) => {
    const time = (Date.now() - startTime) / 1000;

    // GRAVITY
    if (gravityRef.current) {
      gravityRef.current.uTime = time; // Increment uTime smoothly
    }

    // SCREEN
    if (screenRef.current) {
      screenRef.current.uTime = time; // Increment uTime smoothly
    }

    // BACKGROUND
    const color = getColorForTimeOfDay(time);
    if (portalRefBackground.current) {
      portalRefBackground.current.material.color.set(color);
      portalRefBackground.current.material.needsUpdate = true;
    }
    if (portalRefForeground.current) {
      portalRefForeground.current.material.color.set(color);
      portalRefForeground.current.material.needsUpdate = true;
    }

    // MOUSE MOVEMENT + SCALING
    if (sceneRef.current) {
      smoothMouseX.current = THREE.MathUtils.lerp(
        smoothMouseX.current,
        mouse.x * 0.1,
        0.08
      );
      smoothMouseY.current = THREE.MathUtils.lerp(
        smoothMouseY.current,
        -mouse.y * 0.05,
        0.08
      );
      sceneRef.current.rotation.y = smoothMouseX.current;
      sceneRef.current.rotation.x = smoothMouseY.current;

      const responsiveScale = Math.min(viewport.width / 4, 0.5) * baseScale;

      sceneRef.current.scale.set(
        responsiveScale,
        responsiveScale,
        responsiveScale
      );
    }
    // // 3D PRINTER
    if (printerBedRef.current) {
      printerBedRef.current.position.z = Math.sin(time) * 0.1;
    }
    if (printerArmRef.current) {
      printerArmRef.current.position.y = 0.05 + Math.sin(time) * 0.08;
    }
    if (printerHeadRef.current) {
      printerHeadRef.current.position.x = 0.025 + Math.sin(time * 2) * 0.08;
    }
  });

  const outsideLayerBackgroundTexture = useLoader(
    THREE.TextureLoader,
    "/images/outside_layer_background.png"
  );

  const outsideLayerForgroundTexture = useLoader(
    THREE.TextureLoader,
    "/images/outside_layer_foreground.png"
  );

  const effectHouseStickerTexture = useLoader(
    THREE.TextureLoader,
    "/images/effect_house.png"
  );
  const reactStickerTexture = useLoader(
    THREE.TextureLoader,
    "/images/react_logo.png"
  );
  const nextjsStickerTexture = useLoader(
    THREE.TextureLoader,
    "/images/nextjs_logo.png"
  );
  const threeStickerTexture = useLoader(
    THREE.TextureLoader,
    "/images/three_logo.png"
  );
  const touchDesignerStickerTexture = useLoader(
    THREE.TextureLoader,
    "/images/touchdesigner_logo.png"
  );
  const blenderHouseStickerTexture = useLoader(
    THREE.TextureLoader,
    "/images/blender_badge.png"
  );

  return (
    <group ref={sceneRef} {...props} position={[0,0.17,0]} dispose={null}>
      <group position={[0, -0.2, 0]}>
        <Grid {...grid} position={[0, -0.5, 0]} />

        <Float speed={1} rotationIntensity={0.4} floatIntensity={0.4}>
          <mesh
            position={[1.1, -0.3, -0.9]}
            rotation={[-Math.PI / 3, -0.2, -0.5]}
          >
            <planeGeometry args={[0.25, 0.25]} />
            <meshBasicMaterial
              transparent
              map={blenderHouseStickerTexture}
              alphaTest={0.5}
            />
          </mesh>
        </Float>

        <Float speed={1} rotationIntensity={0.4} floatIntensity={0.4}>
          <mesh position={[1, -0.3, 0]} rotation={[-Math.PI / 3, -0.2, 0]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial
              transparent
              map={effectHouseStickerTexture}
              alphaTest={0.5}
            />
          </mesh>
        </Float>

        <Float speed={1} rotationIntensity={0.4} floatIntensity={0.4}>
          <mesh
            position={[0.3, -0.3, 0.5]}
            rotation={[-Math.PI / 3, -0.2, 0.8]}
          >
            <planeGeometry args={[0.26, 0.26]} />
            <meshBasicMaterial
              transparent
              map={touchDesignerStickerTexture}
              alphaTest={0.5}
            />
          </mesh>
        </Float>

        <Float speed={1} rotationIntensity={0.4} floatIntensity={0.4}>
          <mesh position={[-0.6, -0.3, 0.5]} rotation={[-Math.PI / 2.2, 0, 0]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial
              transparent
              map={reactStickerTexture}
              alphaTest={0.5}
            />
          </mesh>
        </Float>

        <Float speed={1} rotationIntensity={1} floatIntensity={0.4}>
          <mesh position={[-1.2, -0.3, -0.1]} rotation={[-Math.PI / 2.2, 0, 0]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial
              transparent
              map={nextjsStickerTexture}
              alphaTest={0.5}
            />
          </mesh>
        </Float>

        <Float speed={1} rotationIntensity={1} floatIntensity={0.4}>
          <mesh position={[-0.6, -0.3, -0.8]} rotation={[-Math.PI / 2.2, 0, 0]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial
              transparent
              map={threeStickerTexture}
              alphaTest={0.5}
            />
          </mesh>
        </Float>

        <mesh name="table" geometry={nodes.table.geometry}>
          <meshStandardMaterial color="#f06947" />
        </mesh>

        <mesh name="gravity_field" geometry={nodes.gravity_field.geometry}>
          <gravityMaterial
            transparent
            depthWrite={false}
            alphaTest={0.5}
            side={THREE.DoubleSide}
            ref={gravityRef}
          />
        </mesh>
        <mesh
          name="window"
          geometry={nodes.window.geometry}
          material={materials.window}
          position={[0, -0.15, 0]}
        >
          <MeshPortalMaterial>
            <group rotation={[0, -0.25, 0]} position={[0, 0.3, 0]}>
              <mesh position={[0, -0.5, -2.5]} ref={portalRefBackground}>
                <planeGeometry args={[2, 1.2, 32, 32]} />
                {/* the colour to fade from white to dark purple depending on time of the day */}
                <meshBasicMaterial
                  map={outsideLayerBackgroundTexture}
                  alphaTest={0.2}
                />
              </mesh>
              <mesh position={[0, -0.15, -1.5]} ref={portalRefForeground}>
                <planeGeometry args={[1.5, 1, 32, 32]} />
                {/* the colour to fade from white to dark purple depending on time of the day */}
                <meshBasicMaterial
                  map={outsideLayerForgroundTexture}
                  alphaTest={0.5}
                />
              </mesh>
            </group>
            <Sky />
          </MeshPortalMaterial>
        </mesh>
        <group
          name="laptop"
          position={[0.2, 0.043, -0.116]}
          rotation={[0.434, -0.16, 0.074]}
        >
          <group name="laptop_body" position={[0, 0.01, 0]}>
            <mesh
              name="Cube005"
              castShadow
              receiveShadow
              geometry={nodes.Cube005.geometry}
              material={materials.computer}
            />
            <mesh
              name="Cube005_1"
              castShadow
              receiveShadow
              geometry={nodes.Cube005_1.geometry}
              material={materials.keys}
            />
            <mesh
              name="Cube005_2"
              castShadow
              receiveShadow
              geometry={nodes.Cube005_2.geometry}
              material={materials.trackpad}
            />
          </group>
          <group>
            <mesh
              name="screen"
              castShadow
              receiveShadow
              geometry={nodes.screen.geometry}
              material={materials.computer}
              position={[0, 0.01, 0.002]}
            />
            <mesh position={[-0.002, 0.11, -0.155]} rotation={[-0.5, 0, 0]}>
              <planeGeometry args={[0.29, 0.21, 32, 32]} />
              <screenMaterial ref={screenRef} />
            </mesh>
          </group>
        </group>
        <group
          name="keyboard_2"
          position={[0.182, 0.02, 0.179]}
          rotation={[0.032, -0.147, 0.005]}
        >
          <mesh
            name="Tastatur_Tastatur_Untergrund_0"
            geometry={nodes.Tastatur_Tastatur_Untergrund_0.geometry}
            material={materials.body}
          />
          <mesh
            name="Tastatur_Tastatur_Untergrund_0_1"
            geometry={nodes.Tastatur_Tastatur_Untergrund_0_1.geometry}
            material={materials["keys_1.001"]}
          />
          <mesh
            name="Tastatur_Tastatur_Untergrund_0_2"
            geometry={nodes.Tastatur_Tastatur_Untergrund_0_2.geometry}
            material={materials.keys_2}
          />
          <mesh
            name="Tastatur_Tastatur_Untergrund_0_3"
            geometry={nodes.Tastatur_Tastatur_Untergrund_0_3.geometry}
            material={materials.keys_3}
          />
        </group>
        <group
          name="mouse"
          position={[0.532, 0.013, 0.207]}
          rotation={[0, -0.165, 0]}
        >
          <mesh
            name="Object_0003"
            geometry={nodes.Object_0003.geometry}
            material={materials.mouse_body}
          />
          <mesh
            name="Object_0003_1"
            geometry={nodes.Object_0003_1.geometry}
            material={materials.wheel}
          />
        </group>
        <group
          name="printer"
          position={[-0.344, 0, 0]}
          rotation={[0, 0.223, 0]}
        >
          {/* ARM */}
          <group position={[0, 0.1, 0]} ref={printerArmRef}>
            <mesh
              name="Object_0010"
              geometry={nodes.Object_0010.geometry}
              material={materials["printer-arm"]}
            />
            <mesh
              name="Object_0010_1"
              geometry={nodes.Object_0010_1.geometry}
              material={materials["printer-bars"]}
            />
            <mesh
              position={[0, 0, 0]}
              ref={printerHeadRef}
              name="head"
              geometry={nodes.head.geometry}
              material={materials["printer-head"]}
            />
          </group>
          <mesh
            name="Object_0008"
            geometry={nodes.Object_0008.geometry}
            material={materials["printer-body"]}
          />
          <mesh
            name="Object_0008_1"
            geometry={nodes.Object_0008_1.geometry}
            material={materials["printer-screen"]}
          />
          <mesh
            name="Object_0008_2"
            geometry={nodes.Object_0008_2.geometry}
            material={materials["printer-bars"]}
          />
          <group ref={printerBedRef}>
            <mesh
              name="Object_0012_1"
              geometry={nodes.Object_0012_1.geometry}
              material={materials["printer-table"]}
            />
            <mesh
              name="Object_0012"
              geometry={nodes.Object_0012.geometry}
              material={materials["printer-body"]}
            />
          </group>
        </group>
        <group
          name="pi"
          position={[0.479, 0.002, 0.033]}
          rotation={[0, 0.337, 0]}
        >
          <mesh
            name="Raspberry_Pi_5_Reference_Model_V11"
            geometry={nodes.Raspberry_Pi_5_Reference_Model_V11.geometry}
            material={materials["pi-base"]}
          />
          <mesh
            name="Raspberry_Pi_5_Reference_Model_V11_1"
            geometry={nodes.Raspberry_Pi_5_Reference_Model_V11_1.geometry}
            material={materials["pi-silver"]}
          />
          <mesh
            name="Raspberry_Pi_5_Reference_Model_V11_2"
            geometry={nodes.Raspberry_Pi_5_Reference_Model_V11_2.geometry}
            material={materials["pi-dark"]}
          />
          <mesh
            name="Raspberry_Pi_5_Reference_Model_V11_3"
            geometry={nodes.Raspberry_Pi_5_Reference_Model_V11_3.geometry}
            material={materials["pi-light"]}
          />
          <mesh
            name="Raspberry_Pi_5_Reference_Model_V11_4"
            geometry={nodes.Raspberry_Pi_5_Reference_Model_V11_4.geometry}
            material={materials["pi-mid"]}
          />
          <mesh
            name="Raspberry_Pi_5_Reference_Model_V11_5"
            geometry={nodes.Raspberry_Pi_5_Reference_Model_V11_5.geometry}
            material={materials["pi-yellow"]}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/desk.glb");

export default Model;
