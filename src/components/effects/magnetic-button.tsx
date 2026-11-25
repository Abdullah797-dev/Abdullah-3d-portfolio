'use client'

import { useRef, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * MagneticButton — attracts toward the cursor with spring smoothing.
 *
 * Wraps any button-like element. On mouse move within a magnetic radius,
 * the button translates toward the cursor. Springs back to origin on leave.
 *
 * Disabled on touch devices.
 */
type MagneticButtonProps = {
  children: ReactNode
  className?: string
  strength?: number
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export function MagneticButton({
  children,
  className,
  strength = 0.3,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15 })
  const sy = useSpring(y, { stiffness: 200, damping: 15 })

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Mouse only. Touch and reduced-motion users get a normal button.
    if (!window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set((e.clientX - cx) * strength)
    y.set((e.clientY - cy) * strength)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      className={cn('btn-glow', className)}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  )
}
