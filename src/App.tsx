import { Component, Suspense, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import { Experience } from './three/Experience'
import { SCENE_CUT } from './three/sequence'
import { useScrollProgress, useScrollSnap } from './lib/hooks'
import { asset } from './lib/asset'
import {
  ContactSection,
  DoorSection,
  Footer,
  GallerySection,
  Header,
  HeroSection,
  Lightbox,
  QualitySection,
  Rail,
  ServicesSection,
  TruckSection,
} from './ui/Overlay'

/**
 * If the GPU/driver refuses a WebGL context after the feature check passed,
 * R3F throws while mounting. Without a boundary React would unmount the whole
 * page (black screen), so we catch it and swap in the photographic stage.
 */
class StageBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onFail()
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function Loader({ ready, disabled = false }: { ready: boolean; disabled?: boolean }) {
  const { progress, active } = useProgress()
  const [minTimePassed, setMinTimePassed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), 900)
    return () => clearTimeout(t)
  }, [])

  const done = disabled || (ready && !active && progress >= 100 && minTimePassed)
  const pct = Math.round(Math.min(100, progress))

  return (
    <div className={`loader ${done ? 'is-hidden' : ''}`} aria-hidden={done}>
      <div className="loader__inner">
        <div className="loader__mark">DEPOZIT SECOND-HAND · BUCUREȘTI</div>
        <div className="loader__sub">Se deschide oblonul</div>
        <div className="loader__track">
          <div className="loader__fill" style={{ width: `${Math.max(6, pct)}%` }} />
        </div>
        <div className="loader__pct">{pct}%</div>
      </div>
    </div>
  )
}

/**
 * WebGL is required for the 3D stage. Without it we keep the page fully usable:
 * the HTML content becomes the site, over a photographic backdrop.
 */
function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

export default function App() {
  const { progressRef, progress } = useScrollProgress()
  useScrollSnap()
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  const [hasWebGL] = useState(() => (typeof window === 'undefined' ? true : supportsWebGL()))
  const [glFailed, setGlFailed] = useState(false)
  const showStage = hasWebGL && !glFailed

  // reveal HTML panels as they enter the viewport
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.target.classList.toggle('is-visible', e.isIntersecting))
      },
      { rootMargin: '-14% 0px -14% 0px', threshold: 0.08 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // give the first frame a moment, then drop the loader
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1200)
    return () => clearTimeout(t)
  }, [])

  // ?clean=1 strips the editorial layer so the render can be reviewed on its own
  const clean = new URLSearchParams(window.location.search).has('clean')

  const distance = Math.abs(progress - SCENE_CUT)
  const flash = Math.max(0, 1 - distance / 0.018)

  return (
    <div className={`app ${clean ? 'app--clean' : ''}`} style={{ ["--fallback-image" as string]: `url(${asset('media/01-warehouse.jpg')})` } as CSSProperties}>
      <div className={`stage ${showStage ? '' : 'stage--fallback'}`}>
        {hasWebGL ? (
          <StageBoundary
            onFail={() => setGlFailed(true)}
            fallback={<div className="fallback__poster" role="img" aria-label="Depozit de haine second-hand" />}
          >
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
              <Experience progress={progressRef} />
            </Suspense>
          </Canvas>
          </StageBoundary>
        ) : (
          <div className="fallback__poster" role="img" aria-label="Depozit de haine second-hand" />
        )}
      </div>

      <div className="veil" />
      <div className="flash" style={{ opacity: flash }} />

      <Header />
      <Rail progress={progress} />

      <main className="track">
        <HeroSection />
        <TruckSection />
        <DoorSection />
        <ServicesSection />
        <QualitySection />
        <GallerySection onOpen={setLightbox} />
        <ContactSection />
        <Footer />
      </main>

      <Loader ready={ready} disabled={!showStage} />
      <Lightbox index={lightbox} onClose={() => setLightbox(null)} />
    </div>
  )
}
