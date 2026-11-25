'use client'

import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, Bot, Box, Code2, Mail } from 'lucide-react'
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { useTheme } from 'next-themes'
import dynamic from 'next/dynamic'
import { persona } from '@/lib/portfolio-data'
import { MagneticButton } from '@/components/effects/magnetic-button'
import { useHeavy3D } from '@/hooks/use-heavy-3d'
import { scrollToId } from '@/lib/scroll-store'

const HeroSceneLazy = dynamic(
  () => import('@/components/scene/hero-scene').then((m) => m.HeroScene),
  { ssr: false },
)

import type { CharacterInteraction } from '@/components/scene/hero-character'

const POSTER = '/models/hafiz-hero.png'

let webglCache: boolean | null = null
function webglAvailable() {
  if (webglCache !== null) return webglCache
  try {
    const c = document.createElement('canvas')
    webglCache = Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    webglCache = false
  }
  return webglCache
}
const noopSubscribe = () => () => {}

class SceneBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.warn('[hero] 3D scene disabled:', err)
  }
  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children
  }
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const heavy = useHeavy3D()
  const { resolvedTheme } = useTheme()
  const [inView, setInView] = useState(true)
  const [modelReady, setModelReady] = useState(false)
  const canWebGL = useSyncExternalStore(noopSubscribe, webglAvailable, () => true)
  const [hovered, setHovered] = useState(false)
  const interaction = useRef<CharacterInteraction>({ hovered: false, nodAt: -1e9 })
  const onModelReady = useCallback(() => setModelReady(true), [])

  // Hills drift at 0.3x the scroll speed (rAF-throttled, off for reduced motion).
  useEffect(() => {
    const el = sectionRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight * 1.2)
        el.style.setProperty('--hero-scroll', `${y * 0.3}px`)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const setHover = (value: boolean) => {
    interaction.current.hovered = value
    setHovered(value)
  }
  const sayHello = () => {
    interaction.current.nodAt = performance.now()
  }
  const onStageKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      sayHello()
    }
  }

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    const bounds = event.currentTarget.getBoundingClientRect()
    // Body parallax: max 8px each way.
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 16
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 16
    event.currentTarget.style.setProperty('--pointer-x', `${x}px`)
    event.currentTarget.style.setProperty('--pointer-y', `${y}px`)
    sectionRef.current?.style.setProperty('--hill-x', `${x}px`)
    sectionRef.current?.style.setProperty('--hill-y', `${y}px`)
  }

  return (
    <section
      id="home"
      ref={sectionRef}
      className="hero-section relative min-h-[100svh] overflow-hidden px-5 sm:px-8 lg:px-10"
    >
      <div className="hero-landscape absolute inset-0" aria-hidden="true" />
      <div className="hero-shade absolute inset-0" aria-hidden="true" />
      <div className="hero-wordmark" aria-hidden="true">HAFIZ ABDULLAH</div>

      <div data-hero-content className="relative z-10 mx-auto grid min-h-[100svh] w-full max-w-7xl items-center gap-2 pt-28 pb-24 lg:grid-cols-[55fr_45fr] lg:gap-0 lg:pt-24 lg:pb-20">
        <div className="hero-copy relative z-10 max-w-2xl text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-8 inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-left text-xs leading-relaxed text-white/90 shadow-lg backdrop-blur-md"
          >
            <span className="size-2 shrink-0 rounded-full bg-[#B5C93A] shadow-[0_0_14px_#B5C93A]" />
            {persona.availability}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D9E2C8]"
          >
            Web Application Developer
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="mb-5 font-display text-6xl font-medium leading-[1.05] tracking-[-0.02em] text-white sm:text-7xl lg:text-7xl xl:text-[6.25rem]"
          >
            <span className="block">Hafiz</span>
            <span className="hero-name-accent block">Abdullah.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-5 flex items-center justify-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-[#D9E2C8] lg:justify-start"
          >
            <span className="h-px w-8 bg-[#B5C93A]/70" />
            {persona.location}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="mx-auto max-w-lg text-sm leading-7 text-white/80 sm:text-base lg:mx-0"
          >
            {persona.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
          >
            <MagneticButton
              onClick={() => scrollToId('projects')}
              className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-white pr-1.5 pl-6 text-sm font-semibold text-[#111811] shadow-lg transition hover:bg-[#F5F2EB]"
              strength={0.15}
            >
              See the work
              <span className="cta-arrow" aria-hidden="true"><ArrowDown className="size-3.5" /></span>
            </MagneticButton>
            <MagneticButton
              onClick={() => scrollToId('contact')}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20"
              strength={0.15}
            >
              <Mail className="size-4" /> Get in touch
            </MagneticButton>
          </motion.div>
        </div>

        <div
          ref={stageRef}
          onPointerMove={handlePointerMove}
          onPointerEnter={(event) => event.pointerType === 'mouse' && setHover(true)}
          onPointerLeave={(event) => {
            setHover(false)
            event.currentTarget.style.setProperty('--pointer-x', '0px')
            event.currentTarget.style.setProperty('--pointer-y', '0px')
            sectionRef.current?.style.setProperty('--hill-x', '0px')
            sectionRef.current?.style.setProperty('--hill-y', '0px')
          }}
          onClick={sayHello}
          onKeyDown={onStageKey}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          data-hovered={hovered ? 'true' : 'false'}
          className="hero-stage relative mx-auto w-full max-w-[500px] cursor-pointer outline-none lg:max-w-none"
          role="button"
          tabIndex={0}
          aria-label="Hafiz Abdullah's 3D character standing on a green hill. Press to say hello."
        >
          <div className="hero-canvas-scale absolute inset-0">
            {/* Poster: shows instantly (good LCP), stays as the fallback without WebGL. */}
            <img
              src={POSTER}
              alt=""
              aria-hidden="true"
              width={461}
              height={977}
              fetchPriority="high"
              decoding="async"
              className={`hero-poster ${modelReady && canWebGL ? 'is-hidden' : ''}`}
            />
            {canWebGL && (
              <SceneBoundary>
                <HeroSceneLazy
                  isDark={resolvedTheme !== 'light'}
                  active={inView && heavy}
                  eventSource={sectionRef}
                  interaction={interaction}
                  onReady={onModelReady}
                />
              </SceneBoundary>
            )}
          </div>
          <div className="hero-chip hero-chip-mern"><Code2 className="size-3.5" /> MERN</div>
          <div className="hero-chip hero-chip-3d"><Box className="size-3.5" /> 3D Web</div>
          <div className="hero-chip hero-chip-ai"><Bot className="size-3.5" /> AI Tools</div>
          <div className="hero-stage-caption" aria-hidden="true">
            <span className="size-1.5 rounded-full bg-[#B5C93A]" />
            {hovered ? 'Click to say hello' : 'Building from Karachi'}
          </div>
        </div>
      </div>

      <motion.button
        onClick={() => scrollToId('about')}
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-white/75 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        aria-label="Scroll to About"
      >
        Scroll <ArrowRight className="size-3.5 rotate-90" />
      </motion.button>
    </section>
  )
}
