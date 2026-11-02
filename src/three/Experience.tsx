import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
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

const DARK = new THREE.Color('#241610')

function Rig({ progress }: { progress: ScrollRef }) {
  const { camera, size } = useThree()
  const smooth = useRef(0)
  const pos = useMemo(() => new THREE.Vector3(), [])
  const tgt = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  const par = useRef({ x: 0, y: 0 })

  useFrame((state, dt) => {
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

    // tall screens: pull the camera back along the view axis so the truck and
    // the shed stay inside the narrower horizontal field of view
    const aspect = size.width / size.height
    const portrait = aspect < 1
    if (portrait) {
      const pull = THREE.MathUtils.clamp(1.18 / aspect, 1, 2) * 0.92
      pos.sub(tgt).multiplyScalar(pull).add(tgt)
      tgt.y -= 0.35
    }

    // hand-held feel: the view drifts a couple of centimetres with the pointer,
    // critically damped so it never snaps
    const px = state.pointer.x
    const py = state.pointer.y
    par.current.x = damp(par.current.x, px, 2.6, Math.min(dt, 0.05))
    par.current.y = damp(par.current.y, py, 2.6, Math.min(dt, 0.05))
    pos.x += par.current.x * 0.42
    pos.y += par.current.y * 0.26

    camera.position.lerp(pos, 0.65)
    look.lerp(tgt, 0.5)
    camera.lookAt(look)

    const cam = camera as THREE.PerspectiveCamera
    const targetFov = portrait ? 64 : 48
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
  const extFog = useMemo(() => new THREE.FogExp2('#e0b489', 0.0048), [])
  const intFog = useMemo(() => new THREE.FogExp2('#241610', 0.03), [])

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
    scene.environmentIntensity = inside ? 0.34 : 0.7
  })

  return null
}

function ExteriorLights({ progress }: { progress: ScrollRef }) {
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const fill = useRef<THREE.PointLight>(null)

  useFrame(() => {
    const p = progress.current.p
    if (sun.current) sun.current.intensity = 3.3 * (1 - smoothstep(range(p, 0.3, 0.5)))
    if (hemi.current) hemi.current.intensity = 0.55 * (1 - smoothstep(range(p, 0.35, 0.5)))
    if (fill.current) fill.current.intensity = 12 + 26 * smoothstep(range(p, 0.28, 0.46))
  })

  return (
    <group>
      <hemisphereLight ref={hemi} args={['#f3cfa6', '#5c4430', 0.72]} />
      <directionalLight
        ref={sun}
        position={[34, 26, 22]}
        intensity={3.3}
        color="#ffdcae"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.0006}
      />
      {/* cool rim from behind: separates the truck from the dark facade */}
      <directionalLight position={[-26, 14, -18]} intensity={0.95} color="#ffb877" />
      {/* warm bounce from the open dock */}
      <pointLight ref={fill} position={[0, 2.4, 10]} intensity={12} distance={26} color="#ffb877" />
      <ambientLight intensity={0.34} color="#ffdcb8" />
    </group>
  )
}

function Grade() {
  const { size } = useThree()
  // bloom is the expensive pass; skip it on phones where the GPU budget is thin
  if (size.width < 760) return null
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom
        intensity={0.42}
        luminanceThreshold={0.84}
        luminanceSmoothing={0.28}
        mipmapBlur
        radius={0.72}
      />
      <Vignette offset={0.28} darkness={0.72} eskil={false} />
    </EffectComposer>
  )
}

export function Experience({ progress }: { progress: ScrollRef }) {
  const ext = useRef<THREE.Group>(null)
  const doorOpen = useRef(0)
  const whOpen = useRef(0)

  useFrame(() => {
    const p = progress.current.p
    if (ext.current) ext.current.visible = p < SCENE_CUT + 0.002
    // the tail gate follows the copy: it opens on the "ușa" chapter; the depot
    // bays stay cracked open so warm light leaks into the yard
    doorOpen.current = smoothstep(range(p, 0.3, 0.46))
    whOpen.current = smoothstep(range(p, 0.05, 0.2)) * 0.3
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
        <Truck progress={progress} doorOpen={doorOpen} />
      </group>
      <Interior progress={progress} />
      <Grade />
    </>
  )
}
