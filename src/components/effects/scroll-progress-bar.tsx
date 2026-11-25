'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

/**
 * ScrollProgressBar — a thin sun→sea gradient bar fixed at the top of the
 * viewport that fills as the user scrolls down the page.
 *
 * Sits above the navbar (z-50) and is pointer-events-none so it never
 * blocks clicks. Hidden on prefers-reduced-motion.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #4a6b2a 0%, #7a9a1f 50%, #b5c93a 100%)',
        boxShadow: '0 0 10px var(--glow)',
      }}
      aria-hidden="true"
    />
  )
}
