'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, VolumeX, Film, Maximize, Mic } from 'lucide-react'
import { SectionHeading, SectionWrapper } from './section-heading'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { persona, about, projects, achievements } from '@/lib/portfolio-data'

/**
 * Animated promo video — rendered procedurally on a <canvas> element.
 *
 * In a real production workflow you would author this in Adobe After Effects
 * and export an MP4 + .aep project file. The sandbox cannot run After Effects
 * so we synthesize an equivalent ~30s animated sequence on canvas (with audio
 * chimes via the WebAudio API) and also export the storyboard script for the
 * AE project (see README).
 */

type Scene = {
  id: number
  duration: number // ms
  render: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void
}

const C = {
  bg: '#0A120A',
  cyan: '#B5C93A',
  fuchsia: '#7A8B3A',
  violet: '#D9E2C8',
  white: '#FFFFFF',
  muted: '#A7B39A',
}

const scenes: Scene[] = [
  // 1 — Title fade-in (6s)
  {
    id: 1,
    duration: 6000,
    render: (ctx, t, w, h) => {
      const p = t / 6000
      fadeBg(ctx, w, h, p)
      ctx.font = `bold ${Math.min(w / 12, 64)}px ui-sans-serif, system-ui`
      ctx.textAlign = 'center'
      ctx.fillStyle = C.white
      ctx.globalAlpha = clamp01(p * 1.5)
      ctx.fillText('Hi, I am', w / 2, h / 2 - 30)
      ctx.globalAlpha = clamp01(p * 1.5)
      const grad = ctx.createLinearGradient(w / 2 - 200, 0, w / 2 + 200, 0)
      grad.addColorStop(0, C.cyan)
      grad.addColorStop(1, C.fuchsia)
      ctx.fillStyle = grad
      ctx.font = `bold ${Math.min(w / 8, 90)}px ui-sans-serif, system-ui`
      ctx.fillText(persona.name, w / 2, h / 2 + 50)
      ctx.globalAlpha = 1
    },
  },
  // 2 — Title slide (5s)
  {
    id: 2,
    duration: 5000,
    render: (ctx, t, w, h) => {
      const p = t / 5000
      fadeBg(ctx, w, h, 1)
      const offset = easeInOut(p) * 60
      ctx.textAlign = 'center'
      ctx.fillStyle = C.cyan
      ctx.font = `bold ${Math.min(w / 16, 36)}px ui-sans-serif, system-ui`
      ctx.fillText(persona.title, w / 2, h / 2 - offset)
      ctx.fillStyle = C.muted
      ctx.font = `${Math.min(w / 28, 18)}px ui-sans-serif, system-ui`
      wrapText(ctx, persona.tagline, w / 2, h / 2 + 30 + offset, w * 0.7, 26)
    },
  },
  // 3 — Highlights (7s)
  {
    id: 3,
    duration: 7000,
    render: (ctx, t, w, h) => {
      const p = t / 7000
      fadeBg(ctx, w, h, 1)
      ctx.textAlign = 'left'
      ctx.fillStyle = C.cyan
      ctx.font = `bold ${Math.min(w / 20, 32)}px ui-sans-serif, system-ui`
      ctx.fillText('// What I bring', 60, 80)
      about.highlights.forEach((h_, i) => {
        const localStart = i / about.highlights.length
        const localP = clamp01((p - localStart) * 4)
        if (localP <= 0) return
        const y = 140 + i * 60
        ctx.globalAlpha = localP
        // Bullet dot
        ctx.fillStyle = i % 2 === 0 ? C.cyan : C.fuchsia
        ctx.beginPath()
        ctx.arc(70, y - 6, 5, 0, Math.PI * 2)
        ctx.fill()
        // Text
        ctx.fillStyle = C.white
        ctx.font = `${Math.min(w / 32, 20)}px ui-sans-serif, system-ui`
        const text = h_.slice(0, 56)
        ctx.fillText(text, 90, y)
        ctx.globalAlpha = 1
      })
    },
  },
  // 4 — Projects showcase (15s)
  {
    id: 4,
    duration: 15000,
    render: (ctx, t, w, h) => {
      const p = t / 15000
      fadeBg(ctx, w, h, 1)
      ctx.fillStyle = C.fuchsia
      ctx.font = `bold ${Math.min(w / 20, 32)}px ui-sans-serif, system-ui`
      ctx.textAlign = 'left'
      ctx.fillText('// Selected projects', 60, 80)

      // Show all projects in the portfolio reel.
      const videoProjects = projects
      const perProject = 1 / videoProjects.length
      videoProjects.forEach((proj, i) => {
        const localStart = i * perProject
        const localP = clamp01((p - localStart) / perProject)
        if (localP <= 0) return
        const y = 130 + i * 52
        ctx.globalAlpha = localP
        // Card background
        const cardW = w * 0.82
        const cardH = 42
        ctx.fillStyle = 'rgba(181, 201, 58, 0.08)'
        ctx.strokeStyle = `rgba(181, 201, 58, ${0.3 * localP})`
        ctx.lineWidth = 1
        roundRect(ctx, 50, y - cardH + 20, cardW, cardH, 8)
        ctx.fill()
        ctx.stroke()
        // Title
        ctx.fillStyle = C.white
        ctx.font = `bold ${Math.min(w / 36, 18)}px ui-sans-serif, system-ui`
        ctx.fillText(proj.title, 70, y - 5, cardW - 40)
        // Tags
        ctx.fillStyle = C.muted
        ctx.font = `${Math.min(w / 60, 12)}px ui-sans-serif, system-ui`
        ctx.fillText(proj.tags.slice(0, 4).join(' · '), 70, y + 12, cardW - 40)
        ctx.globalAlpha = 1
      })
    },
  },
  // 5 — Stats (7s)
  {
    id: 5,
    duration: 7000,
    render: (ctx, t, w, h) => {
      const p = t / 7000
      fadeBg(ctx, w, h, 1)
      const stats = [
        { label: 'Years coding', value: '3+' },
        { label: 'Projects shipped', value: '7' },
        { label: 'Languages', value: '5' },
        { label: 'Game demos', value: '3' },
      ]
      ctx.textAlign = 'center'
      stats.forEach((s, i) => {
        const x = (w / stats.length) * (i + 0.5)
        const localP = clamp01(p * 4 - i * 0.4)
        if (localP <= 0) return
        ctx.globalAlpha = localP
        ctx.fillStyle = i % 2 ? C.fuchsia : C.cyan
        ctx.font = `bold ${Math.min(w / 12, 56)}px ui-sans-serif, system-ui`
        ctx.fillText(s.value, x, h / 2)
        ctx.fillStyle = C.muted
        ctx.font = `${Math.min(w / 40, 16)}px ui-sans-serif, system-ui`
        ctx.fillText(s.label, x, h / 2 + 36)
        ctx.globalAlpha = 1
      })
    },
  },
  // 6 — Achievements (8s)
  {
    id: 6,
    duration: 8000,
    render: (ctx, t, w, h) => {
      const p = t / 8000
      fadeBg(ctx, w, h, 1)
      ctx.fillStyle = C.violet
      ctx.font = `bold ${Math.min(w / 20, 32)}px ui-sans-serif, system-ui`
      ctx.textAlign = 'left'
      ctx.fillText('// Recognition', 60, 80)
      achievements.slice(0, 3).forEach((a, i) => {
        const localP = clamp01(p * 3 - i * 0.6)
        if (localP <= 0) return
        const y = 130 + i * 90
        ctx.globalAlpha = localP
        ctx.fillStyle = C.cyan
        ctx.font = `${Math.min(w / 32, 20)}px ui-sans-serif, system-ui`
        ctx.fillText('★ ' + a.title, 60, y)
        ctx.fillStyle = C.white
        ctx.font = `${Math.min(w / 50, 14)}px ui-sans-serif, system-ui`
        wrapText(ctx, a.detail, 60, y + 25, w * 0.8, 22)
        ctx.globalAlpha = 1
      })
    },
  },
  // 7 — Outro (6s)
  {
    id: 7,
    duration: 6000,
    render: (ctx, t, w, h) => {
      const p = t / 6000
      fadeBg(ctx, w, h, 1)
      ctx.textAlign = 'center'
      ctx.fillStyle = C.white
      ctx.globalAlpha = clamp01(p * 2)
      ctx.font = `bold ${Math.min(w / 14, 48)}px ui-sans-serif, system-ui`
      ctx.fillText("Let's build something", w / 2, h / 2 - 20)
      const grad = ctx.createLinearGradient(w / 2 - 200, 0, w / 2 + 200, 0)
      grad.addColorStop(0, C.cyan)
      grad.addColorStop(1, C.fuchsia)
      ctx.fillStyle = grad
      ctx.font = `bold ${Math.min(w / 12, 64)}px ui-sans-serif, system-ui`
      ctx.fillText('together.', w / 2, h / 2 + 40)
      ctx.globalAlpha = clamp01((p - 0.4) * 3)
      ctx.fillStyle = C.muted
      ctx.font = `${Math.min(w / 30, 18)}px ui-sans-serif, system-ui`
      ctx.fillText(persona.email, w / 2, h / 2 + 90)
      ctx.globalAlpha = 1
    },
  },
]

const TOTAL_DURATION = scenes.reduce((s, sc) => s + sc.duration, 0) // ~54s

export function VideoSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const narrationRef = useRef<HTMLAudioElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [progress, setProgress] = useState(0)
  const [currentScene, setCurrentScene] = useState(1)
  const [voiceOn, setVoiceOn] = useState(true)
  const volumeRef = useRef(volume)
  const mutedRef = useRef(muted)
  const voiceOnRef = useRef(voiceOn)
  const startTimeRef = useRef<number>(0)
  const animFrameRef = useRef<number>(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const lastSceneRef = useRef<number>(1)
  const inViewRef = useRef(true)

  useEffect(() => {
    volumeRef.current = volume
    mutedRef.current = muted
    voiceOnRef.current = voiceOn
  }, [volume, muted, voiceOn])

  // Format helper
  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000)
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  const draw = (ts: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const elapsed = Math.min(playing ? ts - startTimeRef.current : progress * TOTAL_DURATION, TOTAL_DURATION)
    const wrapped = Math.min(elapsed, TOTAL_DURATION - 1)

    // Determine which scene
    let cum = 0
    let scene: Scene = scenes[0]
    let sceneLocalT = 0
    for (const sc of scenes) {
      if (wrapped < cum + sc.duration) {
        scene = sc
        sceneLocalT = wrapped - cum
        break
      }
      cum += sc.duration
    }

    if (scene.id !== lastSceneRef.current) {
      lastSceneRef.current = scene.id
      setCurrentScene(scene.id)
      if (playing && !mutedRef.current && volumeRef.current > 0) playChime(scene.id)
      // Switch narration audio to the new scene
      if (playing && voiceOnRef.current && narrationRef.current) {
        narrationRef.current.src = `/audio/scene-${scene.id}.mp3`
        narrationRef.current.volume = mutedRef.current ? 0 : volumeRef.current
        narrationRef.current.currentTime = 0
        narrationRef.current.play().catch(() => {})
      }
    }

    // Render
    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    scene.render(ctx, sceneLocalT, canvas.width, canvas.height)

    // Top progress bar
    ctx.fillStyle = 'rgba(181, 201, 58, 0.15)'
    ctx.fillRect(0, 0, canvas.width, 3)
    ctx.fillStyle = C.cyan
    ctx.fillRect(0, 0, canvas.width * (wrapped / TOTAL_DURATION), 3)

    if (playing) {
      if (Math.abs(progress - wrapped / TOTAL_DURATION) > 0.01 || elapsed >= TOTAL_DURATION) {
        setProgress(Math.min(wrapped / TOTAL_DURATION, 1))
      }
      if (elapsed >= TOTAL_DURATION) {
        setPlaying(false)
        setProgress(1)
        narrationRef.current?.pause()
        return
      }
      // Only continue the RAF loop if the section is in the viewport
      if (inViewRef.current) {
        animFrameRef.current = requestAnimationFrame(draw)
      }
    }
  }

  // When paused, draw the current frame once
  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(animFrameRef.current)
      // Render a single frame at the current progress
      requestAnimationFrame((ts) => {
        startTimeRef.current = ts - progress * TOTAL_DURATION
        draw(ts)
      })
    }
  }, [playing, progress])

  // Start/stop animation
  useEffect(() => {
    if (playing) {
      const start = () => {
        startTimeRef.current = performance.now() - progress * TOTAL_DURATION
        animFrameRef.current = requestAnimationFrame(draw)
      }
      start()
    } else {
      cancelAnimationFrame(animFrameRef.current)
    }
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [playing])

  // Initial render
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = 960
    canvas.height = 540
    requestAnimationFrame((ts) => {
      startTimeRef.current = ts
      draw(ts)
    })
  }, [])

  // Pause the RAF loop when the section is scrolled out of view (perf)
  useEffect(() => {
    const section = sectionRef.current
    if (!section || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting
      },
      { threshold: 0.1 },
    )
    io.observe(section)
    return () => io.disconnect()
  }, [])

  const playChime = (sceneId: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      }
      const ac = audioCtxRef.current
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      const freqs = [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 261.63]
      osc.frequency.value = freqs[(sceneId - 1) % freqs.length]
      osc.type = 'sine'
      gain.gain.setValueAtTime(0, ac.currentTime)
      gain.gain.linearRampToValueAtTime(mutedRef.current ? 0 : 0.06 * volumeRef.current, ac.currentTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.5)
      osc.connect(gain).connect(ac.destination)
      osc.start()
      osc.stop(ac.currentTime + 0.5)
    } catch {
      /* audio not critical */
    }
  }

  const togglePlay = () => {
    if (playing) {
      setPlaying(false)
      // Pause narration
      if (narrationRef.current) narrationRef.current.pause()
    } else {
      if (progress >= 0.999) setProgress(0)
      setPlaying(true)
      // Start narration for current scene
      if (voiceOn && narrationRef.current) {
        narrationRef.current.src = `/audio/scene-${currentScene}.mp3`
        narrationRef.current.volume = mutedRef.current ? 0 : volumeRef.current
        narrationRef.current.currentTime = 0
        narrationRef.current.play().catch(() => {})
      }
    }
  }

  const restart = () => {
    setProgress(0)
    setPlaying(true)
    lastSceneRef.current = 1
    setCurrentScene(1)
    if (voiceOn && narrationRef.current) {
      narrationRef.current.src = `/audio/scene-1.mp3`
      narrationRef.current.volume = mutedRef.current ? 0 : volumeRef.current
      narrationRef.current.currentTime = 0
      narrationRef.current.play().catch(() => {})
    }
  }

  const toggleMute = () => {
    setMuted((value) => {
      const next = !value
      if (narrationRef.current) narrationRef.current.volume = next ? 0 : volumeRef.current
      return next
    })
  }

  const toggleVoice = () => {
    setVoiceOn((v) => {
      const next = !v
      if (narrationRef.current) {
        if (next && playing) {
          narrationRef.current.src = `/audio/scene-${currentScene}.mp3`
          narrationRef.current.volume = mutedRef.current ? 0 : volumeRef.current
          narrationRef.current.currentTime = 0
          narrationRef.current.play().catch(() => {})
        } else {
          narrationRef.current.pause()
        }
      }
      return next
    })
  }

  const seek = (value: number, shouldPlay = playing) => {
    const nextProgress = clamp01(value)
    startTimeRef.current = performance.now() - nextProgress * TOTAL_DURATION
    setProgress(nextProgress)
    const currentTime = nextProgress * TOTAL_DURATION
    let start = 0
    const scene = scenes.find((item) => {
      const inScene = currentTime < start + item.duration
      if (!inScene) start += item.duration
      return inScene
    })
    if (scene) {
      setCurrentScene(scene.id)
      lastSceneRef.current = scene.id
      if (shouldPlay && voiceOnRef.current && narrationRef.current) {
        narrationRef.current.src = `/audio/scene-${scene.id}.mp3`
        narrationRef.current.volume = mutedRef.current ? 0 : volumeRef.current
        narrationRef.current.currentTime = 0
        narrationRef.current.play().catch(() => {})
      }
    }
  }

  return (
    <div ref={sectionRef}>
    <SectionWrapper id="video">
      <SectionHeading
        eyebrow="05 · Showreel"
        title="Animated intro video"
        description="A canvas-rendered introduction to my work, skills, projects, and achievements, with an original voiceover and scene-by-scene storyboard."
      />

      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[1.22fr_1fr] lg:gap-8">
        {/* Player */}
        <div className="min-w-0">
          <div ref={playerRef} className="relative overflow-hidden rounded-[24px] border border-white/15 bg-[#0A120A] shadow-xl shadow-black/30">
            <canvas
              ref={canvasRef}
              className="block aspect-video w-full min-w-0 max-w-full bg-[#0A120A]"
              aria-label="Animated portfolio promo video"
            />

            {/* Hidden narration audio element */}
            <audio ref={narrationRef} preload="auto" className="hidden" />

            {/* Big play overlay when paused */}
            <AnimatePresence>
              {!playing && (
                <motion.button
                  onClick={togglePlay}
                  className="absolute inset-0 grid place-items-center bg-black/40 group"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  aria-label={progress > 0 ? 'Resume' : 'Play'}
                >
                  <div className="grid size-16 place-items-center rounded-full bg-[#B5C93A] shadow-xl shadow-black/30 transition-transform group-hover:scale-110 sm:size-20">
                    <Play className="ml-1 size-7 text-[#172216] sm:size-9" fill="currentColor" />
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Bottom control bar */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              {/* Seek bar */}
              <label className="mb-2 flex items-center">
                <span className="sr-only">Video progress</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={progress}
                  onChange={(event) => seek(Number(event.target.value))}
                  className="h-1.5 w-full cursor-pointer accent-[#B5C93A]"
                  aria-label="Video progress"
                />
              </label>
              {/* Buttons */}
              <div className="flex items-center gap-2 text-white">
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 hover:bg-white/10"
                  onClick={togglePlay}
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                </Button>
                <label className="hidden items-center gap-1.5 sm:flex" aria-label="Volume">
                  <span className="sr-only">Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={muted ? 0 : volume}
                    onChange={(event) => {
                      const nextVolume = Number(event.target.value)
                      setVolume(nextVolume)
                      setMuted(nextVolume === 0)
                      if (narrationRef.current) narrationRef.current.volume = nextVolume
                    }}
                    className="w-16 accent-[#B5C93A]"
                    aria-label="Volume"
                  />
                </label>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 hover:bg-white/10"
                  onClick={restart}
                  aria-label="Restart"
                >
                  <RotateCcw className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 hover:bg-white/10"
                  onClick={toggleMute}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={`size-8 hover:bg-white/10 ${voiceOn ? 'text-sun' : 'text-white/50'}`}
                  onClick={toggleVoice}
                  aria-label={voiceOn ? 'Disable voiceover' : 'Enable voiceover'}
                  title={voiceOn ? 'Voiceover on' : 'Voiceover off'}
                >
                  <Mic className="size-4" />
                </Button>
                <span className="text-xs font-mono ml-2">
                  {fmt(progress * TOTAL_DURATION)} / {fmt(TOTAL_DURATION)}
                </span>
                <span className="ml-auto text-[11px] text-white/60 flex items-center gap-1">
                  <Film className="size-3" /> Scene {currentScene}/{scenes.length}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 hover:bg-white/10"
                  onClick={() => {
                    if (!playerRef.current) return
                    if (document.fullscreenElement) void document.exitFullscreen()
                    else void playerRef.current.requestFullscreen()
                  }}
                  aria-label="Toggle fullscreen"
                >
                  <Maximize className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-[11px]">Canvas-rendered</Badge>
            <Badge variant="secondary" className="text-[11px]">540p · 54s</Badge>
            <Badge variant="secondary" className="text-[11px] bg-sun/10 text-sun border-sun/30">
              <Mic className="size-2.5 mr-1" /> Voiceover
            </Badge>
            <Badge variant="secondary" className="text-[11px]">AE storyboard in README</Badge>
          </div>
        </div>

        {/* Scene list / storyboard */}
        <div className="min-w-0 space-y-2.5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Storyboard
          </div>
          {scenes.map((s, i) => {
            const timestamp = scenes.slice(0, i).reduce((total, item) => total + item.duration, 0)
            return (
            <button
              key={s.id}
              onClick={() => {
                setPlaying(false)
                narrationRef.current?.pause()
                seek(timestamp / TOTAL_DURATION, false)
              }}
              aria-current={currentScene === s.id ? 'step' : undefined}
              className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                currentScene === s.id
                  ? 'border-[#B5C93A]/50 bg-[#B5C93A]/10 text-white'
                  : 'surface text-muted-foreground hover:border-[#B5C93A]/60'
              }`}
            >
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em]">Scene {s.id}</div>
                <div className="font-mono text-[11px] opacity-70">{fmt(timestamp)} · {fmt(s.duration)}</div>
              </div>
              <div className="text-sm font-medium">{SCENE_TITLES[i] ?? `Scene ${s.id}`}</div>
            </button>
          )})}
        </div>
      </div>
    </SectionWrapper>
    </div>
  )
}

const SCENE_TITLES = [
  'Title fade-in',
  'Role & tagline',
  'Skills & highlights',
  'Project showcase',
  'Quick stats',
  'Achievements',
  'Outro / call to action',
]

/* ---------- canvas helpers ---------- */
function fadeBg(ctx: CanvasRenderingContext2D, w: number, h: number, alpha: number) {
  ctx.fillStyle = C.bg
  ctx.globalAlpha = 1
  ctx.fillRect(0, 0, w, h)
  // Subtle radial glow
  const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7)
  grad.addColorStop(0, `rgba(181, 201, 58, ${0.05 * alpha})`)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ')
  let line = ''
  let yy = y
  for (const w of words) {
    const test = line + w + ' '
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, yy)
      line = w + ' '
      yy += lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line.trim(), x, yy)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// Augment C with amber
;(C as Record<string, string>).amber = '#fbbf24'
