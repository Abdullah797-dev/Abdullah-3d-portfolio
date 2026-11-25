'use client'

import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Clamp text to N lines WITHOUT cutting a word in half.
 *
 * CSS line-clamp places its ellipsis wherever the line runs out, often in the
 * middle of a word ("cost-effectiv…"). This measures the real rendered width
 * and keeps as many whole words as fit, then adds "…". It re-measures on
 * resize. Before the first measurement it falls back to CSS line-clamp.
 */
export function WordClamp({
  text,
  lines,
  className = '',
}: {
  text: string
  lines: number
  className?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [shown, setShown] = useState<string | null>(null)
  const [measured, setMeasured] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    let lastWidth = -1

    const measure = () => {
      const width = el.clientWidth
      if (!width || width === lastWidth) return
      lastWidth = width
      const cs = getComputedStyle(el)
      const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.6
      const max = lineHeight * lines + 1

      const probe = document.createElement('p')
      probe.className = className.replace(/\bline-clamp-\d+\b/g, '')
      probe.style.cssText = `position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;width:${width}px;margin:0;display:block;overflow:visible;-webkit-line-clamp:unset;`
      document.body.appendChild(probe)

      probe.textContent = text
      if (probe.offsetHeight <= max) {
        setShown(null)
      } else {
        const words = text.split(/\s+/)
        const tidy = (n: number) => words.slice(0, n).join(' ').replace(/[\s,;:.—–-]+$/, '') + '…'
        let lo = 1
        let hi = words.length - 1
        while (lo < hi) {
          const mid = Math.ceil((lo + hi) / 2)
          probe.textContent = tidy(mid)
          if (probe.offsetHeight <= max) lo = mid
          else hi = mid - 1
        }
        setShown(tidy(lo))
      }
      probe.remove()
      setMeasured(true)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [text, lines, className])

  return (
    <p
      ref={ref}
      className={measured ? className.replace(/\bline-clamp-\d+\b/g, '') : className}
      title={shown ? text : undefined}
    >
      {shown ?? text}
    </p>
  )
}
