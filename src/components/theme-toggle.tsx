'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  // Avoid hydration mismatch by reading a value that only exists on the client.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative" aria-label="Toggle theme">
        <Sun className="size-5" />
      </Button>
    )
  }

  const current = resolvedTheme ?? theme
  const isDark = current === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative border-border/40 hover:border-sun/50 transition-colors"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <Sun
        className={`size-5 transition-all duration-500 ${
          isDark ? 'rotate-0 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        } text-sun`}
      />
      <Moon
        className={`absolute size-5 transition-all duration-500 ${
          isDark ? 'rotate-0 scale-100 opacity-100 text-sea' : 'rotate-90 scale-0 opacity-0'
        }`}
      />
    </Button>
  )
}
