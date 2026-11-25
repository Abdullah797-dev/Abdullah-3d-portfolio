'use client'

import { ArrowUp } from 'lucide-react'
import { persona } from '@/lib/portfolio-data'
import { Logo } from './logo'
import { scrollToId, scrollToTop } from '@/lib/scroll-store'

const LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'video', label: 'Video' },
  { id: 'contact', label: 'Contact' },
]

/**
 * Footer — Virenhold style: frosted glass over the blurred hills, a hairline
 * meta row, an evenly spaced link row, and a giant fading wordmark.
 */
export function Footer() {
  const year = new Date().getFullYear()
  return (
    <>
      <footer className="site-footer relative mt-auto overflow-hidden text-white">
        <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8 lg:pt-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <button onClick={scrollToTop} className="group inline-flex items-center gap-3" aria-label="Back to top">
              <span className="size-2 rounded-full bg-[#B5C93A] shadow-[0_0_10px_#B5C93A]" aria-hidden="true" />
              <Logo size="md" className="text-white transition-opacity group-hover:opacity-80" />
              <span className="h-4 w-px rotate-12 bg-white/30" aria-hidden="true" />
              <span className="font-display text-lg font-medium text-white">Hafiz Abdullah</span>
            </button>
            <p className="max-w-md text-sm leading-6 text-[#D9E2C8]/75">{persona.tagline}</p>
          </div>

          <div className="footer-glass">
            <div className="footer-meta">
              <p>© {year} {persona.name}</p>
              <span className="footer-rule" aria-hidden="true" />
              <p className="tracking-[0.22em] uppercase text-[#D9E2C8]">{persona.location}</p>
              <span className="footer-rule" aria-hidden="true" />
              <div className="flex items-center gap-3">
                <p>All Rights Reserved</p>
                <button onClick={scrollToTop} className="footer-top" aria-label="Back to top">
                  <ArrowUp className="size-3.5" /> Top
                </button>
              </div>
            </div>
            <nav aria-label="Footer" className="footer-links">
              {LINKS.map((l) => (
                <button key={l.id} onClick={() => scrollToId(l.id)}>{l.label}</button>
              ))}
            </nav>
          </div>

          <div className="footer-wordmark-clip mt-6" aria-hidden="true">
            <span className="footer-wordmark text-center select-none">HAFIZ ABDULLAH</span>
          </div>
        </div>
      </footer>
      <span className="personal-pill">Personal &amp; client use</span>
    </>
  )
}
