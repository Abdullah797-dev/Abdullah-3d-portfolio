'use client'

import { useRef, useSyncExternalStore, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion'

const QUERY = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/**
 * TiltCard. 3D tilt that follows the mouse.
 *
 * On hover the card tilts, lifts up a few pixels and a soft light follows the
 * cursor. The border glow comes from the `.surface` class on the card inside.
 * Text is never pushed forward in Z, so it stays sharp.
 *
 * Off on touch screens and for reduced motion.
 */
export function TiltCard({
  children,
  className = '',
  maxTilt = 7,
  lift = 8,
  glowColor = 'var(--glow-soft)',
}: {
  children: ReactNode
  className?: string
  maxTilt?: number
  lift?: number
  glowColor?: string
}) {
  const enabled = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )

  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const hover = useSpring(0, { stiffness: 220, damping: 22 })
  const sx = useSpring(mx, { stiffness: 200, damping: 20 })
  const sy = useSpring(my, { stiffness: 200, damping: 20 })

  const rotateX = useTransform(sy, [0, 1], [maxTilt, -maxTilt])
  const rotateY = useTransform(sx, [0, 1], [-maxTilt, maxTilt])
  const y = useTransform(hover, [0, 1], [0, -lift])
  const scale = useTransform(hover, [0, 1], [1, 1.012])
  const glowX = useTransform(sx, [0, 1], ['0%', '100%'])
  const glowY = useTransform(sy, [0, 1], ['0%', '100%'])
  const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, ${glowColor} 0%, transparent 62%)`

  // The tree is the same whether or not tilt is on, so children never remount.
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }

  return (
    <div ref={ref} style={{ perspective: '900px' }} className={className}>
      <motion.div
        onMouseEnter={() => enabled && hover.set(1)}
        onMouseMove={handleMove}
        onMouseLeave={() => {
          hover.set(0)
          mx.set(0.5)
          my.set(0.5)
        }}
        style={{ rotateX, rotateY, y, scale, transformStyle: 'preserve-3d' }}
        className="relative h-full w-full rounded-2xl will-change-transform"
      >
        {children}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glowBackground, opacity: hover }}
        />
      </motion.div>
    </div>
  )
}
