import { useMemo } from 'react'
import * as THREE from 'three'
import { useSurface } from './pbr'

/* ---------------------------------------------------------------- */
/* Subansamble camion — fiecare piesa e modelata separat, cu           */
/* dimensiuni reale (benă 2.52 x 2.82 x 7.20, sasiu la 0.74 m).       */
/* ---------------------------------------------------------------- */

/** roata: cauciuc cu umar teșit, janta cu spite, butuc cu prezoane */
export function Wheel({
  position,
  size = 0.52,
  dual = false,
}: {
  position: [number, number, number]
  size?: number
  dual?: boolean
}) {
  const rubber = useMemo(() => new THREE.MeshStandardMaterial({ color: '#14161a', roughness: 0.95, metalness: 0.02 }), [])
  const shoulder = useMemo(() => new THREE.MeshStandardMaterial({ color: '#101215', roughness: 0.92 }), [])
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9aa0a6', roughness: 0.36, metalness: 0.92 }), [])
  const darkSteel = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4c5157', roughness: 0.5, metalness: 0.8 }), [])
  const bolts = useMemo(() => Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2), [])

  const halfW = dual ? 0.23 : 0.17

  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <group name="roll">
        {/* banda de rulare */}
        <mesh castShadow material={rubber}>
          <cylinderGeometry args={[size, size, halfW * 2 - 0.02, 30, 1]} />
        </mesh>
        {/* umerii cauciucului, teșit spre lateral */}
        {[-1, 1].map((s) => (
          <mesh key={s} material={shoulder} position={[0, s * (halfW - 0.02), 0]}>
            <cylinderGeometry args={[size * 0.985, size * 0.86, 0.05, 30, 1]} />
          </mesh>
        ))}
        {/* canalele din talon */}
        {[-1, 1].map((s) => (
          <mesh key={`g${s}`} material={shoulder} position={[0, s * halfW, 0]}>
            <torusGeometry args={[size * 0.72, 0.028, 6, 24]} />
          </mesh>
        ))}
        {/* janta si discul */}
        <mesh material={steel} position={[0, halfW * (dual ? 0.55 : 0.7), 0]}>
          <cylinderGeometry args={[size * 0.58, size * 0.58, 0.09, 24, 1]} />
        </mesh>
        <mesh material={darkSteel} position={[0, halfW * (dual ? 0.5 : 0.64), 0]}>
          <cylinderGeometry args={[size * 0.5, size * 0.5, 0.11, 24, 1]} />
        </mesh>
        {/* butuc + prezoane */}
        <mesh material={steel} position={[0, halfW * (dual ? 0.66 : 0.78), 0]}>
          <cylinderGeometry args={[size * 0.2, size * 0.22, 0.13, 16, 1]} />
        </mesh>
        {bolts.map((a, i) => (
          <mesh
            key={i}
            material={darkSteel}
            position={[Math.cos(a) * size * 0.34, halfW * (dual ? 0.62 : 0.75), Math.sin(a) * size * 0.34]}
          >
            <cylinderGeometry args={[0.021, 0.021, 0.05, 6, 1]} />
          </mesh>
        ))}
        {/* tambur de frână, vizibil prin jantă */}
        <mesh material={darkSteel} position={[0, -halfW * 0.4, 0]}>
          <cylinderGeometry args={[size * 0.46, size * 0.46, 0.1, 18, 1]} />
        </mesh>
      </group>
    </group>
  )
}

/** sasiu: lonjeroane, traverse, punti, rezervor, cutie de baterii, bara spate */
export function Chassis() {
  const steel = useSurface('chassis', [7, 2.4])
  const metal = useSurface('steel', [2, 2])

  const rails: [number, number][] = [
    [-0.78, 0.95],
    [0.78, 0.95],
  ]
  const cross = useMemo(() => [-1.1, 0.05, 1.2, 2.5, 3.7, 4.9, 6.3, 7.6, 8.5], [])
  const axles: [number, number][] = [
    [-0.9, 0.58],
    [5.6, 0.58],
    [6.8, 0.58],
  ]

  return (
    <group name="chassis">
      {/* lonjeroane */}
      {rails.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 3.7]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.3, 9.7]} />
          <meshStandardMaterial
            map={steel.map}
            normalMap={steel.normalMap}
            roughnessMap={steel.roughnessMap}
            color="#5f646a"
            roughness={0.82}
            metalness={0.45}
          />
        </mesh>
      ))}
      {/* traverse */}
      {cross.map((z, i) => (
        <mesh key={i} position={[0, 1.02, z]} castShadow>
          <boxGeometry args={[1.52, 0.13, 0.11]} />
          <meshStandardMaterial color="#4a4f55" roughness={0.8} metalness={0.5} />
        </mesh>
      ))}
      {/* punti fata + spate, cu diferențial */}
      {axles.map(([z, y], i) => (
        <group key={i}>
          <mesh position={[0, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.085, 0.085, 2.1, 12, 1]} />
            <meshStandardMaterial color="#3f444a" roughness={0.85} metalness={0.4} />
          </mesh>
          {i > 0 && (
            <mesh position={[0.34, y, z]} castShadow>
              <sphereGeometry args={[0.24, 14, 10]} />
              <meshStandardMaterial color="#3a3f45" roughness={0.88} metalness={0.35} />
            </mesh>
          )}
        </group>
      ))}
      {/* rezervor */}
      <mesh position={[0.98, 0.68, 2.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.3, 18, 1]} />
        <meshStandardMaterial
          map={metal.map}
          normalMap={metal.normalMap}
          roughnessMap={metal.roughnessMap}
          color="#b9bec4"
          roughness={0.34}
          metalness={0.9}
        />
      </mesh>
      {/* cutie baterii + scară laterală */}
      <mesh position={[-0.98, 0.68, 2.4]} castShadow>
        <boxGeometry args={[0.42, 0.4, 0.72]} />
        <meshStandardMaterial color="#2b3036" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* aparatori de noroi, peste fiecare roata spate */}
      {[5.6, 6.8].map((z, i) => (
        <group key={i}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 1.02, 1.02, z]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.66, 0.045, 6, 18, Math.PI]} />
              <meshStandardMaterial color="#1d2126" roughness={0.85} metalness={0.2} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
      {/* bara spate anti-incastrare */}
      <mesh position={[0, 0.52, 8.62]} castShadow>
        <boxGeometry args={[2.06, 0.11, 0.1]} />
        <meshStandardMaterial color="#c8402c" roughness={0.55} metalness={0.35} />
      </mesh>
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.72, 8.58]} castShadow>
          <boxGeometry args={[0.08, 0.34, 0.08]} />
          <meshStandardMaterial color="#8f2c1e" roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

/** cabina: profil extrudat (parbriz rabatat, plafon cu boltă), grilă, faruri,
 *  oglinzi pe braț, trepte, ștergătoare și linia ușii */
export function Cab({ position = [0, 0, -0.6] as [number, number, number] }) {
  const paint = useSurface('steel', [2.4, 1.2])
  const skin = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-1.0, 1.0)
    s.lineTo(-0.99, 2.0)
    s.lineTo(-0.72, 2.86) // parbriz rabatat
    s.lineTo(0.48, 2.97) // plafon cu boltă
    s.lineTo(0.9, 2.78)
    s.lineTo(0.95, 1.0)
    s.closePath()
    return s
  }, [])
  const shell = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(skin, {
      depth: 2.16,
      bevelEnabled: true,
      bevelSize: 0.05,
      bevelThickness: 0.05,
      bevelSegments: 2,
      curveSegments: 4,
    })
    g.rotateY(-Math.PI / 2)
    g.translate(1.08, 0, 0)
    return g
  }, [skin])

  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#0e161b',
        roughness: 0.06,
        metalness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.7,
      }),
    [],
  )
  const chrome = useMemo(() => new THREE.MeshStandardMaterial({ color: '#b9bfc6', roughness: 0.28, metalness: 0.95 }), [])
  const trim = useMemo(() => new THREE.MeshStandardMaterial({ color: '#23272b', roughness: 0.62, metalness: 0.3 }), [])
  const lamp = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#fff8ea', emissive: '#ffe6bd', emissiveIntensity: 2.6, roughness: 0.2 }),
    [],
  )

  return (
    <group position={position} name="cab">
      {/* corpul cabinei */}
      <mesh geometry={shell} castShadow receiveShadow>
        <meshStandardMaterial
          map={paint.map}
          normalMap={paint.normalMap}
          roughnessMap={paint.roughnessMap}
          color="#eceef1"
          roughness={0.33}
          metalness={0.34}
          envMapIntensity={1.15}
        />
      </mesh>

      {/* parbriz, pe planul rabatat */}
      <mesh position={[0, 2.44, -0.86]} rotation={[Math.atan2(0.14, 1.2), 0, 0]} material={glass}>
        <planeGeometry args={[2.02, 0.94]} />
      </mesh>
      {/* geamurile laterale + geamul din spate */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 1.085, 2.36, -0.12]} rotation={[0, (s * Math.PI) / 2, 0]} material={glass}>
            <planeGeometry args={[1.15, 0.78]} />
          </mesh>
          <mesh position={[s * 1.085, 2.36, 0.74]} rotation={[0, (s * Math.PI) / 2, 0]} material={glass}>
            <planeGeometry args={[0.42, 0.7]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 2.36, 0.85]} material={glass}>
        <planeGeometry args={[1.5, 0.62]} />
      </mesh>

      {/* rama parbrizului + stergatoare */}
      <mesh position={[0, 1.96, -1.0]} rotation={[Math.atan2(0.14, 1.2), 0, 0]} material={trim}>
        <boxGeometry args={[2.1, 0.07, 0.06]} />
      </mesh>
      {[-0.5, 0.34].map((x, i) => (
        <mesh key={i} position={[x, 2.0, -0.98]} rotation={[0.18, 0, i ? -0.32 : -0.18]} material={trim}>
          <boxGeometry args={[0.78, 0.03, 0.03]} />
        </mesh>
      ))}

      {/* grila frontala, cu lame orizontale */}
      <mesh position={[0, 1.62, -1.03]} material={trim}>
        <boxGeometry args={[1.94, 0.52, 0.08]} />
      </mesh>
      {[1.46, 1.58, 1.7, 1.82].map((y, i) => (
        <mesh key={i} position={[0, y, -1.07]} material={chrome}>
          <boxGeometry args={[1.82, 0.045, 0.05]} />
        </mesh>
      ))}
      {/* emblema */}
      <mesh position={[0, 1.66, -1.12]} material={chrome}>
        <cylinderGeometry args={[0.11, 0.11, 0.04, 18, 1]} />
      </mesh>

      {/* faruri: carcasă, lentilă, semnalizare */}
      {[-0.74, 0.74].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.9, -1.04]} material={trim}>
            <boxGeometry args={[0.6, 0.3, 0.1]} />
          </mesh>
          <mesh position={[x, 1.9, -1.1]} material={lamp}>
            <boxGeometry args={[0.5, 0.2, 0.04]} />
          </mesh>
          <mesh position={[x, 1.72, -1.08]} material={lamp}>
            <boxGeometry args={[0.44, 0.05, 0.03]} />
          </mesh>
        </group>
      ))}

      {/* bara frontala cu placa si proiectoare */}
      <mesh position={[0, 1.12, -1.06]} castShadow material={trim}>
        <boxGeometry args={[2.2, 0.34, 0.2]} />
      </mesh>
      <mesh position={[0, 1.05, -1.17]} material={chrome}>
        <boxGeometry args={[0.52, 0.13, 0.02]} />
      </mesh>
      {[-0.62, 0.62].map((x) => (
        <mesh key={x} position={[x, 1.1, -1.17]} material={lamp}>
          <cylinderGeometry args={[0.075, 0.075, 0.04, 14, 1]} />
        </mesh>
      ))}

      {/* oglinzi pe brat, cu oglinda mare de unghi mort */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 1.24, 2.5, -0.98]} rotation={[0, 0, Math.PI / 2]} material={trim}>
            <cylinderGeometry args={[0.025, 0.025, 0.34, 8, 1]} />
          </mesh>
          <mesh position={[s * 1.42, 2.44, -0.96]} material={trim}>
            <boxGeometry args={[0.08, 0.52, 0.2]} />
          </mesh>
          <mesh position={[s * 1.47, 2.44, -0.96]} material={chrome}>
            <boxGeometry args={[0.02, 0.44, 0.14]} />
          </mesh>
          <mesh position={[s * 1.4, 2.1, -0.96]} material={trim}>
            <boxGeometry args={[0.07, 0.18, 0.14]} />
          </mesh>
        </group>
      ))}

      {/* linia usii, maner, trepte */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 1.086, 1.85, 0.32]} rotation={[0, (s * Math.PI) / 2, 0]} material={trim}>
            <boxGeometry args={[0.02, 1.62, 0.03]} />
          </mesh>
          <mesh position={[s * 1.1, 1.78, 0.1]} rotation={[0, (s * Math.PI) / 2, 0]} material={chrome}>
            <boxGeometry args={[0.2, 0.05, 0.05]} />
          </mesh>
          <mesh position={[s * 0.9, 0.72, -0.42]} material={trim}>
            <boxGeometry args={[0.5, 0.07, 0.26]} />
          </mesh>
          <mesh position={[s * 0.9, 0.98, -0.42]} material={trim}>
            <boxGeometry args={[0.44, 0.06, 0.22]} />
          </mesh>
          {/* aparatoare de noroi in spatele rotii fata */}
          <mesh position={[s * 1.12, 0.4, -0.28]} material={trim}>
            <boxGeometry args={[0.06, 0.5, 0.34]} />
          </mesh>
        </group>
      ))}

      {/* deflector de plafon, peste cabina */}
      <mesh position={[0, 3.04, 0.34]} rotation={[-0.22, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 0.1, 0.9]} />
        <meshStandardMaterial color="#e6e9ec" roughness={0.38} metalness={0.3} />
      </mesh>
      {/* lumini de gabarit pe plafon */}
      {[-0.7, 0, 0.7].map((x) => (
        <mesh key={x} position={[x, 2.99, -0.62]} material={lamp}>
          <boxGeometry args={[0.12, 0.04, 0.06]} />
        </mesh>
      ))}
    </group>
  )
}
