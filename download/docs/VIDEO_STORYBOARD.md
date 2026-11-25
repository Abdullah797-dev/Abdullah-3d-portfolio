# Hafiz Abdullah — Portfolio video storyboard

The portfolio intro is rendered in the browser by the canvas in
`src/components/sections/video-section.tsx`. It is a 54-second, 16:9 animation
rendered at 960 × 540 (540p), with a recorded voiceover per scene and a quiet
forest-and-olive color palette. The canvas is responsive and scales to the
player width.

## Composition

- **Resolution:** 960 × 540
- **Aspect ratio:** 16:9
- **Duration:** 54 seconds
- **Rendering:** HTML canvas, 2D
- **Palette:** forest `#0A120A`, deep green `#1A2E1A`, olive `#4A6B2A`,
  moss `#7A8B3A`, lime accent `#B5C93A`, ivory `#F5F2EB`
- **Voiceover:** `public/audio/scene-1.mp3` through `scene-7.mp3`
- **Transitions:** Animated fades and scene-specific motion; a soft chime
  marks scene changes.

## Scenes

| Scene | Start | Duration | Story |
| --- | --- | --- | --- |
| 1 | 0:00 | 0:06 | Title: “Hi, I am Hafiz Abdullah” |
| 2 | 0:06 | 0:05 | Web application developer role and portfolio tagline |
| 3 | 0:11 | 0:07 | Skills, background, and portfolio highlights |
| 4 | 0:18 | 0:15 | Seven project showcase: PricePulse, Medical Diagnosis, EduSage, VoxelCraft, Speed Force, Arena Clash, and Hack Pro |
| 5 | 0:33 | 0:07 | Quick stats: coding experience, projects, languages, and game demos |
| 6 | 0:40 | 0:08 | Project and learning achievements |
| 7 | 0:48 | 0:06 | Outro and email contact |

Scene buttons in the portfolio seek to the listed start times. Playback can be
paused, restarted, muted, volume-adjusted, and viewed fullscreen.

## After Effects adaptation

For an After Effects recreation, use the same dimensions, duration, palette,
scene timings, and exact portfolio content above. Keep text readable on mobile
by respecting a centered safe area and avoid introducing information that is
not in the portfolio data.
