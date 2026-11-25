/**
 * BackgroundWaterLayer. One very light 1px wave line that runs across the
 * whole site behind the content, so the sections feel connected.
 *
 * Two thin lines drift sideways at different speeds (CSS transform only, so
 * it runs on the compositor). GSAP moves the whole layer up slowly as the
 * page scrolls (see ScrollEffects, `data-wave-scroll`). Colors come from
 * theme variables, so it works in dark and light mode.
 *
 * This is also the light wave animation phones get.
 */
const LINE_A =
  'M0,80 C150,20 450,140 600,80 C750,20 1050,140 1200,80 C1350,20 1650,140 1800,80 C1950,20 2250,140 2400,80'
const LINE_B =
  'M0,70 C200,130 400,10 600,70 C800,130 1000,10 1200,70 C1400,130 1600,10 1800,70 C2000,130 2200,10 2400,70'

export function BackgroundWaterLayer() {
  return (
    <div
      className="bg-water-layer fixed inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)',
      }}
    >
      <div data-wave-scroll className="absolute inset-x-0 top-[34%] h-[260px]">
        <svg
          className="wave-drift absolute left-0 top-0 h-[160px] w-[200%]"
          style={{ '--wave-dur': '80s' } as React.CSSProperties}
          viewBox="0 0 2400 160"
          preserveAspectRatio="none"
        >
          <path d={LINE_A} fill="none" stroke="var(--wave-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <svg
          className="wave-drift absolute left-0 top-[70px] h-[160px] w-[200%] opacity-60"
          style={{ '--wave-dur': '110s', animationDirection: 'reverse' } as React.CSSProperties}
          viewBox="0 0 2400 160"
          preserveAspectRatio="none"
        >
          <path d={LINE_B} fill="none" stroke="var(--wave-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  )
}
