'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, User, Check, Play, Github, ExternalLink, FileText, Mail } from 'lucide-react'
import { persona, socials, type Project } from '@/lib/portfolio-data'
import { scrollState } from '@/lib/scroll-store'

export function ProjectVideoModal({
  project,
  open,
  onClose,
}: {
  project: Project | null
  open: boolean
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const caseStudyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    scrollState.lenis?.stop()
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => dialogRef.current?.focus())

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      scrollState.lenis?.start()
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [open, onClose])

  const githubUrl = project?.links?.github ?? socials.github
  const liveUrl = project?.links?.live

  const watchDemo = () => {
    const v = videoRef.current
    if (!v) return
    dialogRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    void v.play().catch(() => {})
  }
  const readCaseStudy = () => caseStudyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <AnimatePresence>
      {open && project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 grid place-items-center bg-[#050a05]/90 p-3 backdrop-blur-md sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-dialog-title"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            data-lenis-prevent
            className="project-modal relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl outline-none"
            onClick={(e) => e.stopPropagation()}
            ref={dialogRef}
            tabIndex={-1}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 grid size-10 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70"
              aria-label="Close project details (Esc)"
            >
              <X className="size-4" />
            </button>

            {/* Media */}
            <div className="relative overflow-hidden rounded-t-3xl bg-black">
              {project.video ? (
                <video
                  ref={videoRef}
                  src={project.video.src}
                  poster={project.video.poster}
                  controls
                  preload="metadata"
                  playsInline
                  className="aspect-video w-full object-contain"
                  aria-label={`${project.title} demo video`}
                />
              ) : project.poster ? (
                <img src={project.poster} alt={`${project.title} interface preview`} className="aspect-video w-full object-cover" />
              ) : (
                <div className="grid aspect-video place-items-center text-sm text-white/60">Project details</div>
              )}
              {project.video && (
                <span className="pointer-events-none absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[#B5C93A] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#172216]">
                  <Play className="size-3 fill-current" /> Demo · {project.video.duration}
                </span>
              )}
            </div>

            {/* Body */}
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_280px] lg:gap-10 lg:p-10">
              <div ref={caseStudyRef} id="case-study" className="scroll-mt-6">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B5C93A]">
                  {project.category} · {project.year} · Case study
                </p>
                <h3 id="project-dialog-title" className="serif-heading text-3xl leading-[1.05] text-white sm:text-4xl">
                  {project.title}
                </h3>
                <p className="modal-muted mt-5 text-[15px] leading-[1.75]">{project.longDescription}</p>

                <div className="mt-8">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Key features</p>
                  <ul className="space-y-2.5">
                    {project.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3 text-sm leading-6 text-white/85">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#B5C93A]/15">
                          <Check className="modal-feature-icon size-3.5" />
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <aside className="space-y-6 lg:border-l lg:border-white/10 lg:pl-8">
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Tech stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((t) => (
                      <span key={t} className="modal-chip rounded-full px-2.5 py-1 text-[11px]">{t}</span>
                    ))}
                  </div>
                </div>

                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="inline-flex items-center gap-1.5 text-white/60"><User className="size-3.5" /> Role</dt>
                    <dd className="text-white">{project.role}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="inline-flex items-center gap-1.5 text-white/60"><Calendar className="size-3.5" /> Year</dt>
                    <dd className="text-white">{project.year}</dd>
                  </div>
                </dl>

                <div className="flex flex-col gap-2">
                  {project.video && (
                    <button type="button" onClick={watchDemo} className="modal-link modal-link-primary inline-flex h-11 items-center justify-between rounded-full pr-1.5 pl-5 text-sm font-semibold">
                      Watch demo <span className="modal-link-arrow"><Play className="size-3 fill-current" /></span>
                    </button>
                  )}
                  {liveUrl && (
                    <a href={liveUrl} target="_blank" rel="noreferrer" className={`modal-link ${project.video ? '' : 'modal-link-primary'} inline-flex h-11 items-center justify-between rounded-full pr-4 pl-5 text-sm font-medium`}>
                      Live demo <ExternalLink className="size-4" />
                    </a>
                  )}
                  {githubUrl && (
                    <a href={githubUrl} target="_blank" rel="noreferrer" className="modal-link inline-flex h-11 items-center justify-between rounded-full pr-4 pl-5 text-sm font-medium">
                      {project.links?.github ? 'Source on GitHub' : 'GitHub profile'} <Github className="size-4" />
                    </a>
                  )}
                  <button type="button" onClick={readCaseStudy} className="modal-link inline-flex h-11 items-center justify-between rounded-full pr-4 pl-5 text-sm font-medium">
                    Case study <FileText className="size-4" />
                  </button>
                  <a
                    href={`mailto:${persona.email}?subject=${encodeURIComponent(`Question about ${project.title}`)}`}
                    className="modal-link inline-flex h-11 items-center justify-between rounded-full pr-4 pl-5 text-sm font-medium"
                  >
                    Ask about this project <Mail className="size-4" />
                  </a>
                </div>
                <p className="text-[11px] text-white/45">
                  Press <kbd className="rounded border border-white/20 px-1 font-mono">Esc</kbd> to close
                </p>
              </aside>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
