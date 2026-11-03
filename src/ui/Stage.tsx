import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from '../three/Experience'
import type { ScrollRef } from '../three/sequence'

/**
 * Scena 3D, izolată într-un chunk propriu: three, postprocessing și texturile
 * PBR nu mai stau în calea primei randări a textului și a butoanelor.
 */
export default function Stage({ progress }: { progress: ScrollRef }) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, window.innerWidth < 900 ? 1.5 : 1.8]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [27, 12, 54], fov: 48, near: 0.1, far: 420 }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.05
      }}
    >
      <Suspense fallback={null}>
        <Experience progress={progress} />
      </Suspense>
    </Canvas>
  )
}
