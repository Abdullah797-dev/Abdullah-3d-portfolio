# Blender Avatar — Modeling Notes

This document describes how to author the equivalent of the procedurally-built
avatar (in `src/components/scene/hero-scene.tsx`) as a proper Blender model
with rigging, materials, and GLB export.

## Reference geometry

The current procedural avatar is composed of these primitives:

| Part | Geometry | Notes |
| --- | --- | --- |
| Head | Icosahedron (radius 0.55, detail 1) | Distort material, color `#0EA5E9`, emissive `#0891B2` |
| Visor | Box (0.7 × 0.18 × 0.05) | Pure black, fully metallic |
| Eyes | Two spheres (radius 0.05) | Left: fuchsia `#E879F9`, Right: cyan `#22D3EE`, fully emissive |
| Neck | Cylinder (0.12 top, 0.18 bottom, height 0.3) | Dark slate `#1E293B`, metallic |
| Torso | Capsule (radius 0.45, length 0.6) | Dark slate, emissive cyan tint `#0C4A6E` |
| Chest core | Icosahedron (radius 0.12) | Fuchsia, fully emissive, animated pulse |
| Arms | Two capsules (radius 0.1, length 0.5) | Slate `#334155`, metallic |
| Halo ring | Torus (radius 0.7, tube 0.02) above head | Cyan, emissive, rotates |
| Hover base ring | Torus (radius 0.6, tube 0.04) below | Fuchsia, emissive |

## Suggested Blender workflow

1. **Open Blender** (3.6+ recommended). Delete the default cube.
2. **Add** each part using `Add > Mesh >` for primitives. Use `Ico Sphere` for
   the head/chest core (set subdivisions to 1), `Cylinder` for the neck, and
   `Capsule` (Blender 4.x has this as `Add > Mesh > Capsule`) for the torso
   and arms. Use `Add > Mesh > Torus` for the rings.
3. **Position** each part as in the reference table (head at y=0.7, torso at
   y=-0.45, etc.). Parent everything to an Empty at the origin.
4. **Materials**: For each part, create a material in the Shader Editor:
   - Head/torso/arms: Principled BSDF, Base Color from the table, Metallic
     0.85, Roughness 0.15–0.3, Emissive Color set with strength 0.4–1.0.
   - Eyes/chest core/halo/base ring: Set Emissive Strength to 2.0–3.0 so
     they glow visibly. Disable `tone mapping` in the GLB export settings to
     preserve the bright values.
5. **Rigging** (optional but recommended):
   - Add an Armature with a single bone running through the torso and neck
     into the head. Parent the head + neck + halo to the head bone.
   - Add two arm bones and parent the arm meshes to them.
   - This lets you pose the avatar or animate waving gestures.
6. **Animation** (optional):
   - Add a subtle "idle" animation: head bob (sinusoidal Y translation
     ±0.08 over 1.2s loop), halo rotation around Z (continuous), chest core
     scale pulse (±8% over 0.33s loop).
   - Export these as actions so they can be played in the web viewer.
7. **Export**:
   - `File > Export > glTF 2.0 (.glb)`.
   - Settings:
     - Format: **glTF Binary (.glb)**
     - Include: ✓ Limit to → checked, ✓ Apply Modifiers
     - Mesh: ✓ Normals, ✓ Tangents, ✓ UVs
     - Material: ✓ Export Materials, shader mode "glTF Material Output"
     - Animation: ✓ Animations, ✓ Sampling, ✓ All Actions (if you made any)
   - Save as `public/avatar.glb`.

## Loading the GLB in the portfolio

Replace the `<Avatar />` function body in
`src/components/scene/hero-scene.tsx` with:

```tsx
import { useGLTF } from '@react-three/drei'

function Avatar() {
  const { scene } = useGLTF('/avatar.glb')
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.08
  })
  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  )
}
```

For animations exported from Blender, use `useAnimations` from drei:

```tsx
import { useGLTF, useAnimations } from '@react-three/drei'

function Avatar() {
  const { scene, animations } = useGLTF('/avatar.glb')
  const ref = useRef<THREE.Group>(null)
  const { actions } = useAnimations(animations, ref)
  useEffect(() => {
    actions['Idle']?.play()
  }, [actions])
  return <primitive ref={ref} object={scene} />
}
```

## Files to deliver

- `avatar.blend` — Blender source file (commit to `download/3d/avatar.blend`)
- `avatar.glb` — exported web-ready model (place in `public/avatar.glb`)
- Optional: `avatar.png` — a rendered preview image

