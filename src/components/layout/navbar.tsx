'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from './logo'
import { scrollToId, scrollState } from '@/lib/scroll-store'

const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'video', label: 'Video' },
  { id: 'contact', label: 'Contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState('home')

  // Scrolled state: cheap, only flips at the threshold.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Active section: IntersectionObserver instead of reading layout on every scroll.
  useEffect(() => {
    const sections = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Mobile menu: Escape closes it, and the page stops scrolling behind it.
  useEffect(() => {
    if (!mobileOpen) return
    scrollState.lenis?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      scrollState.lenis?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen])

  const go = (id: string) => {
    setMobileOpen(false)
    // Wait one tick so Lenis is running again before it scrolls.
    requestAnimationFrame(() => scrollToId(id))
  }

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${scrolled ? 'bg-[#0a120ae8] shadow-lg shadow-black/10' : 'bg-[#0a120a80]'}`}>
        <nav aria-label="Primary" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-3 border-b border-white/10 backdrop-blur-xl">
          <button
            onClick={() => go('home')}
            className="flex shrink-0 items-center gap-2.5 py-1 group"
            aria-label="Go to top"
          >
            <span className="size-2 rounded-full bg-[#B5C93A] shadow-[0_0_10px_#B5C93A]" aria-hidden="true" />
            <Logo size="md" className="text-white transition-opacity group-hover:opacity-90" />
            <span className="hidden items-center gap-2.5 font-display text-[17px] font-medium tracking-[-0.01em] text-white sm:inline-flex"><span className="h-4 w-px rotate-12 bg-white/30" aria-hidden="true" />Hafiz Abdullah</span>
          </button>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => go(n.id)}
                  aria-current={active === n.id ? 'true' : undefined}
                  className={`relative px-2.5 py-2 text-xs font-medium transition-colors 2xl:px-3 2xl:text-sm ${
                    active === n.id
                      ? 'text-[#D9E2C8]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {n.label}
                  {active === n.id && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-[#B5C93A]"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />
            <Button
              onClick={() => go('contact')}
              className="hidden h-10 rounded-full bg-white px-4 text-xs font-semibold text-[#111811] hover:bg-[#F5F2EB] sm:inline-flex"
            >
              Hire Me
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="mobile-menu"
            className="fixed inset-0 z-30 bg-[#0a120af5] pt-20 backdrop-blur-xl lg:hidden"
          >
            <ul className="flex flex-col gap-2 p-6">
              {NAV.map((n, i) => (
                <motion.li
                  key={n.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => go(n.id)}
                    aria-current={active === n.id ? 'true' : undefined}
                    className={`w-full text-left py-3.5 px-4 rounded-xl text-base font-medium transition-colors ${
                      active === n.id
                        ? 'bg-white/10 text-white border border-white/15'
                        : 'text-white/75 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {n.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
