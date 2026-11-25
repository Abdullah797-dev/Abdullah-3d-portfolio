'use client'

import { motion } from 'framer-motion'
import { Brain, Code2, Layout, Server, type LucideIcon } from 'lucide-react'
import { SectionHeading, SectionWrapper } from './section-heading'
import { Card } from '@/components/ui/card'
import { skillCategories } from '@/lib/portfolio-data'

type Skill = { name: string; level: number }
type SkillGroup = { category: string; icon: LucideIcon; skills: Skill[] }

const languageSkills = skillCategories.find((category) => category.category === 'Languages')!.skills
const frontendSkills = skillCategories.find((category) => category.category === 'Frontend')!.skills
const backendSkills = skillCategories.find((category) => category.category === 'Backend')!.skills
const databaseSkills = skillCategories.find((category) => category.category === 'Databases')!.skills
const aiSkills = skillCategories.find((category) => category.category === 'AI & Tools')!.skills

const groups: SkillGroup[] = [
  { category: 'Languages', icon: Code2, skills: languageSkills },
  { category: 'Frontend', icon: Layout, skills: [...frontendSkills, { name: 'Next.js', level: 72 }] },
  { category: 'Backend & Databases', icon: Server, skills: [...backendSkills, ...databaseSkills] },
  { category: 'AI & Tools', icon: Brain, skills: aiSkills },
]

const allSkills = groups.flatMap((group) => group.skills.map((skill) => skill.name))

/** Monogram "logo" marks for the marquee — on-theme, no third-party brand assets. */
const MARKS: Record<string, string> = {
  JavaScript: 'JS', Python: 'Py', C: 'C', 'C++': 'C++', TypeScript: 'TS', React: 'Re', Angular: 'Ng', HTML5: 'H5',
  'CSS3 / Tailwind': 'CSS', 'React Native': 'RN', 'Next.js': 'N', 'Node.js': 'Nd', 'Express.js': 'Ex', 'REST APIs': 'API',
  Postman: 'Pm', MongoDB: 'Mg', MySQL: 'My', PostgreSQL: 'Pg', Redis: 'Rd', LangChain: 'LC', 'LLMs / Prompt Engineering': 'AI',
  'Git / GitHub': 'Git', 'VS Code': 'VS',
}

function proficiency(level: number) {
  if (level >= 90) return 'Expert'
  if (level >= 75) return 'Advanced'
  return 'Intermediate'
}

function previewRelatedProjects(skill: string, selected = false) {
  const eventName = selected ? 'portfolio:skill-select' : 'portfolio:skill-hover'
  window.dispatchEvent(new CustomEvent(eventName, { detail: skill }))
}

export function SkillsSection() {
  return (
    <SectionWrapper id="skills">
      <SectionHeading
        eyebrow="02 · Skills"
        title="Technologies I work with."
        description="A practical toolkit built through coursework, shipped projects, and a lot of experimentation."
      />

      <div className="skill-marquee mb-8 border-y border-white/15 py-3" aria-label="Technology stack">
        <div className="skill-marquee-track" aria-hidden="true">
          {[...allSkills, ...allSkills].map((skill, index) => (
            <span key={`${skill}-${index}`} className="mx-4 inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium text-[#C3CDB3]">
              <span className="marquee-mark">{MARKS[skill] ?? skill.slice(0, 2)}</span>
              {skill}
            </span>
          ))}
        </div>
      </div>

      <p className="sr-only">
        Skills: {groups.map((group) => `${group.category}: ${group.skills.map((skill) => skill.name).join(', ')}`).join('. ')}.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
        {groups.map((group, index) => {
          const Icon = group.icon
          return (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <Card className="surface h-full p-5 sm:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-white/10 text-[#C9DB6A]">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="serif-heading text-xl">{group.category}</h3>
                      <p className="text-xs text-muted-foreground">{group.skills.length} technologies</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[#C9DB6A]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <ul className="flex flex-wrap gap-2.5">
                  {group.skills.map((skill) => {
                    const level = proficiency(skill.level)
                    return (
                      <li key={skill.name}>
                        <button
                          type="button"
                          title={`${skill.name}: ${level} (self-rated ${skill.level}%)`}
                          aria-label={`${skill.name}, ${level}. Highlight related projects`}
                          onMouseEnter={() => previewRelatedProjects(skill.name)}
                          onFocus={() => previewRelatedProjects(skill.name)}
                          onMouseLeave={() => previewRelatedProjects('')}
                          onBlur={() => previewRelatedProjects('')}
                          onClick={() => {
                            previewRelatedProjects(skill.name, true)
                            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-[#1a2e1a18] bg-white/[0.06] px-3 py-2 text-sm text-white transition hover:border-[#B5C93A]/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a6b2a]"
                        >
                          <Icon className="size-3.5 text-[#C3CDB3]" aria-hidden="true" />
                          <span>{skill.name}</span>
                          <span
                            className={`size-1.5 rounded-full ${level === 'Expert' ? 'bg-[#36552d]' : level === 'Advanced' ? 'bg-[#7A8B3A]' : 'bg-[#a9b49a]'}`}
                            aria-hidden="true"
                          />
                          <span className="sr-only">Proficiency: {level}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </Card>
            </motion.div>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Hover a technology to highlight related work, or select it to jump to the projects.</p>
    </SectionWrapper>
  )
}
