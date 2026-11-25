'use client'

/**
 * WaveDivider — an SVG wave shape that sits between sections, creating
 * a seamless "ocean surface" transition instead of flat borders.
 *
 * The wave uses the deep-ocean → aqua gradient and has a subtle animated
 * drift via CSS. Place it at the top or bottom of a section.
 *
 * Props:
 *   position: 'top' | 'bottom' — which edge the wave sits on
 *   flip: boolean — mirror the wave vertically (for bottom of section)
 *   color: string — fill color (defaults to background for blending)
 */
export function WaveDivider({
  position = 'bottom',
  color = 'var(--background)',
  className = '',
}: {
  position?: 'top' | 'bottom'
  color?: string
  className?: string
}) {
  return (
    <div
      className={`pointer-events-none absolute left-0 right-0 w-full overflow-hidden ${className}`}
      style={{
        [position]: 0,
        height: '60px',
        lineHeight: 0,
      } as React.CSSProperties}
      aria-hidden="true"
    >
      <svg
        className="block w-full"
        style={{ height: '60px' }}
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
      >
        <path
          d={position === 'bottom'
            ? 'M0,30 C150,55 350,5 600,30 C850,55 1050,5 1200,30 L1200,60 L0,60 Z'
            : 'M0,30 C150,5 350,55 600,30 C850,5 1050,55 1200,30 L1200,0 L0,0 Z'
          }
          fill={color}
          opacity={0.9}
        />
        {/* Secondary subtle foam line */}
        <path
          d={position === 'bottom'
            ? 'M0,35 C150,50 350,20 600,35 C850,50 1050,20 1200,35 L1200,60 L0,60 Z'
            : 'M0,25 C150,40 350,10 600,25 C850,40 1050,10 1200,25 L1200,0 L0,0 Z'
          }
          fill="none"
          stroke="rgba(126, 200, 227, 0.15)"
          strokeWidth="1"
        />
      </svg>
    </div>
  )
}
