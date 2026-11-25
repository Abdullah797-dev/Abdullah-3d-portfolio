#!/usr/bin/env node
/**
 * Builds public/models/hafiz.glb — the stylized hero character.
 *
 *   node scripts/character/build-character.mjs        (needs `three` installed)
 *
 * The character is modelled from smooth, high-segment primitives (no sculpt),
 * rigidly skinned to a named skeleton so it can be posed and animated in
 * Three.js / React Three Fiber. Bind pose is a T-pose; the file also carries
 * the clips "HeroPose", "Idle", "Wave" and "Nod".
 *
 * Bone names are a contract with src/components/scene/hero-character.tsx.
 * A hand-sculpted replacement exported from Blender with the same bone names
 * works without code changes.
 */
import * as THREE from 'three'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'
import { HERO_POSE } from './pose.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(here, '../../public/models/hafiz.glb')

/* ───────────────────────── Skeleton (world bind positions, metres) ───────── */

const J = [
  ['Root', null, [0, 0, 0]],
  ['Hips', 'Root', [0, 0.93, 0]],
  ['Spine', 'Hips', [0, 1.04, 0]],
  ['Chest', 'Spine', [0, 1.2, 0]],
  ['Neck', 'Chest', [0, 1.43, 0]],
  ['Head', 'Neck', [0, 1.51, 0]],
  ['Eye_L', 'Head', [0.058, 1.672, 0.137]],
  ['Eye_R', 'Head', [-0.058, 1.672, 0.137]],
  ['Lid_L', 'Head', [0.058, 1.672, 0.137]],
  ['Lid_R', 'Head', [-0.058, 1.672, 0.137]],
  ['Mouth', 'Head', [0, 1.566, 0.16]],
  ['UpperArm_L', 'Chest', [0.185, 1.375, 0]],
  ['LowerArm_L', 'UpperArm_L', [0.455, 1.375, 0]],
  ['Hand_L', 'LowerArm_L', [0.69, 1.375, 0]],
  ['UpperArm_R', 'Chest', [-0.185, 1.375, 0]],
  ['LowerArm_R', 'UpperArm_R', [-0.455, 1.375, 0]],
  ['Hand_R', 'LowerArm_R', [-0.69, 1.375, 0]],
  ['UpperLeg_L', 'Hips', [0.078, 0.9, 0]],
  ['LowerLeg_L', 'UpperLeg_L', [0.078, 0.49, 0]],
  ['Foot_L', 'LowerLeg_L', [0.078, 0.09, 0]],
  ['UpperLeg_R', 'Hips', [-0.078, 0.9, 0]],
  ['LowerLeg_R', 'UpperLeg_R', [-0.078, 0.49, 0]],
  ['Foot_R', 'LowerLeg_R', [-0.078, 0.09, 0]],
]
const jointIndex = Object.fromEntries(J.map((j, i) => [j[0], i]))
const jointWorld = Object.fromEntries(J.map((j) => [j[0], new THREE.Vector3(...j[2])]))

/* ───────────────────────── Materials ───────────────────────── */

const MAT = {
  skin: { color: '#E2AC86', rough: 0.55 },
  hair: { color: '#2A1E17', rough: 0.62 },
  beard: { color: '#2F2219', rough: 0.75 },
  brow: { color: '#251A13', rough: 0.8 },
  shirt: { color: '#EEE7D6', rough: 0.82 },
  shirtShade: { color: '#E0D7C1', rough: 0.85 },
  vest: { color: '#FFFFFF', rough: 0.88, texture: 'plaid', double: true },
  trousers: { color: '#3B3E42', rough: 0.86 },
  leather: { color: '#6B4428', rough: 0.48 },
  boot: { color: '#734A2A', rough: 0.45 },
  sole: { color: '#2E2219', rough: 0.7 },
  lace: { color: '#D8C9A8', rough: 0.8 },
  strap: { color: '#4C5751', rough: 0.7 },
  metal: { color: '#C9A86A', rough: 0.3, metal: 0.8 },
  glasses: { color: '#111111', rough: 0.25, metal: 0.5 },
  sclera: { color: '#F8F6F1', rough: 0.25 },
  iris: { color: '#4A2F1B', rough: 0.2 },
  pupil: { color: '#0C0806', rough: 0.1 },
  mouth: { color: '#5A2420', rough: 0.6 },
  teeth: { color: '#F4EFE6', rough: 0.35 },
  cheek: { color: '#E59C80', rough: 0.6 },
}

/* ───────────────────────── Geometry helpers ───────────────────────── */

const parts = []
const m4 = () => new THREE.Matrix4()
const V = (x, y, z) => new THREE.Vector3(x, y, z)

function add(geo, mat, joint, matrix) {
  const g = geo.index ? geo : geo
  if (matrix) g.applyMatrix4(matrix)
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2))
  parts.push({ geo: g, mat, joint })
  return g
}
function trs(pos, rot = [0, 0, 0], scl = [1, 1, 1]) {
  return m4().compose(V(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), V(...scl))
}
function ellipsoid(mat, joint, pos, radii, rot = [0, 0, 0], seg = [36, 26], extra = []) {
  return add(new THREE.SphereGeometry(1, seg[0], seg[1], ...extra), mat, joint, trs(pos, rot, radii))
}
/** Tapered tube from a to b (radii ra → rb). */
function tube(mat, joint, a, b, ra, rb, radial = 28, open = false) {
  const A = V(...a), B = V(...b), dir = B.clone().sub(A), len = dir.length()
  const g = new THREE.CylinderGeometry(rb, ra, len, radial, 4, open)
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.normalize())
  return add(g, mat, joint, m4().compose(A.clone().add(B).multiplyScalar(0.5), q, V(1, 1, 1)))
}
function capsule(mat, joint, a, b, r, radial = 24) {
  const A = V(...a), B = V(...b), dir = B.clone().sub(A), len = dir.length()
  const g = new THREE.CapsuleGeometry(r, Math.max(0.0001, len), 10, radial)
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.normalize())
  return add(g, mat, joint, m4().compose(A.clone().add(B).multiplyScalar(0.5), q, V(1, 1, 1)))
}
/** Lathe from [radius, y] pairs, squashed in depth. */
function lathe(mat, joint, profile, depth = 0.72, seg = 56, phiStart = 0, phiLength = Math.PI * 2, uvScale = 1) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg, phiStart, phiLength)
  g.scale(1, 1, depth)
  if (uvScale !== 1) {
    const uv = g.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * uvScale * 2.2, uv.getY(i) * uvScale)
  }
  g.computeVertexNormals()
  return add(g, mat, joint)
}
function rbox(mat, joint, pos, size, rot = [0, 0, 0], r = 0.01) {
  // rounded box via a squashed high-segment sphere-ish superellipse: use a box with bevel by scaling a capsule
  const g = new THREE.BoxGeometry(size[0], size[1], size[2], 2, 2, 2)
  return add(g, mat, joint, trs(pos, rot))
}
function torus(mat, joint, pos, R, r, rot = [0, 0, 0], arc = Math.PI * 2, scl = [1, 1, 1], seg = [14, 48]) {
  return add(new THREE.TorusGeometry(R, r, seg[0], seg[1], arc), mat, joint, trs(pos, rot, scl))
}

/* ───────────────────────── Body ───────────────────────── */

// Torso (shirt) — slim, gentleman's build.
const torsoProfile = [
  [0.0, 0.9], [0.128, 0.9], [0.133, 0.98], [0.138, 1.06], [0.146, 1.16], [0.158, 1.26],
  [0.162, 1.32], [0.152, 1.38], [0.118, 1.425], [0.06, 1.445], [0.0, 1.45],
]
lathe('shirt', 'Chest', torsoProfile.filter(([, y]) => y >= 1.05), 0.7)
lathe('shirt', 'Spine', torsoProfile.filter(([, y]) => y <= 1.17), 0.7)

// Open plaid vest — a shell slightly larger than the torso, open at the front.
const vestProfile = [
  [0.142, 0.965], [0.143, 0.98], [0.147, 1.06], [0.155, 1.16], [0.168, 1.26], [0.172, 1.32], [0.162, 1.38], [0.128, 1.42],
]
const VEST_OPEN = 0.42
lathe('vest', 'Chest', vestProfile.filter(([, y]) => y >= 1.1), 0.74, 60, VEST_OPEN, Math.PI * 2 - VEST_OPEN * 2, 3)
lathe('vest', 'Spine', vestProfile.filter(([, y]) => y <= 1.16), 0.74, 60, VEST_OPEN, Math.PI * 2 - VEST_OPEN * 2, 3)
// Vest front edges (piping) and buttons.
for (const s of [1, -1]) {
  const x = Math.sin(VEST_OPEN) * 0.156 * s
  tube('leather', 'Chest', [x, 1.13, 0.1], [x * 0.92, 1.39, 0.098], 0.0045, 0.0045, 8)
  for (const y of [1.0, 1.08]) ellipsoid('leather', 'Spine', [x + 0.01 * s, y, 0.106], [0.006, 0.006, 0.003])
}

// Shoulders (shirt) so the sleeve meets the torso cleanly.
for (const s of [1, -1]) ellipsoid('shirt', 'Chest', [s * 0.165, 1.37, 0], [0.068, 0.062, 0.066])

// Collar: band + two pressed points.
tube('shirt', 'Chest', [0, 1.405, -0.005], [0, 1.455, -0.005], 0.072, 0.064, 32, true)
for (const s of [1, -1]) {
  ellipsoid('shirtShade', 'Chest', [s * 0.036, 1.418, 0.068], [0.04, 0.022, 0.008], [-0.5, s * 0.45, s * 0.75], [24, 12])
}
// Placket + buttons on the shirt.
for (const y of [1.0, 1.1, 1.2, 1.3]) ellipsoid('lace', y > 1.12 ? 'Chest' : 'Spine', [0, y, 0.106 + (y - 1) * 0.02], [0.0055, 0.0055, 0.003])

// Backpack straps over both shoulders + slim pack on the back.
for (const s of [1, -1]) {
  tube('strap', 'Chest', [s * 0.1, 1.15, 0.112], [s * 0.112, 1.36, 0.1], 0.011, 0.011, 10)
  tube('strap', 'Chest', [s * 0.112, 1.36, 0.1], [s * 0.115, 1.43, 0.0], 0.011, 0.011, 10)
  tube('strap', 'Chest', [s * 0.115, 1.43, 0.0], [s * 0.11, 1.38, -0.12], 0.011, 0.011, 10)
  rbox('metal', 'Chest', [s * 0.102, 1.2, 0.116], [0.024, 0.012, 0.006])
}
{
  const g = new THREE.CapsuleGeometry(0.11, 0.16, 8, 24)
  add(g, 'strap', 'Chest', trs([0, 1.24, -0.135], [0, 0, 0], [0.95, 0.95, 0.2]))
}

// Neck.
tube('skin', 'Neck', [0, 1.4, 0], [0, 1.54, 0.005], 0.05, 0.047, 28)

// Hips: trousers + belt + buckle.
lathe('trousers', 'Hips', [[0, 0.86], [0.1, 0.86], [0.126, 0.875], [0.134, 0.92], [0.131, 0.955], [0, 0.955]], 0.7)
tube('leather', 'Hips', [0, 0.915, 0], [0, 0.955, 0], 0.137, 0.135, 48, true).scale(1, 1, 1)
// squash belt depth to match trousers
parts[parts.length - 1].geo.applyMatrix4(trs([0, 0, 0], [0, 0, 0], [1, 1, 0.73]))
rbox('metal', 'Hips', [0, 0.935, 0.1], [0.04, 0.032, 0.008])
rbox('leather', 'Hips', [0, 0.935, 0.103], [0.028, 0.02, 0.006])

/* Legs — straight charcoal trousers, lace-up boots. */
for (const s of [1, -1]) {
  const L = s > 0 ? '_L' : '_R', x = s * 0.078
  tube('trousers', 'UpperLeg' + L, [x, 0.93, 0], [x, 0.48, 0.005], 0.074, 0.06, 32)
  ellipsoid('trousers', 'LowerLeg' + L, [x, 0.49, 0.004], [0.06, 0.04, 0.06])
  tube('trousers', 'LowerLeg' + L, [x, 0.49, 0.004], [x, 0.125, 0.0], 0.058, 0.06, 32, true)
  // Boot: shaft, foot, toe cap, sole, heel, laces.
  tube('boot', 'Foot' + L, [x, 0.17, 0], [x, 0.06, 0.005], 0.049, 0.057, 28)
  ellipsoid('boot', 'Foot' + L, [x, 0.058, 0.05], [0.058, 0.05, 0.12], [0, 0, 0])
  ellipsoid('boot', 'Foot' + L, [x, 0.048, 0.115], [0.052, 0.04, 0.06])
  rbox('sole', 'Foot' + L, [x, 0.012, 0.045], [0.118, 0.024, 0.27])
  rbox('sole', 'Foot' + L, [x, 0.022, -0.045], [0.104, 0.03, 0.07])
  for (let i = 0; i < 4; i++) rbox('lace', 'Foot' + L, [x, 0.11 - i * 0.017, 0.058 + i * 0.016], [0.05, 0.005, 0.006], [0.75, 0, 0])
}

/* Arms (T-pose along ±X) — short sleeves, slim forearms, watch on the left wrist. */
for (const s of [1, -1]) {
  const L = s > 0 ? '_L' : '_R'
  const sx = (v) => s * v
  tube('shirt', 'UpperArm' + L, [sx(0.18), 1.375, 0], [sx(0.33), 1.372, 0.002], 0.064, 0.056, 32)
  torus('shirtShade', 'UpperArm' + L, [sx(0.33), 1.372, 0.002], 0.055, 0.007, [0, Math.PI / 2, 0], Math.PI * 2, [1, 1, 1], [8, 32])
  tube('skin', 'UpperArm' + L, [sx(0.3), 1.374, 0], [sx(0.455), 1.375, 0], 0.044, 0.038, 24)
  ellipsoid('skin', 'LowerArm' + L, [sx(0.455), 1.375, 0], [0.038, 0.036, 0.036])
  tube('skin', 'LowerArm' + L, [sx(0.455), 1.375, 0], [sx(0.665), 1.375, 0], 0.037, 0.03, 24)
  // Hand: palm, four fingers, thumb (relaxed).
  ellipsoid('skin', 'Hand' + L, [sx(0.725), 1.373, 0.002], [0.05, 0.02, 0.042])
  for (let f = 0; f < 4; f++) {
    const z = 0.027 - f * 0.018
    const len = [0.05, 0.056, 0.053, 0.044][f]
    capsule('skin', 'Hand' + L, [sx(0.765), 1.371, z], [sx(0.765 + len), 1.366, z * 1.1], 0.0085, 12)
  }
  capsule('skin', 'Hand' + L, [sx(0.71), 1.37, 0.035], [sx(0.75), 1.365, 0.07], 0.01, 12)
}
// Leather watch on the left wrist.
torus('leather', 'LowerArm_L', [0.645, 1.375, 0], 0.033, 0.008, [0, Math.PI / 2, 0], Math.PI * 2, [1, 1, 1], [10, 36])
add(new THREE.CylinderGeometry(0.017, 0.017, 0.01, 28), 'metal', 'LowerArm_L', trs([0.645, 1.41, 0], [0, 0, 0]))
add(new THREE.CylinderGeometry(0.013, 0.013, 0.012, 28), 'lace', 'LowerArm_L', trs([0.645, 1.411, 0], [0, 0, 0]))

/* ───────────────────────── Head ───────────────────────── */

const HC = [0, 1.66, 0.01] // head centre
// Skull/face — slimmer than the reference by ~25%.
ellipsoid('skin', 'Head', HC, [0.148, 0.18, 0.158], [0, 0, 0], [48, 36])
// Jaw/cheeks volume (lower face, a touch narrower).
ellipsoid('skin', 'Head', [0, 1.6, 0.03], [0.128, 0.11, 0.13], [0, 0, 0], [40, 28])
// Ears.
for (const s of [1, -1]) {
  ellipsoid('skin', 'Head', [s * 0.146, 1.66, 0.0], [0.022, 0.04, 0.028], [0, s * 0.3, 0])
  ellipsoid('cheek', 'Head', [s * 0.152, 1.66, 0.004], [0.01, 0.024, 0.015], [0, s * 0.3, 0])
}
// Nose.
ellipsoid('skin', 'Head', [0, 1.632, 0.168], [0.022, 0.032, 0.026], [-0.15, 0, 0])
for (const s of [1, -1]) ellipsoid('skin', 'Head', [s * 0.016, 1.613, 0.158], [0.013, 0.011, 0.012])
// Soft cheeks.
for (const s of [1, -1]) ellipsoid('cheek', 'Head', [s * 0.088, 1.618, 0.122], [0.026, 0.016, 0.01], [0, s * 0.55, 0])

// Eyes: sclera, iris, pupil, highlight — each eye on its own joint so it can look around.
for (const s of [1, -1]) {
  const L = s > 0 ? '_L' : '_R'
  const c = jointWorld['Eye' + L]
  ellipsoid('sclera', 'Eye' + L, [c.x, c.y, c.z], [0.03, 0.03, 0.028], [0, 0, 0], [28, 20])
  ellipsoid('iris', 'Eye' + L, [c.x, c.y, c.z + 0.024], [0.016, 0.016, 0.006], [0, 0, 0], [24, 14])
  ellipsoid('pupil', 'Eye' + L, [c.x, c.y, c.z + 0.028], [0.0085, 0.0085, 0.004], [0, 0, 0], [16, 10])
  ellipsoid('sclera', 'Eye' + L, [c.x + 0.006, c.y + 0.007, c.z + 0.032], [0.0035, 0.0035, 0.002], [0, 0, 0], [10, 8])
  // Upper eyelid: a skin cap above the eye. Rotating the Lid joint +X sweeps it down (blink).
  add(new THREE.SphereGeometry(0.033, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.32), 'skin', 'Lid' + L, trs([c.x, c.y, c.z], [-0.08, 0, 0]))
}
// Brows — thick, neatly groomed, gently arched.
for (const s of [1, -1]) {
  const pts = [[s * 0.028, 1.716, 0.152], [s * 0.06, 1.724, 0.152], [s * 0.094, 1.716, 0.14]]
  capsule('brow', 'Head', pts[0], pts[1], 0.0085, 10)
  capsule('brow', 'Head', pts[1], pts[2], 0.0078, 10)
}

// Glasses — round, thin black frame.
for (const s of [1, -1]) {
  torus('glasses', 'Head', [s * 0.058, 1.672, 0.182], 0.043, 0.0035, [0, 0, 0], Math.PI * 2, [1, 1, 1], [8, 48])
  // temple arm to the ear
  tube('glasses', 'Head', [s * 0.1, 1.675, 0.176], [s * 0.15, 1.672, 0.02], 0.0028, 0.0028, 6)
}
torus('glasses', 'Head', [0, 1.676, 0.184], 0.015, 0.003, [0, 0, 0], Math.PI, [1, 0.7, 1], [6, 20])

// Beard — neatly trimmed shell around the jaw and chin, clean cheek line.
add(
  new THREE.SphereGeometry(1, 48, 28, Math.PI * 0.5 - Math.PI * 0.6, Math.PI * 1.2, Math.PI * 0.5, Math.PI * 0.44),
  'beard', 'Head', trs([0, 1.608, 0.026], [0.1, 0, 0], [0.136, 0.125, 0.142]),
)
// Sideburns joining hair and beard.
for (const s of [1, -1]) ellipsoid('beard', 'Head', [s * 0.132, 1.668, 0.018], [0.014, 0.062, 0.024], [0, s * 0.35, 0])
// Moustache.
for (const s of [1, -1]) capsule('beard', 'Head', [s * 0.005, 1.592, 0.168], [s * 0.042, 1.58, 0.152], 0.011, 12)
// Mouth (on its own joint so the smile can widen).
torus('mouth', 'Mouth', [0, 1.572, 0.164], 0.026, 0.0065, [0, 0, Math.PI], Math.PI, [1, 0.85, 0.6], [8, 24])
add(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), 'teeth', 'Mouth', trs([0, 1.568, 0.162], [0, 0, 0], [0.022, 0.009, 0.005]))

// Hair — side-parted, combed down, clean tapered sides, natural volume on top.
add(
  new THREE.SphereGeometry(1, 56, 30, 0, Math.PI * 2, 0, Math.PI * 0.545),
  'hair', 'Head', trs([0, 1.672, -0.006], [-0.62, 0, 0], [0.156, 0.188, 0.168]),
)
// Volume on top, swept from the left part toward the right.
ellipsoid('hair', 'Head', [-0.012, 1.81, 0.025], [0.13, 0.055, 0.155], [0.12, 0, 0.1], [40, 22])
ellipsoid('hair', 'Head', [-0.03, 1.79, 0.11], [0.1, 0.045, 0.07], [0.35, 0.15, 0.18], [36, 20])
// Front sweep (combed, no spikes).
ellipsoid('hair', 'Head', [-0.02, 1.775, 0.135], [0.095, 0.03, 0.04], [0.5, 0.0, 0.22], [32, 16])
ellipsoid('hair', 'Head', [0.055, 1.79, 0.115], [0.07, 0.03, 0.05], [0.45, 0.0, -0.1], [28, 14])
// Side part line on his left.
capsule('hair', 'Head', [0.068, 1.818, 0.12], [0.078, 1.835, -0.04], 0.012, 10)
// Tapered sides and back.
for (const s of [1, -1]) ellipsoid('hair', 'Head', [s * 0.128, 1.72, -0.03], [0.03, 0.06, 0.1], [0, 0, s * -0.12])
ellipsoid('hair', 'Head', [0, 1.69, -0.12], [0.13, 0.12, 0.06], [0.2, 0, 0])

/* ───────────────────────── Proportion pass: a healthy, fit build ─────────────
 * The parts above are modelled slim. This pass fills the figure out — fuller
 * chest and shoulders, stronger arms and legs, a slightly fuller face — without
 * changing his height. Each joint region gets an affine warp
 *   p' = pivot' + S · (p − pivot)
 * applied to vertices, normals and the joint positions themselves.
 */
const BUILD = { torso: 1.17, torsoDepth: 1.15, neck: 1.12, arm: 1.2, shoulderOut: 0.034, leg: 1.18, hipOut: 0.012, face: 1.06 }
function regionOf(joint) {
  if (/^(UpperArm|LowerArm|Hand)_/.test(joint)) return 'arm'
  if (/^(UpperLeg|LowerLeg|Foot)_/.test(joint)) return 'leg'
  if (joint === 'Neck') return 'neck'
  if (/^(Head|Eye_|Lid_|Mouth)/.test(joint)) return 'head'
  if (joint === 'Root') return 'none'
  return 'torso'
}
function warpFor(joint) {
  const side = joint.endsWith('_L') ? 1 : -1
  switch (regionOf(joint)) {
    case 'arm': return { pivot: V(side * 0.185, 1.375, 0), to: V(side * (0.185 + BUILD.shoulderOut), 1.375, 0), S: V(1, BUILD.arm, BUILD.arm) }
    case 'leg': return { pivot: V(side * 0.078, 0, 0), to: V(side * (0.078 + BUILD.hipOut), 0, 0), S: V(BUILD.leg, 1, BUILD.leg * 0.97) }
    case 'neck': return { pivot: V(0, 0, 0), to: V(0, 0, 0), S: V(BUILD.neck, 1, BUILD.neck) }
    case 'head': return { pivot: V(0, 0, 0.01), to: V(0, 0, 0.01), S: V(BUILD.face, 1, 1.03) }
    case 'torso': return { pivot: V(0, 0, 0), to: V(0, 0, 0), S: V(BUILD.torso, 1, BUILD.torsoDepth) }
    default: return { pivot: V(0, 0, 0), to: V(0, 0, 0), S: V(1, 1, 1) }
  }
}
const warpPoint = (w, p) => p.clone().sub(w.pivot).multiply(w.S).add(w.to)
for (const part of parts) {
  const w = warpFor(part.joint)
  const pos = part.geo.attributes.position, nor = part.geo.attributes.normal, tmp = V(0, 0, 0)
  for (let i = 0; i < pos.count; i++) {
    tmp.fromBufferAttribute(pos, i); const q2 = warpPoint(w, tmp); pos.setXYZ(i, q2.x, q2.y, q2.z)
    if (nor) { tmp.fromBufferAttribute(nor, i).divide(w.S).normalize(); nor.setXYZ(i, tmp.x, tmp.y, tmp.z) }
  }
}
for (const [name] of J) jointWorld[name] = warpPoint(warpFor(name), jointWorld[name])

/* ───────────────────────── One material: texture atlas ─────────────────────
 * The whole character is ONE skinned mesh with ONE material. Colours live in a
 * 1024² atlas: the top half is the vest plaid (unwrapped around the body), the
 * bottom half is a grid of flat swatches, one per surface. A matching
 * metallic-roughness atlas (G = roughness, B = metalness) keeps leather, metal,
 * skin and fabric looking different.
 */
const ATLAS = 1024
const SW_COLS = 8, SW_ROWS = 4
const swatchNames = Object.keys(MAT).filter((n) => n !== 'vest')
if (swatchNames.length > SW_COLS * SW_ROWS) throw new Error('too many swatches')
const swatchUV = (name) => {
  const i = swatchNames.indexOf(name), c = i % SW_COLS, r = Math.floor(i / SW_COLS)
  return [(c + 0.5) / SW_COLS, 0.5 + (r + 0.5) / (SW_ROWS * 2)]
}
const hexRGB = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]

function buildAtlas() {
  const color = new Uint8Array(ATLAS * ATLAS * 4), mr = new Uint8Array(ATLAS * ATLAS * 4)
  const base = [0x7a, 0x4e, 0x2c], dark = [0x4b, 0x30, 0x1c], warm = [0xb3, 0x6d, 0x3a], cream = [0xd9, 0xc4, 0x9c]
  const band = (v, period, width) => ((v % period) + period) % period < width
  const PX = 102, PY = 86 // check period in px (≈10 cm square on the body)
  for (let y = 0; y < ATLAS / 2; y++) for (let x = 0; x < ATLAS; x++) {
    const c = base.slice()
    const mix = (col, a) => { for (let k = 0; k < 3; k++) c[k] = c[k] * (1 - a) + col[k] * a }
    if (band(x, PX, PX * 0.34)) mix(dark, 0.45)
    if (band(y, PY, PY * 0.34)) mix(dark, 0.45)
    if (band(x + PX * 0.55, PX, PX * 0.09)) mix(warm, 0.55)
    if (band(y + PY * 0.55, PY, PY * 0.09)) mix(warm, 0.55)
    if (band(x + PX * 0.78, PX, 3)) mix(cream, 0.5)
    if (band(y + PY * 0.78, PY, 3)) mix(cream, 0.5)
    const twill = ((x + y) % 4 < 2 ? 1 : -1) * 4
    const i = (y * ATLAS + x) * 4
    for (let k = 0; k < 3; k++) color[i + k] = Math.max(0, Math.min(255, c[k] + twill))
    color[i + 3] = 255
    mr[i] = 255; mr[i + 1] = Math.round(MAT.vest.rough * 255); mr[i + 2] = 0; mr[i + 3] = 255
  }
  const cw = ATLAS / SW_COLS, ch = ATLAS / 2 / SW_ROWS
  swatchNames.forEach((name, idx) => {
    const m = MAT[name], rgb = hexRGB(m.color), c0 = (idx % SW_COLS) * cw, r0 = ATLAS / 2 + Math.floor(idx / SW_COLS) * ch
    for (let y = r0; y < r0 + ch; y++) for (let x = c0; x < c0 + cw; x++) {
      const i = (y * ATLAS + x) * 4
      color.set([rgb[0], rgb[1], rgb[2], 255], i)
      mr.set([255, Math.round(m.rough * 255), Math.round((m.metal ?? 0) * 255), 255], i)
    }
  })
  return { color: encodePNG(color, ATLAS, ATLAS), mr: encodePNG(mr, ATLAS, ATLAS) }
}

function encodePNG(px, w, h) {
  const raw = Buffer.alloc(h * (w * 4 + 1))
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(px.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1) }
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
  const crc = (b) => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]) }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))])
}

/* ───────────────────────── Animation clips ───────────────────────── */

const q = (x = 0, y = 0, z = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, 'ZYX'))
const poseQ = (name, dx = 0, dy = 0, dz = 0) => {
  const p = HERO_POSE[name] ?? [0, 0, 0]
  return q(p[0] + dx, p[1] + dy, p[2] + dz)
}
const CLIPS = {
  TPose: { times: [0], tracks: Object.fromEntries(J.map(([n]) => [n, [q()]])) },
  HeroPose: { times: [0], tracks: Object.fromEntries(Object.keys(HERO_POSE).map((n) => [n, [poseQ(n)]])) },
  Idle: (() => {
    const times = [0, 1, 2, 3, 4]
    const b = [0, 1, 0, -1, 0]
    const tracks = Object.fromEntries(Object.keys(HERO_POSE).map((n) => [n, times.map(() => poseQ(n))]))
    tracks.Chest = b.map((v) => poseQ('Chest', -v * 0.015))
    tracks.Head = b.map((v, i) => poseQ('Head', v * 0.02, Math.sin(i * 1.4) * 0.05))
    tracks.Hips = b.map((v) => poseQ('Hips', 0, 0, v * 0.012))
    return { times, tracks }
  })(),
  Wave: (() => {
    const times = [0, 0.3, 0.6, 0.9, 1.2, 1.5]
    const tracks = {}
    tracks.UpperArm_R = times.map((_, i) => poseQ('UpperArm_R', 0, 0, i === 0 || i === 5 ? 0 : 0.45))
    tracks.LowerArm_R = times.map((_, i) => poseQ('LowerArm_R', 0, 0, i === 0 || i === 5 ? 0 : i % 2 ? 0.35 : -0.15))
    tracks.Mouth = null
    delete tracks.Mouth
    return { times, tracks }
  })(),
  Nod: { times: [0, 0.25, 0.5, 0.75], tracks: { Head: [poseQ('Head'), poseQ('Head', 0.22), poseQ('Head', -0.04), poseQ('Head')], Neck: [poseQ('Neck'), poseQ('Neck', 0.08), poseQ('Neck'), poseQ('Neck')] } },
}

/* ───────────────────────── GLB writer ───────────────────────── */

const bin = []
let binLen = 0
const gltf = {
  asset: { version: '2.0', generator: 'hafiz-portfolio build-character.mjs' },
  scene: 0, scenes: [{ name: 'Scene', nodes: [] }], nodes: [], meshes: [], materials: [], skins: [],
  accessors: [], bufferViews: [], buffers: [], textures: [], images: [], samplers: [], animations: [],
}
function view(bytes, target, stride) {
  const pad = (4 - (binLen % 4)) % 4
  if (pad) { bin.push(Buffer.alloc(pad)); binLen += pad }
  const bv = { buffer: 0, byteOffset: binLen, byteLength: bytes.byteLength }
  if (target) bv.target = target
  if (stride) bv.byteStride = stride
  bin.push(Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)); binLen += bytes.byteLength
  gltf.bufferViews.push(bv)
  return gltf.bufferViews.length - 1
}
const COMP = { 5121: Uint8Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array }
const NCOMP = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }
function accessor(arr, type, componentType, { target, minmax, normalized } = {}) {
  const bv = view(arr, target)
  const n = NCOMP[type], count = arr.length / n
  const acc = { bufferView: bv, componentType, count, type }
  if (normalized) acc.normalized = true
  if (minmax) {
    const min = Array(n).fill(Infinity), max = Array(n).fill(-Infinity)
    for (let i = 0; i < count; i++) for (let k = 0; k < n; k++) { const v = arr[i * n + k]; if (v < min[k]) min[k] = v; if (v > max[k]) max[k] = v }
    acc.min = min.map((v) => Math.fround(v)); acc.max = max.map((v) => Math.fround(v))
  }
  gltf.accessors.push(acc)
  return gltf.accessors.length - 1
}

// Nodes: one container, the joint hierarchy, and the skinned mesh.
const container = { name: 'Hafiz', children: [] }
gltf.nodes.push(container)
gltf.scenes[0].nodes.push(0)
const jointNode = {}
for (const [name, parent] of J) {
  const p = parent ? jointWorld[parent] : V(0, 0, 0)
  const t = jointWorld[name].clone().sub(p)
  gltf.nodes.push({ name, translation: [t.x, t.y, t.z].map((v) => +v.toFixed(6)), children: [] })
  jointNode[name] = gltf.nodes.length - 1
}
for (const [name, parent] of J) {
  if (parent) gltf.nodes[jointNode[parent]].children.push(jointNode[name])
}
container.children.push(jointNode.Root)
for (const n of gltf.nodes) if (n.children && n.children.length === 0) delete n.children

// Texture atlas (base colour + metallic-roughness).
const atlas = buildAtlas()
gltf.samplers.push({ magFilter: 9729, minFilter: 9987, wrapS: 33071, wrapT: 33071 })
gltf.images.push({ name: 'hafiz-color', mimeType: 'image/png', bufferView: view(new Uint8Array(atlas.color)) })
gltf.images.push({ name: 'hafiz-metal-rough', mimeType: 'image/png', bufferView: view(new Uint8Array(atlas.mr)) })
gltf.textures.push({ sampler: 0, source: 0 }, { sampler: 0, source: 1 })

// The one material.
gltf.materials.push({
  name: 'HafizMaterial',
  pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], baseColorTexture: { index: 0 }, metallicFactor: 1, roughnessFactor: 1, metallicRoughnessTexture: { index: 1 } },
  doubleSided: true,
})

// Merge every part into ONE primitive. UVs point into the atlas.
const VEST_U0 = VEST_OPEN, VEST_U1 = Math.PI * 2 - VEST_OPEN
let nv = 0, ni = 0
for (const { geo } of parts) { nv += geo.attributes.position.count; ni += geo.index ? geo.index.count : geo.attributes.position.count }
const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2)
const jnt = new Uint8Array(nv * 4), wgt = new Float32Array(nv * 4)
const idx = new Uint32Array(ni)
let vo = 0, io = 0
for (const { geo, joint, mat } of parts) {
  const n = geo.attributes.position.count
  pos.set(geo.attributes.position.array, vo * 3)
  nor.set(geo.attributes.normal.array, vo * 3)
  const sw = mat === 'vest' ? null : swatchUV(mat)
  for (let i = 0; i < n; i++) {
    let u, v
    if (sw) { [u, v] = sw } else {
      const x = pos[(vo + i) * 3], y = pos[(vo + i) * 3 + 1], z = pos[(vo + i) * 3 + 2]
      let phi = Math.atan2(x, z); if (phi < 0) phi += Math.PI * 2
      u = THREE.MathUtils.clamp((phi - VEST_U0) / (VEST_U1 - VEST_U0), 0.002, 0.998)
      v = THREE.MathUtils.clamp((1.46 - y) / 0.6, 0.002, 0.998) * 0.5
    }
    uv[(vo + i) * 2] = u; uv[(vo + i) * 2 + 1] = v
    jnt[(vo + i) * 4] = jointIndex[joint]; wgt[(vo + i) * 4] = 1
  }
  if (geo.index) for (let i = 0; i < geo.index.count; i++) idx[io++] = geo.index.array[i] + vo
  else for (let i = 0; i < n; i++) idx[io++] = vo + i
  vo += n
}
for (let i = 0; i < nv; i++) { const l = Math.hypot(nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]) || 1; nor[i * 3] /= l; nor[i * 3 + 1] /= l; nor[i * 3 + 2] /= l }
const totalVerts = nv, totalTris = ni / 3
const primitives = [{
  attributes: {
    POSITION: accessor(pos, 'VEC3', 5126, { target: 34962, minmax: true }),
    NORMAL: accessor(nor, 'VEC3', 5126, { target: 34962 }),
    TEXCOORD_0: accessor(uv, 'VEC2', 5126, { target: 34962 }),
    JOINTS_0: accessor(jnt, 'VEC4', 5121, { target: 34962 }),
    WEIGHTS_0: accessor(wgt, 'VEC4', 5126, { target: 34962 }),
  },
  indices: accessor(idx, 'SCALAR', 5125, { target: 34963 }),
  material: 0,
  mode: 4,
}]
gltf.meshes.push({ name: 'HafizBody', primitives })

// Skin: inverse bind matrices = inverse of each joint's world bind transform (pure translations).
const ibm = new Float32Array(J.length * 16)
J.forEach(([name], i) => { const w = jointWorld[name]; m4().makeTranslation(-w.x, -w.y, -w.z).toArray(ibm, i * 16) })
gltf.skins.push({ name: 'HafizRig', joints: J.map(([n]) => jointNode[n]), skeleton: jointNode.Root, inverseBindMatrices: accessor(ibm, 'MAT4', 5126) })
gltf.nodes.push({ name: 'HafizBody', mesh: 0, skin: 0 })
container.children.push(gltf.nodes.length - 1)

// Animations.
for (const [name, clip] of Object.entries(CLIPS)) {
  const input = accessor(new Float32Array(clip.times), 'SCALAR', 5126, { minmax: true })
  const anim = { name, samplers: [], channels: [] }
  for (const [joint, quats] of Object.entries(clip.tracks)) {
    if (!quats || jointNode[joint] === undefined) continue
    const out = new Float32Array(clip.times.length * 4)
    clip.times.forEach((_, i) => { const qq = quats[Math.min(i, quats.length - 1)]; out.set([qq.x, qq.y, qq.z, qq.w], i * 4) })
    anim.samplers.push({ input, output: accessor(out, 'VEC4', 5126), interpolation: 'LINEAR' })
    anim.channels.push({ sampler: anim.samplers.length - 1, target: { node: jointNode[joint], path: 'rotation' } })
  }
  gltf.animations.push(anim)
}

// Pack GLB.
const binBuf = Buffer.concat(bin)
const binPadded = Buffer.concat([binBuf, Buffer.alloc((4 - (binBuf.length % 4)) % 4)])
gltf.buffers.push({ byteLength: binPadded.length })
let json = Buffer.from(JSON.stringify(gltf))
json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 0x20)])
const header = Buffer.alloc(12)
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(12 + 8 + json.length + 8 + binPadded.length, 8)
const jh = Buffer.alloc(8); jh.writeUInt32LE(json.length, 0); jh.writeUInt32LE(0x4e4f534a, 4)
const bh = Buffer.alloc(8); bh.writeUInt32LE(binPadded.length, 0); bh.writeUInt32LE(0x004e4942, 4)
mkdirSync(dirname(OUT), { recursive: true })
const glb = Buffer.concat([header, jh, json, bh, binPadded])
writeFileSync(OUT, glb)
console.log(`hafiz.glb: ${(glb.length / 1024 / 1024).toFixed(2)} MB · ${totalVerts} verts · ${totalTris} tris · ${J.length} bones · ${gltf.materials.length} material · 1 mesh · ${primitives.length} primitive · clips: ${Object.keys(CLIPS).join(', ')}`)
