/**
 * MobileLandscape. A lightweight rolling-hills fallback used on phones,
 * tablets and reduced-motion setups. It keeps the calm landscape theme
 * without the cost of a WebGL canvas.
 */
const BACK_HILLS =
  'M0,170 C180,85 330,105 500,155 C680,205 820,70 1020,115 C1220,160 1380,45 1580,118 C1780,190 2050,82 2400,135 L2400,260 L0,260 Z'
const FRONT_HILLS =
  'M0,185 C220,125 390,210 620,150 C820,98 1040,205 1260,145 C1480,85 1700,205 1920,142 C2120,82 2280,145 2400,112 L2400,260 L0,260 Z'

export function MobileWave({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-x-0 bottom-0 h-full"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in oklab, var(--sea) 20%, var(--background)) 0%, color-mix(in oklab, var(--sea) 34%, var(--background)) 48%, var(--background) 100%)',
        }}
      />
      <div
        className="absolute right-[12%] top-[18%] size-28 rounded-full blur-[2px]"
        style={{ background: 'color-mix(in oklab, var(--sun) 58%, transparent)', opacity: 0.24 }}
      />
      <svg
        className="absolute inset-x-0 bottom-0 h-[58%] w-full"
        viewBox="0 0 2400 260"
        preserveAspectRatio="none"
      >
        <path d={BACK_HILLS} fill="#6e8761" opacity="0.62" />
        <path d={FRONT_HILLS} fill="#4f6747" opacity="0.92" />
      </svg>
    </div>
  )
}
