'use client'

// Bones are mutated imperatively every frame — the intended R3F animation path.
/* eslint-disable react-hooks/immutability */

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import heroPoseJson from '@/lib/hero-pose.json'
import { scrollState } from '@/lib/scroll-store'

export const CHARACTER_URL = '/models/hafiz.glb'

/** Live interaction state written by the hero section (no React re-renders). */
export type CharacterInteraction = {
  /** Pointer is over the character stage. */
  hovered: boolean
  /** performance.now() of the last click / tap / Enter on the stage. */
  nodAt: number
}

type Euler3 = [number, number, number]
const POSE = Object.fromEntries(
  Object.entries(heroPoseJson).filter(([k]) => !k.startsWith('_')),
) as Record<string, Euler3>

const BONES = [
  'Root', 'Hips', 'Spine', 'Chest', 'Neck', 'Head', 'Eye_L', 'Eye_R', 'Lid_L', 'Lid_R', 'Mouth',
  'UpperArm_L', 'LowerArm_L', 'Hand_L', 'UpperArm_R', 'LowerArm_R', 'Hand_R',
  'UpperLeg_L', 'LowerLeg_L', 'Foot_L', 'UpperLeg_R', 'LowerLeg_R', 'Foot_R',
] as const
type BoneName = (typeof BONES)[number]

const MAX_LOOK = THREE.MathUtils.degToRad(12)
const damp = THREE.MathUtils.damp
const clamp = THREE.MathUtils.clamp

/**
 * The hero character, loaded from /models/hafiz.glb and animated procedurally:
 *  - idle: breathing, blinking every 3–4 s, small head drift, gentle weight shift
 *  - cursor: head and eyes follow the pointer (max 12°)
 *  - scroll: turns −5° and scales to 0.98 as the hero scrolls away
 *  - hover: a small wave and a wider smile
 *  - click: a friendly nod (the scene adds a glow pulse)
 */
export function HafizCharacter({
  interaction,
  onReady,
}: {
  interaction: MutableRefObject<CharacterInteraction>
  onReady?: () => void
}) {
  const { scene } = useGLTF(CHARACTER_URL)
  const group = useRef<THREE.Group>(null)
  const pointer = useThree((s) => s.pointer)
  const invalidate = useThree((s) => s.invalidate)

  const bones = useMemo(() => {
    const map = {} as Record<BoneName, THREE.Object3D | undefined>
    for (const name of BONES) map[name] = scene.getObjectByName(name) ?? undefined
    scene.traverse((o) => {
      const mesh = o as THREE.SkinnedMesh
      if (mesh.isSkinnedMesh) {
        mesh.frustumCulled = false
        const mat = mesh.material as THREE.MeshStandardMaterial
        // Softer, "studio" look on fabric/skin; keeps glasses and metal crisp.
        if (mat && 'envMapIntensity' in mat) mat.envMapIntensity = 0.85
      }
    })
    return map
  }, [scene])

  // Smoothed animation state.
  const s = useRef({
    lookX: 0, lookY: 0, eyeX: 0, eyeY: 0,
    wave: 0, smile: 0, scroll: 0,
    nextBlink: 1.6, blinkStart: -10,
  })

  useEffect(() => {
    invalidate()
    onReady?.()
  }, [invalidate, onReady])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 1 / 20)
    const st = s.current
    const it = interaction.current

    // ---- inputs, smoothed
    const px = clamp(pointer.x, -1, 1)
    const py = clamp(pointer.y, -1, 1)
    st.lookX = damp(st.lookX, px * MAX_LOOK, 4, dt)
    st.lookY = damp(st.lookY, -py * MAX_LOOK * 0.7, 4, dt)
    st.eyeX = damp(st.eyeX, px * MAX_LOOK, 9, dt)
    st.eyeY = damp(st.eyeY, -py * MAX_LOOK * 0.8, 9, dt)
    st.wave = damp(st.wave, it.hovered ? 1 : 0, 5, dt)
    st.smile = damp(st.smile, it.hovered ? 1 : 0, 6, dt)
    st.scroll = damp(st.scroll, scrollState.heroProgress, 6, dt)

    // ---- idle signals
    const breath = Math.sin(t * 1.6)
    const shift = Math.sin(t * 0.42)
    const drift = Math.sin(t * 0.55) * 0.5 + Math.sin(t * 0.23) * 0.5

    // Blink every 3–4 s, 160 ms long.
    if (t > st.nextBlink) {
      st.blinkStart = t
      st.nextBlink = t + 3 + Math.random()
    }
    const bp = (t - st.blinkStart) / 0.16
    const blink = bp >= 0 && bp <= 1 ? Math.sin(bp * Math.PI) : 0

    // Nod: 0.7 s after a click.
    const nodP = (performance.now() - it.nodAt) / 700
    const nod = nodP >= 0 && nodP <= 1 ? Math.sin(nodP * Math.PI) * (1 - nodP * 0.3) : 0

    // Wave: forearm swings while hovered.
    const waveSwing = Math.sin(t * 7.5) * 0.32 * st.wave

    const set = (name: BoneName, dx = 0, dy = 0, dz = 0) => {
      const b = bones[name]
      if (!b) return
      const p = POSE[name] ?? [0, 0, 0]
      b.rotation.set(p[0] + dx, p[1] + dy, p[2] + dz, 'ZYX')
    }

    set('Root', 0, THREE.MathUtils.degToRad(-5) * st.scroll)
    set('Hips', 0, shift * 0.02, shift * 0.012)
    set('Spine', -breath * 0.006, 0, -shift * 0.008)
    set('Chest', -breath * 0.014, 0, -shift * 0.006)
    set('Neck', st.lookY * 0.35 + nod * 0.12, st.lookX * 0.35)
    set('Head', st.lookY * 0.65 + drift * 0.02 + nod * 0.26, st.lookX * 0.65 + drift * 0.03, -st.lookX * 0.08)
    set('Eye_L', st.eyeY, st.eyeX)
    set('Eye_R', st.eyeY, st.eyeX)
    set('Lid_L', blink * 1.15)
    set('Lid_R', blink * 1.15)

    // Arms: relaxed left arm sways with breath; right arm welcomes, waves on hover.
    set('UpperArm_L', 0, 0, breath * 0.012)
    set('LowerArm_L')
    set('Hand_L')
    set('UpperArm_R', 0, -st.wave * 0.15, st.wave * 0.55 + breath * 0.01)
    set('LowerArm_R', 0, st.wave * 0.2, waveSwing)
    set('Hand_R', 0, 0, waveSwing * 0.4)

    for (const n of ['UpperLeg_L', 'LowerLeg_L', 'Foot_L', 'UpperLeg_R', 'LowerLeg_R', 'Foot_R'] as const) set(n)
    // Weight shift: counter-rotate the legs so the feet stay planted.
    if (bones.UpperLeg_L) bones.UpperLeg_L.rotation.z -= shift * 0.012
    if (bones.UpperLeg_R) bones.UpperLeg_R.rotation.z -= shift * 0.012

    // Smile widens on hover.
    const mouth = bones.Mouth
    if (mouth) mouth.scale.set(1 + st.smile * 0.28, 1 + st.smile * 0.22, 1)

    // Breathing lifts the chest a touch; scroll scales the whole figure to 0.98.
    if (group.current) group.current.scale.setScalar(1 - 0.02 * st.scroll)
  })

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(CHARACTER_URL)
