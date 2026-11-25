'use client'

// React Three Fiber objects are mutated imperatively inside useFrame —
// that is the intended rendering path, not React state.
/* eslint-disable react-hooks/immutability */

import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { HafizCharacter, type CharacterInteraction } from './hero-character'

/**
 * Hero stage — "Classic Green Hills".
 *
 * A small, self-contained 3D stage that lives in the right column of the hero.
 * The rolling hills themselves are the site-wide landscape image behind it;
 * the stage only adds a soft meadow patch under his feet so he stands in it:
 *  - the character (public/models/hafiz.glb) standing on top, see hero-character.tsx
 *  - soft mist banks, fireflies / pollen, a contact shadow and a click glow
 *
 * The canvas is transparent and its edges are faded with a CSS mask, so the
 * full-bleed hills photograph behind it shows through. When the device is
 * low-powered or the visitor prefers reduced motion, the scene renders one
 * still frame ("demand" loop) instead of disappearing.
 */

type Palette = {
  knoll: string
  meadow: string
  knollShade: string
  hillNear: string
  hillFar: string
  tree: string
  treeAlt: string
  trunk: string
  sky: string
  ground: string
  sun: string
  mote: string
  moteOpacity: number
}

const DARK: Palette = {
  knoll: '#5C7240',
  meadow: '#C9B25E',
  knollShade: '#3F5530',
  hillNear: '#33462C',
  hillFar: '#26361F',
  tree: '#22331F',
  treeAlt: '#2C3F27',
  trunk: '#2A2A1E',
  sky: '#8A9A7A',
  ground: '#0A120A',
  sun: '#F2D996',
  mote: '#D8EE7A',
  moteOpacity: 0.85,
}

const LIGHT: Palette = {
  knoll: '#8A9B52',
  meadow: '#E8D27A',
  knollShade: '#6E8044',
  hillNear: '#76874A',
  hillFar: '#93A06A',
  tree: '#46603A',
  treeAlt: '#56703F',
  trunk: '#5A4B34',
  sky: '#E8E6D2',
  ground: '#53664A',
  sun: '#FFF0C1',
  mote: '#FFF6D8',
  moteOpacity: 0.7,
}

/* Small seeded random so the layout is identical on every load. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ---------- Camera: fixed framing, looks at the character ---------- */

function CameraAim() {
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    camera.lookAt(0, 0.95, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

/* ---------- Floating motes (fireflies at night, pollen by day) ---------- */

function useGlowTexture() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.3, 'rgba(255,255,255,0.5)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 64)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

function Motes({ palette, dark }: { palette: Palette; dark: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const texture = useGlowTexture()
  const { positions, seeds } = useMemo(() => {
    const rnd = mulberry32(7)
    const n = 26
    const positions = new Float32Array(n * 3)
    const seeds = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      positions[i * 3] = (rnd() - 0.5) * 7
      positions[i * 3 + 1] = 0.2 + rnd() * 2.8
      positions[i * 3 + 2] = (rnd() - 0.6) * 4
      seeds[i] = rnd() * 100
    }
    return { positions, seeds }
  }, [])
  const base = useMemo(() => positions.slice(), [positions])

  useFrame((state) => {
    const pts = ref.current
    if (!pts) return
    const t = state.clock.elapsedTime
    const attr = pts.geometry.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i]
      attr.setXYZ(
        i,
        base[i * 3] + Math.sin(t * 0.35 + s) * 0.25,
        base[i * 3 + 1] + Math.sin(t * 0.5 + s * 1.7) * 0.18,
        base[i * 3 + 2] + Math.cos(t * 0.3 + s) * 0.2,
      )
    }
    attr.needsUpdate = true
    const mat = pts.material as THREE.PointsMaterial
    mat.opacity = palette.moteOpacity * (0.75 + Math.sin(t * 1.3) * 0.25)
  })

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        color={palette.mote}
        size={dark ? 0.12 : 0.09}
        sizeAttenuation
        transparent
        opacity={palette.moteOpacity}
        depthWrite={false}
        blending={dark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  )
}

/* ---------- Soft mist banks between the hills ---------- */

function useMistTexture() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 64
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(128, 32, 0, 128, 32, 128)
    grad.addColorStop(0, 'rgba(255,255,255,0.9)')
    grad.addColorStop(0.5, 'rgba(255,255,255,0.35)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 64)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

function Mist({ palette, dark }: { palette: Palette; dark: boolean }) {
  const texture = useMistTexture()
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const banks: { pos: [number, number, number]; scale: [number, number]; speed: number }[] = [
    { pos: [-1.5, -0.2, -2.6], scale: [7, 1.1], speed: 0.06 },
    { pos: [2.2, -0.45, -4.4], scale: [8, 1.3], speed: -0.045 },
    { pos: [0, -0.55, -1.2], scale: [6, 0.7], speed: 0.035 },
  ]
  useFrame((state) => {
    const t = state.clock.elapsedTime
    refs.current.forEach((m, i) => {
      if (m) m.position.x = banks[i].pos[0] + Math.sin(t * banks[i].speed * 6 + i) * 0.35
    })
  })
  return (
    <group>
      {banks.map((b, i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m }} position={b.pos} scale={[b.scale[0], b.scale[1], 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={texture} color={dark ? palette.sky : '#FFFDF4'} transparent opacity={dark ? 0.16 : 0.32} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/* ---------- Click glow: a lime ring + light that pulses out from his feet ---------- */

function GlowPulse({ interaction }: { interaction: React.MutableRefObject<CharacterInteraction> }) {
  const ring = useRef<THREE.Mesh>(null)
  const light = useRef<THREE.PointLight>(null)
  useFrame(() => {
    const p = (performance.now() - interaction.current.nodAt) / 1100
    const on = p >= 0 && p <= 1
    const k = on ? 1 - p : 0
    if (ring.current) {
      ring.current.visible = on
      ring.current.scale.setScalar(0.4 + p * 1.6)
      ;(ring.current.material as THREE.MeshBasicMaterial).opacity = k * 0.55
    }
    if (light.current) light.current.intensity = k * 3.2
  })
  return (
    <group>
      <mesh ref={ring} position={[0, 0.02, 0.05]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.42, 0.5, 64]} />
        <meshBasicMaterial color="#B5C93A" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[0.2, 1.4, 0.8]} color="#D8EE7A" intensity={0} distance={3.5} decay={1.5} />
    </group>
  )
}

/* ---------- A soft patch of meadow under his feet (fades into the photo) ---------- */

function GroundPatch({ palette }: { palette: Palette }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, 'rgba(255,255,255,0.95)')
    grad.addColorStop(0.55, 'rgba(255,255,255,0.55)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 256)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  const tufts = useMemo(() => {
    const rnd = mulberry32(5)
    return Array.from({ length: 26 }, () => {
      const a = rnd() * Math.PI * 2
      const r = 0.38 + rnd() * 0.75
      return { x: Math.cos(a) * r * 1.4, z: Math.sin(a) * r * 0.8 + 0.1, s: 0.55 + rnd() * 0.6, r: rnd() * 3 }
    })
  }, [])
  return (
    <group>
      <mesh position={[0, 0, 0.1]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.4, 1.9, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} color={palette.knoll} transparent opacity={0.85} depthWrite={false} />
      </mesh>
      {tufts.map((t, i) => (
        <mesh key={i} position={[t.x, 0.04 * t.s, t.z]} rotation={[0, t.r, 0]} scale={t.s}>
          <coneGeometry args={[0.04, 0.15, 4]} />
          <meshStandardMaterial color={i % 3 ? palette.knollShade : palette.knoll} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  )
}

/* ---------- Contact shadow under his feet ---------- */

function FootShadow({ palette }: { palette: Palette }) {
  return (
    <group position={[0, 0.006, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh scale={[1.25, 0.75, 1]}>
        <circleGeometry args={[0.36, 48]} />
        <meshBasicMaterial color={palette.ground} transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <mesh scale={[1.1, 0.55, 1]}>
        <circleGeometry args={[0.2, 40]} />
        <meshBasicMaterial color={palette.ground} transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* ---------- Scene ---------- */

export function HeroScene({
  isDark = true,
  active = true,
  eventSource,
  interaction,
  onReady,
}: {
  isDark?: boolean
  active?: boolean
  eventSource?: React.RefObject<HTMLElement | null>
  interaction: React.MutableRefObject<CharacterInteraction>
  onReady?: () => void
}) {
  const palette = isDark ? DARK : LIGHT
  const [dpr, setDpr] = useState(1.5)

  return (
    <Canvas
      camera={{ position: [0, 1.15, 4.55], fov: 30 }}
      dpr={[1, Math.min(dpr, 1.75)]}
      // "demand" still renders a first frame (and on prop changes), so the
      // character is always visible — it just stops animating when inactive.
      frameloop={active ? 'always' : 'demand'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      eventSource={eventSource as React.RefObject<HTMLElement>}
      eventPrefix="client"
      style={{ pointerEvents: 'none' }}
    >
      <CameraAim />
      <PerformanceMonitor onDecline={() => setDpr(1)} />

      {/* Soft cinematic key light from the top-left, warm fill, olive rim. */}
      <ambientLight intensity={isDark ? 0.42 : 0.7} />
      <hemisphereLight args={[palette.sky, palette.ground, isDark ? 0.7 : 0.85]} />
      <directionalLight position={[-4, 6, 4.5]} intensity={isDark ? 1.9 : 2.4} color="#FFF0D2" />
      <directionalLight position={[3.5, 2.5, 2]} intensity={isDark ? 0.45 : 0.6} color={palette.sun} />
      <directionalLight position={[2, 3, -4]} intensity={isDark ? 0.9 : 0.6} color="#B5C93A" />

      <Suspense fallback={null}>
        <GroundPatch palette={palette} />
        <Mist palette={palette} dark={isDark} />
        <FootShadow palette={palette} />
        <HafizCharacter interaction={interaction} onReady={onReady} />
        <GlowPulse interaction={interaction} />
        <Motes palette={palette} dark={isDark} />
        {/* Local light cards instead of a downloaded HDR file. No network needed. */}
        <Environment resolution={64} frames={1}>
          <Lightformer form="rect" intensity={1.6} position={[-3, 4, 4]} scale={[6, 3, 1]} color="#FFF0D2" />
          <Lightformer form="rect" intensity={0.8} position={[5, 1, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 6, 1]} color={palette.sky} />
        </Environment>
      </Suspense>
    </Canvas>
  )
}
