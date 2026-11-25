'use client'

import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, Clock3, Github, Linkedin, MapPin, Mail, LoaderCircle } from 'lucide-react'
import { SectionHeading, SectionWrapper } from './section-heading'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { persona, socials } from '@/lib/portfolio-data'

const fieldClass = 'mt-2 h-12 rounded-xl border-white/15 bg-white/[0.06] focus-visible:ring-[#B5C93A]'

export function ContactSection() {
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'success' | 'info' | 'error'; text: string } | null>(null)
  const [sent, setSent] = useState<string | null>(null)

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setNotice(null)
    const form = event.currentTarget
    const values = new FormData(form)
    const projectType = String(values.get('projectType') ?? '')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.get('name'),
          email: values.get('email'),
          subject: `Portfolio enquiry — ${projectType}`,
          projectType,
          message: values.get('message'),
          website: values.get('website'),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.error ?? 'Could not send your message.')
      if (result?.fake) return

      if (result?.delivered) {
        setSent(String(values.get('name') ?? '').split(' ')[0] || 'there')
        form.reset()
      } else {
        setNotice({
          kind: 'info',
          text: 'The site email service is not configured, so your message was not delivered. Please email me directly using the address above.',
        })
      }
    } catch (error) {
      setNotice({
        kind: 'error',
        text: error instanceof Error ? error.message : 'Something went wrong. Please email me directly.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SectionWrapper id="contact">
      {/* Full-bleed call-to-action band over clear hills (Virenhold style). */}
      <div className="cta-band">
      <SectionHeading
        eyebrow="06 · Contact"
        title="Let's start a conversation."
        description="Have a project in mind, a role to discuss, or an idea worth exploring? I'd be glad to hear from you."
        align="center"
        className="mb-8 lg:mb-10"
      />

      <motion.a
        href={`mailto:${persona.email}?subject=Portfolio%20enquiry`}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group mx-auto mb-7 flex w-fit max-w-full flex-wrap items-center justify-center gap-3 text-center"
      >
        <span className="serif-heading break-all text-2xl text-white transition-colors group-hover:text-[#B5C93A] sm:text-4xl lg:text-5xl">
          {persona.email}
        </span>
        <span className="cta-square size-10 transition group-hover:-translate-y-1 group-hover:translate-x-1">
          <ArrowUpRight className="size-5" />
        </span>
      </motion.a>
      <div className="flex justify-center">
        <a href="#contact-form" className="cta-pill">
          Send a message <span className="cta-square" aria-hidden="true"><ArrowUpRight className="size-4" /></span>
        </a>
      </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1.35fr_0.65fr] lg:gap-7">
        <Card className="surface p-5 sm:p-8 lg:p-9">
          <div className="mb-6">
            <p className="section-eyebrow text-sea">Send a message</p>
            <h3 className="serif-heading mt-2 text-2xl sm:text-3xl">Tell me what you have in mind.</h3>
          </div>
          <div className="relative">
          <AnimatePresence>
            {sent && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="contact-success absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl text-center"
                role="status"
              >
                <span className="relative grid size-20 place-items-center">
                  <motion.span
                    className="absolute inset-0 rounded-full bg-[#B5C93A]/30"
                    initial={{ scale: 0.6, opacity: 1 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 1.2, repeat: 2, ease: 'easeOut' }}
                  />
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
                    className="relative grid size-16 place-items-center rounded-full bg-[#B5C93A] text-[#111811] shadow-lg"
                  >
                    <Check className="size-8" strokeWidth={2.5} />
                  </motion.span>
                </span>
                <h4 className="serif-heading mt-6 text-2xl">Thank you, {sent}.</h4>
                <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">Your message is on its way. I usually reply within 24 hours.</p>
                <button
                  type="button"
                  onClick={() => setSent(null)}
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white transition hover:border-[#B5C93A]/60"
                >
                  Send another message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <form id="contact-form" onSubmit={submitMessage} className="space-y-5" aria-hidden={sent ? true : undefined}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Name
                <Input name="name" autoComplete="name" required minLength={2} maxLength={100} className={fieldClass} placeholder="Your name" />
              </label>
              <label className="block text-sm font-medium">
                Email
                <Input name="email" type="email" autoComplete="email" required maxLength={254} className={fieldClass} placeholder="you@example.com" />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Project type
              <select
                name="projectType"
                required
                defaultValue="Internship"
                className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-[#B5C93A]"
              >
                <option>Internship</option>
                <option>Freelance</option>
                <option>Full-time</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Message
              <Textarea name="message" required minLength={10} maxLength={5000} rows={5} className="mt-2 min-h-32 resize-y rounded-xl border-white/15 bg-white/[0.06] focus-visible:ring-[#B5C93A]" placeholder="A few details about what you're looking for…" />
            </label>
            <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
              <label>
                Leave this field empty
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                type="submit"
                disabled={submitting}
                className="h-12 rounded-full bg-white px-6 text-sm font-semibold text-[#111811] shadow-md hover:bg-[#f4f2e9] disabled:opacity-70"
              >
                {submitting ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
                Send message
                {!submitting && <ArrowRight className="ml-2 size-4" />}
              </Button>
              <p aria-live="polite" className={`text-sm ${notice?.kind === 'error' ? 'text-red-700' : notice?.kind === 'info' ? 'text-amber-800' : 'text-[#C9DB6A]'}`}>
                {notice && (
                  <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-start gap-2">
                    {notice.kind === 'success' ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : null}
                    {notice.text}
                  </motion.span>
                )}
              </p>
            </div>
          </form>
          </div>
        </Card>

        <Card className="surface p-6 sm:p-8">
          <p className="section-eyebrow text-sea">A few details</p>
          <h3 className="serif-heading mt-2 text-2xl">Good things start with a hello.</h3>
          <dl className="mt-6 space-y-5">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-sea"><CheckCircle2 className="size-4" /></span>
              <div><dt className="text-xs text-muted-foreground">Availability</dt><dd className="mt-1 text-sm font-medium leading-6">{persona.availability}</dd></div>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-sea"><MapPin className="size-4" /></span>
              <div><dt className="text-xs text-muted-foreground">Location</dt><dd className="mt-1 text-sm font-medium">{persona.location}</dd></div>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-sea"><Clock3 className="size-4" /></span>
              <div><dt className="text-xs text-muted-foreground">Response time</dt><dd className="mt-1 text-sm font-medium">Usually replies in 24h</dd></div>
            </div>
          </dl>
          <div className="mt-7 border-t border-white/15 pt-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Find me online</p>
            <div className="flex flex-wrap gap-2">
              {socials.github && (
                <a href={socials.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-white transition hover:border-[#B5C93A]/60">
                  <Github className="size-4" /> GitHub <ArrowUpRight className="size-3" />
                </a>
              )}
              {socials.linkedin && (
                <a href={socials.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-white transition hover:border-[#B5C93A]/60">
                  <Linkedin className="size-4" /> LinkedIn <ArrowUpRight className="size-3" />
                </a>
              )}
              <a href={socials.email} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-white transition hover:border-[#B5C93A]/60">
                <Mail className="size-4" /> Email <ArrowUpRight className="size-3" />
              </a>
            </div>
          </div>
        </Card>
      </div>
    </SectionWrapper>
  )
}
