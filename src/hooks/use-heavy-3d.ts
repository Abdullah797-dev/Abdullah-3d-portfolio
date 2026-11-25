'use client'

import { useSyncExternalStore } from 'react'

/**
 * Enable continuous WebGL animation only when motion is allowed and the
 * device has enough reported CPU threads. The scene itself remains visible
 * as a static canvas on lower-powered devices.
 */
const QUERY = '(prefers-reduced-motion: no-preference)'

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

function getSnapshot() {
  const cores = navigator.hardwareConcurrency ?? 8
  return window.matchMedia(QUERY).matches && cores >= 4
}

export function useHeavy3D() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
