'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollState } from '@/lib/scroll-store'

gsap.registerPlugin(ScrollTrigger)

/**
 * GSAP ScrollTrigger effects for the whole page. Renders nothing.
 *
 *  - Sections fade and rise in once.
 *  - [data-parallax="0.2"] elements drift at their own speed.
 *  - The hero text fades out as you leave the hero.
 *  - The hero progress value drives the 3D camera zoom.
 *
 * Skipped when the visitor asks for reduced motion.
 */
export function ScrollEffects() {
  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // 1. Section reveals. clearProps matters: a leftover transform would
      // break the fixed-position project modal inside the section.
      gsap.utils
        .toArray<HTMLElement>('main > section:not(#home) > div')
        .forEach((inner) => {
          gsap.fromTo(
            inner,
            { autoAlpha: 0, y: 56 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              clearProps: 'transform,opacity,visibility',
              scrollTrigger: { trigger: inner, start: 'top 88%', once: true },
            },
          )
        })

      // 2. Parallax. Speed 0.2 moves the element 20% of its travel.
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || '0.15')
        gsap.fromTo(
          el,
          { y: speed * 90 },
          {
            y: speed * -90,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      })

      // 3. Hero: camera progress + text fade.
      const home = document.getElementById('home')
      if (home) {
        ScrollTrigger.create({
          trigger: home,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          onUpdate: (self) => {
            scrollState.heroProgress = self.progress
          },
        })
        gsap.to('[data-hero-content]', {
          opacity: 0,
          y: -70,
          ease: 'none',
          scrollTrigger: {
            trigger: home,
            start: '15% top',
            end: '75% top',
            scrub: true,
          },
        })
      }

    })

    return () => mm.revert()
  }, [])

  return null
}
