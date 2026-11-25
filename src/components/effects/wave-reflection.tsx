/**
 * WaveReflection. A faint rippled reflection under a project card.
 * Drawn with CSS transform animation (no JS loop), one per card.
 */
export function WaveReflection({ color = 'var(--glow-soft)' }: { color?: string }) {
  return (
    <div
      className="wave-reflection pointer-events-none absolute -bottom-8 left-0 right-0 h-8 overflow-hidden"
      aria-hidden="true"
      style={{
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
      }}
    >
      <svg
        className="wave-drift absolute left-0 h-8 w-[200%]"
        style={{ '--wave-dur': '12s' } as React.CSSProperties}
        viewBox="0 0 2400 32"
        preserveAspectRatio="none"
      >
        <path
          d="M0,16 C150,4 350,28 600,16 C850,4 1050,28 1200,16 C1400,4 1600,28 1800,16 C2000,4 2200,28 2400,16 L2400,32 L0,32 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}
