'use client'

import { motion } from 'framer-motion'
import { Award, Briefcase, Calendar, GraduationCap, MapPin } from 'lucide-react'
import { SectionHeading, SectionWrapper } from './section-heading'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { experiences, education, achievements } from '@/lib/portfolio-data'

export function ExperienceSection() {
  return (
    <SectionWrapper id="experience">
      <SectionHeading
        eyebrow="04 · Experience & education"
        title="Where I've worked and studied."
        description="A timeline of the projects, coursework, and learning that have shaped my work so far."
      />

      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
        <TimelineColumn title="Experience" icon={Briefcase}>
          {experiences.map((item, index) => (
            <motion.article
              key={`${item.role}-${item.period}`}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="relative pl-8"
            >
              <span className="timeline-dot absolute top-6 left-0 size-3 rounded-full bg-[#4A6B2A]" />
              <Card className="surface p-5 sm:p-6">
                <TimelineMeta period={item.period} location={item.location} />
                <h3 className="serif-heading mt-3 text-xl">{item.role}</h3>
                <p className="mt-1 text-sm font-medium text-sea">{item.org}</p>
                <p className="mt-3 text-sm leading-6 text-foreground/80">{item.description}</p>
                <ul className="mt-4 space-y-2.5">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm leading-6 text-foreground/80">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#7A8B3A]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.article>
          ))}
        </TimelineColumn>

        <TimelineColumn title="Education" icon={GraduationCap}>
          {education.map((item, index) => (
            <motion.article
              key={`${item.institution}-${item.period}`}
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="relative pl-8"
            >
              <span className="timeline-dot absolute top-6 left-0 size-3 rounded-full bg-[#4A6B2A]" />
              <Card className="surface p-5 sm:p-6">
                <TimelineMeta period={item.period} location={item.location} />
                <h3 className="serif-heading mt-3 text-xl">{item.institution}</h3>
                <p className="mt-1 text-sm font-medium text-sea">{item.degree}</p>
                <p className="mt-3 text-sm leading-6 text-foreground/80">{item.details}</p>
                <ul className="mt-4 space-y-2">
                  {item.impacts.map((impact) => (
                    <li key={impact} className="edu-impact flex items-start gap-2.5 text-sm leading-6 text-foreground/80">
                      {impact}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.coursework.map((course) => (
                    <Badge key={course} variant="secondary" className="h-auto rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-normal text-[#C3CDB3]">
                      {course}
                    </Badge>
                  ))}
                </div>
              </Card>
            </motion.article>
          ))}
        </TimelineColumn>
      </div>

      <div className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow text-sea">Milestones</p>
            <h3 className="serif-heading mt-2 text-3xl sm:text-4xl">Progress, project by project.</h3>
          </div>
          <Award className="mb-1 size-6 shrink-0 text-sea" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="surface h-full p-5">
                <div className="mb-4 grid size-9 place-items-center rounded-full bg-white/10">
                  <Award className="size-4 text-sea" />
                </div>
                <h4 className="serif-heading text-lg leading-tight">{achievement.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{achievement.detail}</p>
                <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.12em] text-sea">{achievement.date}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}

function TimelineColumn({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof Briefcase
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-white/10 text-sea">
          <Icon className="size-5" />
        </span>
        <h3 className="serif-heading text-2xl">{title}</h3>
      </div>
      <div className="relative space-y-5">
        <span className="timeline-line absolute top-3 bottom-3 left-[5px] w-px" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}

function TimelineMeta({ period, location }: { period: string; location: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5"><Calendar className="size-3.5" />{period}</span>
      <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{location}</span>
    </div>
  )
}
