import type Lenis from 'lenis'

/**
 * Shared scroll state. Written once per frame by SmoothScroll and ScrollEffects,
 * read by the 3D scene and the nav. A plain object avoids React re-renders.
 */
export const scrollState = {
  lenis: null as Lenis | null,
  y: 0,
  /** Smoothed scroll speed in px per frame. Positive when scrolling down. */
  velocity: 0,
  /** 0 to 1 while the hero scrolls out of view. */
  heroProgress: 0,
}

export function scrollToId(id: string) {
  if (typeof document === 'undefined') return
  const el = document.getElementById(id)
  if (!el) return
  if (scrollState.lenis) {
    scrollState.lenis.scrollTo(el, { duration: 1.2, offset: 0 })
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export function scrollToTop() {
  if (typeof window === 'undefined') return
  if (scrollState.lenis) {
    scrollState.lenis.scrollTo(0, { duration: 1.2 })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
