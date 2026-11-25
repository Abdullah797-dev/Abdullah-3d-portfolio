'use client'

import { cn } from '@/lib/utils'

/**
 * Logo — Arabic calligraphy of "حافظ عبدالله" rendered with the Amiri font.
 *
 * The text is set RTL via the `dir` attribute so the joined letterforms
 * shape correctly. A subtle sun→sea gradient gives the calligraphic strokes
 * warmth without becoming a garish "AI gradient" effect.
 */
export function Logo({
  className,
  size = 'md',
  showLatin = false,
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showLatin?: boolean
}) {
  const sizes: Record<string, string> = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
  }
  return (
    <span
      className={cn(
        'font-arabic leading-none select-none',
        'gradient-text-sunset',
        sizes[size],
        className,
      )}
      dir="rtl"
      lang="ar"
      aria-label="حافظ عبدالله — Hafiz Abdullah"
    >
      حافظ عبدالله
      {showLatin && (
        <span className="sr-only">Hafiz Abdullah</span>
      )}
    </span>
  )
}
