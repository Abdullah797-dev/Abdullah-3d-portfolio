'use client'

import { useRef, useSyncExternalStore, type ReactNode } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * ScrollParallax — moves children at a different speed than the scroll.
 *
 * Uses Framer Motion's useScroll on the element's position in the viewport
 * and applies a Y transform. `speed` controls how much it moves:
 *   speed > 0 → moves slower than scroll (appears to lag, parallax background)
 *   speed < 0 → moves faster than scroll (appears to lead, parallax foreground)
 *
 * The offset defaults to ["start end", "end start"] so the parallax is active
 * the entire time the element is in the viewport.
 */
export function ScrollParallax({
  children,
  className,
  speed = 0.3,
  offset = ['start end', 'end start'],
}: {
  children: ReactNode
  className?: string
  speed?: number
  offset?: ('start end' | 'end start' | 'start start' | 'end end')[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as never,
  })
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, -speed * 100])

  return (
    <motion.div ref={ref} style={{ y }} className={cn(className)}>
      {children}
    </motion.div>
  )
}

/**
 * ScrollReveal — fades + slides children in when they enter the viewport.
 * Respects prefers-reduced-motion.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 30,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

/**
 * usePrefersReducedMotion — returns true if the user has requested reduced motion.
 */
export function usePrefersReducedMotion(): boolean {
  // useSyncExternalStore keeps server and first client render identical (false).
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  )
}

export type { MotionValue }
