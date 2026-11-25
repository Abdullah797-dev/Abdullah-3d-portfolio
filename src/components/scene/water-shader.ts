/**
 * Realistic ocean water shader — Awwwards-level upgrade.
 *
 * Pipeline:
 *  Vertex shader:
 *    - 4 layered Gerstner waves (different directions, steepnesses, wavelengths)
 *    - Each wave contributes horizontal displacement (sharp crests, flat troughs)
 *      and an analytical normal contribution.
 *    - Jacobian determinant accumulation → foam appears where the surface pinches.
 *    - **Mouse ripple**: a Gaussian-centered displacement at the mouse world position
 *      creates a raised wave that follows the cursor. Decays smoothly with distance.
 *    - **Scroll-speed modulation**: scroll speed drives the wave speed (via uPhase) so the
 *      ocean flows faster as you scroll down.
 *  Fragment shader:
 *    - Procedural animated noise added to normals for small-scale ripple detail.
 *    - Depth-based color (deep ocean blue → aqua) using vertex height.
 *    - Fresnel reflection of sky color (more reflection at grazing angles).
 *    - Blinn-Phong specular from sun direction → sun-glitter path.
 *    - Broad specular halo for soft sun reflection around the glitter path.
 *    - Foam blend on crests (pure white foam for clean premium look).
 *    - Distance fade to transparent, so the page background shows through.
 *    - Soft rim glow (uGlowColor) on grazing angles.
 *    - uPhase is accumulated in JS (dt * speed) so changing speed never jumps the waves.
 *
 * References:
 *   - "Simulating Ocean Water" (Tessendorf, 2001)
 *   - GPU Gems ch.1 — Effective Water Simulation from Physical Models
 *   - Shadertoy "Ocean" by Dave_Hoskins
 */
import * as THREE from 'three'

export const waterVertexShader = /* glsl */ `
uniform float uTime;
uniform vec4 uWaveA; // xy = direction, z = steepness, w = wavelength
uniform vec4 uWaveB;
uniform vec4 uWaveC;
uniform vec4 uWaveD;
uniform float uPhase;         // accumulated wave time (speed is applied in JS)
uniform vec2 uMouse;        // world-space xz where the cursor hits the water plane
uniform float uMouseStrength; // 0..1, fades when mouse leaves the canvas

varying vec3 vNormal;
varying vec3 vViewDir;
varying float vHeight;
varying float vFoam;
varying vec2 vUv;
varying vec3 vWorldPos;
varying float vRipple;

// One Gerstner wave: returns displacement (dx, dy, dz) and accumulates
// normal contribution + Jacobian determinant for foam detection.
vec3 gerstner(
  vec2 pos,
  vec2 dir,
  float steep,
  float wavelength,
  float t,
  inout vec3 normalAcc,
  inout float jac
) {
  float k = 6.28318530718 / wavelength;       // wave number
  float c = sqrt(9.8 / k);                    // phase speed (gravity-driven)
  float f = k * (dot(dir, pos) - c * uPhase); // phase
  float a = steep / k;                         // amplitude
  float cosf = cos(f);
  float sinf = sin(f);

  // Horizontal displacement → sharp crests, flat troughs
  // Vertical displacement → the wave height
  vec3 disp = vec3(dir.x * a * cosf, a * sinf, dir.y * a * cosf);

  // Surface normal contribution (GPU Gems simplified form)
  normalAcc.x -= dir.x * steep * cosf;
  normalAcc.z -= dir.y * steep * cosf;

  // Jacobian: J = 1 - sum(steep^2 * sinf). Where J is small → foam.
  jac -= steep * steep * sinf;

  return disp;
}

// Mouse ripple: a damped sinusoidal bump centered at uMouse.
// Uses an exponential falloff so the disturbance is local and smooth.
float mouseRipple(vec2 pos, vec2 mouse, float t, float strength) {
  vec2 d = pos - mouse;
  float dist = length(d);
  // Falloff — Gaussian so it's smooth and localized
  float falloff = exp(-dist * dist * 0.18);
  // Traveling ripple rings — cosine of distance minus time
  float ring = cos(dist * 2.5 - t * 5.0);
  // Secondary slower ring for richness
  float ring2 = cos(dist * 1.4 - t * 2.5);
  return (ring * 0.6 + ring2 * 0.4) * falloff * strength * 0.22;
}

void main() {
  vec2 xz = position.xz;
  vec3 disp = vec3(0.0);
  vec3 normalAcc = vec3(0.0, 1.0, 0.0);
  float jac = 1.0;

  disp += gerstner(xz, normalize(uWaveA.xy), uWaveA.z, uWaveA.w, uTime, normalAcc, jac);
  disp += gerstner(xz, normalize(uWaveB.xy), uWaveB.z, uWaveB.w, uTime, normalAcc, jac);
  disp += gerstner(xz, normalize(uWaveC.xy), uWaveC.z, uWaveC.w, uTime, normalAcc, jac);
  disp += gerstner(xz, normalize(uWaveD.xy), uWaveD.z, uWaveD.w, uTime, normalAcc, jac);

  // Mouse ripple displacement — raises the water where the cursor hovers
  float ripple = mouseRipple(xz, uMouse, uTime, uMouseStrength);
  disp.y += ripple;
  vRipple = ripple;

  // Tilt the normal slightly toward the ripple gradient so lighting responds
  float rippleGrad = mouseRipple(xz + vec2(0.1, 0.0), uMouse, uTime, uMouseStrength) - ripple;
  normalAcc.x -= rippleGrad * 2.0;
  float rippleGradZ = mouseRipple(xz + vec2(0.0, 0.1), uMouse, uTime, uMouseStrength) - ripple;
  normalAcc.z -= rippleGradZ * 2.0;

  vec3 pos = position + disp;
  vHeight = disp.y;
  vNormal = normalize(normalAcc);
  vFoam = 1.0 - smoothstep(-0.05, 0.55, jac);
  vUv = xz;

  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vWorldPos = worldPos.xyz;
  vViewDir = normalize(cameraPosition - worldPos.xyz);

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`

export const waterFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uShallowColor;
uniform vec3 uDeepColor;
uniform vec3 uSkyColor;
uniform vec3 uSunColor;
uniform vec3 uSunDirection;
uniform float uFresnelPower;
uniform float uShininess;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uGlowColor;
uniform float uGlowStrength;

varying vec3 vNormal;
varying vec3 vViewDir;
varying float vHeight;
varying float vFoam;
varying vec2 vUv;
varying vec3 vWorldPos;
varying float vRipple;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),               hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// Fractional Brownian motion for richer ripple detail
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 2; i++) {
    v += amp * vnoise(p);
    p *= 2.13;
    amp *= 0.5;
  }
  return v;
}

void main() {
  // Small-scale ripple normals (procedural, animated, no texture needed)
  vec2 rippleUv = vUv * 3.5 + vec2(uTime * 0.18, uTime * 0.07);
  float n1 = fbm(rippleUv) * 2.0 - 1.0;
  float n2 = fbm(rippleUv * 2.3 - vec2(uTime * 0.11, uTime * 0.16)) * 2.0 - 1.0;
  vec3 rippleNormal = vec3(n1, 0.0, n2) * 0.18;

  vec3 normal = normalize(vNormal + rippleNormal);

  // Depth-based color: height as a proxy for crest vs trough.
  float depthFactor = smoothstep(-0.35, 0.65, vHeight);
  vec3 waterColor = mix(uDeepColor, uShallowColor, depthFactor);

  // Fresnel — more reflection at grazing angles.
  float NdotV = max(dot(normal, vViewDir), 0.0);
  float fresnel = pow(1.0 - NdotV, uFresnelPower);

  // Blend water with sky reflection (cool sky-blue tint).
  vec3 finalColor = mix(waterColor, uSkyColor, fresnel * 0.55);

  // Soft blue rim glow where the surface catches the sky.
  finalColor += uGlowColor * pow(fresnel, 1.4) * uGlowStrength;

  // Blinn-Phong specular from sun direction → the glitter path.
  vec3 halfVec = normalize(uSunDirection + vViewDir);
  float NdotH = max(dot(normal, halfVec), 0.0);
  float spec = pow(NdotH, uShininess);
  finalColor += uSunColor * spec * 3.0;

  // Broader specular halo — soft sun reflection around the sharp glitter path.
  float broadSpec = pow(NdotH, 32.0);
  finalColor += uSunColor * broadSpec * 0.18;

  // Mouse ripple highlight — a subtle bright sheen where the water is raised
  float rippleHighlight = smoothstep(0.02, 0.15, vRipple);
  finalColor += uSunColor * rippleHighlight * 0.4;

  // Foam on wave crests — pure white for a clean premium look.
  vec3 foamColor = vec3(0.97, 0.98, 1.0);
  // Also add foam where the ripple is strong (mouse disturbance creates white caps)
  float mouseFoam = smoothstep(0.08, 0.18, vRipple);
  finalColor = mix(finalColor, foamColor, max(vFoam * 0.5, mouseFoam * 0.6));

  // Distance fade: the water turns transparent toward the horizon, so it
  // blends into the page background in both themes.
  float dist = length(vWorldPos.xz);
  float fogFactor = smoothstep(uFogNear, uFogFar, dist);

  gl_FragColor = vec4(finalColor, 1.0 - fogFactor);
}
`

export type WaterUniforms = {
  uTime: { value: number }
  uWaveA: { value: THREE.Vector4 }
  uWaveB: { value: THREE.Vector4 }
  uWaveC: { value: THREE.Vector4 }
  uWaveD: { value: THREE.Vector4 }
  uPhase: { value: number }
  uMouse: { value: THREE.Vector2 }
  uMouseStrength: { value: number }
  uShallowColor: { value: THREE.Color }
  uDeepColor: { value: THREE.Color }
  uSkyColor: { value: THREE.Color }
  uSunColor: { value: THREE.Color }
  uSunDirection: { value: THREE.Vector3 }
  uFresnelPower: { value: number }
  uShininess: { value: number }
  uFogColor: { value: THREE.Color }
  uFogNear: { value: number }
  uFogFar: { value: number }
  uGlowColor: { value: THREE.Color }
  uGlowStrength: { value: number }
}

/**
 * Build the water ShaderMaterial. Caller owns the material and should dispose
 * it on unmount. Palette: deep ocean blue + aqua + white foam — clean and premium.
 */
export function createWaterMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uWaveA: { value: new THREE.Vector4(1.0, 0.3, 0.42, 11.0) },
      uWaveB: { value: new THREE.Vector4(-0.5, 1.0, 0.30, 6.5) },
      uWaveC: { value: new THREE.Vector4(0.7, -0.8, 0.22, 3.5) },
      uWaveD: { value: new THREE.Vector4(-0.3, -0.6, 0.15, 1.8) },
      uPhase: { value: 0 },
      uMouse: { value: new THREE.Vector2(999.0, 999.0) },
      uMouseStrength: { value: 0.0 },
      // Deep ocean blue → aqua gradient
      uShallowColor: { value: new THREE.Color('#1e9bd8') },   // aqua blue
      uDeepColor: { value: new THREE.Color('#0a1929') },     // deep ocean blue
      // Cool sky reflection (pale blue, not orange)
      uSkyColor: { value: new THREE.Color('#7ec8e3') },
      // Bright cool-white sun for specular highlights
      uSunColor: { value: new THREE.Color('#e8f4ff') },
      uSunDirection: { value: new THREE.Vector3(0.3, 0.55, -0.78).normalize() },
      uFresnelPower: { value: 3.0 },
      uShininess: { value: 200.0 },
      uFogColor: { value: new THREE.Color('#0a1929') },
      uFogNear: { value: 22.0 },
      uFogFar: { value: 34.0 },
      uGlowColor: { value: new THREE.Color('#4cc3ff') },
      uGlowStrength: { value: 0.35 },
    } as WaterUniforms as unknown as { [k: string]: THREE.IUniform },
    side: THREE.DoubleSide,
    transparent: true,
  })
}
