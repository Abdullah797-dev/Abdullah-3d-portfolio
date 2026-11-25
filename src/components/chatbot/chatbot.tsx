'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, User, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { persona } from '@/lib/portfolio-data'
import { toast } from 'sonner'
import { scrollState } from '@/lib/scroll-store'

type Msg = {
  role: 'user' | 'assistant'
  content: string
  sources?: { id: string; source: string; score: number }[]
  ts: number
}

const first = persona.name.split(' ')[0]
const SUGGESTED = [
  `What projects has ${first} built?`,
  `Is ${first} open to internships?`,
  `What is his tech stack?`,
]

export function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content: `Hi! I'm ${persona.name.split(' ')[0]}'s portfolio assistant. Ask me anything about his work — I answer from his actual portfolio content, with citations.`,
      ts: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    scrollState.lenis?.stop()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      scrollState.lenis?.start()
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const send = useCallback(
    async (text: string) => {
      const q = text.trim()
      if (!q || loading) return
      setInput('')
      setLoading(true)
      const userMsg: Msg = { role: 'user', content: q, ts: Date.now() }
      setMessages((prev) => [...prev, userMsg])

      try {
        const history = messages
          .filter((m) => m.content)
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content }))

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q, history }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data?.error ?? 'Failed to fetch answer')
        }
        const assistantMsg: Msg = {
          role: 'assistant',
          content: data.answer ?? 'Sorry, I could not generate an answer.',
          sources: data.sources ?? [],
          ts: Date.now(),
        }
        setMessages((prev) => [...prev, assistantMsg])
      } catch (err) {
        toast.error('Chatbot error', {
          description: err instanceof Error ? err.message : 'Please try again.',
        })
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              `I had trouble responding. Please try again or email ${persona.name} directly at ${persona.email}.`,
            ts: Date.now(),
          },
        ])
      } finally {
        setLoading(false)
      }
    },
    [loading, messages],
  )

  return (
    <>
      {/* Launcher */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#F5D90A] px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-black/20 transition-shadow hover:shadow-black/30"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: open ? 0 : 1, y: open ? 20 : 0, pointerEvents: open ? 'none' : 'auto' }}
        aria-label="Open chatbot"
      >
        <MessageSquare className="size-5" />
        <span>Ask {persona.name.split(' ')[0]}</span>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col glass border border-white/15 shadow-2xl shadow-black/40 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(700px,80dvh)] sm:max-h-[80vh] sm:w-[440px] sm:rounded-2xl"
            role="dialog"
            aria-label="Ask Hafiz — AI Assistant"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/40 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="size-9 rounded-full bg-[#F5D90A] grid place-items-center">
                      <Bot className="size-5 text-black" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-sea ring-2 ring-background animate-pulse" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    Ask {persona.name.split(' ')[0]} — AI Assistant
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 font-mono">
                      RAG
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">Answers grounded in the portfolio</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea data-lenis-prevent className="flex-1 px-3 py-3" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <MessageBubble key={i} msg={m} />
                ))}
                {loading && (
                  <div className="flex items-start gap-2.5">
                    <Avatar role="assistant" />
                    <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-3 py-2.5 text-sm">
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        Typing
                        <span className="inline-flex gap-1" aria-hidden="true">
                          <span className="size-1 animate-bounce rounded-full bg-[#B5C93A]" />
                          <span className="size-1 animate-bounce rounded-full bg-[#B5C93A] [animation-delay:120ms]" />
                          <span className="size-1 animate-bounce rounded-full bg-[#B5C93A] [animation-delay:240ms]" />
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Suggested chips (only show when 1 message in convo) */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="min-h-9 text-left text-xs px-3 py-1.5 rounded-full border border-[#B5C93A]/30 bg-[#B5C93A]/10 text-[#D9E2C8] hover:bg-[#B5C93A]/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="p-3 border-t border-border/40 flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about my work…"
                className="flex-1 bg-white/5 border-white/15 text-white placeholder:text-white/50 focus-visible:ring-[#B5C93A]/50"
                disabled={loading}
                maxLength={500}
                aria-label="Chat input"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                className="bg-[#F5D90A] text-black hover:bg-[#e6c900]"
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Avatar({ role }: { role: 'user' | 'assistant' }) {
  if (role === 'assistant') {
    return (
      <div className="size-7 shrink-0 rounded-full bg-[#F5D90A] grid place-items-center">
        <Bot className="size-4 text-black" />
      </div>
    )
  }
  return (
    <div className="size-7 shrink-0 rounded-full bg-muted grid place-items-center">
      <User className="size-4 text-muted-foreground" />
    </div>
  )
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar role={msg.role} />
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-[#F5D90A] text-black rounded-tr-sm'
            : 'bg-muted/60 rounded-tl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap">{msg.content}</p>
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1">
              <ExternalLink className="size-3" /> Sources
            </div>
            {msg.sources.map((s) => (
              <a
                key={s.id}
                href={`#${s.source.split('>').pop()?.trim().toLowerCase().replace(/\s+/g, '-')}`}
                className="block text-[11px] text-sea hover:underline transition-colors"
                onClick={(e) => {
                  // Smooth scroll to relevant section if possible
                  const target = s.source.split('>').pop()?.trim().toLowerCase().replace(/\s+/g, '-')
                  if (target) {
                    e.preventDefault()
                    const el = document.getElementById(target)
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                }}
              >
                • {s.source}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
