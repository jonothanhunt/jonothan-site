#!/usr/bin/env node
/**
 * Build-time glTF slimming.
 *
 * The desk is 23 flat-colour materials and not one texture — no image, no
 * sampler, nothing in the file that samples a surface. It nonetheless shipped
 * three full sets of texture coordinates on every mesh, 143kB of UVs that
 * nothing can ever read: a quarter of the file, downloaded and uploaded to the
 * GPU on every first visit to the home page. Blender writes them because the
 * meshes were unwrapped at some point; nothing since has needed them.
 *
 * So this drops them, garbage-collects whatever that orphans, and then stores
 * the normals as bytes instead of floats. Together: 599kB to 334kB, with every
 * position, index and node matrix bit-identical to the source and the worst
 * normal on the desk turned by a third of a degree.
 *
 * What it deliberately does *not* do:
 *
 *   Quantising positions (KHR_mesh_quantization) and meshopt both roughly
 *   halve what is left again, and three.js reads both without a decoder —
 *   meshopt's is already in the bundle, because drei's useGLTF wires it up
 *   whether or not anything uses it. They are still not safe here. Both work
 *   by shrinking geometry into a normalised local space and pushing the
 *   inverse into each node's matrix, and DeskScene.jsx doesn't read the node
 *   matrices: it is gltfjsx output, so every transform in the file has been
 *   copied out as a literal in the JSX and the geometry is lifted out from
 *   under its node. Measured, the two put the parts of the desk up to 1.12
 *   world units from where the scene expects them. Taking either means
 *   rebuilding the scene graph to honour the file's transforms again.
 *
 *   This is exactly why the normals *can* be shrunk and the positions can't: a
 *   normal is a unit vector, so it survives the trip with no scale and no
 *   offset, and no node has to be told anything.
 *
 *   Draco compresses harder still — 64kB — and costs a 280kB wasm decoder
 *   fetched from gstatic at runtime, which is both a bad trade at this size
 *   and a third party on a site that has none.
 *
 * The far bigger lever is not in this file at all: the deployed .glb is served
 * with no Content-Encoding, because model/gltf-binary isn't in Cloudflare's
 * compressible list, so all of it goes over the wire raw. It brotlis to about
 * a fifth. See the note in public/_headers.
 *
 * Idempotent, like scripts/dither.mjs: an output newer than both its source
 * and this script is left alone.
 */
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const SELF = fileURLToPath(import.meta.url);

/* Source lives in src/ so it is never published; only the slimmed copy is
   written into public/, where it is gitignored and rebuilt on every build. */
const MODELS = [{ from: "src/models/desk.glb", to: "public/models/desk.glb" }];

const JSON_CHUNK = 0x4e4f534a; // "JSON"
const BIN_CHUNK = 0x004e4942; // "BIN\0"
const pad4 = (n) => (n + 3) & ~3;

function readGLB(buf) {
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error("not a glb");
  let off = 12;
  let json = null;
  let bin = null;
  while (off < buf.length) {
    const len = buf.readUInt32LE(off);
    const type = buf.readUInt32LE(off + 4);
    const body = buf.subarray(off + 8, off + 8 + len);
    if (type === JSON_CHUNK) json = JSON.parse(body.toString("utf8"));
    else if (type === BIN_CHUNK) bin = body;
    off += 8 + len;
  }
  return { json, bin };
}

function writeGLB(json, bin) {
  const j = Buffer.from(JSON.stringify(json), "utf8");
  // Both chunks are 4-byte aligned; JSON pads with spaces, BIN with zeroes.
  const jp = Buffer.concat([j, Buffer.alloc(pad4(j.length) - j.length, 0x20)]);
  const bp = Buffer.concat([bin, Buffer.alloc(pad4(bin.length) - bin.length)]);
  const total = 12 + 8 + jp.length + 8 + bp.length;
  const out = Buffer.alloc(total);
  out.writeUInt32LE(0x46546c67, 0);
  out.writeUInt32LE(2, 4);
  out.writeUInt32LE(total, 8);
  out.writeUInt32LE(jp.length, 12);
  out.writeUInt32LE(JSON_CHUNK, 16);
  jp.copy(out, 20);
  out.writeUInt32LE(bp.length, 20 + jp.length);
  out.writeUInt32LE(BIN_CHUNK, 24 + jp.length);
  bp.copy(out, 28 + jp.length);
  return out;
}

/* Everything this script is not written to rewrite. Each of these holds a
   reference into the accessor or bufferView tables, so leaving one unhandled
   would not fail loudly — it would renumber somebody's data and hand back a
   file that loads and is wrong. Better to stop. */
function assertSimple(g) {
  const refuse = (why) => {
    throw new Error(`${why} — scripts/model.mjs can't renumber that safely`);
  };
  if (g.skins?.length) refuse("the model has skins");
  if (g.animations?.length) refuse("the model has animations");
  if (g.accessors?.some((a) => a.sparse)) refuse("sparse accessors");
  if (g.meshes?.some((m) => m.primitives.some((p) => p.targets)))
    refuse("morph targets");
  if (g.bufferViews?.some((v) => v.byteStride != null))
    refuse("interleaved bufferViews");
  if (g.buffers?.length !== 1 || g.buffers[0].uri)
    refuse("more than one buffer, or an external one");
  if (g.extensionsUsed?.includes("EXT_meshopt_compression"))
    refuse("the model is already meshopt-compressed");
  if (g.extensionsUsed?.includes("KHR_draco_mesh_compression"))
    refuse("the model is already draco-compressed");
}

/** Which TEXCOORD sets any material actually samples. */
function usedTexcoords(g) {
  const used = new Set();
  const visit = (info) => info && used.add(info.texCoord ?? 0);
  for (const m of g.materials ?? []) {
    const p = m.pbrMetallicRoughness ?? {};
    visit(p.baseColorTexture);
    visit(p.metallicRoughnessTexture);
    visit(m.normalTexture);
    visit(m.occlusionTexture);
    visit(m.emissiveTexture);
    // Extensions can carry their own textureInfo — KHR_materials_specular,
    // _transmission, _sheen and friends. Rather than enumerate them, find any
    // object with an `index` into g.textures and treat it as one.
    JSON.stringify(m.extensions ?? {}, (k, v) => {
      if (v && typeof v === "object" && typeof v.index === "number" && "texCoord" in v)
        used.add(v.texCoord ?? 0);
      else if (v && typeof v === "object" && typeof v.index === "number" && /Texture$/.test(k))
        used.add(0);
      return v;
    });
  }
  return used;
}

/**
 * Normals as signed bytes.
 *
 * A normal is a unit vector, so it needs no scale and no offset to survive
 * being stored small — which is exactly what positions can't do, and the whole
 * reason quantising those is off the table here. Normalised BYTE is plain
 * glTF 2.0, one of the component types the spec already lists for NORMAL: no
 * extension, no decoder, nothing to feature-detect. Measured against the
 * float original, the worst normal on the desk turns by 0.347 degrees.
 *
 * Three bytes per normal would not be aligned, and the spec requires every
 * vertex element to sit on a 4-byte boundary, so each one is padded to four
 * and the view carries `byteStride: 4`.
 */
function quantizeNormals(g, bin, replaced) {
  const isNormal = new Set();
  for (const mesh of g.meshes ?? [])
    for (const prim of mesh.primitives)
      if (prim.attributes.NORMAL != null) isNormal.add(prim.attributes.NORMAL);

  let done = 0;
  for (const i of isNormal) {
    const a = g.accessors[i];
    if (a.type !== "VEC3" || a.componentType !== 5126 || a.bufferView == null) continue;
    const v = g.bufferViews[a.bufferView];
    const src = new Float32Array(
      bin.buffer,
      bin.byteOffset + (v.byteOffset ?? 0) + (a.byteOffset ?? 0),
      a.count * 3,
    );
    const out = Buffer.alloc(a.count * 4); // xyz + one byte of padding
    for (let n = 0; n < a.count; n++) {
      for (let c = 0; c < 3; c++) {
        // glTF decodes a normalised byte as max(c / 127, -1), so encode the
        // inverse and clamp: -128 would decode to slightly past -1.
        const q = Math.round(src[n * 3 + c] * 127);
        out.writeInt8(Math.min(127, Math.max(-127, q)), n * 4 + c);
      }
    }
    replaced.set(a.bufferView, { bytes: out, byteStride: 4 });
    a.componentType = 5120;
    a.normalized = true;
    a.byteOffset = 0;
    // min/max are in the accessor's own units, and these are now bytes.
    delete a.min;
    delete a.max;
    done++;
  }
  return done;
}

function slim(buf) {
  const { json: g, bin } = readGLB(buf);
  assertSimple(g);

  /* Bytes that replace a bufferView's original contents, keyed by its index.
     Filled by quantizeNormals and read by the repack below, so the two passes
     don't each walk the binary. */
  const replaced = new Map();

  const keep = usedTexcoords(g);
  let dropped = 0;
  for (const mesh of g.meshes ?? []) {
    for (const prim of mesh.primitives) {
      for (const sem of Object.keys(prim.attributes)) {
        const m = /^TEXCOORD_(\d+)$/.exec(sem);
        if (!m || keep.has(Number(m[1]))) continue;
        delete prim.attributes[sem];
        dropped++;
      }
    }
  }

  const normals = quantizeNormals(g, bin, replaced);

  /* Garbage-collect. An accessor nothing points at goes, then a bufferView no
     surviving accessor or image points at goes, then the binary chunk is
     repacked from just the views that are left. */
  const liveAcc = new Set();
  for (const mesh of g.meshes ?? [])
    for (const prim of mesh.primitives) {
      for (const i of Object.values(prim.attributes)) liveAcc.add(i);
      if (prim.indices != null) liveAcc.add(prim.indices);
    }

  const accMap = new Map();
  const accessors = [];
  (g.accessors ?? []).forEach((a, i) => {
    if (!liveAcc.has(i)) return;
    accMap.set(i, accessors.length);
    accessors.push(a);
  });

  const liveView = new Set();
  for (const a of accessors) if (a.bufferView != null) liveView.add(a.bufferView);
  for (const im of g.images ?? []) if (im.bufferView != null) liveView.add(im.bufferView);

  const viewMap = new Map();
  const bufferViews = [];
  const chunks = [];
  let cursor = 0;
  (g.bufferViews ?? []).forEach((v, i) => {
    if (!liveView.has(i)) return;
    const sub = replaced.get(i);
    const bytes = sub
      ? sub.bytes
      : bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength);
    chunks.push(bytes);
    const copy = { ...v, byteOffset: cursor, byteLength: bytes.length, buffer: 0 };
    if (sub) copy.byteStride = sub.byteStride;
    cursor = pad4(cursor + bytes.length);
    viewMap.set(i, bufferViews.length);
    bufferViews.push(copy);
  });

  // Re-emit the binary with the same 4-byte alignment the offsets assume.
  const out = Buffer.alloc(cursor);
  bufferViews.forEach((v, n) => chunks[n].copy(out, v.byteOffset));

  for (const a of accessors) if (a.bufferView != null) a.bufferView = viewMap.get(a.bufferView);
  for (const im of g.images ?? []) if (im.bufferView != null) im.bufferView = viewMap.get(im.bufferView);
  for (const mesh of g.meshes ?? [])
    for (const prim of mesh.primitives) {
      for (const [sem, i] of Object.entries(prim.attributes)) prim.attributes[sem] = accMap.get(i);
      if (prim.indices != null) prim.indices = accMap.get(prim.indices);
    }

  g.accessors = accessors;
  g.bufferViews = bufferViews;
  g.buffers = [{ byteLength: out.length }];

  return { buf: writeGLB(g, out), dropped, normals };
}

const K = (n) => `${Math.round(n / 1024)}kB`;

async function build({ from, to }) {
  const src = path.join(ROOT, from);
  const dest = path.join(ROOT, to);
  const srcStat = await fs.stat(src);
  const selfStat = await fs.stat(SELF);
  const destStat = fsSync.existsSync(dest) ? await fs.stat(dest) : null;
  if (destStat && destStat.mtimeMs > Math.max(srcStat.mtimeMs, selfStat.mtimeMs)) return;

  const input = await fs.readFile(src);
  const { buf, dropped, normals } = slim(input);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
  console.log(
    `  model  ${to}  ${K(input.length)} -> ${K(buf.length)}` +
      `  (${dropped} unused UV set${dropped === 1 ? "" : "s"} dropped,` +
      ` ${normals} normal set${normals === 1 ? "" : "s"} to bytes)`,
  );
}

await Promise.all(MODELS.map(build));
