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
