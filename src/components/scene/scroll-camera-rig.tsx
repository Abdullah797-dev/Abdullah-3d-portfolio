'use client'

import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '@/lib/scroll-store'

/**
 * One camera rig for everything.
 *
 *  - Mouse: the camera drifts a little toward the pointer.
 *  - Scroll: the camera zooms in and lifts as the hero scrolls away.
 *    The progress value comes from a GSAP ScrollTrigger (see ScrollEffects).
 *
 * It is the only thing that writes the camera, so mouse and scroll never fight.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const pointer = useThree((s) => s.pointer)
  const look = useMemo(() => new THREE.Vector3(0, 0.3, 0), [])

  /* eslint-disable react-hooks/immutability */
  useFrame((_, dt) => {
    const p = scrollState.heroProgress
    const eased = p * p * (3 - 2 * p)

    const tx = pointer.x * 0.9
    const ty = 2.3 + pointer.y * 0.35 + eased * 0.6
    const tz = 8 - eased * 3.4

    camera.position.x = THREE.MathUtils.damp(camera.position.x, tx, 2.5, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, ty, 2.5, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, tz, 3, dt)
    camera.lookAt(look)
  })
  /* eslint-enable react-hooks/immutability */

  return null
}
