import { Suspense, useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  MeshPortalMaterial,
  Float,
} from "@react-three/drei";
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

function Desk({ atRest }) {
  const { nodes, materials } = useGLTF(MODEL);
  const [effectHouse, reactLogo, nextLogo, blenderBadge] = useTexture(TEXTURES);
  const { camera, size, gl } = useThree();

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

  /* Scroll tilt, from the desk's own travel through the viewport.
     
     This used to be progress through the whole document — scrollY over the
     body's scrollable height — which meant the tilt was set by where the page
     was rather than by where the desk was. Scrolling anywhere at all, long
     after the desk had gone by, kept driving it, and whatever angle the
     document happened to be at when the desk came into view was the angle it
     held. Scrolling up and down a couple of times could leave it near the end
     of its range and keep it there.

     Now zero is the desk centred in the viewport and the ±0.15 ends are it
     entering and leaving, so the tilt is bounded by the desk's own passage,
     always returns through centre, and agrees with the neutral pose the rest
     snap uses.

     Still no layout work on scroll: the element's page position is measured
     once and re-measured only when something could actually have moved it. */
  useEffect(() => {
    const el = gl.domElement;
    let top = 0;
    let height = 0;
    const measure = () => {
      const r = el.getBoundingClientRect();
      top = r.top + window.scrollY;
      height = r.height;
    };
    const onScroll = () => {
      const centre = top + height / 2 - window.scrollY;
      const p = THREE.MathUtils.clamp(centre / (window.innerHeight || 1), 0, 1);
      scroll.current.target = (0.5 - p) * 0.3;
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
    // size is in here so the measurement is retaken whenever the canvas
    // itself changes shape, which is the other way the desk can move.
  }, [gl, size.width, size.height]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const k = 1 - Math.pow(0.001, delta); // frame-rate independent damping

    if (gravity.current) gravity.current.uTime = t;
    if (screen.current) screen.current.uTime = t;

    if (root.current) {
      /* Going to rest, rather than tracking. This runs on the one frame drawn
         as the desk leaves the viewport — see the observer in DeskScene — so
         it snaps rather than eases: there is no second frame to ease on. What
         it snaps to is the pose the desk would hold with the pointer in the
         middle of it and the page at half scroll, which is the one neutral
         position it has. */
      if (atRest.current) {
        pointer.current.x = 0;
        pointer.current.y = 0;
        scroll.current.current = 0;
        root.current.rotation.set(0, 0, 0);
      } else {
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
    <group ref={root} position={[0, 0.12, 0]} scale={2} dispose={null}>
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

/* ============================================================
   The retro pass

   The desk drawn the way a machine that couldn't afford to draw it properly
   would have: sampled onto a coarse grid with no filtering between the cells,
   and every channel crushed to a handful of levels so the shading bands
   instead of graduating.

   Both halves matter and they are separate settings. PIXEL_SCALE is the grid,
   as a fraction of the element — 0.62 puts roughly 450 cells across the panel
   the desk occupies, a little finer than a VGA screen and still obviously a
   grid.

   LEVELS is the colour depth, and it is four a channel — 64 colours — because
   the pass now dithers on the way down. Four was tried before without a dither
   and had to be abandoned at six: the view through the window is five ridge
   planes separated only by value, the shadows had a single step between them,
   and every layer below the sun quantised to the same black. An ordered dither
   is the answer to exactly that. A value between two levels comes out as a mix
   of both instead of snapping to one, so the ridges keep their separation on a
   palette a third the size, and the desk's own surfaces band harder than they
   did at six.

   Deliberately *not* dithered. Ordered dithering is the site's house treatment
   and it is the natural thing to reach for here, but dithering exists to hide
   banding and banding is what we're after — a Bayer pattern would trade the
   steps for noise and lose the era.

   ## Why the grid is in the shader and not in the framebuffer

   The obvious implementation is to render the scene into a small target and
   blow it up through a NearestFilter, and that is what this did first. It
   renders the same picture and costs a sixth of the fill — but it puts the
   window's portal out of action, and the reason is worth keeping.

   `MeshPortalMaterial` does not sample its texture through the mesh's own UVs.
   The portal is a full-screen render of another scene, and the window samples
   it by *screen position* — `gl_FragCoord` over the canvas resolution it was
   given when it mounted. Render the main scene into a target a sixth of the
   size and every fragment's `gl_FragCoord` is in that smaller space, so the
   window reads the bottom-left sixth of its own texture, which is empty. The
   window came out black and nothing about it looked like a sampling problem.

   So the scene is rendered at full size, where screen space is what the portal
   expects, and the grid is applied when the result is drawn back — each output
   pixel snapped to the centre of its cell, which is the same point sample a
   small framebuffer would have taken.
   ============================================================ */
const PIXEL_SCALE = 0.62;
const LEVELS = 4;

const RETRO_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const RETRO_FRAG = /* glsl */ `
  /* No pars includes up here, deliberately. three injects the
     tone-mapping and colour-space declarations into every ShaderMaterial it
     compiles, whether or not the shader asks for them, so including them by
     hand redefines toneMappingExposure and every tone-mapping function and
     the fragment shader fails to compile. Only the two call-site chunks at
     the bottom of main() are ours to add. */
  uniform sampler2D tDiffuse;
  uniform vec2 uGrid;
  uniform float uLevels;
  varying vec2 vUv;

  /* An 8x8 Bayer matrix, computed rather than looked up.
     ---
     The usual way to do this is a const array indexed by pixel position, which
     works but needs dynamic indexing — restricted in GLSL ES 1.00 and a
     needless dependency on which GLSL version three happens to compile for.
     The matrix has a closed form instead: it is built by interleaving the bits
     of x and y and reversing them, and these three lines are that, folded up.
     bayer2 gives the 2x2; each larger one is the smaller one scaled into a
     quarter of a cell and added to the next 2x2 down. Returns [0, 1). */
  float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
  }
  float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
  float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

  void main() {
    /* Snap to the centre of the cell this fragment falls in. Sampling the
       centre rather than the corner is what makes it a point sample of the
       scene rather than of the seam between two cells. */
    vec2 uv = (floor(vUv * uGrid) + 0.5) / uGrid;
    vec4 texel = texture2D(tDiffuse, uv);

    /* Un-premultiply. The render target holds the scene composited onto
       nothing, so a half-covered edge pixel arrives with its colour already
       scaled by its own alpha — quantising that scales the colour by the
       coverage as well as by the level, and every silhouette edge comes back
       a band darker than the surface behind it. */
    vec3 colour = texel.a > 0.0 ? texel.rgb / texel.a : texel.rgb;

    /* Alpha is quantised too, and hard. A soft edge on a blown-up pixel reads
       as a blurred pixel, which is the one thing this pass exists to avoid. */
    gl_FragColor = vec4(colour, step(0.5, texel.a));

    /* Tone map and encode first, quantise second. These two chunks are the
       pipeline the scene would have gone through had it been drawn straight to
       the canvas, and they run here because it wasn't. Quantising after them
       also puts the steps where they belong: the levels are evenly spaced in
       what the eye sees rather than in linear light, where three quarters of
       them would land in the highlights and the shadows would band in one
       jump. */
    #include <tonemapping_fragment>
    #include <colorspace_fragment>

    /* Ordered dither, then quantise — the same move the hero's line screen
       makes, and the reason both can hold a picture in three or four tones.
       ---
       A plain 0.5 there would be a round-to-nearest: every surface snaps to
       one level and a gradient becomes a hard band. Substituting the Bayer
       value for that 0.5 means the matrix decides which of the two levels a
       value sits between this particular cell takes, so a surface halfway
       between two levels comes out as an even mix of both and reads as the
       value in between. The ramp still does the quantising; the screen only
       breaks the tie.
       ---
       Sampled on the *cell* rather than the fragment. The scene is already
       being drawn onto a coarse grid, and a dither finer than that grid would
       put a pattern inside each block instead of across them — which is a
       texture on top of the pixels, not the pixels themselves. One threshold
       per cell is what makes it read as one image. */
    vec2 cell = floor(vUv * uGrid);
    gl_FragColor.rgb =
      floor(gl_FragColor.rgb * (uLevels - 1.0) + bayer8(cell)) /
      (uLevels - 1.0);
  }
`;

/**
 * Renders the scene to a texture, then draws it back through the grid.
 *
 * `useFrame` with a priority takes the render loop over from R3F entirely —
 * at priority 0 R3F draws the scene itself after the callbacks run, which
 * would paint the un-pixelated version straight over this one. The priority
 * has to be above the portal's, which runs its own pass at 0 to fill the
 * window's texture before the main scene reads it.
 *
 * ## The colour space, which is not optional
 *
 * three only tone maps and encodes to sRGB when it is drawing to the *canvas*.
 * Render into a target and it deliberately does neither: the texture holds
 * raw linear light, because that is what a texture should hold. Draw that
 * texture back out without putting it through the pipeline it skipped and
 * every value is interpreted as though it were already sRGB — mid-grey renders
 * at half its intended brightness, and the whole scene comes back looking as
 * if someone had dimmed it. The desk went from a lit workspace to a silhouette
 * this way, and it reads as a lighting problem rather than as a colour-space
 * one, which is what makes it worth a paragraph.
 *
 * So the quad's shader includes three's own `tonemapping_fragment` and
 * `colorspace_fragment` chunks and runs them itself. It has to be those rather
 * than a hand-rolled gamma curve: the renderer's tone mapping is configurable
 * from the Canvas, and these chunks compile to whichever one is set.
 */
function Retro() {
  const { gl, scene, camera, size } = useThree();

  const target = useMemo(
    () =>
      new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        // No mipmaps: they are a chain of progressively blurrier copies, and
        // sampling one is exactly the smoothing this is avoiding.
        generateMipmaps: false,
        depthBuffer: true,
      }),
    [],
  );

  const [quadScene, quadCamera, material] = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uGrid: { value: new THREE.Vector2(1, 1) },
        uLevels: { value: LEVELS },
      },
      vertexShader: RETRO_VERT,
      fragmentShader: RETRO_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const quadScene = new THREE.Scene();
    quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    return [quadScene, new THREE.Camera(), material];
  }, []);

  useEffect(() => {
    const dpr = gl.getPixelRatio();
    target.setSize(
      Math.max(1, Math.round(size.width * dpr)),
      Math.max(1, Math.round(size.height * dpr)),
    );
    material.uniforms.uGrid.value.set(
      Math.max(1, Math.round(size.width * PIXEL_SCALE)),
      Math.max(1, Math.round(size.height * PIXEL_SCALE)),
    );
  }, [size.width, size.height, gl, target, material]);

  useEffect(() => () => target.dispose(), [target]);

  useFrame(() => {
    gl.setRenderTarget(target);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    material.uniforms.tDiffuse.value = target.texture;
    gl.render(quadScene, quadCamera);
  }, 1);

  return null;
}

export default function DeskScene({ onReady }) {
  const [visible, setVisible] = useState(false);
  /* Read by Desk's render loop. A ref rather than state because it has to be
     true *before* the frame that acts on it is drawn, and a state update
     wouldn't land until the render after. */
  const atRest = useRef(false);

  return (
    <Canvas
      orthographic
      // frameloop is driven manually so the GPU idles when off-screen.
      frameloop={visible ? "always" : "never"}
      /* No point rendering above 1×. The WebGL frame is only ever read back at
         `resolution` — around a tenth of the element's size — so every extra
         device pixel is sampled straight back out again. */
      dpr={1}
      camera={{ near: 0.1, far: 1000, position: [-1.8, 1.6, 3.5], rotation: [-0.42, -0.4, -0.1] }}
      gl={{ alpha: true, antialias: false, powerPreference: "default" }}
      style={{ background: "transparent" }}
      onCreated={({ gl, advance }) => {
        /* Leaving the viewport stops the loop, and stopping the loop leaves
           whatever frame happened to be on screen on screen — which is a
           half-finished lerp somewhere between where the pointer was and where
           the scroll had got to, and a desk left at an angle it was only ever
           passing through. Scrolling back to it then showed that, until the
           loop restarted and swung it somewhere else.

           So the desk is put back to its rest pose and one more frame is drawn
           *before* the loop is allowed to stop. `advance` is R3F's manual
           step; calling it while the loop is still running is harmless, and
           calling it here rather than waiting for the loop removes the race
           between the next animation frame and React applying the state change
           below. Coming back, the lerp starts from that neutral pose, so the
           desk eases out of centre rather than arriving mid-swing. */
        const io = new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting) {
              atRest.current = false;
              setVisible(true);
              return;
            }
            atRest.current = true;
            advance(performance.now());
            setVisible(false);
          },
          { threshold: 0 },
        );
        io.observe(gl.domElement);
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          setVisible(false);
        });
      }}
    >
      {/* Lit for a colour render. The ASCII version was deliberately underlit
          — the ramp maps dark to dense, so the scene's brightness *was* its
          ink coverage, and properly lit it came out as a scattering of full
          stops. The retro pass reads colour rather than coverage, and at those
          levels the desk was a black silhouette with the banding all crowded
          into the bottom step. */}
      <ambientLight intensity={0.85} />
      <directionalLight position={[0, 10, 5]} intensity={1.5} />
      <Suspense fallback={null}>
        <Desk atRest={atRest} />
        <Ready onReady={onReady} />
      </Suspense>
      <Retro />

    </Canvas>
  );
}

useGLTF.preload(MODEL);
