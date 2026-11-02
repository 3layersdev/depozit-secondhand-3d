/**
 * Detail layers. These sit on top of the base masses and are what make the
 * silhouettes read as real objects: ribs, arches, hinges, dock hardware,
 * reflective stripes, marker lights, mud flaps, puddles.
 */
import { useMemo } from 'react'
import * as THREE from 'three'
import { useSurface } from './pbr'
import { signTexture } from './textures'

const rubber = <meshStandardMaterial color="#15171a" roughness={0.92} metalness={0.05} />
const chrome = (
  <meshStandardMaterial color="#c9ced4" roughness={0.24} metalness={0.95} envMapIntensity={1.4} />
)
const paint = (color: string) => (
  <meshPhysicalMaterial
    color={color}
    roughness={0.36}
    metalness={0.28}
    clearcoat={0.7}
    clearcoatRoughness={0.22}
    envMapIntensity={1.1}
  />
)

/* ------------------------------------------------------------------ */
/* Box truck detail                                                    */
/* ------------------------------------------------------------------ */

export function TruckDetails({ livery }: { livery: THREE.Texture }) {
  const ribs = useMemo(() => {
    const out: number[] = []
    const n = 22
    for (let i = 0; i < n; i++) out.push(0.95 + (i / (n - 1)) * 6.9)
    return out
  }, [])
  const wheelsZ = [-0.9, 5.6, 6.8]

  return (
    <group>
      {/* trailer side ribs */}
      {ribs.map((z) => (
        <group key={z}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 1.285, 2.57, z]}>
              <boxGeometry args={[0.035, 2.62, 0.06]} />
              {chrome}
            </mesh>
          ))}
        </group>
      ))}

      {/* roof ribs */}
      {[1.6, 2.9, 4.2, 5.5, 6.8].map((z) => (
        <mesh key={z} position={[0, 3.98, z]}>
          <boxGeometry args={[2.44, 0.035, 0.05]} />
          {chrome}
        </mesh>
      ))}

      {/* wheel arches */}
      {wheelsZ.map((z) =>
        [-1, 1].map((s) => (
          <mesh key={`${z}${s}`} position={[s * 1.3, 0.72, z]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.74, 0.055, 8, 22, Math.PI]} />
            {paint('#e8ebef')}
          </mesh>
        )),
      )}

      {/* mud flaps */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.16, 0.34, 7.42]}>
          <boxGeometry args={[0.46, 0.56, 0.03]} />
          {rubber}
        </mesh>
      ))}

      {/* rear door hardware */}
      {[-1.15, 1.15].map((x) =>
        [1.35, 2.6, 3.85].map((y) => (
          <mesh key={`${x}${y}`} position={[x, y, 8.04]}>
            <boxGeometry args={[0.1, 0.16, 0.1]} />
            {chrome}
          </mesh>
        )),
      )}
      <mesh position={[0, 1.32, 8.06]}>
        <boxGeometry args={[0.52, 0.07, 0.06]} />
        {chrome}
      </mesh>

      {/* rear door livery */}
      <mesh position={[0, 2.95, 7.99]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.06, 1.0]} />
        <meshStandardMaterial map={livery} transparent roughness={0.45} emissive="#ffffff" emissiveMap={livery} emissiveIntensity={0.05} />
      </mesh>

      {/* reflective side stripes */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.3, 1.3, 4.4]} rotation={[0, (s * Math.PI) / 2, 0]}>
          <planeGeometry args={[6.6, 0.11]} />
          <meshStandardMaterial color="#f4f6f8" emissive="#dfe6ee" emissiveIntensity={0.5} roughness={0.3} metalness={0.4} />
        </mesh>
      ))}

      {/* marker lights */}
      {[1.9, 3.4, 4.9, 6.4].map((z) =>
        [-1, 1].map((s) => (
          <mesh key={`${z}${s}`} position={[s * 1.3, 1.52, z]} rotation={[0, (s * Math.PI) / 2, 0]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshStandardMaterial color="#ffb15c" emissive="#ff9d3d" emissiveIntensity={2.2} />
          </mesh>
        )),
      )}
      {[-0.85, -0.28, 0.28, 0.85].map((x) => (
        <mesh key={x} position={[x, 4.0, 8.02]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#ff5252" emissive="#ff2a2a" emissiveIntensity={2.4} />
        </mesh>
      ))}

      {/* number plates */}
      <mesh position={[0, 0.74, 8.14]}>
        <boxGeometry args={[0.52, 0.12, 0.02]} />
        <meshStandardMaterial color="#f2f4f0" emissive="#ffffff" emissiveIntensity={0.35} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.95, -2.2]}>
        <boxGeometry args={[0.52, 0.12, 0.02]} />
        <meshStandardMaterial color="#f2f4f0" emissive="#ffffff" emissiveIntensity={0.35} roughness={0.5} />
      </mesh>

      {/* cab mirrors on arms */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 1.42, 2.62, -2.0]} rotation={[0, 0, s * 0.5]}>
            <cylinderGeometry args={[0.025, 0.025, 0.5, 6]} />
            {chrome}
          </mesh>
          <mesh position={[s * 1.62, 2.62, -2.02]}>
            <boxGeometry args={[0.06, 0.44, 0.26]} />
            {rubber}
          </mesh>
          <mesh position={[s * 1.585, 2.62, -2.02]} rotation={[0, (s * Math.PI) / 2, 0]}>
            <planeGeometry args={[0.22, 0.38]} />
            <meshStandardMaterial color="#2b3742" roughness={0.12} metalness={0.6} envMapIntensity={1.6} />
          </mesh>
        </group>
      ))}

      {/* wipers */}
      {[-0.45, 0.35].map((x) => (
        <mesh key={x} position={[x, 1.98, -2.14]} rotation={[0, 0, 0.28]}>
          <boxGeometry args={[0.5, 0.02, 0.02]} />
          {rubber}
        </mesh>
      ))}

      {/* cab steps + grab handle */}
      {[-1, 1].map((s) =>
        [0.82, 1.18].map((y) => (
          <mesh key={`${s}${y}`} position={[s * 1.2, y, -1.95]}>
            <boxGeometry args={[0.34, 0.07, 0.5]} />
            <meshStandardMaterial color="#2d3136" roughness={0.55} metalness={0.5} />
          </mesh>
        )),
      )}

      {/* exhaust stack behind the cab */}
      <mesh position={[1.06, 1.75, 0.05]}>
        <cylinderGeometry args={[0.07, 0.07, 1.9, 12]} />
        {chrome}
      </mesh>

      {/* tail lift folded under the door */}
      <mesh position={[0, 0.66, 8.42]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[2.16, 0.07, 0.62]} />
        <meshStandardMaterial color="#9aa0a6" roughness={0.4} metalness={0.75} />
      </mesh>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.84, 8.28]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
          {chrome}
        </mesh>
      ))}

      {/* front grille slats */}
      {[1.16, 1.32, 1.48].map((y) => (
        <mesh key={y} position={[0, y, -2.19]}>
          <boxGeometry args={[1.9, 0.06, 0.05]} />
          {chrome}
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Warehouse detail                                                    */
/* ------------------------------------------------------------------ */

export function WarehouseDetails() {
  const metal = useSurface('steel', [3, 3])
  const plate = useMemo(() => signTexture('01', '', 'DOCK'), [])

  return (
    <group>
      {/* gutter + downpipes */}
      <mesh position={[0, 15.35, -13.6]}>
        <boxGeometry args={[76, 0.34, 0.34]} />
        <meshStandardMaterial {...metal} color="#8f959c" roughness={0.45} metalness={0.7} />
      </mesh>
      {[-36.4, 36.4].map((x) => (
        <mesh key={x} position={[x, 7.6, -13.62]}>
          <cylinderGeometry args={[0.13, 0.13, 15.2, 8]} />
          <meshStandardMaterial color="#7c8288" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}

      {/* parapet cap */}
      <mesh position={[0, 15.78, -12.1]}>
        <boxGeometry args={[76.4, 0.16, 0.5]} />
        <meshStandardMaterial color="#5b6068" roughness={0.55} metalness={0.5} />
      </mesh>

      {/* wall lamps */}
      {[-30, -18, 18, 30].map((x) => (
        <group key={x} position={[x, 9.2, -13.4]}>
          <mesh>
            <boxGeometry args={[0.7, 0.16, 0.4]} />
            <meshStandardMaterial color="#33373c" roughness={0.6} metalness={0.5} />
          </mesh>
          <mesh position={[0, -0.14, 0.1]}>
            <boxGeometry args={[0.56, 0.06, 0.26]} />
            <meshStandardMaterial color="#fff0d2" emissive="#ffd39a" emissiveIntensity={3.2} />
          </mesh>
        </group>
      ))}

      {/* dock hardware: seals, bumpers, numbers, guides */}
      {[-9, 9].map((x, i) => (
        <group key={x} position={[x, 0, 0]}>
          {/* rubber seal frame */}
          {[
            { p: [0, 6.4, -13.6], s: [6.9, 0.36, 0.34] as [number, number, number] },
            { p: [-3.42, 3.1, -13.6], s: [0.34, 6.5, 0.34] as [number, number, number] },
            { p: [3.42, 3.1, -13.6], s: [0.34, 6.5, 0.34] as [number, number, number] },
          ].map((b, k) => (
            <mesh key={k} position={b.p as [number, number, number]}>
              <boxGeometry args={b.s} />
              {rubber}
            </mesh>
          ))}
          {/* dock bumpers */}
          {[-2.6, 2.6].map((bx) => (
            <mesh key={bx} position={[bx, 1.35, -13.3]}>
              <boxGeometry args={[0.5, 0.62, 0.36]} />
              <meshStandardMaterial color="#101214" roughness={0.95} />
            </mesh>
          ))}
          {/* leveller lip */}
          <mesh position={[0, 0.82, -12.6]} rotation={[0.06, 0, 0]}>
            <boxGeometry args={[2.4, 0.08, 1.1]} />
            <meshStandardMaterial color="#9ba1a7" roughness={0.35} metalness={0.8} />
          </mesh>
          {/* dock number */}
          <mesh position={[0, 7.15, -13.62]}>
            <planeGeometry args={[1.3, 0.6]} />
            <meshStandardMaterial map={plate} transparent roughness={0.6} emissive="#ffffff" emissiveMap={plate} emissiveIntensity={0.3} />
          </mesh>
          {/* hatched no-parking paint */}
          {Array.from({ length: 7 }).map((_, k) => (
            <mesh
              key={k}
              rotation={[-Math.PI / 2, 0, 0.5]}
              position={[x - 3 + k * 1, 0.02, -4.4]}
            >
              <planeGeometry args={[0.5, 4.6]} />
              <meshStandardMaterial color="#d8b64a" roughness={0.85} transparent opacity={0.5} />
            </mesh>
          ))}
          {i === 1 && null}
        </group>
      ))}

      {/* roof edge vents along the parapet */}
      {[-28, -16, -4, 8, 20, 32].map((x) => (
        <mesh key={x} position={[x, 15.5, -13.2]}>
          <boxGeometry args={[0.9, 0.4, 0.6]} />
          <meshStandardMaterial color="#4a4f56" roughness={0.7} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Yard detail: puddles, pallets, kerbs                                */
/* ------------------------------------------------------------------ */

export function YardDetails() {
  const pallet = useSurface('wood', [1.4, 1.4])
  const puddles = useMemo(
    () => [
      { p: [-6.2, 8.4] as [number, number], s: [3.1, 1.7] as [number, number], r: 0.4 },
      { p: [4.8, 12.6] as [number, number], s: [2.2, 3.4] as [number, number], r: -0.2 },
      { p: [13.5, 5.2] as [number, number], s: [2.6, 1.3] as [number, number], r: 1.1 },
      { p: [-14.8, 14.2] as [number, number], s: [4.2, 2.1] as [number, number], r: 0.15 },
    ],
    [],
  )

  return (
    <group>
      {/* puddles mirror the sky/lamps through the environment map */}
      {puddles.map((w, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, w.r]} position={[w.p[0], 0.014, w.p[1]]}>
          <planeGeometry args={w.s} />
          <meshStandardMaterial
            color="#1a1d20"
            roughness={0.06}
            metalness={0.15}
            envMapIntensity={1.8}
            transparent
            opacity={0.92}
          />
        </mesh>
      ))}

      {/* pallet stacks waiting for collection */}
      {[
        [-19.5, 1.4],
        [15.2, 8.6],
        [-11.5, 15.5],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {[0, 0.16, 0.32, 0.48].map((y, k) => (
            <mesh key={k} position={[0, y + 0.08, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.2, 0.13, 1.0]} />
              <meshStandardMaterial {...pallet} color="#b99a6f" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* kerb strips framing the yard */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 24, 0.09, 14]} receiveShadow>
          <boxGeometry args={[0.4, 0.2, 22]} />
          <meshStandardMaterial color="#8d8d86" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
