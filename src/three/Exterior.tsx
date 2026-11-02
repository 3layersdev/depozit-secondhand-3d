import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import {
  baleLabelTexture,
  glowTexture,
  shutterTexture,
  signTexture,
} from './textures'
import { asphaltMaps, baleMaps, claddingMaps } from './materials'
import { TruckDetails, WarehouseDetails, YardDetails } from './details'
import { range, smoothstep, type ScrollRef } from './sequence'

/* ------------------------------------------------------------------ */
/* Instanced bale stacks (shared by exterior + interior)              */
/* ------------------------------------------------------------------ */

/** Soft cloth sack: subdivided box, vertices pushed out into bulges. */
function baleGeometry() {
  const g = new THREE.BoxGeometry(1, 1, 1, 11, 8, 11)
  const pos = g.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const bulge =
      Math.sin(v.x * 4.7 + 1.7) * Math.cos(v.y * 3.9) * Math.sin(v.z * 4.5 + 0.6)
    const crease = Math.sin(v.x * 11.5 + v.z * 7.3) * Math.sin(v.z * 9.1 - v.y * 5.5)
    const edge = Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z))
    // keep the corners sagging inward: packed sacks round off at the edges
    const amount = (0.055 * bulge + 0.016 * crease) * (1.0 - edge * 0.55)
    v.multiplyScalar(1 + amount)
    // sag the top face a little, the way a packed sack settles
    if (v.y > 0.35) v.y -= 0.02 + 0.02 * Math.abs(Math.sin(v.x * 6))
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

export type BaleSpec = {
  pos: [number, number, number]
  size?: [number, number, number]
  yaw?: number
}

export function Bales({
  specs,
  wrapScale = 1,
  tint = '#e6e9ee',
}: {
  specs: BaleSpec[]
  wrapScale?: number
  tint?: string
}) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const wrap = useMemo(() => baleMaps([2 * wrapScale, 1.4 * wrapScale]), [wrapScale])
  const geo = useMemo(() => baleGeometry(), [])

  useEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    specs.forEach((s, i) => {
      const size = s.size ?? [1.32, 0.92, 0.98]
      e.set(0, s.yaw ?? 0, 0)
      q.setFromEuler(e)
      m.compose(
        new THREE.Vector3(...s.pos),
        q,
        new THREE.Vector3(size[0], size[1], size[2]),
      )
      mesh.setMatrixAt(i, m)
    })
    mesh.instanceMatrix.needsUpdate = true
    // slight tone spread per sack: same cloth, different light and dye lots
    const c = new THREE.Color()
    specs.forEach((_, i) => {
      const t = 0.88 + ((i * 37) % 17) / 100
      c.setRGB(t, t * 0.995, t * 0.975)
      mesh.setColorAt(i, c)
    })
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [specs])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, specs.length]} castShadow receiveShadow>
      <primitive object={geo} attach="geometry" />
      <meshPhysicalMaterial
        map={wrap.map}
        normalMap={wrap.normalMap}
        roughnessMap={wrap.roughnessMap}
        normalScale={new THREE.Vector2(0.85, 0.85)}
        color={tint}
        roughness={0.42}
        metalness={0}
        clearcoat={0.75}
        clearcoatRoughness={0.28}
        envMapIntensity={0.9}
      />
    </instancedMesh>
  )
}

/** stack generator: builds a pallet-sized pile */
export function stack(
  base: [number, number, number],
  cols: number,
  rows: number,
  layers: number,
  opts: { gapX?: number; gapY?: number; gapZ?: number; jitter?: number } = {},
): BaleSpec[] {
  const { gapX = 1.4, gapY = 0.96, gapZ = 1.05, jitter = 0.06 } = opts
  const out: BaleSpec[] = []
  for (let l = 0; l < layers; l++) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push({
          pos: [
            base[0] + c * gapX + (Math.random() - 0.5) * jitter,
            base[1] + 0.46 + l * gapY,
            base[2] + r * gapZ + (Math.random() - 0.5) * jitter,
          ],
          yaw: (Math.random() - 0.5) * 0.05,
        })
      }
    }
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Ground, markings                                                    */
/* ------------------------------------------------------------------ */

export function Yard() {
  const asphalt = useMemo(() => asphaltMaps([26, 26]), [])
  const lines = useMemo(() => {
    const g: { pos: [number, number, number]; size: [number, number] }[] = []
    for (let i = -3; i <= 3; i++) {
      g.push({ pos: [i * 4, 0.012, 16], size: [0.14, 6] })
    }
    return g
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[320, 320]} />
        <meshStandardMaterial
          map={asphalt.map}
          normalMap={asphalt.normalMap}
          normalScale={new THREE.Vector2(0.7, 0.7)}
          roughnessMap={asphalt.roughnessMap}
          metalness={0.06}
          envMapIntensity={0.7}
        />
      </mesh>
      {lines.map((l, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={l.pos}>
          <planeGeometry args={l.size} />
          <meshStandardMaterial color="#e4e2d8" roughness={0.9} transparent opacity={0.28} />
        </mesh>
      ))}
      {/* loading ramp */}
      <mesh position={[0, 0.3, -6.6]} receiveShadow>
        <boxGeometry args={[30, 0.6, 12]} />
        <meshStandardMaterial color="#3a3d42" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.62, -0.8]} receiveShadow>
        <boxGeometry args={[30, 0.04, 0.5]} />
        <meshStandardMaterial color="#c9c4b4" roughness={0.8} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Warehouse facade                                                    */
/* ------------------------------------------------------------------ */

export function Warehouse({ open }: { open: React.RefObject<number> }) {
  const corrugated = useMemo(() => claddingMaps([7, 2.4]), [])
  const shutter = useMemo(() => shutterTexture(), [])
  const sign = useMemo(() => signTexture(), [])
  const glow = useMemo(() => glowTexture(), [])
  const shutterL = useRef<THREE.Group>(null)
  const shutterR = useRef<THREE.Group>(null)

  useFrame(() => {
    const o = open.current ?? 0
    if (shutterL.current) {
      shutterL.current.scale.y = Math.max(0.02, 1 - o)
      shutterL.current.position.y = o * 6.2
    }
    if (shutterR.current) {
      shutterR.current.scale.y = Math.max(0.02, 1 - o)
      shutterR.current.position.y = o * 6.2
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* main wall */}
      <mesh position={[0, 7.5, -14]} receiveShadow>
        <planeGeometry args={[76, 15]} />
        <meshStandardMaterial
          map={corrugated.map}
          normalMap={corrugated.normalMap}
          normalScale={new THREE.Vector2(1.1, 1.1)}
          roughnessMap={corrugated.roughnessMap}
          color="#8b9299"
          metalness={0.55}
          envMapIntensity={0.95}
        />
      </mesh>
      {/* parapet + roof slab */}
      <mesh position={[0, 15.2, -12]} castShadow>
        <boxGeometry args={[76, 1.1, 4.4]} />
        <meshStandardMaterial color="#4c5157" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* corner pilasters */}
      {[-34, -12, 12, 34].map((x) => (
        <mesh key={x} position={[x, 7.5, -13.8]} castShadow>
          <boxGeometry args={[1.2, 15, 0.7]} />
          <meshStandardMaterial color="#565b61" roughness={0.7} metalness={0.35} />
        </mesh>
      ))}

      {/* dock canopies */}
      {[-9, 9].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 8.4, -10.6]} castShadow>
            <boxGeometry args={[11, 0.5, 6.4]} />
            <meshStandardMaterial color="#2f3338" roughness={0.7} metalness={0.4} />
          </mesh>
          {/* doorway recess */}
          <mesh position={[0, 3.1, -13.75]}>
            <planeGeometry args={[6.4, 6.2]} />
            <meshStandardMaterial color="#16181b" roughness={0.95} />
          </mesh>
          {/* shutter drum */}
          <mesh position={[0, 6.35, -13.1]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.34, 0.34, 6.2, 14]} />
            <meshStandardMaterial color="#7a7f86" roughness={0.5} metalness={0.6} />
          </mesh>
          {/* rolling shutter */}
          <group position={[0, 0, -13.05]} ref={x < 0 ? shutterL : shutterR}>
            <mesh position={[0, 3.1, 0]}>
              <planeGeometry args={[6.2, 6.2]} />
              <meshStandardMaterial map={shutter} color="#a7abb1" roughness={0.55} metalness={0.5} />
            </mesh>
          </group>
          {/* frame */}
          {[-3.3, 3.3].map((fx) => (
            <mesh key={fx} position={[fx, 3.1, -12.9]} castShadow>
              <boxGeometry args={[0.34, 6.6, 0.5]} />
              <meshStandardMaterial color="#22262b" roughness={0.6} metalness={0.5} />
            </mesh>
          ))}
          {/* warm light spill */}
          <sprite position={[0, 2.2, -10.4]} scale={[14, 9, 1]}>
            <spriteMaterial map={glow} color="#ffb066" transparent opacity={0.22} depthWrite={false} />
          </sprite>
          {/* dock lamp */}
          <mesh position={[0, 8.0, -9.4]}>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshStandardMaterial color="#ffd9ac" emissive="#ffbe78" emissiveIntensity={4} />
          </mesh>
        </group>
      ))}

      {/* brand sign */}
      <mesh position={[0, 11.3, -13.72]}>
        <planeGeometry args={[24, 6]} />
        <meshStandardMaterial map={sign} roughness={0.55} metalness={0.1} emissive="#ffffff" emissiveMap={sign} emissiveIntensity={0.22} />
      </mesh>
      <pointLight position={[0, 10.6, -11.2]} intensity={26} distance={26} color="#ffcf9e" />

      <WarehouseDetails />

      {/* roof vents */}
      {[-22, -3, 12, 24].map((x) => (
        <mesh key={x} position={[x, 16, -13]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 1.2, 10]} />
          <meshStandardMaterial color="#3c4147" roughness={0.8} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Box truck                                                           */
/* ------------------------------------------------------------------ */

function Wheel({ position, size = 0.52 }: { position: [number, number, number]; size?: number }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[size, size, 0.34, 18]} />
        <meshStandardMaterial color="#15171a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[size * 0.52, size * 0.52, 0.04, 14]} />
        <meshStandardMaterial color="#8d9298" roughness={0.35} metalness={0.85} />
      </mesh>
    </group>
  )
}

export function Truck({
  progress,
  wheelSpin,
  doorOpen,
}: {
  progress: ScrollRef
  wheelSpin: React.RefObject<number>
  doorOpen: React.RefObject<number>
}) {
  const root = useRef<THREE.Group>(null)
  const wheels = useRef<THREE.Group>(null)
  const shutter = useRef<THREE.Group>(null)
  const livery = useMemo(() => signTexture('DEPOZIT', 'SECOND-HAND', 'IMPORT DIRECT · ANGLIA · 20+ ANI'), [])
  const bodyShutter = useMemo(() => shutterTexture(), [])
  const interior = useRef<THREE.PointLight>(null)
  const innerGlow = useRef<THREE.Sprite>(null)

  useFrame((_, dt) => {
    const p = progress.current.p
    // drive-in: comes from the right and parks
    const t = smoothstep(range(p, 0.015, 0.23))
    const g = root.current
    if (g) {
      g.position.x = THREE.MathUtils.lerp(28, 0, t)
      g.position.z = THREE.MathUtils.lerp(6, 0, t)
      g.rotation.y = THREE.MathUtils.lerp(-0.22, 0, t)
      g.position.y = Math.sin(t * 26) * 0.035 * (1 - t)
      g.visible = p < 0.5
    }
    // wheel spin decays after parking
    if (wheels.current) {
      const spin = (wheelSpin.current ?? 0) * dt
      wheels.current.children.forEach((c) => {
        c.rotation.x -= spin
      })
    }
    // rear roll-up door
    const o = doorOpen.current ?? 0
    if (shutter.current) {
      shutter.current.scale.y = Math.max(0.02, 1 - o)
      shutter.current.position.y = -1.41 + o * 2.66
    }
    if (interior.current) interior.current.intensity = 4 + o * 42
    if (innerGlow.current) {
      const m = innerGlow.current.material as THREE.SpriteMaterial
      m.opacity = o * 0.55
    }
  })

  const bodyW = 2.52
  const bodyH = 2.82
  const bodyL = 7.2
  const bodyZ = 4.4 // center
  const floorY = 1.16

  return (
    <group ref={root} position={[0, 0, 0]}>
      {/* chassis */}
      <mesh position={[0, 0.86, 4.3]} castShadow>
        <boxGeometry args={[2.2, 0.32, 8.6]} />
        <meshStandardMaterial color="#22252a" roughness={0.8} metalness={0.4} />
      </mesh>

      {/* cargo body shell */}
      <group position={[0, floorY + bodyH / 2, bodyZ]}>
        {/* floor */}
        <mesh position={[0, -bodyH / 2 + 0.03, 0]} receiveShadow>
          <boxGeometry args={[bodyW, 0.1, bodyL]} />
          <meshStandardMaterial color="#3b3a36" roughness={0.9} />
        </mesh>
        {/* left / right walls */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[(s * bodyW) / 2, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.06, bodyH, bodyL]} />
            <meshStandardMaterial color="#eceef1" roughness={0.42} metalness={0.15} />
          </mesh>
        ))}
        {/* roof */}
        <mesh position={[0, bodyH / 2, 0]} castShadow>
          <boxGeometry args={[bodyW, 0.07, bodyL]} />
          <meshStandardMaterial color="#f2f4f7" roughness={0.5} />
        </mesh>
        {/* front wall */}
        <mesh position={[0, 0, -bodyL / 2]} castShadow>
          <boxGeometry args={[bodyW, bodyH, 0.07]} />
          <meshStandardMaterial color="#e6e8ec" roughness={0.45} />
        </mesh>

        {/* livery on both sides */}
        {[-1, 1].map((s) => (
          <mesh
            key={s}
            position={[(s * (bodyW / 2 + 0.035)) * 1, 0.28, 0.2]}
            rotation={[0, (s * Math.PI) / 2, 0]}
          >
            <planeGeometry args={[5.6, 1.4]} />
            <meshStandardMaterial
              map={livery}
              transparent
              roughness={0.5}
              emissive="#ffffff"
              emissiveMap={livery}
              emissiveIntensity={0.06}
            />
          </mesh>
        ))}

        {/* rear frame */}
        <mesh position={[0, 0, bodyL / 2 + 0.02]}>
          <boxGeometry args={[bodyW, bodyH, 0.08]} />
          <meshStandardMaterial color="#1b1e22" roughness={0.7} metalness={0.3} />
        </mesh>
        {/* rear opening (dark inside) */}
        <mesh position={[0, 0, bodyL / 2 - 0.01]}>
          <planeGeometry args={[bodyW - 0.28, bodyH - 0.3]} />
          <meshStandardMaterial color="#0a0b0c" roughness={1} />
        </mesh>
        {/* rolling shutter (rear) */}
        <group ref={shutter} position={[0, -bodyH / 2, 0]}>
          <mesh position={[0, 1.42, bodyL / 2 + 0.03]}>
            <planeGeometry args={[bodyW - 0.3, 2.66]} />
            <meshStandardMaterial
              map={bodyShutter}
              color="#c2c6cc"
              roughness={0.5}
              metalness={0.55}
            />
          </mesh>
        </group>
        {/* drum above the rear */}
        <mesh position={[0, bodyH / 2 - 0.1, bodyL / 2 + 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.13, bodyW - 0.2, 10]} />
          <meshStandardMaterial color="#8b9097" roughness={0.5} metalness={0.6} />
        </mesh>

        {/* interior warm light + glow */}
        <pointLight ref={interior} position={[0, 0.4, 1.4]} intensity={4} distance={12} color="#ffb877" />
        <sprite ref={innerGlow} position={[0, 0, bodyL / 2 + 0.4]} scale={[3.4, 3.2, 1]}>
          <spriteMaterial map={glowTexture('#ffcf9c')} transparent opacity={0} depthWrite={false} />
        </sprite>

        {/* interior bales visible through the door */}
        <Bales
          specs={[
            { pos: [-0.55, -0.95, 1.7], yaw: 0.02 },
            { pos: [0.62, -0.95, 2.5], yaw: -0.03 },
            { pos: [-0.5, -0.02, 2.2], yaw: 0.04 },
            { pos: [0.55, -0.95, 0.6], yaw: 0.02 },
            { pos: [-0.45, -0.95, -0.6], yaw: -0.02 },
          ]}
          tint="#dfe4ea"
        />
      </group>

      {/* cab */}
      <group position={[0, 0, -0.6]}>
        <mesh position={[0, 2.05, -0.55]} castShadow>
          <boxGeometry args={[2.42, 2.05, 1.9]} />
          <meshStandardMaterial color="#e9ebee" roughness={0.34} metalness={0.35} />
        </mesh>
        {/* windshield + side windows */}
        <mesh position={[0, 2.35, -1.52]} rotation={[0.08, 0, 0]}>
          <planeGeometry args={[2.1, 0.92]} />
          <meshPhysicalMaterial
            color="#0d1418"
            roughness={0.08}
            metalness={0.2}
            clearcoat={1}
            envMapIntensity={1.6}
          />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[(s * 2.43) / 2, 2.3, -0.75]} rotation={[0, (s * Math.PI) / 2, 0]}>
            <planeGeometry args={[1.3, 0.8]} />
            <meshPhysicalMaterial color="#0d1418" roughness={0.1} metalness={0.25} clearcoat={1} />
          </mesh>
        ))}
        {/* grille + bumper */}
        <mesh position={[0, 1.28, -1.56]}>
          <boxGeometry args={[2.36, 0.5, 0.22]} />
          <meshStandardMaterial color="#2a2e33" roughness={0.6} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.92, -1.62]} castShadow>
          <boxGeometry args={[2.42, 0.34, 0.3]} />
          <meshStandardMaterial color="#1c1f23" roughness={0.75} />
        </mesh>
        {/* headlights */}
        {[-0.86, 0.86].map((x) => (
          <mesh key={x} position={[x, 1.5, -1.58]}>
            <boxGeometry args={[0.44, 0.24, 0.1]} />
            <meshStandardMaterial color="#fff6e2" emissive="#ffe9c2" emissiveIntensity={2.4} />
          </mesh>
        ))}
        {/* mirrors */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.35, 2.55, -1.42]}>
            <boxGeometry args={[0.26, 0.4, 0.08]} />
            <meshStandardMaterial color="#23272c" roughness={0.6} />
          </mesh>
        ))}
        {/* cab roof deflector */}
        <mesh position={[0, 3.16, -0.5]} castShadow>
          <boxGeometry args={[2.3, 0.22, 1.7]} />
          <meshStandardMaterial color="#e4e7ea" roughness={0.4} />
        </mesh>
      </group>

      {/* wheels */}
      <group ref={wheels}>
        <Wheel position={[-1.16, 0.58, -0.9]} />
        <Wheel position={[1.16, 0.58, -0.9]} />
        <Wheel position={[-1.16, 0.58, 5.6]} />
        <Wheel position={[1.16, 0.58, 5.6]} />
        <Wheel position={[-1.16, 0.58, 6.8]} />
        <Wheel position={[1.16, 0.58, 6.8]} />
      </group>

      {/* side skirts + tank */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.14, 0.62, 4.4]}>
          <boxGeometry args={[0.06, 0.5, 3.2]} />
          <meshStandardMaterial color="#c9ccd1" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[-1.0, 0.72, 1.9]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.28, 0.28, 1.1, 12]} />
        <meshStandardMaterial color="#9aa0a7" roughness={0.35} metalness={0.8} />
      </mesh>

      {/* rear bumper / underrun bar + lights */}
      <TruckDetails livery={livery} />

      <mesh position={[0, 0.52, 8.15]}>
        <boxGeometry args={[2.4, 0.16, 0.16]} />
        <meshStandardMaterial color="#23262a" roughness={0.7} metalness={0.4} />
      </mesh>
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.98, 8.06]}>
          <boxGeometry args={[0.3, 0.2, 0.08]} />
          <meshStandardMaterial color="#8d1f1f" emissive="#ff2a2a" emissiveIntensity={1.4} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Yard clutter                                                        */
/* ------------------------------------------------------------------ */

export function YardProps() {
  const label = useMemo(() => baleLabelTexture('GRADE 1', 'UK · 48 kg'), [])
  const outside = useMemo(
    () => [
      ...stack([-16, 0, -4.5], 3, 2, 2),
      ...stack([19, 0, -5.5], 2, 2, 3),
      ...stack([22.5, 0, 2], 2, 2, 2),
    ],
    [],
  )
  return (
    <group>
      <YardDetails />
      <Bales specs={outside} />
      {/* pallets */}
      {[-16, 19, 22.5].map((x, i) => (
        <mesh key={i} position={[x + 1.4, 0.07, -4.5 + i * 3]} receiveShadow>
          <boxGeometry args={[2.6, 0.14, 2.2]} />
          <meshStandardMaterial color="#6b563c" roughness={0.9} />
        </mesh>
      ))}
      {/* label on a front bale */}
      <mesh position={[-15.2, 0.5, -3.95]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.5, 0.31]} />
        <meshStandardMaterial map={label} roughness={0.8} />
      </mesh>
      {/* bollards */}
      {[-13.5, -4.5, 4.5, 13.5].map((x) => (
        <mesh key={x} position={[x, 0.55, -0.6]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 1.1, 10]} />
          <meshStandardMaterial color="#d9822b" roughness={0.7} />
        </mesh>
      ))}
      {/* yard lamp posts */}
      {[-24, 24].map((x) => (
        <group key={x} position={[x, 0, 10]}>
          <mesh position={[0, 4.5, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 9, 8]} />
            <meshStandardMaterial color="#4a4e54" roughness={0.7} metalness={0.4} />
          </mesh>
          <mesh position={[0, 9.1, 0]}>
            <boxGeometry args={[0.5, 0.22, 1.4]} />
            <meshStandardMaterial color="#ffe3b8" emissive="#ffcf94" emissiveIntensity={3} />
          </mesh>
          <pointLight position={[0, 8.9, 0]} intensity={38} distance={34} color="#ffcf9c" />
        </group>
      ))}
    </group>
  )
}
