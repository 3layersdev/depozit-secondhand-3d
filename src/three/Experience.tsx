import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Yard, Warehouse, Truck, YardProps } from './Exterior'
import { Interior } from './Interior'
import { skyEquirect } from './textures'
import {
  EXT_CAM,
  EXT_TGT,
  INT_CAM,
  INT_TGT,
  SCENE_CUT,
  damp,
  range,
  sampleVec3,
  smoothstep,
  type ScrollRef,
} from './sequence'

const DARK = new THREE.Color('#06070a')

function Rig({ progress }: { progress: ScrollRef }) {
  const { camera, size } = useThree()
  const smooth = useRef(0)
  const pos = useMemo(() => new THREE.Vector3(), [])
  const tgt = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dt) => {
    const p = progress.current.p
    smooth.current = damp(smooth.current, p, p < 0.02 ? 18 : 7, Math.min(dt, 0.05))
    const s = smooth.current

    if (s < SCENE_CUT) {
      sampleVec3(EXT_CAM, s, pos)
      sampleVec3(EXT_TGT, s, tgt)
    } else {
      sampleVec3(INT_CAM, s, pos)
      sampleVec3(INT_TGT, s, tgt)
    }

    // portrait screens: pull back a touch so the composition still reads
    const portrait = size.height > size.width
    if (portrait) {
      pos.x *= 0.72
      pos.y += 0.35
    }

    camera.position.lerp(pos, 0.65)
    look.lerp(tgt, 0.5)
    camera.lookAt(look)

    const cam = camera as THREE.PerspectiveCamera
    const targetFov = portrait ? 62 : 48
    if (Math.abs(cam.fov - targetFov) > 0.01) {
      cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov, 0.1)
      cam.updateProjectionMatrix()
    }
  })

  return null
}

function Atmosphere({ progress }: { progress: ScrollRef }) {
  const { gl, scene } = useThree()
  const sky = useMemo(() => skyEquirect(), [])
  const extFog = useMemo(() => new THREE.FogExp2('#8d97a3', 0.0072), [])
  const intFog = useMemo(() => new THREE.FogExp2('#08090c', 0.03), [])

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const rt = pmrem.fromEquirectangular(sky)
    scene.environment = rt.texture
    scene.environmentIntensity = 0.55
    return () => {
      rt.dispose()
      pmrem.dispose()
    }
  }, [gl, scene, sky])

  useFrame(() => {
    const inside = progress.current.p >= SCENE_CUT
    scene.fog = inside ? intFog : extFog
    scene.background = inside ? DARK : sky
    scene.environmentIntensity = inside ? 0.32 : 0.6
  })

  return null
}

function ExteriorLights({ progress }: { progress: ScrollRef }) {
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const fill = useRef<THREE.PointLight>(null)

  useFrame(() => {
    const p = progress.current.p
    if (sun.current) sun.current.intensity = 2.4 * (1 - smoothstep(range(p, 0.3, 0.5)))
    if (hemi.current) hemi.current.intensity = 0.55 * (1 - smoothstep(range(p, 0.35, 0.5)))
    if (fill.current) fill.current.intensity = 12 + 26 * smoothstep(range(p, 0.28, 0.46))
  })

  return (
    <group>
      <hemisphereLight ref={hemi} args={['#b9c6d4', '#3b3a36', 0.55]} />
      <directionalLight
        ref={sun}
        position={[34, 26, 22]}
        intensity={2.4}
        color="#ffe6c4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.0006}
      />
      {/* warm bounce from the open dock */}
      <pointLight ref={fill} position={[0, 2.4, 10]} intensity={12} distance={26} color="#ffb877" />
      <ambientLight intensity={0.18} />
    </group>
  )
}

export function Experience({ progress }: { progress: ScrollRef }) {
  const ext = useRef<THREE.Group>(null)
  const wheelSpin = useRef(6)
  const doorOpen = useRef(0)
  const whOpen = useRef(0)

  useFrame((_, dt) => {
    const p = progress.current.p
    if (ext.current) ext.current.visible = p < SCENE_CUT + 0.002
    // shutter choreography
    doorOpen.current = smoothstep(range(p, 0.315, 0.455))
    whOpen.current = smoothstep(range(p, 0.05, 0.2)) * 0.28
    // wheels stop once parked
    const parked = smoothstep(range(p, 0.2, 0.26))
    wheelSpin.current = THREE.MathUtils.lerp(wheelSpin.current, parked > 0.9 ? 0 : 5.5, 1 - Math.exp(-4 * Math.min(dt, 0.05)))
  })

  return (
    <>
      <Atmosphere progress={progress} />
      <Rig progress={progress} />
      <ExteriorLights progress={progress} />
      <group ref={ext}>
        <Yard />
        <Warehouse open={whOpen} />
        <YardProps />
        <Truck progress={progress} wheelSpin={wheelSpin} doorOpen={doorOpen} />
      </group>
      <Interior progress={progress} />
    </>
  )
}
