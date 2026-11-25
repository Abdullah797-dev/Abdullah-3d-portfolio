'use client'

import { useEffect, useRef } from 'react'

/**
 * One landscape behind the whole site (Virenhold style).
 * A sharp rolling-hills image sits fixed behind every section; as you scroll
 * past the hero it softens into a blurred, darker version so text and glass
 * cards stay readable. Driven by one CSS variable (--depth, 0 → 1).
 */
export function SiteBackdrop() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const depth = Math.min(1, window.scrollY / (window.innerHeight * 0.9))
      el.style.setProperty('--depth', depth.toFixed(3))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return (
    <div ref={ref} className="site-backdrop" aria-hidden="true">
      <div className="site-backdrop-sharp" />
      <div className="site-backdrop-soft" />
      <div className="site-backdrop-shade" />
    </div>
  )
}
