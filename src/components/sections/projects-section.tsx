'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Clock3, Play, Search, SlidersHorizontal, Star } from 'lucide-react'
import { SectionHeading, SectionWrapper } from './section-heading'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { projects, type Project } from '@/lib/portfolio-data'
import { ProjectVideoModal } from './project-video-modal'
import { TiltCard } from '@/components/effects/tilt-card'
import { WordClamp } from '@/components/effects/word-clamp'

const CATEGORIES = ['All', 'Web', 'AI', 'Game', '3D', 'Systems'] as const
type Category = (typeof CATEGORIES)[number]

export function ProjectsSection() {
  const [activeCat, setActiveCat] = useState<Category>('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'title'>('newest')
  const [hoverSkill, setHoverSkill] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [selected, setSelected] = useState<Project | null>(null)

  useEffect(() => {
    const handleHover = (event: Event) => setHoverSkill((event as CustomEvent<string>).detail ?? '')
    const handleSelect = (event: Event) => setSelectedSkill((event as CustomEvent<string>).detail ?? '')
    window.addEventListener('portfolio:skill-hover', handleHover)
    window.addEventListener('portfolio:skill-select', handleSelect)
    return () => {
      window.removeEventListener('portfolio:skill-hover', handleHover)
      window.removeEventListener('portfolio:skill-select', handleSelect)
    }
  }, [])
  const activeSkill = hoverSkill || selectedSkill

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const matches = projects.filter((project) => {
      const matchesCategory = activeCat === 'All' || project.category === activeCat
      const searchable = [
        project.title,
        project.shortDescription,
        project.longDescription,
        ...project.tags,
      ].join(' ').toLowerCase()
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
    return matches.sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title)
      const yearDifference = Number(b.year) - Number(a.year)
      return sort === 'newest' ? yearDifference : -yearDifference
    })
  }, [activeCat, query, sort])

  return (
    <SectionWrapper id="projects">
      <SectionHeading
        eyebrow="03 · Selected work"
        title="Things I've built."
        description="Seven end-to-end builds across web apps, AI tooling, and browser games — click any card with a play badge to watch its demo, or any card to read the full case study."
      />

      <div className="mb-6 flex flex-col gap-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCat(category)}
              aria-pressed={activeCat === category}
              className={`filter-pill min-h-11 rounded-full px-5 text-sm font-medium transition ${
                activeCat === category
                  ? 'bg-[#B5C93A] text-[#172216] shadow-sm'
                  : 'border border-white/15 bg-white/[0.06] text-[#C3CDB3] hover:border-[#B5C93A]/60 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects, technologies…"
              className="h-12 rounded-full border-white/15 bg-white/[0.06] pl-10 focus-visible:ring-[#4a6b2a]"
              aria-label="Search projects and technologies"
            />
          </label>
          <label className="flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 text-sm text-[#C3CDB3]">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            <span className="sr-only">Sort projects</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as typeof sort)}
              className="min-w-[7rem] bg-transparent outline-none"
              aria-label="Sort projects"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title A–Z</option>
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <Star className="mx-auto mb-3 size-8 opacity-40" />
          No projects match your search. Try another term or category.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => setSelected(project)}
                highlighted={isRelated(project, activeSkill)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Showing {filtered.length} of {projects.length} projects
        {activeSkill ? ` · Related to ${activeSkill}` : ''}
      </p>

      <ProjectVideoModal
        project={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </SectionWrapper>
  )
}

function isRelated(project: Project, skill: string) {
  if (!skill) return false
  const normalized = skill.toLowerCase().replace(/\.js$/, '')
  return [...project.tags, project.title].some((value) =>
    value.toLowerCase().replace(/\.js$/, '').includes(normalized),
  )
}

function ProjectCard({
  project,
  onOpen,
  highlighted,
}: {
  project: Project
  onOpen: () => void
  highlighted: boolean
}) {
  const hasVideo = Boolean(project.video)
  const poster = project.video?.poster ?? project.poster

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.24 }}
      className={`h-full rounded-2xl ${highlighted ? 'ring-2 ring-[#7A9A1F] ring-offset-2 ring-offset-transparent' : ''}`}
    >
      <TiltCard maxTilt={6} lift={5} className="h-full">
        <Card
          className="project-card surface group flex h-full cursor-pointer flex-col gap-0 overflow-hidden rounded-2xl py-0"
          onClick={onOpen}
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-label={`Read case study for ${project.title}${hasVideo ? ', watch demo video' : ''}`}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onOpen()
            }
          }}
        >
          <div className="relative aspect-video overflow-hidden bg-[#0f1a0f]">
            {poster ? (
              <img
                src={poster}
                alt={`${project.title} project preview`}
                width={1280}
                height={720}
                decoding="async"
                loading="lazy"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="grid size-full place-items-center bg-gradient-to-br from-[#1a2e1a] to-[#0f1a0f]">
                <span className="serif-heading text-6xl text-[#B5C93A]">{project.title.charAt(0)}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#10190db0] via-transparent to-transparent" />
            {hasVideo && (
              <>
                <div className="absolute inset-0 grid place-items-center">
                  <span className="grid size-14 place-items-center rounded-full bg-[#B5C93A] text-[#172216] shadow-lg transition-transform group-hover:scale-105">
                    <Play className="ml-0.5 size-5 fill-current" />
                  </span>
                </div>
                <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded bg-black/70 px-2 py-1 font-mono text-[11px] text-white">
                  <Clock3 className="size-3" /> {project.video!.duration}
                </span>
                <span className="absolute top-3 left-3 rounded-full bg-[#B5C93A] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#172216]">
                  Play demo
                </span>
              </>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="h-auto rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-[#C9DB6A]">
                {project.category}
              </Badge>
              <span className="text-xs text-muted-foreground">{project.year}</span>
            </div>
            <h3 className="serif-heading mb-2 text-xl leading-tight transition-colors group-hover:text-[#C9DB6A] sm:text-2xl">
              {project.title}
            </h3>
            {/* 2 lines, never cut mid-word; the full text is in the case study. */}
            <WordClamp text={project.shortDescription} lines={2} className="mb-4 line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground" />
            <div className="mb-5 flex flex-wrap gap-1.5">
              {project.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] text-[#C3CDB3]">
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-[#C3CDB3]">+{project.tags.length - 3}</span>
              )}
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-white/15 pt-4">
              <span className="text-xs font-semibold text-[#C9DB6A]">
                {hasVideo ? 'Watch demo · Read case study' : 'Read case study'} <span aria-hidden="true">→</span>
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{project.role}</span>
            </div>
          </div>
        </Card>
      </TiltCard>
    </motion.div>
  )
}
