/**
 * The desk, in plain three.
 *
 * This was React Three Fiber and drei. It is imperative three now, and the
 * reason is weight: fiber calls `extend(THREE)` on every Canvas, registering
 * the whole three namespace so that `<torusKnotGeometry />` resolves as a JSX
 * tag. That is how the library is meant to work and it is also why three can
 * never be tree-shaken underneath it — the bundle carried `LatheGeometry`,
 * `PositionalAudio` and every other class the scene has never used. Measured
 * on this scene: 1147kB raw / 255kB brotli for three + fiber + drei + React,
 * against 589kB / 123kB for three with only the parts named below. Dropping
 * drei alone saved 10kB, so it was all of it or none of it.
 *
 * React went with it. The desk was the only thing on the home page that needed
 * React at all — the one Astro island on the whole site is the Sandpack demo
 * on blog posts — so react-dom's 178kB left the page too.
 *
 * What the framework was actually doing, and where it went:
 *
 *   useGLTF / useTexture  -> GLTFLoader / TextureLoader, awaited in mount()
 *   Float                 -> eight lines in the frame loop, same curves
 *   shaderMaterial        -> ShaderMaterial, which is all it ever made
 *   useFrame priorities   -> the order of three calls in one loop
 *   MeshPortalMaterial    -> a render target and eight lines of GLSL; see the
 *                            note on the window below
 *
 * The renderer settings are not defaults. They are what fiber was configuring
 * behind the Canvas, read off the live renderer before this was written, and
 * getting them wrong is not subtle: without ACES tone mapping and an sRGB
 * output space the whole scene comes back looking dimmed.
 */
import {
  AmbientLight,
  Camera,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  ACESFilmicToneMapping,
  TextureLoader,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
  MathUtils,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODEL = "/models/desk.glb";
const TEXTURES = [
  "/textures/desk/effect_house.png",
  "/textures/desk/react_logo.png",
  "/textures/desk/nextjs_logo.png",
  "/textures/desk/blender_badge.png",
];

/* The five parallax ridge layers behind the window, as data. */
const RIDGES = [
  { z: -1.8, y: 0, uFrequency: 15, uWave: 13, uOffset: 1, uHeight: 12, uShade: 0.8 },
  { z: -1.6, y: 0.08, uFrequency: 11, uWave: 5, uOffset: 1, uHeight: 12, uShade: 0.6 },
  { z: -1.3, y: 0.14, uFrequency: 6, uWave: 10, uOffset: 0.2, uHeight: 12, uShade: 0.4 },
  { z: -1.2, y: 0.08, uFrequency: 150, uWave: 140, uOffset: 0.2, uHeight: 13, uShade: 0.2 },
  { z: -1.1, y: 0.08, uFrequency: 112, uWave: 140, uOffset: 0.2, uHeight: 13, uShade: 0.1 },
];

/* ============================================================
   Materials

   Four shaders that used to be built by drei's `shaderMaterial` helper, which
   makes a ShaderMaterial subclass with the uniforms mirrored onto the instance
   as properties. Nothing here needed that mirror — the loop writes `uTime`
   through `uniforms` directly — so they are plain ShaderMaterials.
   ============================================================ */

const VERT_UV = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Animated stripe field around the desk. */
const gravityMaterial = () =>
  new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColour: { value: new Color("#aaaaff") } },
    vertexShader: /* glsl */ `
      varying float vZ;
      void main() {
        vZ = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision lowp float;
      uniform float uTime;
      uniform vec3 uColour;
      varying float vZ;
      void main() {
        float pattern = step(0.6, mod((1.0 - vZ * 2.0) * 10.0 * vZ + uTime * 0.5, 1.0));
        gl_FragColor = vec4(uColour, pattern);
      }
    `,
    transparent: true,
    depthWrite: false,
    alphaTest: 0.5,
    side: DoubleSide,
  });

/**
 * Laptop screen. Cheap 2D value noise rather than the 3D Perlin the original
 * site ran per pixel — near-identical at a fraction of the cost.
 */
const screenMaterial = () =>
  new ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: VERT_UV,
    fragmentShader: /* glsl */ `
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
  });

/** Gradient sky seen through the window portal. */
const skyMaterial = () =>
  new ShaderMaterial({
    uniforms: {},
    vertexShader: VERT_UV,
    fragmentShader: /* glsl */ `
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
  });

/** Ridge layers behind the window. One shader, driven per layer by uniforms. */
const ridgeMaterial = (r) =>
  new ShaderMaterial({
    uniforms: {
      uFrequency: { value: r.uFrequency },
      uWave: { value: r.uWave },
      uOffset: { value: r.uOffset },
      uHeight: { value: r.uHeight },
      uShade: { value: r.uShade },
    },
    vertexShader: VERT_UV,
    fragmentShader: /* glsl */ `
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
    transparent: true,
  });

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

   LEVELS is the colour depth, four a channel — 64 colours — because the pass
   dithers on the way down. Four was tried before without a dither and had to
   be abandoned at six: the view through the window is five ridge planes
   separated only by value, and every layer below the sun quantised to the same
   black. An ordered dither is the answer to exactly that. A value between two
   levels comes out as a mix of both instead of snapping to one, so the ridges
   keep their separation on a palette a third the size.

   ## Why the grid is in the shader and not in the framebuffer

   The obvious implementation is to render into a small target and blow it up
   through a NearestFilter, and that is what this did first. It renders the
   same picture for a sixth of the fill — and it put the window out of action.
   The window samples its portal by *screen position*, so rendering the scene
   into a target a sixth of the size left every fragment's `gl_FragCoord` in
   that smaller space and the window read the empty bottom-left sixth of its
   own texture. It came out black, and nothing about it looked like a sampling
   problem.

   So the scene is rendered at full size, where screen space is what the window
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
  /* No pars includes up here, deliberately. three injects the tone-mapping and
     colour-space declarations into every ShaderMaterial it compiles, whether
     or not the shader asks for them, so including them by hand redefines
     toneMappingExposure and every tone-mapping function and the fragment
     shader fails to compile. Only the two call-site chunks at the bottom of
     main() are ours to add. */
  uniform sampler2D tDiffuse;
  uniform vec2 uGrid;
  uniform float uLevels;
  varying vec2 vUv;

  /* An 8x8 Bayer matrix, computed rather than looked up.
     ---
     The usual way is a const array indexed by pixel position, which needs
     dynamic indexing — restricted in GLSL ES 1.00 and a needless dependency on
     which GLSL version three compiles for. The matrix has a closed form
     instead: it is built by interleaving the bits of x and y and reversing
     them, and these three lines are that, folded up. Returns [0, 1). */
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

    /* Un-premultiply. The target holds the scene composited onto nothing, so a
       half-covered edge pixel arrives with its colour already scaled by its own
       alpha — quantising that scales the colour by the coverage as well as by
       the level, and every silhouette edge comes back a band darker than the
       surface behind it. */
    vec3 colour = texel.a > 0.0 ? texel.rgb / texel.a : texel.rgb;

    /* Alpha is quantised too, and hard. A soft edge on a blown-up pixel reads
       as a blurred pixel, which is the one thing this pass exists to avoid. */
    gl_FragColor = vec4(colour, step(0.5, texel.a));

    /* Tone map and encode first, quantise second. These two chunks are the
       pipeline the scene would have gone through had it been drawn straight to
       the canvas, and they run here because it wasn't. Quantising after them
       also puts the steps where they belong: evenly spaced in what the eye
       sees rather than in linear light, where three quarters of them would
       land in the highlights. */
    #include <tonemapping_fragment>
    #include <colorspace_fragment>

    /* Ordered dither, then quantise. A plain 0.5 there would be a
       round-to-nearest: every surface snaps to one level and a gradient becomes
       a hard band. Substituting the Bayer value means the matrix decides which
       of the two levels a value sits between this cell takes, so a surface
       halfway between two comes out as an even mix and reads as the value in
       between.
       ---
       Sampled on the *cell* rather than the fragment. The scene is already on a
       coarse grid, and a dither finer than that grid would put a pattern inside
       each block instead of across them — a texture on top of the pixels rather
       than the pixels themselves. */
    vec2 cell = floor(vUv * uGrid);
    gl_FragColor.rgb =
      floor(gl_FragColor.rgb * (uLevels - 1.0) + bayer8(cell)) /
      (uLevels - 1.0);
  }
`;

/**
 * The window.
 *
 * drei's `MeshPortalMaterial` renders its children into a buffer and has the
 * mesh sample that buffer by *screen position* rather than through its own
 * UVs — the portal is a full-screen render of another scene, and the window is
 * a hole cut in this one. That is the whole trick, and it is these eight lines
 * plus a render target.
 */
const windowMaterial = () =>
  new ShaderMaterial({
    uniforms: { tPortal: { value: null }, uResolution: { value: new Vector2(1, 1) } },
    vertexShader: /* glsl */ `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tPortal;
      uniform vec2 uResolution;
      void main() {
        gl_FragColor = texture2D(tPortal, gl_FragCoord.xy / uResolution);
      }
    `,
  });

/** drei's <Float>, which is this and nothing else. */
function floatAt(obj, t, offset, speed = 1, rotationIntensity = 0.4, floatIntensity = 0.4) {
  const s = offset + t;
  obj.rotation.x = (Math.cos((s / 4) * speed) / 8) * rotationIntensity;
  obj.rotation.y = (Math.sin((s / 4) * speed) / 8) * rotationIntensity;
  obj.rotation.z = (Math.sin((s / 4) * speed) / 20) * rotationIntensity;
  obj.position.y = (Math.sin((s / 4) * speed) / 10) * floatIntensity;
}

/**
 * Builds the scene and runs it. Called by the capability gate in Desk.astro
 * once a device has proved it can take it.
 *
 * Returns a teardown that stops the loop, drops every listener and releases
 * the GPU resources — the same contract the React version's unmount had.
 */
export async function mount(el) {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: "default",
  });
  /* No point above 1x. The frame is only ever read back through a grid at
     0.62 of the element, so every extra device pixel is sampled straight back
     out again. */
  renderer.setPixelRatio(1);
  // Not defaults: what fiber was setting behind the Canvas. See the file note.
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.background = "transparent";
  el.appendChild(renderer.domElement);

  const scene = new Scene();
  /* Lit for a colour render. The ASCII version this replaced was deliberately
     underlit — the ramp mapped dark to dense, so the scene's brightness *was*
     its ink coverage. The retro pass reads colour rather than coverage, and at
     four levels an underlit desk is a black silhouette with all the banding
     crowded into the bottom step. */
  scene.add(new AmbientLight(0xffffff, 0.85));
  const key = new DirectionalLight(0xffffff, 1.5);
  key.position.set(0, 10, 5);
  scene.add(key);

  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
  camera.position.set(-1.8, 1.6, 3.5);
  camera.rotation.set(-0.42, -0.4, -0.1);

  const [gltf, textures] = await Promise.all([
    new GLTFLoader().loadAsync(MODEL),
    Promise.all(TEXTURES.map((u) => new TextureLoader().loadAsync(u))),
  ]);
  for (const t of textures) t.colorSpace = SRGBColorSpace;
  const [effectHouse, reactLogo, nextLogo, blenderBadge] = textures;

  const nodes = {};
  const materials = {};
  gltf.scene.traverse((o) => {
    if (o.name && !nodes[o.name]) nodes[o.name] = o;
    if (o.material?.name && !materials[o.material.name]) materials[o.material.name] = o.material;
  });
  const geo = (name) => nodes[name].geometry;

  /* ---- the portal's own scene ---- */
  const portalScene = new Scene();
  const portalRoot = new Group();
  portalRoot.rotation.set(0, -0.1, 0);
  portalRoot.position.set(0.5, -0.1, 0);
  const sky = new Mesh(new PlaneGeometry(5, 5), skyMaterial());
  sky.position.set(-0.05, -0.1, -2);
  portalRoot.add(sky);
  for (const r of RIDGES) {
    const m = new Mesh(new PlaneGeometry(3, 2), ridgeMaterial(r));
    m.position.set(0, r.y, r.z);
    portalRoot.add(m);
  }
  portalScene.add(portalRoot);
  /* The portal's contents ride the window's own transform.
  
     This is the half of drei's MeshPortalMaterial that isn't obvious from the
     output: as well as sampling by screen position, it does
     `scene.matrixWorld.copy(parent.matrixWorld)` every frame, so the other
     world turns with the desk instead of hanging fixed behind a moving hole.
     Without it the window is a fixed photograph with a frame sliding over it,
     which is exactly what it looked like.

     Both auto-updates are off so that neither three nor the renderer writes
     over the matrix between setting it and drawing with it; the forced update
     in the loop is what pushes it down to the children. */
  portalScene.matrixAutoUpdate = false;
  portalScene.matrixWorldAutoUpdate = false;
  /* The two lights the React version put in here are gone. Every material in
     this scene is a ShaderMaterial that computes its own colour and never
     reads a light, so they lit nothing. */

  /* ---- the desk ---- */
  const root = new Group();
  root.position.set(0, 0.12, 0);
  root.scale.setScalar(2);
  const inner = new Group();
  inner.position.set(0, -0.2, 0);
  root.add(inner);
  scene.add(root);

  const floats = [];
  const sticker = (map, position, rotation, size = [0.3, 0.3]) => {
    const outer = new Group();
    const wobble = new Group();
    const mesh = new Mesh(
      new PlaneGeometry(size[0], size[1]),
      new MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5 }),
    );
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    wobble.add(mesh);
    outer.add(wobble);
    inner.add(outer);
    // drei seeds each Float with its own random phase, so they drift apart.
    floats.push({ obj: wobble, offset: Math.random() * 10000 });
  };
  sticker(blenderBadge, [1.1, -0.3, -0.9], [-Math.PI / 3, -0.2, -0.5], [0.25, 0.25]);
  sticker(effectHouse, [1, -0.3, 0], [-Math.PI / 3, -0.2, 0]);
  sticker(nextLogo, [-0.85, -0.3, -0.35], [-Math.PI / 2.2, 0, 0]);
  sticker(reactLogo, [-0.35, -0.3, -1.3], [-Math.PI / 2.2, 0, 0]);

  inner.add(new Mesh(geo("table"), new MeshStandardMaterial({ color: "#ad452b" })));

  const gravityMat = gravityMaterial();
  inner.add(new Mesh(geo("gravity_field"), gravityMat));

  const windowMat = windowMaterial();
  const windowMesh = new Mesh(geo("window"), windowMat);
  windowMesh.position.set(0, -0.15, 0);
  inner.add(windowMesh);

  const add = (parent, name, material, position) => {
    const m = new Mesh(geo(name), material);
    if (position) m.position.set(...position);
    parent.add(m);
    return m;
  };
  const group = (parent, position, rotation) => {
    const g = new Group();
    if (position) g.position.set(...position);
    if (rotation) g.rotation.set(...rotation);
    parent.add(g);
    return g;
  };

  // Laptop
  const laptop = group(inner, [0.2, 0.043, -0.116], [0.434, -0.16, 0.074]);
  const lid = group(laptop, [0, 0.01, 0]);
  add(lid, "Cube005", materials.computer);
  add(lid, "Cube005_1", materials.keys);
  add(lid, "Cube005_2", materials.trackpad);
  add(laptop, "screen", materials.computer, [0, 0.01, 0.002]);
  const screenMat = screenMaterial();
  const screenPlane = new Mesh(new PlaneGeometry(0.29, 0.21), screenMat);
  screenPlane.position.set(-0.002, 0.11, -0.155);
  screenPlane.rotation.set(-0.5, 0, 0);
  laptop.add(screenPlane);

  // Keyboard
  const kb = group(inner, [0.182, 0.02, 0.179], [0.032, -0.147, 0.005]);
  add(kb, "Tastatur_Tastatur_Untergrund_0", materials.body);
  add(kb, "Tastatur_Tastatur_Untergrund_0_1", materials["keys_1.001"]);
  add(kb, "Tastatur_Tastatur_Untergrund_0_2", materials.keys_2);
  add(kb, "Tastatur_Tastatur_Untergrund_0_3", materials.keys_3);

  // Mouse
  const mouse = group(inner, [0.532, 0.013, 0.207], [0, -0.165, 0]);
  add(mouse, "Object_0003", materials.mouse_body);
  add(mouse, "Object_0003_1", materials.wheel);

  // Printer
  const printer = group(inner, [-0.344, 0, 0], [0, 0.223, 0]);
  const arm = group(printer, [0, 0.1, 0]);
  add(arm, "Object_0010", materials["printer-arm"]);
  add(arm, "Object_0010_1", materials["printer-bars"]);
  const head = add(arm, "head", materials["printer-head"]);
  add(printer, "Object_0008", materials["printer-body"]);
  add(printer, "Object_0008_1", materials["printer-screen"]);
  add(printer, "Object_0008_2", materials["printer-bars"]);
  const bed = group(printer);
  add(bed, "Object_0012_1", materials["printer-table"]);
  add(bed, "Object_0012", materials["printer-body"]);

  // Raspberry Pi
  const pi = group(inner, [0.479, 0.002, 0.033], [0, 0.337, 0]);
  ["pi-base", "pi-silver", "pi-dark", "pi-light", "pi-mid", "pi-yellow"].forEach((mat, i) =>
    add(pi, `Raspberry_Pi_5_Reference_Model_V11${i ? `_${i}` : ""}`, materials[mat]),
  );

  /* ---- the two render targets ---- */
  const targetOpts = {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    // No mipmaps: a chain of progressively blurrier copies is exactly the
    // smoothing this is avoiding.
    generateMipmaps: false,
    depthBuffer: true,
  };
  const portalTarget = new WebGLRenderTarget(1, 1, targetOpts);
  const sceneTarget = new WebGLRenderTarget(1, 1, targetOpts);

  const retroMat = new ShaderMaterial({
    uniforms: {
      tDiffuse: { value: sceneTarget.texture },
      uGrid: { value: new Vector2(1, 1) },
      uLevels: { value: LEVELS },
    },
    vertexShader: RETRO_VERT,
    fragmentShader: RETRO_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const quadScene = new Scene();
  quadScene.add(new Mesh(new PlaneGeometry(2, 2), retroMat));
  const quadCamera = new Camera();
  windowMat.uniforms.tPortal.value = portalTarget.texture;

  /* ---- sizing ---- */
  let width = 0;
  let height = 0;
  const resize = () => {
    const r = el.getBoundingClientRect();
    width = Math.max(1, Math.round(r.width));
    height = Math.max(1, Math.round(r.height));
    renderer.setSize(width, height, false);
    portalTarget.setSize(width, height);
    sceneTarget.setSize(width, height);
    retroMat.uniforms.uGrid.value.set(
      Math.max(1, Math.round(width * PIXEL_SCALE)),
      Math.max(1, Math.round(height * PIXEL_SCALE)),
    );
    windowMat.uniforms.uResolution.value.set(width, height);
    camera.left = width / -2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / -2;
    // Orthographic zoom tracks element width. 0.22 is the original site's factor.
    camera.zoom = width * 0.22;
    camera.updateProjectionMatrix();
    measure();
  };

  /* ---- input ---- */
  const pointer = { x: 0, y: 0 };
  const smoothed = { x: 0, y: 0 };
  const scroll = { current: 0, target: 0 };
  /* Whether `pointer` still describes where the cursor is. Going to rest
     zeroes the smoothed value, but the target it eases towards is only ever
     written by a move over the canvas — so a desk that had been hovered,
     scrolled away from and scrolled back to eased straight back into the pose
     the cursor left it in, with no cursor anywhere near it. */
  let pointerLive = false;

  /* The pointer is read against the window, not the canvas.
     ---
     It used to be measured from the canvas's own box, so the desk only
     answered a cursor that was over it and sat still while you moved around
     the rest of the page — which reads as a dead object in a live page. Taken
     against the viewport instead, it turns towards the pointer wherever the
     pointer is, and centre screen is the neutral pose.

     R3F expressed this as <Canvas eventSource eventPrefix>; with no Canvas
     left it is two lines, and cheaper than what it replaces — innerWidth and
     innerHeight are free, where the old getBoundingClientRect forced a layout
     read on every single pointer move. */
  const onPointerMove = (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    pointerLive = true;
  };

  /* Scroll tilt, from the desk's own travel through the viewport rather than
     progress through the document — which is what this was, and meant the
     angle was set by where the page was rather than where the desk was.
     Zero is the desk centred in the viewport, which is also the pose the rest
     snap uses. No layout work on scroll: the page position is measured once
     and retaken only when something could have moved it. */
  let docTop = 0;
  let docHeight = 0;
  const measure = () => {
    const r = el.getBoundingClientRect();
    docTop = r.top + window.scrollY;
    docHeight = r.height;
  };
  const onScroll = () => {
    const centre = docTop + docHeight / 2 - window.scrollY;
    const p = MathUtils.clamp(centre / (window.innerHeight || 1), 0, 1);
    scroll.target = (0.5 - p) * 0.3;
  };

  /* ---- the loop ---- */
  let running = false;
  let atRest = false;
  let raf = 0;
  let last = 0;
  let elapsed = 0;
  let frames = 0;

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    draw(now);
  };

  function draw(now) {
    const delta = last ? Math.min(0.1, (now - last) / 1000) : 0.016;
    last = now;
    elapsed += delta;
    const t = elapsed;
    const k = 1 - Math.pow(0.001, delta); // frame-rate independent damping

    gravityMat.uniforms.uTime.value = t;
    screenMat.uniforms.uTime.value = t;

    if (atRest) {
      /* Going to rest rather than tracking. This runs on the one frame drawn
         as the desk leaves the viewport, so it snaps rather than eases: there
         is no second frame to ease on. What it snaps to is the pose the desk
         holds with the pointer in the middle and the page at half scroll — the
         one neutral position it has. */
      smoothed.x = 0;
      smoothed.y = 0;
      pointerLive = false;
      scroll.current = 0;
      root.rotation.set(0, 0, 0);
    } else {
      smoothed.x = MathUtils.lerp(smoothed.x, pointerLive ? pointer.x * 0.1 : 0, k);
      smoothed.y = MathUtils.lerp(smoothed.y, pointerLive ? -pointer.y * 0.05 : 0, k);
      scroll.current = MathUtils.lerp(scroll.current, scroll.target, k * 0.6);
      root.rotation.y = smoothed.x;
      root.rotation.x = smoothed.y + scroll.current;
    }

    for (const f of floats) floatAt(f.obj, t, f.offset);
    bed.position.z = Math.sin(t) * 0.1;
    arm.position.y = 0.05 + Math.sin(t) * 0.08;
    head.position.x = 0.025 + Math.sin(t * 2) * 0.08;

    /* Three passes, in this order. The window reads the portal, so the portal
       has to be drawn first; the grid reads the scene, so the scene has to be
       drawn before the quad. This ordering is what R3F's useFrame priorities
       were expressing. */
    windowMesh.updateWorldMatrix(true, false);
    portalScene.matrixWorld.copy(windowMesh.matrixWorld);
    portalScene.updateMatrixWorld(true);

    renderer.setRenderTarget(portalTarget);
    renderer.clear();
    renderer.render(portalScene, camera);

    renderer.setRenderTarget(sceneTarget);
    renderer.clear();
    renderer.render(scene, camera);

    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCamera);

    // Two frames, so the first has actually painted before it is faded in.
    if (frames <= 1 && ++frames > 1) el.classList.add("is-ready");
  }

  const start = () => {
    if (running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  resize();
  measure();
  onScroll();

  /* Leaving the viewport stops the loop, and stopping the loop leaves whatever
     frame was on screen on screen — a half-finished lerp somewhere between
     where the pointer was and where the scroll had got to, and a desk left at
     an angle it was only ever passing through. So it is put back to its rest
     pose and one more frame is drawn *before* the loop stops. Coming back, the
     lerp starts from that neutral pose and the desk eases out of centre rather
     than arriving mid-swing. */
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) {
        atRest = false;
        start();
        return;
      }
      atRest = true;
      draw(performance.now());
      stop();
    },
    { threshold: 0 },
  );
  io.observe(renderer.domElement);

  const onContextLost = (e) => {
    e.preventDefault();
    stop();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(el);

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure, { passive: true });

  return () => {
    stop();
    io.disconnect();
    ro.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", measure);
    portalTarget.dispose();
    sceneTarget.dispose();
    scene.traverse((o) => {
      o.geometry?.dispose();
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
      else o.material?.dispose();
    });
    for (const t of textures) t.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
