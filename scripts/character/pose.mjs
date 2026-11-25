import { readFileSync } from 'node:fs'
const raw = JSON.parse(readFileSync(new URL('../../src/lib/hero-pose.json', import.meta.url), 'utf8'))
delete raw._comment
/** Local bone rotations (radians, Euler ZYX) for the hero pose. */
export const HERO_POSE = raw
