import { Suspense, useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture, MeshPortalMaterial, Float } from "@react-three/drei";
import * as THREE from "three";
import "./materials.js";

const MODEL = "/models/desk.glb";
const TEXTURES = [
  "/textures/desk/effect_house.png",
  "/textures/desk/react_logo.png",
  "/textures/desk/nextjs_logo.png",
  "/textures/desk/blender_badge.png",
];

/* The six parallax ridge layers behind the window, as data. */
const RIDGES = [
  { z: -1.8, y: 0, uFrequency: 15, uWave: 13, uOffset: 1, uHeight: 12, uShade: 0.8 },
  { z: -1.6, y: 0.08, uFrequency: 11, uWave: 5, uOffset: 1, uHeight: 12, uShade: 0.6 },
  { z: -1.3, y: 0.14, uFrequency: 6, uWave: 10, uOffset: 0.2, uHeight: 12, uShade: 0.4 },
  { z: -1.2, y: 0.08, uFrequency: 150, uWave: 140, uOffset: 0.2, uHeight: 13, uShade: 0.2 },
  { z: -1.1, y: 0.08, uFrequency: 112, uWave: 140, uOffset: 0.2, uHeight: 13, uShade: 0.1 },
];

function Portal() {
  return (
    <group rotation={[0, -0.1, 0]} position={[0.5, -0.1, 0]}>
      <mesh position={[-0.05, -0.1, -2]}>
        <planeGeometry args={[5, 5]} />
        <skyMaterial />
      </mesh>
      {RIDGES.map((r, i) => (
        <mesh key={i} position={[0, r.y, r.z]}>
          <planeGeometry args={[3, 2]} />
          <ridgeMaterial
            transparent
            uFrequency={r.uFrequency}
            uWave={r.uWave}
            uOffset={r.uOffset}
            uHeight={r.uHeight}
            uShade={r.uShade}
          />
        </mesh>
      ))}
      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 2, 3]} intensity={1} color="#ffeebb" />
    </group>
  );
}

function Sticker({ texture, position, rotation, size = [0.3, 0.3] }) {
  return (
    <Float speed={1} rotationIntensity={0.4} floatIntensity={0.4}>
      <mesh position={position} rotation={rotation}>
        <planeGeometry args={size} />
        <meshBasicMaterial transparent map={texture} alphaTest={0.5} />
      </mesh>
    </Float>
  );
}

function Desk() {
  const { nodes, materials } = useGLTF(MODEL);
  const [effectHouse, reactLogo, nextLogo, blenderBadge] = useTexture(TEXTURES);
  const { camera, size } = useThree();

  const root = useRef();
  const gravity = useRef();
  const screen = useRef();
  const bed = useRef();
  const arm = useRef();
  const head = useRef();

  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef({ current: 0, target: 0 });

  // Orthographic zoom tracks element width. 0.22 is the original site's factor.
  useEffect(() => {
    camera.zoom = size.width * 0.22;
    camera.updateProjectionMatrix();
  }, [size.width, camera]);

  // Scroll tilt, read passively and only stored — the value is applied in the
  // render loop, so scrolling never triggers layout work.
  useEffect(() => {
    const onScroll = () => {
      const p = window.scrollY / (document.body.scrollHeight - innerHeight || 1);
      scroll.current.target = (p - 0.5) * 0.3;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const k = 1 - Math.pow(0.001, delta); // frame-rate independent damping

    if (gravity.current) gravity.current.uTime = t;
    if (screen.current) screen.current.uTime = t;

    if (root.current) {
      pointer.current.x = THREE.MathUtils.lerp(
        pointer.current.x,
        state.pointer.x * 0.1,
        k,
      );
      pointer.current.y = THREE.MathUtils.lerp(
        pointer.current.y,
        -state.pointer.y * 0.05,
        k,
      );
      scroll.current.current = THREE.MathUtils.lerp(
        scroll.current.current,
        scroll.current.target,
        k * 0.6,
      );
      root.current.rotation.y = pointer.current.x;
      root.current.rotation.x = pointer.current.y + scroll.current.current;
    }

    if (bed.current) bed.current.position.z = Math.sin(t) * 0.1;
    if (arm.current) arm.current.position.y = 0.05 + Math.sin(t) * 0.08;
    if (head.current) head.current.position.x = 0.025 + Math.sin(t * 2) * 0.08;
  });

  const tableMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ad452b" }),
    [],
  );

  return (
    <group ref={root} position={[0, 0.17, 0]} scale={2} dispose={null}>
      <group position={[0, -0.2, 0]}>
        <Sticker
          texture={blenderBadge}
          position={[1.1, -0.3, -0.9]}
          rotation={[-Math.PI / 3, -0.2, -0.5]}
          size={[0.25, 0.25]}
        />
        <Sticker
          texture={effectHouse}
          position={[1, -0.3, 0]}
          rotation={[-Math.PI / 3, -0.2, 0]}
        />
        <Sticker
          texture={nextLogo}
          position={[-0.85, -0.3, -0.35]}
          rotation={[-Math.PI / 2.2, 0, 0]}
        />
        <Sticker
          texture={reactLogo}
          position={[-0.35, -0.3, -1.3]}
          rotation={[-Math.PI / 2.2, 0, 0]}
        />

        <mesh geometry={nodes.table.geometry} material={tableMaterial} />

        <mesh geometry={nodes.gravity_field.geometry}>
          <gravityMaterial
            ref={gravity}
            transparent
            depthWrite={false}
            alphaTest={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh geometry={nodes.window.geometry} position={[0, -0.15, 0]}>
          <MeshPortalMaterial>
            <Portal />
          </MeshPortalMaterial>
        </mesh>

        <group position={[0.2, 0.043, -0.116]} rotation={[0.434, -0.16, 0.074]}>
          <group position={[0, 0.01, 0]}>
            <mesh geometry={nodes.Cube005.geometry} material={materials.computer} />
            <mesh geometry={nodes.Cube005_1.geometry} material={materials.keys} />
            <mesh geometry={nodes.Cube005_2.geometry} material={materials.trackpad} />
          </group>
          <mesh
            geometry={nodes.screen.geometry}
            material={materials.computer}
            position={[0, 0.01, 0.002]}
          />
          <mesh position={[-0.002, 0.11, -0.155]} rotation={[-0.5, 0, 0]}>
            <planeGeometry args={[0.29, 0.21]} />
            <screenMaterial ref={screen} />
          </mesh>
        </group>

        <group position={[0.182, 0.02, 0.179]} rotation={[0.032, -0.147, 0.005]}>
          <mesh
            geometry={nodes.Tastatur_Tastatur_Untergrund_0.geometry}
            material={materials.body}
          />
          <mesh
            geometry={nodes.Tastatur_Tastatur_Untergrund_0_1.geometry}
            material={materials["keys_1.001"]}
          />
          <mesh
            geometry={nodes.Tastatur_Tastatur_Untergrund_0_2.geometry}
            material={materials.keys_2}
          />
          <mesh
            geometry={nodes.Tastatur_Tastatur_Untergrund_0_3.geometry}
            material={materials.keys_3}
          />
        </group>

        <group position={[0.532, 0.013, 0.207]} rotation={[0, -0.165, 0]}>
          <mesh geometry={nodes.Object_0003.geometry} material={materials.mouse_body} />
          <mesh geometry={nodes.Object_0003_1.geometry} material={materials.wheel} />
        </group>

        <group position={[-0.344, 0, 0]} rotation={[0, 0.223, 0]}>
          <group position={[0, 0.1, 0]} ref={arm}>
            <mesh
              geometry={nodes.Object_0010.geometry}
              material={materials["printer-arm"]}
            />
            <mesh
              geometry={nodes.Object_0010_1.geometry}
              material={materials["printer-bars"]}
            />
            <mesh
              ref={head}
              geometry={nodes.head.geometry}
              material={materials["printer-head"]}
            />
          </group>
          <mesh
            geometry={nodes.Object_0008.geometry}
            material={materials["printer-body"]}
          />
          <mesh
            geometry={nodes.Object_0008_1.geometry}
            material={materials["printer-screen"]}
          />
          <mesh
            geometry={nodes.Object_0008_2.geometry}
            material={materials["printer-bars"]}
          />
          <group ref={bed}>
            <mesh
              geometry={nodes.Object_0012_1.geometry}
              material={materials["printer-table"]}
            />
            <mesh
              geometry={nodes.Object_0012.geometry}
              material={materials["printer-body"]}
            />
          </group>
        </group>

        <group position={[0.479, 0.002, 0.033]} rotation={[0, 0.337, 0]}>
          {[
            "pi-base",
            "pi-silver",
            "pi-dark",
            "pi-light",
            "pi-mid",
            "pi-yellow",
          ].map((mat, i) => (
            <mesh
              key={mat}
              geometry={
                nodes[
                  `Raspberry_Pi_5_Reference_Model_V11${i ? `_${i}` : ""}`
                ].geometry
              }
              material={materials[mat]}
            />
          ))}
        </group>
      </group>
    </group>
  );
}

/* Sits inside <Suspense>, so it only mounts once the model and textures have
   resolved. useFrame then runs only while the loop is live, which means the
   callback fires on a frame that is genuinely being drawn — the cue to fade
   the canvas in. Waits for the second one so the first has actually painted. */
function Ready({ onReady }) {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current > 1) return;
    if (++frames.current > 1) onReady?.();
  });
  return null;
}

export default function DeskScene({ onReady }) {
  const [visible, setVisible] = useState(false);

  return (
    <Canvas
      orthographic
      // frameloop is driven manually so the GPU idles when off-screen.
      frameloop={visible ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ near: 0.1, far: 1000, position: [-1.8, 1.6, 3.5], rotation: [-0.42, -0.4, -0.1] }}
      gl={{ alpha: true, antialias: false, powerPreference: "default" }}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => {
        const io = new IntersectionObserver(
          ([e]) => setVisible(e.isIntersecting),
          { threshold: 0 },
        );
        io.observe(gl.domElement);
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          setVisible(false);
        });
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 10, 5]} intensity={3.2} />
      <Suspense fallback={null}>
        <Desk />
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL);
