/**
 * Procedural PBR map generators.
 *
 * Everything is generated in JS at load time (no external textures), but instead
 * of flat colours these produce albedo + normal + roughness triplets so surfaces
 * react to the environment map and the key light the way real materials do.
 *
 * Sizes stay small (256–512) because the maps are tiled: detail comes from the
 * normal map, not from resolution.
 */
import * as THREE from 'three'

type RGB = [number, number, number]

/* ------------------------------------------------------------------ */
/* tiny noise toolbox                                                  */
/* ------------------------------------------------------------------ */

function hash2(x: number, y: number, seed: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453
  return n - Math.floor(n)
}

function valueNoise(x: number, y: number, seed: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash2(xi, yi, seed)
  const b = hash2(xi + 1, yi, seed)
  const c = hash2(xi, yi + 1, seed)
  const d = hash2(xi + 1, yi + 1, seed)
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v
}

function fbm(x: number, y: number, seed: number, octaves = 4) {
  let sum = 0
  let amp = 0.5
  let freq = 1
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, y * freq, seed + i * 13) * amp
    amp *= 0.5
    freq *= 2.07
  }
  return sum
}

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n
}

/* ------------------------------------------------------------------ */
/* core builders                                                       */
/* ------------------------------------------------------------------ */

function canvas(size: number) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  return c
}

function finish(c: HTMLCanvasElement, repeat: [number, number], srgb: boolean) {
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  t.anisotropy = 8
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.needsUpdate = true
  return t
}

/**
 * Builds a colour map and, from the same height field, a matching normal map
 * (Sobel). Data maps stay linear; only albedo is sRGB.
 */
function buildMaps(
  size: number,
  repeat: [number, number],
  shade: (u: number, v: number, x: number, y: number) => { rgb: RGB; height: number; rough: number },
) {
  const color = canvas(size)
  const rough = canvas(size)
  const cctx = color.getContext('2d')!
  const rctx = rough.getContext('2d')!
  const cimg = cctx.createImageData(size, size)
  const rimg = rctx.createImageData(size, size)
  const heights = new Float32Array(size * size)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      const s = shade(u, v, x, y)
      const i = (y * size + x) * 4
      cimg.data[i] = clamp01(s.rgb[0]) * 255
      cimg.data[i + 1] = clamp01(s.rgb[1]) * 255
      cimg.data[i + 2] = clamp01(s.rgb[2]) * 255
      cimg.data[i + 3] = 255
      const r = clamp01(s.rough) * 255
      rimg.data[i] = r
      rimg.data[i + 1] = r
      rimg.data[i + 2] = r
      rimg.data[i + 3] = 255
      heights[y * size + x] = s.height
    }
  }
  cctx.putImageData(cimg, 0, 0)
  rctx.putImageData(rimg, 0, 0)

  // Sobel → tangent-space normal
  const nrm = canvas(size)
  const nctx = nrm.getContext('2d')!
  const nimg = nctx.createImageData(size, size)
  const at = (x: number, y: number) =>
    heights[((y + size) % size) * size + ((x + size) % size)]
  const strength = 2.2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx =
        at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) -
        (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1))
      const dy =
        at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) -
        (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1))
      let nx = -dx * strength
      let ny = -dy * strength
      let nz = 1
      const len = Math.hypot(nx, ny, nz) || 1
      nx /= len
      ny /= len
      nz /= len
      const i = (y * size + x) * 4
      nimg.data[i] = (nx * 0.5 + 0.5) * 255
      nimg.data[i + 1] = (ny * 0.5 + 0.5) * 255
      nimg.data[i + 2] = (nz * 0.5 + 0.5) * 255
      nimg.data[i + 3] = 255
    }
  }
  nctx.putImageData(nimg, 0, 0)

  return {
    map: finish(color, repeat, true),
    normalMap: finish(nrm, repeat, false),
    roughnessMap: finish(rough, repeat, false),
  }
}

/* ------------------------------------------------------------------ */
/* materials                                                           */
/* ------------------------------------------------------------------ */

/** Trapezoidal steel cladding: vertical ribs, grime streaks, galvanised sheen. */
export function claddingMaps(repeat: [number, number] = [6, 3]) {
  return buildMaps(384, repeat, (u, v) => {
    const ribs = 22
    const s = Math.sin(u * Math.PI * 2 * ribs)
    const rib = Math.pow(Math.abs(s), 0.65) * Math.sign(s)
    const grain = fbm(u * 90, v * 90, 3, 3) - 0.5
    const streak = fbm(u * 26, v * 3, 9, 3)
    const grime = clamp01((v - 0.62) * 2.2) * streak * 0.34
    const base = 0.62 + rib * 0.12 + grain * 0.05
    const tint = clamp01(base - grime)
    return {
      rgb: [tint * 0.92, tint * 0.94, tint * 0.97] as RGB,
      height: rib * 0.35 + grain * 0.35,
      rough: 0.34 + Math.abs(grain) * 0.24 + grime * 0.4,
    }
  })
}

/** Yard asphalt: aggregate speckle, worn tyre paths, damp patches. */
export function asphaltMaps(repeat: [number, number] = [26, 26]) {
  return buildMaps(384, repeat, (u, v) => {
    const cell = hash2(Math.floor(u * 260), Math.floor(v * 260), 5)
    const agg = cell > 0.82 ? (cell - 0.82) * 5.2 : 0
    const grain = fbm(u * 120, v * 120, 11, 3)
    const patch = fbm(u * 5, v * 5, 21, 3)
    const damp = clamp01((patch - 0.55) * 3.4)
    const base = 0.12 + grain * 0.09 + agg * 0.2
    const dark = base * (1 - damp * 0.32)
    return {
      rgb: [dark * 1.02, dark, dark * 0.98] as RGB,
      height: agg * 0.55 + grain * 0.4,
      rough: 0.86 - damp * 0.68 + agg * 0.05,
    }
  })
}

/** Poured concrete floor with saw joints, scuffs and oil stains. */
export function concreteMaps(repeat: [number, number] = [8, 8]) {
  return buildMaps(384, repeat, (u, v) => {
    const grain = fbm(u * 60, v * 60, 31, 4)
    const stain = fbm(u * 3.2, v * 3.2, 41, 3)
    const joint = Math.min(
      Math.abs((u % 0.25) - 0.125),
      Math.abs((v % 0.25) - 0.125),
    )
    const jointDark = joint < 0.006 ? 0.45 : 1
    const base = (0.52 + grain * 0.16 - clamp01(stain - 0.5) * 0.3) * jointDark
    return {
      rgb: [base * 1.01, base, base * 0.97] as RGB,
      height: grain * 0.5 + (joint < 0.006 ? -0.6 : 0),
      rough: 0.78 + grain * 0.14,
    }
  })
}

/** Woven poly wrap / pressed cloth for bales: crosshatch weave with tape sheen. */
export function baleMaps(repeat: [number, number] = [3, 2]) {
  return buildMaps(384, repeat, (u, v) => {
    const weave =
      Math.sin(u * Math.PI * 2 * 120) * Math.sin(v * Math.PI * 2 * 120) * 0.5 + 0.5
    const lump = fbm(u * 9, v * 9, 51, 4)
    const wrinkles = fbm(u * 22, v * 6, 61, 3)
    const tape = v > 0.46 && v < 0.54 ? 1 : 0
    const tint = 0.84 + lump * 0.16 - wrinkles * 0.06
    const rgb: RGB = tape
      ? [tint * 0.99, tint * 0.99, 1]
      : [tint, tint * 0.995, tint * 0.985]
    return {
      rgb,
      height: weave * 0.5 + lump * 0.6 + wrinkles * 0.3,
      rough: tape ? 0.22 : 0.62 + weave * 0.06,
    }
  })
}

/** Rough sawn pallet timber. */
export function palletMaps(repeat: [number, number] = [1, 1]) {
  return buildMaps(256, repeat, (u, v) => {
    const grain = fbm(u * 30, v * 220, 71, 3)
    const plank = Math.floor(v * 7) / 7
    const seam = Math.abs((v * 7) % 1 - 0.5) > 0.44 ? 0.55 : 1
    const tone = 0.34 + plank * 0.16 + grain * 0.12
    return {
      rgb: [(tone + 0.06) * seam, tone * seam, (tone - 0.04) * seam] as RGB,
      height: grain * 0.7 * seam,
      rough: 0.85,
    }
  })
}

/** Brushed aluminium / galvanised trim used for dock hardware. */
export function brushedMetalMaps(repeat: [number, number] = [2, 2]) {
  return buildMaps(256, repeat, (u, v) => {
    const brush = fbm(u * 200, v * 6, 81, 3)
    const tone = 0.56 + brush * 0.18
    return {
      rgb: [tone, tone * 1.01, tone * 1.03] as RGB,
      height: brush * 0.5,
      rough: 0.28 + brush * 0.22,
    }
  })
}

/* ------------------------------------------------------------------ */
/* vehicle paint                                                       */
/* ------------------------------------------------------------------ */

/**
 * Painted steel for the truck body: panel seams, rivet lines, orange-peel
 * grain, road dirt creeping up from the sill and a few scratches. Comes with
 * normal + roughness so the paint catches the low sun instead of reading flat.
 */
export function vehiclePaintMaps(repeat: [number, number] = [2, 1]) {
  return buildMaps(384, repeat, (u, v) => {
    const grain = fbm(u * 150, v * 150, 101, 3) - 0.5
    const peel = fbm(u * 40, v * 40, 111, 2) - 0.5

    // panel seams every quarter of the body side
    const cell = u * 4
    const d = Math.min(cell % 1, 1 - (cell % 1))
    const seam = d < 0.006 ? 0.7 : 1
    // rivet rows just above the sill and under the roof
    const rivetBand = (v > 0.055 && v < 0.085) || (v > 0.915 && v < 0.945)
    const rivetCell = (v * 90) % 1
    const rivet = rivetBand && d < 0.05 && rivetCell < 0.45 ? 1 : 0

    // road grime: strongest at the bottom, broken up by streaks
    const streak = fbm(u * 18, v * 4, 121, 3)
    const dirt = clamp01((v - 0.7) / 0.3) * (0.45 + streak * 0.75)
    const spray = clamp01((fbm(u * 55, v * 55, 131, 3) - 0.62) * 3) * clamp01((v - 0.6) * 2)

    // a handful of light scratches
    const scratch = hash2(Math.floor(v * 384), Math.floor(u * 12), 141) > 0.985 ? 0.12 : 0

    const base = 0.9 + peel * 0.05 + grain * 0.03
    const tint = base * seam * (1 - dirt * 0.34 - spray * 0.22) + scratch
    return {
      rgb: [tint * 1.0, tint * 0.995, tint * 0.985] as RGB,
      height: peel * 0.35 + grain * 0.4 + (seam < 1 ? -0.6 : 0) + rivet * 0.8 + dirt * 0.2,
      rough: 0.3 + grain * 0.1 + dirt * 0.45 + spray * 0.3,
    }
  })
}

/** Weathered galvanised chassis / underframe: rust blooms on dull steel. */
export function chassisMaps(repeat: [number, number] = [4, 2]) {
  return buildMaps(256, repeat, (u, v) => {
    const grain = fbm(u * 120, v * 120, 151, 3)
    const rust = clamp01((fbm(u * 7, v * 7, 161, 4) - 0.52) * 3.2)
    const tone = 0.2 + grain * 0.12
    return {
      rgb: [tone * (1 + rust * 2.1), tone * (1 + rust * 0.8), tone * (1 - rust * 0.2)] as RGB,
      height: grain * 0.5 + rust * 0.4,
      rough: 0.62 + rust * 0.34,
    }
  })
}
