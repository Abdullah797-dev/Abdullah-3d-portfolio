'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollState } from '@/lib/scroll-store'

gsap.registerPlugin(ScrollTrigger)

/**
 * Lenis smooth scroll, driven by the GSAP ticker so ScrollTrigger and the
 * 3D scene stay in sync with it.
 *
 * Skipped on touch screens and for reduced motion (native scroll is better
 * there). The ticker still tracks scroll speed so the water can react.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    let lenis: Lenis | null = null
    if (fine && !reduced) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })
      scrollState.lenis = lenis
      lenis.on('scroll', ScrollTrigger.update)
    }

    let lastY = window.scrollY
    const tick = (time: number) => {
      lenis?.raf(time * 1000)
      const y = window.scrollY
      scrollState.y = y
      scrollState.velocity += (y - lastY - scrollState.velocity) * 0.15
      lastY = y
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)

    return () => {
      window.removeEventListener('load', onLoad)
      gsap.ticker.remove(tick)
      lenis?.destroy()
      scrollState.lenis = null
    }
  }, [])

  return <>{children}</>
}
