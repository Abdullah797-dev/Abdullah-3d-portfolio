'use client'

import { useEffect, useRef } from 'react'

const INTERACTIVE = 'a, button, [role="button"], summary, select, [data-cursor="hover"]'
const TEXT_FIELD = 'input, textarea, [contenteditable="true"]'

/**
 * Glowing dot cursor.
 *
 * A small dot follows the mouse exactly. A soft halo trails behind it and
 * grows over links and buttons. Only runs on devices with a real mouse.
 * All movement is written straight to the DOM, so React never re-renders.
 */
export function GlowCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    const root = document.documentElement
    root.classList.add('has-glow-cursor')

    let x = -100
    let y = -100
    let hx = -100
    let hy = -100
    let scale = 1
    let targetScale = 1
    let raf = 0
    let running = false

    const dot = dotRef.current
    const halo = haloRef.current

    const render = () => {
      hx += (x - hx) * 0.18
      hy += (y - hy) * 0.18
      scale += (targetScale - scale) * 0.16
      if (dot) dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      if (halo) halo.style.transform = `translate3d(${hx}px, ${hy}px, 0) translate(-50%, -50%) scale(${scale})`
      const settled =
        Math.abs(x - hx) < 0.1 && Math.abs(y - hy) < 0.1 && Math.abs(targetScale - scale) < 0.005
      if (settled) {
        running = false
        return
      }
      raf = requestAnimationFrame(render)
    }
    const start = () => {
      if (running) return
      running = true
      raf = requestAnimationFrame(render)
    }

    const setVisible = (on: boolean) => {
      const o = on ? '1' : '0'
      if (dot) dot.style.opacity = o
      if (halo) halo.style.opacity = o
    }

    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      if (hx < 0) {
        hx = x
        hy = y
      }
      setVisible(true)
      start()
    }
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null
      if (!t || !t.closest) return
      if (t.closest(TEXT_FIELD)) {
        setVisible(false)
        return
      }
      targetScale = t.closest(INTERACTIVE) ? 2.4 : 1
      start()
    }
    const onDown = () => {
      targetScale *= 0.8
      start()
    }
    const onUp = () => {
      targetScale = targetScale < 1 ? 1 : targetScale / 0.8
      start()
    }
    const onLeave = () => setVisible(false)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      root.classList.remove('has-glow-cursor')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <>
      <div
        ref={haloRef}
        aria-hidden="true"
        className="glow-cursor cursor-ring pointer-events-none fixed left-0 top-0 z-[200] size-12 rounded-full opacity-0 will-change-transform"
        style={{
          // Dot + ring cursor: a thin lime ring that trails the dot.
          border: '1.5px solid var(--cursor-ring, #b5c93a)',
          background: 'radial-gradient(circle, var(--glow-soft) 0%, transparent 70%)',
          transition: 'opacity 0.25s ease',
        }}
      />
      <div
        ref={dotRef}
        aria-hidden="true"
        className="glow-cursor pointer-events-none fixed left-0 top-0 z-[201] size-2 rounded-full opacity-0 will-change-transform"
        style={{
          background: 'var(--cursor-dot)',
          boxShadow: '0 0 10px var(--cursor-dot), 0 0 22px var(--glow)',
          transition: 'opacity 0.25s ease',
        }}
      />
    </>
  )
}
