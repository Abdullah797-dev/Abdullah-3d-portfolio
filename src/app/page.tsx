'use client'

import dynamic from 'next/dynamic'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { SiteBackdrop } from '@/components/layout/site-backdrop'
import { HeroSection } from '@/components/sections/hero-section'
import { AboutSection } from '@/components/sections/about-section'
import { SkillsSection } from '@/components/sections/skills-section'
import { ProjectsSection } from '@/components/sections/projects-section'
import { ExperienceSection } from '@/components/sections/experience-section'
import { ContactSection } from '@/components/sections/contact-section'

// The video section draws on a canvas and plays audio. Load it after the first paint.
// The empty <section id="video"> keeps the nav link and scroll position working meanwhile.
const VideoSection = dynamic(
  () => import('@/components/sections/video-section').then((m) => m.VideoSection),
  { ssr: false, loading: () => <section id="video" className="min-h-[60vh]" aria-hidden="true" /> },
)

// Chatbot is loaded only on client
const Chatbot = dynamic(
  () => import('@/components/chatbot/chatbot').then((m) => m.Chatbot),
  { ssr: false },
)

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <SiteBackdrop />
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ExperienceSection />
        <VideoSection />
        <ContactSection />
      </main>
      <Footer />
      <Chatbot />
    </div>
  )
}
