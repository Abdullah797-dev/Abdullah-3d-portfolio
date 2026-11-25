import { NextRequest, NextResponse } from 'next/server'
import { ragAnswer } from '@/lib/rag'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const question: string = (body?.question ?? '').toString().trim()
    const history: { role: string; content: string }[] = Array.isArray(body?.history)
      ? body.history
      : []

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required.' },
        { status: 400 },
      )
    }
    if (question.length > 1000) {
      return NextResponse.json(
        { error: 'Question is too long (max 1000 characters).' },
        { status: 400 },
      )
    }

    // Basic spam protection — block obvious spam patterns
    const spamPatterns = [/viagra/i, /crypto\s+airdrop/i, /free\s+money/i, /\bhttps?:\/\/\S+\s*https?:\/\//i]
    if (spamPatterns.some((p) => p.test(question))) {
      return NextResponse.json(
        { error: 'Message flagged as spam.' },
        { status: 422 },
      )
    }

    const result = await ragAnswer(question, history)

    return NextResponse.json({
      answer: result.answer,
      sources: result.sources,
      retrievedCount: result.retrievedCount,
    })
  } catch (err) {
    console.error('[/api/chat] error', err)
    return NextResponse.json(
      {
        error: 'Chatbot failed to respond. Please try again.',
        answer:
          "I'm having trouble responding right now. Please try again in a moment, or reach out via the contact form.",
        sources: [],
        retrievedCount: 0,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'RAG Chatbot API',
    description:
      'Retrieval-Augmented Generation chatbot answering questions about the portfolio owner.',
    method: 'POST',
    body: { question: 'string', history: '{role, content}[]' },
  })
}
