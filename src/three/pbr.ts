/**
 * Real PBR skins.
 *
 * Albedo + tangent normal + roughness for each surface come from CC0 photo
 * scans (Poly Haven), packaged at 768px and served from /media/pbr. Loading goes
 * through useLoader, so the scene suspends until the maps are on the GPU and the
 * intro loader shows true progress instead of guessing.
 *
 * Tiling: the caller picks the repeat, so the same scanned stone or steel can be
 * reused at yard scale and at hand scale. Clones share the underlying image, so
 * remember to keep the returned object in a memo — one clone per material.
 */
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import { asset } from '../lib/asset'

export type SurfaceName =
  | 'asphalt' // yard tarmac
  | 'concrete' // hall floor, ramp, walls
  | 'cladding' // corrugated steel facade
  | 'shutter' // roller door slats, dock steel
  | 'chassis' // painted-and-rusting steel
  | 'wood' // pallets, sorting tables
  | 'steel' // brushed plate, truck panels

const SETS: Record<SurfaceName, string> = {
  asphalt: 'asphalt_02',
  concrete: 'concrete_floor_02',
  cladding: 'corrugated_iron_02',
  shutter: 'box_profile_metal_sheet',
  chassis: 'rusty_painted_metal',
  wood: 'wood_planks_dirt',
  steel: 'metal_plate_02',
}

export type Surface = {
  map: THREE.Texture
  normalMap: THREE.Texture
  roughnessMap: THREE.Texture
}

const KINDS = ['diff', 'nor', 'rough'] as const

/** URLs for one surface, in diff/nor/rough order (stable, so useLoader caches). */
export function surfaceUrls(name: SurfaceName): string[] {
  const set = SETS[name]
  return KINDS.map((k) => asset(`media/pbr/${set}-${k}.jpg`))
}

function tune(t: THREE.Texture, repeat: [number, number], srgb: boolean) {
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat[0], repeat[1])
  t.anisotropy = 8
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.needsUpdate = true
  return t
}

const cache = new Map<string, Surface>()

/**
 * Load (or reuse) the maps for a surface at a given tiling.
 * Suspends until every map of that set has decoded.
 */
export function useSurface(name: SurfaceName, repeat: [number, number] = [1, 1]): Surface {
  const [diff, nor, rough] = useLoader(THREE.TextureLoader, surfaceUrls(name))
  const key = `${name}:${repeat[0]}:${repeat[1]}`
  const hit = cache.get(key)
  if (hit) return hit
  const made: Surface = {
    map: tune(diff.clone(), repeat, true),
    normalMap: tune(nor.clone(), repeat, false),
    roughnessMap: tune(rough.clone(), repeat, false),
  }
  // the clones share the decoded image with the loaded originals, which stay
  // alive in the loader cache as their source
  cache.set(key, made)
  return made
}
