import type { MutableRefObject } from 'react'
import * as THREE from 'three'

export type ScrollRef = MutableRefObject<{ p: number }>

/** Keyframe helper: monotone interpolation between stops, no overshoot outside range */
export type Stop = { p: number; v: number[] }

export function sampleVec3(stops: Stop[], p: number, out: THREE.Vector3) {
  if (p <= stops[0].p) return out.set(...(stops[0].v as [number, number, number]))
  const last = stops[stops.length - 1]
  if (p >= last.p) return out.set(...(last.v as [number, number, number]))
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]
    const b = stops[i + 1]
    if (p >= a.p && p <= b.p) {
      const raw = (p - a.p) / (b.p - a.p)
      const t = smoothstep(raw)
      return out.set(
        THREE.MathUtils.lerp(a.v[0], b.v[0], t),
        THREE.MathUtils.lerp(a.v[1], b.v[1], t),
        THREE.MathUtils.lerp(a.v[2], b.v[2], t),
      )
    }
  }
  return out.set(...(last.v as [number, number, number]))
}

export function smoothstep(t: number) {
  const x = THREE.MathUtils.clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

/** normalized 0..1 progress between two absolute stops */
export function range(p: number, from: number, to: number) {
  return THREE.MathUtils.clamp((p - from) / (to - from), 0, 1)
}

export function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt))
}

/* ---------- exterior camera path ---------- */
/* The truck arrives and stops at the ramp; the camera then slides down its
   right flank and settles in front of the bay whose shutter rolls up, so the
   chapter about the depot door lands on the depot door, not on the trailer. */
export const EXT_CAM: Stop[] = [
  { p: 0.0, v: [27, 12, 54] },
  { p: 0.09, v: [21.5, 9.2, 42.5] },
  { p: 0.17, v: [15.2, 6.6, 30.5] },
  { p: 0.24, v: [9.2, 4.47, 17.4] },
  { p: 0.3, v: [6.0, 3.42, 11.2] },
  { p: 0.36, v: [5.3, 3.0, 4.6] },
  { p: 0.42, v: [6.6, 2.8, -0.6] },
  { p: 0.455, v: [8.1, 2.62, -4.8] },
  { p: 0.5, v: [8.8, 2.54, -9.0] },
]

export const EXT_TGT: Stop[] = [
  { p: 0.0, v: [3, 5.0, -2] },
  { p: 0.09, v: [4, 4.4, -1] },
  { p: 0.17, v: [6, 3.6, -2] },
  { p: 0.24, v: [7.0, 3.05, -3.4] },
  { p: 0.3, v: [6.2, 2.9, -5.6] },
  { p: 0.36, v: [6.8, 2.8, -8.6] },
  { p: 0.42, v: [8.5, 2.62, -11.4] },
  { p: 0.455, v: [9, 2.45, -14] },
  { p: 0.5, v: [9, 2.4, -16] },
]

/* ---------- interior camera path ---------- */
export const INT_CAM: Stop[] = [
  { p: 0.5, v: [0, 2.4, 9] },
  { p: 0.56, v: [0.5, 2.45, 3.4] },
  { p: 0.63, v: [-0.7, 2.35, -4.4] },
  { p: 0.7, v: [0.9, 2.3, -12.6] },
  { p: 0.77, v: [-0.5, 2.35, -20.4] },
  { p: 0.84, v: [0.7, 2.3, -27.6] },
  { p: 0.91, v: [0, 2.5, -35.4] },
  { p: 1.0, v: [0, 3.0, -43.5] },
]

export const INT_TGT: Stop[] = [
  { p: 0.5, v: [0, 2.2, 0] },
  { p: 0.56, v: [0, 2.15, -6] },
  { p: 0.63, v: [0, 2.05, -13] },
  { p: 0.7, v: [0, 2.0, -21] },
  { p: 0.77, v: [0, 2.0, -28] },
  { p: 0.84, v: [0, 2.0, -35] },
  { p: 0.91, v: [0, 2.3, -43] },
  { p: 1.0, v: [0, 3.4, -52] },
]

import { SCENE_CUT } from '../lib/constants'
export { SCENE_CUT }
