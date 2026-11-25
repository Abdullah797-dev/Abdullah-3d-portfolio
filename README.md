# Hafiz Abdullah — Portfolio (Classic Green Hills · Premium Edition)

Personal portfolio for **Hafiz Abdullah**, Web Application Developer from Karachi, Pakistan
(4th-year B.Sc. Computer Science, NED University). Next.js 16 · React 19 · TypeScript ·
Tailwind CSS 4 · Three.js / React Three Fiber · Framer Motion · GSAP · Lenis.

## Run it

```bash
bun install        # or: npm install
cp .env.example .env   # optional — only needed for contact-form email delivery
bun run dev        # http://localhost:3000
bun run build && bun run start   # production (standalone server)
```

Fonts (Playfair Display, Manrope, Amiri) come from `next/font/google`, so the first build
needs internet access.

## Edit your content

Everything visible on the site — bio, skills, projects, experience, education, achievements,
socials — lives in **`src/lib/portfolio-data.ts`**. The "Ask Hafiz" assistant's knowledge
base is generated from the same file.

- **LinkedIn:** set `socials.linkedin` to your profile URL; the LinkedIn button then appears in
  Contact and in the page's structured data. It stays hidden while the value is empty.
- **Per-project links:** add `links: { live: "https://…", github: "https://…" }` to any project
  to show "Live demo" / "Source on GitHub" in its case-study modal.

## Theme

One landscape behind the whole site (`public/backgrounds/hills.jpg`), dark cinematic veils,
frosted-glass cards, white serif headings, lime accents. Swap in your own hills photograph by
replacing `hills.jpg` (keep the name; ~2560×1440). The look is defined in the "ONE WORLD" block
at the end of `src/app/globals.css`.

## The 3D character

- **Model:** `public/models/hafiz.glb` — ONE skinned mesh with ONE material (≈4.3 MB, ~62k vertices,
  23 bones, rigid-skinned). Colours, plaid, roughness and metal come from a 1024² texture atlas.
  Bind pose is a T-pose; the file also includes the clips `HeroPose`, `Idle`, `Wave`, `Nod`.
- **Avatar:** `public/models/hafiz-avatar.png` (rendered from the model) is used on the About profile card.
- **Poster / fallback:** `public/models/hafiz-hero.png` shows instantly while the model loads and
  stays as the image when WebGL is unavailable.
- **Regenerate** after editing shapes, colours or the plaid:
  `node scripts/character/build-character.mjs` (then re-render the poster if you like).
- **Pose:** `src/lib/hero-pose.json` (radians, Euler order ZYX) is shared by the build script and the site.
- **Swapping in a sculpted model:** export a `.glb` from Blender with the same bone names
  (`Root, Hips, Spine, Chest, Neck, Head, Eye_L/R, Lid_L/R, Mouth, UpperArm_L/R, LowerArm_L/R,
  Hand_L/R, UpperLeg_L/R, LowerLeg_L/R, Foot_L/R`) in a T-pose, replace `hafiz.glb`, done.
  Missing bones are skipped safely.
- **Behaviour** (`src/components/scene/hero-character.tsx`): breathing, blinking every 3–4 s, head drift
  and weight shift; head + eyes follow the cursor (max 12°); −5° turn and 0.98× scale on scroll; wave and
  wider smile on hover; nod + lime glow on click/Enter. The stage parallax is max 8 px; the hills behind
  move at 0.3× scroll.

## Structure

```
src/app/                 layout, page, globals.css, API routes (chat, contact)
src/components/sections  hero, about, skills, projects (+ modal), experience, video, contact
src/components/scene     hero-scene.tsx — 3D stage with the character on the hills
src/components/layout    navbar, footer, logo
src/components/effects   smooth scroll, scroll reveals, tilt, magnetic buttons, cursor
src/lib                  portfolio-data.ts, rag.ts, scroll-store.ts
public/                  hills backdrop, project posters, demo videos, voiceover audio
download/docs/           VIDEO_STORYBOARD.md (After Effects storyboard), BLENDER_AVATAR.md
```

The portfolio video is rendered from canvas at 540p with a scene-by-scene voiceover. Its
storyboard, timings, and composition notes are in
[download/docs/VIDEO_STORYBOARD.md](./download/docs/VIDEO_STORYBOARD.md).
