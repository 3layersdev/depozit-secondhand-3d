import { useEffect, useRef, useState } from 'react'

/**
 * Beat map: each HTML section owns a slice of the 3D timeline.
 * Keeping the mapping explicit (instead of a raw scroll ratio) means the
 * camera choreography stays aligned with the copy even when panels grow
 * taller on small screens.
 */
export const BEATS: [number, number][] = [
  [0.0, 0.16], // hero
  [0.16, 0.32], // truck arrives
  [0.32, 0.484], // door opens
  [0.484, 0.64], // services
  [0.64, 0.77], // quality
  [0.77, 0.9], // gallery
  [0.9, 1.0], // contact
]

export function useScrollProgress() {
  const ref = useRef<{ p: number }>({ p: 0 })
  const [quantized, setQuantized] = useState(0)

  useEffect(() => {
    let raf = 0
    let sections: HTMLElement[] = []
    let tops: number[] = []
    let docEnd = 0

    const measure = () => {
      sections = Array.from(document.querySelectorAll<HTMLElement>('.panel'))
      const scrollY = window.scrollY
      tops = sections.map((el) => el.getBoundingClientRect().top + scrollY)
      docEnd = document.documentElement.scrollHeight - window.innerHeight
    }

    const compute = () => {
      if (!sections.length) measure()
      const y = window.scrollY
      let p = 0
      if (sections.length) {
        const i = Math.min(
          sections.length - 1,
          Math.max(0, tops.findIndex((_top, idx) => y < (tops[idx + 1] ?? docEnd + 1))),
        )
        const start = tops[i]
        const end = (tops[i + 1] ?? docEnd + 1) - 1
        const [a, b] = BEATS[i] ?? [0, 1]
        const t = end > start ? Math.min(1, Math.max(0, (y - start) / (end - start))) : 0
        p = a + (b - a) * t
      }
      const clamped = Math.min(1, Math.max(0, p))
      ref.current.p = clamped
      if (import.meta.env.DEV || window.location.search.includes('qa')) {
        document.documentElement.dataset.p = clamped.toFixed(4)
      }
      setQuantized((prev) => (Math.abs(prev - p) > 0.004 ? p : prev))
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(compute)
    }

    const onResize = () => {
      measure()
      onScroll()
    }

    measure()
    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  return { progressRef: ref, progress: quantized }
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}
