'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = 'left',
}: {
  eyebrow?: string
  title: string
  description?: string
  className?: string
  align?: 'left' | 'center'
}) {
  return (
    <div
      data-parallax="0.04"
      className={cn(
        'max-w-3xl mb-14 lg:mb-20',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 mb-4"
        >
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-px w-10 bg-gradient-to-r from-sun to-sun/40 origin-left"
          />
          <span           className="section-eyebrow text-xs font-mono tracking-[0.12em] text-sun">
            {eyebrow}
          </span>
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="serif-heading glow-hover text-4xl sm:text-5xl lg:text-6xl font-semibold font-display tracking-tight leading-[1.02]"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl"
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}

export function SectionWrapper({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={cn('content-section relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8', className)}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  )
}
