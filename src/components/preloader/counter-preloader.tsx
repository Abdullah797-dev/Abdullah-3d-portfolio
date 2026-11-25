'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const KEY = 'ha-preloader-shown'
const MIN_MS = 1200
const MAX_MS = 1200

/**
 * Short name-and-landscape preloader with a progress line.
 *
 * The count follows real page load. It waits at 92 until the window `load`
 * event fires, then finishes. It shows once per browser session.
 */
export function CounterPreloader() {
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const root = document.documentElement

    if (sessionStorage.getItem(KEY)) {
      requestAnimationFrame(() => setVisible(false))
      return
    }

    root.classList.add('is-loading')
    let raf = 0
    let shown = 0
    let finished = false
    let loaded = document.readyState === 'complete'
    const start = performance.now()
    const onLoad = () => {
      loaded = true
    }
    window.addEventListener('load', onLoad)

    const finish = () => {
      if (finished) return
      finished = true
      setCount(100)
      sessionStorage.setItem(KEY, '1')
      root.classList.remove('is-loading')
      setTimeout(() => setVisible(false), 250)
    }

    const tick = (now: number) => {
      const elapsed = now - start
      const timeTarget = Math.min(elapsed / MIN_MS, 1) * 100
      const target = loaded ? timeTarget : Math.min(timeTarget, 92)
      shown += (target - shown) * 0.2
      const v = Math.min(100, Math.round(shown))
      setCount((prev) => (prev === v ? prev : v))

      if ((loaded && elapsed >= MIN_MS && v >= 99) || elapsed >= MAX_MS) {
        finish()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('load', onLoad)
      root.classList.remove('is-loading')
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] overflow-hidden bg-[#0A120A] text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: '-6%' }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          role="progressbar"
          aria-label="Loading"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={count}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-55"
            style={{ backgroundImage: 'url(/backgrounds/hills-1280.jpg)' }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A120A]/50 via-[#0A120A]/35 to-[#0A120A]/90" aria-hidden="true" />
          <div className="absolute inset-0 grid place-items-center px-6 text-center">
            <div>
              <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.3em] text-[#D9E2C8]">Web application developer</p>
              <div className="font-display text-[clamp(3.5rem,12vw,8rem)] font-medium leading-[0.9] tracking-[-0.05em]">
                Hafiz<br /><span className="text-[#B5C93A]">Abdullah</span>
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.2em] text-white/65">{String(count).padStart(2, '0')}%</p>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/15">
            <div
              className="h-full origin-left bg-[#B5C93A]"
              style={{ transform: `scaleX(${count / 100})`, boxShadow: '0 0 12px var(--glow)' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
