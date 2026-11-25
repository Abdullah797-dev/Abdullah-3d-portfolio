# Nebula — Interactive 3D Web Portfolio

A modern, interactive, 3D web portfolio that integrates 3D graphics, a custom-designed avatar, an animated video, a Retrieval-Augmented Generation (RAG) based chatbot, and an email communication system into a single full-stack Next.js 16 application.

> **Sample persona**: The portfolio is populated with a fictional CS student persona ("Aarav Sharma"). To use your own information, edit a single file: `src/lib/portfolio-data.ts`.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| Animations | Framer Motion |
| RAG / AI | `z-ai-web-dev-sdk` (embeddings + LLM chat) |
| Email | Nodemailer SMTP |
| Forms / validation | react-hook-form + zod |
| Notifications | Sonner + Radix toast |
| Database | Prisma (SQLite client available, not used for this portfolio) |

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout + ThemeProvider + Toaster
│   ├── page.tsx                    # Main portfolio page (single route)
│   ├── globals.css                 # Sunset-over-ocean dark/light theme + utilities
│   └── api/
│       ├── chat/route.ts           # RAG chatbot endpoint (POST)
│       └── contact/route.ts        # Email contact endpoint (POST)
├── components/
│   ├── layout/
│   │   ├── navbar.tsx              # Sticky nav + mobile drawer + section tracking
│   │   └── footer.tsx
│   ├── scene/
│   │   ├── hero-scene.tsx          # Three.js ocean scene: Gerstner water + sun + avatar
│   │   └── water-shader.ts        # GLSL water shader (Gerstner waves, Fresnel, sun glitter, foam)
│   ├── sections/
│   │   ├── hero-section.tsx        # Hero with 3D canvas + name + CTAs
│   │   ├── about-section.tsx       # Bio paragraphs + highlights + quick facts
│   │   ├── skills-section.tsx      # 5 skill categories with animated progress bars
│   │   ├── projects-section.tsx    # Filterable + searchable project gallery
│   │   ├── experience-section.tsx  # Timeline + education + achievements
│   │   ├── video-section.tsx       # Canvas-rendered 30s promo video player
│   │   ├── contact-section.tsx     # Contact form + spam protection
│   │   └── section-heading.tsx     # Reusable heading wrapper
│   ├── chatbot/
│   │   └── chatbot.tsx             # Floating chatbot UI with source citations
│   ├── theme-provider.tsx          # next-themes wrapper
│   └── theme-toggle.tsx            # Dark/light theme toggle
└── lib/
    ├── portfolio-data.ts           # Persona + knowledge base for RAG
    ├── rag.ts                      # RAG pipeline (embed → retrieve → generate)
    ├── db.ts                       # Prisma client
    └── utils.ts                    # cn() helper
```

---

## Module summary

### Module 1 — 3D Web-Based Portfolio ✓

- Single-page responsive layout with sticky navbar and footer.
- Sections: Hero, About, Skills, Projects, Experience, Video, Contact.
- Smooth Framer Motion animations and section-aware navigation.
- Mobile-first responsive design (breakpoints: `sm`, `md`, `lg`, `xl`).

### Module 2 — Custom 3D Avatar ✓

A custom-built stylized robotic avatar constructed procedurally in Three.js:
- Distort-material head that follows the cursor (clamped rotation).
- Halo ring, glowing chest core, blinking eyes (asymmetric colors).
- Hover base ring + arms + visor.
- Reactive to mouse movement (head rotation, particle field rotation, floating shapes parallax).

> **Blender migration path**: To use a Blender-authored avatar instead, model your character in Blender, rig it, export as `.glb`, drop it into `/public/avatar.glb`, and replace the `<Avatar />` component body with:
> ```tsx
> import { useGLTF } from '@react-three/drei'
> function Avatar() {
>   const { scene } = useGLTF('/avatar.glb')
>   return <primitive object={scene} />
> }
> ```
> The `.blend` source file should live alongside the `.glb` in `/public/3d/` for reference.

### Module 3 — Animated Video ✓

A 30-second promo video rendered procedurally on a `<canvas>` element with 7 scenes:

1. Title fade-in (3s)
2. Role & tagline (2s)
3. Skills & highlights (5s)
4. Project showcase (7s)
5. Quick stats (4s)
6. Achievements (4s)
7. Outro / call to action (5s)

Features:
- Play / pause / seek / restart controls.
- Per-scene audio chimes via Web Audio API (mutable).
- Click the storyboard on the right to jump to a scene.

> **After Effects migration path**: A full storyboard with scene timings, text content, transitions, and color values is documented in `docs/VIDEO_STORYBOARD.md`. Use it to author the equivalent composition in Adobe After Effects, then export an MP4 and replace the `<canvas>` player with a `<video>` element. The `.aep` source file should be committed to `/docs/video/`.

### Module 4 — RAG-Based AI Chatbot ✓

The chatbot pipeline (in `src/lib/rag.ts`):

1. **Chunking** — `portfolio-data.ts` builds ~30 knowledge chunks from bio, skills, projects, experiences, education, and achievements. Each chunk has an `id` and a human-readable `source` label.
2. **Embedding** — Each chunk is embedded via `z-ai-web-dev-sdk`'s embeddings API. Results are cached in-memory for the lifetime of the process.
3. **Query embedding** — The visitor's question is embedded using the same model.
4. **Retrieval** — Cosine similarity between query and chunk embeddings; top-4 retrieved (filtered to score > 0.1).
5. **Generation** — Retrieved context is injected into the system prompt; the LLM generates a grounded answer with `[1]`, `[2]` citation markers.
6. **Citations** — Each answer shows clickable source links that scroll the page to the relevant portfolio section.

**Hallucination guardrails**:
- The system prompt explicitly instructs the LLM to answer ONLY from the provided context.
- If the context is insufficient, the model returns a fixed "I don't have that information" message instead of inventing facts.
- If the embedding SDK is unavailable, the system falls back to a deterministic hash-based pseudo-embedding (lower quality, but retrieval still works).

### Module 5 — Email and Contact System ✓

`/api/contact` route (`src/app/api/contact/route.ts`):

- Frontend validation in `contact-section.tsx` (name ≥ 2 chars, valid email regex, subject ≥ 3 chars, message 10–5000 chars).
- Backend re-validates the same rules and returns per-field errors.
- **Honeypot spam trap**: a hidden `website` field that bots fill in but humans don't.
- **Rate limiting**: max 3 submissions per minute per IP (in-memory).
- **Spam keyword filter** blocks common spam patterns.
- **Nodemailer SMTP** delivers mail to `CONTACT_TO_EMAIL` (defaults to persona email).
- HTML-escaped output to prevent injection in email body.
- Environment variables protect credentials:

```env
# .env.local — required for real email delivery
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_address@gmail.com
SMTP_PASS=your_app_password
CONTACT_TO_EMAIL=your_address@gmail.com
CONTACT_FROM_EMAIL=portfolio@yourdomain.com
```

> **Without SMTP credentials configured**, the API still validates, logs the submission to the server console, and returns success so the end-to-end UX is fully functional — only actual email delivery is skipped.

### Module 6 — Deployment ✓

The app is a standard Next.js 16 App Router project and deploys to any Node.js host:

- **Vercel** (recommended): push to GitHub, import the repo, deploy. No build config needed.
- **Self-hosted**: `bun run build` then `bun run start` (uses the standalone output).
- **Docker**: a sample Dockerfile is in `Dockerfile.example`.

Set environment variables (SMTP_*, CONTACT_*) in your hosting provider's dashboard.

---

## Extra credit features implemented

| Feature | Where |
| --- | --- |
| Mouse-reactive 3D | `hero-scene.tsx` — camera parallax + avatar head track the cursor; water shader has 4 animated Gerstner wave octaves |
| Dark and light themes | `theme-toggle.tsx` + `globals.css` — toggle in navbar, persisted via `next-themes` |
| Project filtering + search | `projects-section.tsx` — category filter chips + live text search + tag chips |
| Chatbot source citations | `chatbot.tsx` — every answer shows clickable source links to relevant portfolio sections |
| Accessibility | semantic HTML, ARIA labels, keyboard-navigable controls, sr-only text where needed, focus rings |
| Spam protection | honeypot + rate limit + keyword filter in contact route |
| Responsive design | mobile-first; tested at sm / md / lg / xl breakpoints |

---

## Customizing the persona

All persona content lives in **one file**: `src/lib/portfolio-data.ts`. Update:

- `persona` — name, title, tagline, location, email, socials.
- `about` — short bio, long bio paragraphs, highlights.
- `skillCategories` — skill groups with self-rated levels.
- `projects` — project objects with title, description, tags, links.
- `experiences` — work history with bullet points.
- `education` — institutions, degrees, coursework.
- `achievements` — awards and recognition.

The RAG knowledge base is regenerated from this file at runtime, so updating it instantly updates the chatbot too.

---

## Local development

```bash
bun install
bun run dev      # starts Next.js on port 3000
bun run lint     # ESLint check
```

Open the preview at the link provided by the platform.

---

## API reference

### `POST /api/chat`

Body:
```json
{ "question": "string", "history": [{ "role": "user|assistant", "content": "string" }] }
```

Response:
```json
{
  "answer": "string with [1] [2] citations",
  "sources": [{ "id": "string", "source": "Projects > Nebula", "text": "...", "score": 0.84 }],
  "retrievedCount": 4
}
```

### `POST /api/contact`

Body:
```json
{ "name": "string", "email": "string", "subject": "string", "message": "string", "website": "" }
```

Response (success):
```json
{ "ok": true, "delivered": true, "messageId": "<...>" }
```

Response (validation error):
```json
{ "error": "Validation failed.", "fields": { "email": "Please enter a valid email address." } }
```

---

## License

Sample project — free to use, modify, and learn from.

