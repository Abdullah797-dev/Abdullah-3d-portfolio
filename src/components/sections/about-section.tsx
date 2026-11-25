'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Check, Code2, FolderGit2, GraduationCap, Sparkles } from 'lucide-react'
import { WordClamp } from '@/components/effects/word-clamp'
import { SectionHeading, SectionWrapper } from './section-heading'
import { Card } from '@/components/ui/card'
import { about, persona, projects, skillCategories } from '@/lib/portfolio-data'
import { AnimatedCounter } from '@/components/effects/animated-counter'

const stats = [
  { icon: FolderGit2, label: 'Projects shipped', value: projects.length, suffix: '+', note: 'Web · AI · 3D · games' },
  { icon: Code2, label: 'Languages', value: skillCategories[0].skills.length, suffix: '', note: 'Across coursework & projects' },
  { icon: GraduationCap, label: 'Year', value: null, display: '4th', note: 'NED University' },
  { icon: Sparkles, label: 'Core stack', value: null, display: 'MERN / PERN / Web 3D', note: 'Full-stack · AI tools', long: true },
]
const projectNames = ['pricepulse', 'edusage', 'hack-pro']
  .map((id) => projects.find((project) => project.id === id)?.title.split(' —')[0])
  .filter((name): name is string => Boolean(name))

export function AboutSection() {
  const [expanded, setExpanded] = useState(false)

  return (
    <SectionWrapper id="about">
      <SectionHeading
        eyebrow="01 · About me"
        title="A bit about who I am."
        description="A quick introduction to my background, the work I care about, and what I am learning."
      />

      <div className="mb-9 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <Card className="surface h-full p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{stat.label}</span>
                  <Icon className="size-4 text-sea" />
                </div>
                <div className={`serif-heading ${'long' in stat && stat.long ? 'text-xl leading-tight sm:text-2xl' : 'text-3xl leading-none sm:text-4xl'}`}>
                  {stat.value !== null ? <AnimatedCounter value={stat.value} suffix={stat.suffix} /> : stat.display}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{stat.note}</div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[3fr_2fr] lg:gap-10">
        <Card className="surface relative overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sea">A little about my path</div>
          <div className="space-y-4">
            {about.long.slice(0, expanded ? about.long.length : 3).map((paragraph, index) =>
              expanded ? (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm leading-7 text-foreground/85 sm:text-[15px]"
                >
                  {paragraph}
                </motion.p>
              ) : (
                // Max 3 lines each, cut only at a whole word.
                <WordClamp key={index} text={paragraph} lines={3} className="line-clamp-3 text-sm leading-7 text-foreground/85 sm:text-[15px]" />
              ),
            )}
          </div>
          <button
            type="button"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sea transition hover:text-white"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Read less' : 'Read more'}
            <ArrowDown className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </Card>

        <Card className="surface relative p-6 sm:p-7 lg:sticky lg:top-28">
          <div className="mb-6 flex items-center gap-4">
            <div className="profile-avatar grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#1A2E1A] font-display text-xl font-medium text-[#D9E2C8] ring-4 ring-white/20">
              <img src="/models/hafiz-avatar.png" alt={`${persona.name} avatar`} width={128} height={128} loading="lazy" decoding="async" className="size-full object-cover" />
            </div>
            <div>
              <h3 className="serif-heading text-2xl">{persona.name}</h3>
              <p className="text-sm text-muted-foreground">{persona.title}</p>
            </div>
          </div>
          <dl className="divide-y divide-white/10">
            {[
              ['Based in', persona.location],
              ['Studying at', 'NED University'],
              ['Year', persona.year],
              ['Graduation', persona.graduation],
              ['Availability', 'Open to opportunities'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-3 text-sm">
                <dt className="shrink-0 text-muted-foreground">{label}</dt>
                <dd className={`text-right font-medium ${label === 'Availability' ? 'text-sea' : ''}`}>{value}</dd>
              </div>
            ))}
          </dl>
          <a
            href={`mailto:${persona.email}?subject=Portfolio%20enquiry`}
            className="cta-pill mt-5 w-full justify-between"
          >
            Get in touch <span className="cta-square" aria-hidden="true"><ArrowUpRight className="size-4" /></span>
          </a>
        </Card>
      </div>

      <div className="surface mt-8 grid gap-5 rounded-2xl border p-5 sm:p-7 lg:grid-cols-[190px_1fr]">
        <h3 className="serif-heading text-2xl">Highlights</h3>
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {[...about.highlights, `Built ${projectNames.join(', ')} and more.`].map((highlight) => (
            <li key={highlight} className="flex items-start gap-2.5 text-sm leading-6 text-foreground/85">
              <Check className="mt-1 size-4 shrink-0 text-sea" />
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </SectionWrapper>
  )
}
