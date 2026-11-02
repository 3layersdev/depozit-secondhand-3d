import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { Bales, stack } from './Exterior'
import {
  garmentPalette,
  glowTexture,
  panelTexture,
  signTexture,
  wallTitleTexture,
} from './textures'
import { gallery, grades, services } from '../content'
import { concreteMaps, claddingMaps } from './materials'
import { SCENE_CUT, type ScrollRef } from './sequence'

const HALL_W = 15
const HALL_H = 8
const HALL_FRONT = 11
const HALL_BACK = -52

/* ------------------------------------------------------------------ */
/* Shell                                                              */
/* ------------------------------------------------------------------ */

function Hall() {
  const concrete = useMemo(() => concreteMaps([5, 16]), [])
  const metal = useMemo(() => claddingMaps([9, 2]), [])

  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, (HALL_FRONT + HALL_BACK) / 2]} receiveShadow>
        <planeGeometry args={[HALL_W, HALL_FRONT - HALL_BACK]} />
        <meshStandardMaterial
          map={concrete.map}
          normalMap={concrete.normalMap}
          normalScale={new THREE.Vector2(0.6, 0.6)}
          roughnessMap={concrete.roughnessMap}
          color="#a4a8ad"
          metalness={0.05}
          envMapIntensity={0.85}
        />
      </mesh>
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, HALL_H, (HALL_FRONT + HALL_BACK) / 2]}>
        <planeGeometry args={[HALL_W, HALL_FRONT - HALL_BACK]} />
        <meshStandardMaterial color="#101216" roughness={0.95} />
      </mesh>
      {/* side walls */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[(s * HALL_W) / 2, HALL_H / 2, (HALL_FRONT + HALL_BACK) / 2]}
          rotation={[0, (-s * Math.PI) / 2, 0]}
          receiveShadow
        >
          <planeGeometry args={[HALL_FRONT - HALL_BACK, HALL_H]} />
          <meshStandardMaterial
            map={metal.map}
            normalMap={metal.normalMap}
            roughnessMap={metal.roughnessMap}
            color="#6b7178"
            metalness={0.42}
            envMapIntensity={0.8}
          />
        </mesh>
      ))}
      {/* back wall */}
      <mesh position={[0, HALL_H / 2, HALL_BACK]} receiveShadow>
        <planeGeometry args={[HALL_W, HALL_H]} />
        <meshStandardMaterial
      map={metal.map}
      normalMap={metal.normalMap}
      roughnessMap={metal.roughnessMap}
      color="#565c63"
      metalness={0.35}
      envMapIntensity={0.8}
    />
      </mesh>
      {/* entry frame (behind camera at the start) */}
      <mesh position={[0, 1.5, HALL_FRONT]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[HALL_W, 3.2]} />
        <meshStandardMaterial color="#16181c" roughness={0.95} />
      </mesh>

      {/* ceiling light strips */}
      {[-18, -8, 2, -28, -40].map((z) => (
        <group key={z}>
          <mesh position={[0, HALL_H - 0.18, z]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.5, 0.42]} />
            <meshStandardMaterial color="#fff3dc" emissive="#ffe0b0" emissiveIntensity={2.6} side={THREE.DoubleSide} />
          </mesh>
          <pointLight position={[0, HALL_H - 1.1, z]} intensity={22} distance={18} color="#ffd8a8" />
        </group>
      ))}

      {/* painted floor aisles */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[s * 2.6, 0.012, (HALL_FRONT + HALL_BACK) / 2]}
        >
          <planeGeometry args={[0.09, HALL_FRONT - HALL_BACK]} />
          <meshStandardMaterial color="#e0a45a" roughness={0.8} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */

const RACK_COLORS = garmentPalette()

function GarmentRack({ position, count = 14 }: { position: [number, number, number]; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const color = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const x = -1.15 + (i / (count - 1)) * 2.3 + (Math.random() - 0.5) * 0.03
      const h = 0.62 + Math.random() * 0.34
      m.compose(
        new THREE.Vector3(x, 1.62 - h / 2, (Math.random() - 0.5) * 0.09),
        q.identity(),
        new THREE.Vector3(0.13 + Math.random() * 0.03, h, 0.05),
      )
      mesh.setMatrixAt(i, m)
      color.set(RACK_COLORS[i % RACK_COLORS.length])
      mesh.setColorAt(i, color)
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [count])

  return (
    <group position={position}>
      {/* rail */}
      <mesh position={[0, 1.66, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 2.6, 8]} />
        <meshStandardMaterial color="#a8adb4" roughness={0.3} metalness={0.85} />
      </mesh>
      {[-1.28, 1.28].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.82, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 1.68, 8]} />
            <meshStandardMaterial color="#a8adb4" roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[x, 0.02, 0]}>
            <boxGeometry args={[0.5, 0.04, 0.5]} />
            <meshStandardMaterial color="#31353b" roughness={0.6} metalness={0.4} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.85} metalness={0.02} />
      </instancedMesh>
    </group>
  )
}

function SortingTable({ position, items = 9 }: { position: [number, number, number]; items?: number }) {
  const piles = useMemo(
    () =>
      Array.from({ length: items }, () => ({
        x: (Math.random() - 0.5) * 3.4,
        z: (Math.random() - 0.5) * 1.0,
        h: 0.1 + Math.random() * 0.22,
        c: RACK_COLORS[Math.floor(Math.random() * RACK_COLORS.length)],
      })),
    [items],
  )
  return (
    <group position={position}>
      <mesh position={[0, 0.86, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.08, 1.5]} />
        <meshStandardMaterial color="#b9bcc0" roughness={0.5} metalness={0.25} />
      </mesh>
      {[-1.9, 1.9].map((x) =>
        [-0.6, 0.6].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.43, z]}>
            <boxGeometry args={[0.07, 0.86, 0.07]} />
            <meshStandardMaterial color="#4a4f55" roughness={0.6} metalness={0.4} />
          </mesh>
        )),
      )}
      {piles.map((p, i) => (
        <mesh key={i} position={[p.x, 0.9 + p.h / 2, p.z]} rotation={[0, Math.random(), 0]}>
          <boxGeometry args={[0.34, p.h, 0.26]} />
          <meshStandardMaterial color={p.c} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function Forklift({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[1.5, 0.9, 2.0]} />
        <meshStandardMaterial color="#d8892b" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.5, 0.15]}>
        <boxGeometry args={[1.3, 0.9, 1.2]} />
        <meshStandardMaterial color="#2a2e33" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* mast + forks */}
      <mesh position={[0, 1.5, -1.15]}>
        <boxGeometry args={[1.3, 2.6, 0.16]} />
        <meshStandardMaterial color="#3c4046" roughness={0.6} metalness={0.5} />
      </mesh>
      {[-0.45, 0.45].map((x) => (
        <mesh key={x} position={[x, 0.28, -1.75]}>
          <boxGeometry args={[0.16, 0.06, 1.3]} />
          <meshStandardMaterial color="#55595f" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {[-0.62, 0.62].map((x) =>
        [-0.6, 0.7].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.32, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.24, 12]} />
            <meshStandardMaterial color="#17191c" roughness={0.9} />
          </mesh>
        )),
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Panels                                                             */
/* ------------------------------------------------------------------ */

function Panel({
  texture,
  position,
  rotation = 0,
  size = [6, 3.75],
  accent = '#e8722c',
}: {
  texture: THREE.Texture
  position: [number, number, number]
  rotation?: number
  size?: [number, number]
  accent?: string
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh>
        <planeGeometry args={size} />
        <meshStandardMaterial
          map={texture}
          roughness={0.55}
          metalness={0.1}
          emissive="#ffffff"
          emissiveMap={texture}
          emissiveIntensity={0.35}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, size[1] / 2 + 0.04, -0.02]}>
        <planeGeometry args={[size[0], 0.06]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <sprite position={[0, 0, -0.5]} scale={[size[0] * 1.5, size[1] * 1.5, 1]}>
        <spriteMaterial map={glowTexture('#ffb271')} transparent opacity={0.16} depthWrite={false} />
      </sprite>
    </group>
  )
}

function ServicePanels() {
  const textures = useMemo(
    () =>
      services.map((s) =>
        panelTexture({
          index: s.index,
          kicker: 'Serviciu',
          title: s.title,
          body: s.text,
          bullets: s.points.slice(0, 2),
        }),
      ),
    [],
  )

  const spots: { z: number; side: -1 | 1 }[] = [
    { z: 1.2, side: -1 },
    { z: 1.2, side: 1 },
    { z: -7.4, side: -1 },
    { z: -7.4, side: 1 },
  ]

  return (
    <group>
      {textures.map((t, i) => {
        const spot = spots[i]
        const x = spot.side * (HALL_W / 2 - 0.22)
        const rotation = spot.side < 0 ? Math.PI / 2 - 0.42 : -Math.PI / 2 + 0.42
        return (
          <Panel
            key={i}
            texture={t}
            position={[x, 2.75, spot.z]}
            rotation={rotation}
            size={[6, 3.75]}
          />
        )
      })}
      {/* bales under the panels, so the space feels stocked */}
      <Bales specs={stack([-5.6, 0, 3.6], 1, 2, 3, { gapZ: 1.1 })} />
      <Bales specs={stack([5.1, 0, 3.6], 1, 2, 3, { gapZ: 1.1 })} />
      <Bales specs={stack([-5.9, 0, -3.2], 1, 2, 2, { gapZ: 1.1 })} />
      <Bales specs={stack([5.4, 0, -3.2], 1, 2, 2, { gapZ: 1.1 })} />
    </group>
  )
}

function GradeZone() {
  const textures = useMemo(
    () =>
      grades.map((g) =>
        panelTexture({
          kicker: g.tag,
          title: g.name,
          body: g.text,
          accent: g.id === 'extra' ? '#f2c14e' : g.id === 'crema' ? '#e8722c' : '#8fa3b8',
        }),
      ),
    [],
  )

  return (
    <group>
      {/* zone header on the floor-lit wall */}
      <mesh position={[-HALL_W / 2 + 0.2, 5.4, -15.4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 2.5]} />
        <meshStandardMaterial
          map={wallTitleTexture('Cinci calități sortate', 'Calitate')}
          transparent
          emissive="#ffffff"
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>

      {textures.map((t, i) => (
        <group key={i}>
          <Panel
            texture={t}
            position={[HALL_W / 2 - 0.22, 3.9, -12.4 - i * 3.2]}
            rotation={-Math.PI / 2 + 0.5}
            size={[4.6, 2.9]}
            accent={grades[i].id === 'extra' ? '#f2c14e' : '#e8722c'}
          />
          {/* quality bar on the floor */}
          <mesh position={[HALL_W / 2 - 1.4, 0.02, -12.4 - i * 3.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4.2 * grades[i].metric, 0.16]} />
            <meshStandardMaterial
              color={grades[i].id === 'extra' ? '#f2c14e' : '#e8722c'}
              emissive={grades[i].id === 'extra' ? '#f2c14e' : '#e8722c'}
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>
      ))}

      <SortingTable position={[-2.2, 0, -14.4]} />
      <SortingTable position={[-2.6, 0, -19.2]} items={7} />
      <GarmentRack position={[-4.6, 0, -12.2]} />
      <GarmentRack position={[-4.9, 0, -17.4]} count={12} />
      <GarmentRack position={[4.6, 0, -21.5]} count={13} />
      <Bales specs={stack([-5.7, 0, -22.4], 1, 2, 3, { gapZ: 1.05 })} />
      <Bales specs={stack([3.4, 0, -24.6], 2, 1, 2, { gapX: 1.45 })} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Gallery                                                            */
/* ------------------------------------------------------------------ */

function GalleryCard({
  index,
  position,
  rotation,
  texture,
  meta,
}: {
  index: number
  position: [number, number, number]
  rotation: number
  texture: THREE.Texture
  meta: (typeof gallery)[number]
}) {
  const group = useRef<THREE.Group>(null)
  const baseY = position[1]
  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.position.y = baseY + Math.sin(t * 0.7 + index * 1.3) * 0.05
    group.current.rotation.z = Math.sin(t * 0.45 + index) * 0.012
  })

  return (
    <group ref={group} position={position} rotation={[0, rotation, 0]}>
      {/* frame */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[3.5, 2.34, 0.1]} />
        <meshStandardMaterial color="#1b1e22" roughness={0.45} metalness={0.6} />
      </mesh>
      <mesh>
        <planeGeometry args={[3.3, 2.14]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.35}
          metalness={0.05}
          emissive="#ffffff"
          emissiveMap={texture}
          emissiveIntensity={0.28}
          toneMapped={false}
        />
      </mesh>
      {/* caption plate */}
      <mesh position={[0, -1.38, 0]}>
        <planeGeometry args={[3.3, 0.46]} />
        <meshStandardMaterial color="#0e1013" roughness={0.6} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, -1.38, 0.01]}>
        <planeGeometry args={[3.3, 0.46]} />
        <meshStandardMaterial
          map={captionTexture(meta.title, meta.meta, meta.kind === 'reel')}
          transparent
          toneMapped={false}
        />
      </mesh>
      {/* reel badge */}
      {meta.kind === 'reel' && (
        <group position={[1.2, 0.78, 0.05]}>
          <mesh>
            <circleGeometry args={[0.26, 24]} />
            <meshStandardMaterial color="#e8722c" emissive="#e8722c" emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
          <mesh position={[0.02, 0, 0.01]}>
            <circleGeometry args={[0.085, 3]} />
            <meshStandardMaterial color="#0d0e10" toneMapped={false} />
          </mesh>
        </group>
      )}
      <sprite position={[0, 0, -0.4]} scale={[5.2, 4, 1]}>
        <spriteMaterial map={glowTexture('#ffc08a')} transparent opacity={0.1} depthWrite={false} />
      </sprite>
    </group>
  )
}

const captionCache = new Map<string, THREE.Texture>()
function captionTexture(title: string, meta: string, reel: boolean) {
  const key = `${title}|${meta}|${reel}`
  const hit = captionCache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 144
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#0e1013'
  ctx.fillRect(0, 0, 1024, 144)
  ctx.fillStyle = '#f6f4ef'
  ctx.font = 'bold 46px Helvetica, Arial, sans-serif'
  ctx.fillText(title, 26, 62)
  ctx.fillStyle = 'rgba(246,244,239,0.6)'
  ctx.font = '400 30px Helvetica, Arial, sans-serif'
  ctx.fillText(meta, 26, 108)
  if (reel) {
    ctx.fillStyle = '#e8722c'
    ctx.font = '700 28px Helvetica, Arial, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('CLIP', 998, 100)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  captionCache.set(key, t)
  return t
}

function GalleryWall() {
  const textures = useTexture(gallery.map((g) => g.src))
  const list = Array.isArray(textures) ? textures : [textures]
  useMemo(() => {
    list.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 4
    })
  }, [list])

  const slots = useMemo(
    () =>
      gallery.map((_, i) => {
        const side = i % 2 === 0 ? -1 : 1
        return {
          position: [side * 3.05, 2.85 - (i % 3) * 0.06, -25.5 - i * 1.55] as [number, number, number],
          rotation: side < 0 ? 0.42 : -0.42,
        }
      }),
    [],
  )

  return (
    <group>
      <mesh position={[0, 6.2, -30]} rotation={[0, 0, 0]}>
        <planeGeometry args={[11, 2.2]} />
        <meshStandardMaterial
          map={wallTitleTexture('Din depozit, direct la raft', 'Galerie')}
          transparent
          emissive="#ffffff"
          emissiveIntensity={0.45}
          toneMapped={false}
        />
      </mesh>
      {gallery.map((item, i) => (
        <GalleryCard
          key={item.id}
          index={i}
          position={slots[i].position}
          rotation={slots[i].rotation}
          texture={list[i]}
          meta={item}
        />
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Outro                                                              */
/* ------------------------------------------------------------------ */

function OutroWall() {
  const sign = useMemo(() => signTexture('SECOND-HAND', 'BUCUREȘTI', 'SORTARE · CALITĂȚI · EN GROS'), [])
  return (
    <group position={[0, 0, -50.5]}>
      <mesh position={[0, 4.4, 0]}>
        <planeGeometry args={[14, 3.5]} />
        <meshStandardMaterial
          map={sign}
          emissive="#ffffff"
          emissiveMap={sign}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 2.1, -0.2]}>
        <planeGeometry args={[12, 0.06]} />
        <meshStandardMaterial color="#e8722c" emissive="#e8722c" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <sprite position={[0, 4.2, 0.5]} scale={[16, 9, 1]}>
        <spriteMaterial map={glowTexture('#ffbe86')} transparent opacity={0.22} depthWrite={false} />
      </sprite>
      <Bales specs={stack([-5.6, 0, -1.2], 1, 2, 3, { gapZ: 1.05 })} />
      <Bales specs={stack([5.2, 0, -1.2], 1, 2, 3, { gapZ: 1.05 })} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Root                                                               */
/* ------------------------------------------------------------------ */

export function Interior({ progress }: { progress: ScrollRef }) {
  const root = useRef<THREE.Group>(null)

  useFrame(() => {
    if (root.current) root.current.visible = progress.current.p >= SCENE_CUT
  })

  return (
    <group ref={root} visible={false}>
      <Hall />
      <Forklift position={[-4.4, 0, 6]} rotation={0.5} />
      <Bales specs={stack([4.2, 0, 7.6], 2, 2, 3, { gapX: 1.42, gapZ: 1.05 })} />
      <Bales specs={stack([-3.4, 0, 8.6], 1, 2, 3, { gapZ: 1.05 })} />
      <GarmentRack position={[4.4, 0, 4.4]} count={16} />
      <ServicePanels />
      <GradeZone />
      <GalleryWall />
      <OutroWall />
    </group>
  )
}
