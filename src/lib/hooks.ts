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

/**
 * Section snapping: one gesture = one chapter.
 *
 * The page is a film strip, so a wheel notch, an arrow key or a swipe moves the
 * reader exactly one chapter and lands it centred in the viewport. The travel
 * is animated on rAF with an ease-in-out curve (no scroll jank, no fighting the
 * browser).
 * Off for `?qa=1`, `?clean=1` and for `prefers-reduced-motion`.
 */
export function useScrollSnap() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('qa') || params.has('clean')) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let stops: number[] = []
    let animating = false
    let raf = 0
    let releasedAt = 0

    const measure = () => {
      const limit = Math.max(0, Math.round(document.documentElement.scrollHeight - window.innerHeight))
      const list: number[] = []
      // every chapter parks its own card dead centre on screen
      document.querySelectorAll<HTMLElement>('.panel').forEach((panel) => {
        const card = panel.querySelector<HTMLElement>('.reveal') ?? panel
        const r = card.getBoundingClientRect()
        const centre = r.top + window.scrollY + r.height / 2
        list.push(Math.round(Math.min(limit, Math.max(0, centre - window.innerHeight / 2))))
      })
      list.push(limit)
      const sorted = [...new Set(list)].sort((a, b) => a - b)
      const out: number[] = []
      sorted.forEach((n) => {
        // near-identical stops at the very ends would cost a second, pointless notch
        if (!out.length || n - out[out.length - 1] > 24) out.push(n)
      })
      if (out[out.length - 1] !== sorted[sorted.length - 1]) out.push(sorted[sorted.length - 1])
      stops = out
    }

    const animateTo = (to: number) => {
      const from = window.scrollY
      const dist = to - from
      if (Math.abs(dist) < 2) return
      const dur = Math.min(1250, 540 + Math.abs(dist) * 0.4)
      const t0 = performance.now()
      animating = true
      cancelAnimationFrame(raf)
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur)
        const e = k < 0.5 ? 16 * k ** 5 : 1 - Math.pow(-2 * k + 2, 5) / 2
        // 'instant' is essential: a smooth behaviour here would restart the
        // CSS-driven animation every frame and cancel the tween
        window.scrollTo({ top: Math.round(from + dist * e), behavior: 'instant' as ScrollBehavior })
        if (k < 1) raf = requestAnimationFrame(step)
        else {
          animating = false
          releasedAt = performance.now()
        }
      }
      raf = requestAnimationFrame(step)
    }

    const next = (dir: number) => {
      measure()
      const y = window.scrollY
      const edge = 8
      const target =
        dir > 0
          ? stops.find((t) => t > y + edge) ?? stops[stops.length - 1]
          : [...stops].reverse().find((t) => t < y - edge) ?? 0
      animateTo(target)
    }

    const blocked = (el: EventTarget | null) =>
      !!(el as HTMLElement | null)?.closest?.('.lightbox, .rail, .header__nav')

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || blocked(e.target)) return
      if (Math.abs(e.deltaY) < 1) return
      e.preventDefault()
      if (animating) return
      // trackpads keep firing after the fingers lift; that tail must not
      // trigger a second chapter
      if (performance.now() - releasedAt < 420) return
      next(e.deltaY > 0 ? 1 : -1)
    }

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || blocked(e.target)) return
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        if (!animating) next(1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        if (!animating) next(-1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        animateTo(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        measure()
        animateTo(stops[stops.length - 1])
      }
    }

    // touch: let the browser scroll natively, then settle on the closest chapter
    let settle = 0
    const onTouchEnd = () => {
      window.clearTimeout(settle)
      settle = window.setTimeout(() => {
        if (animating) return
        measure()
        const y = window.scrollY
        const near = stops.reduce((a, c) => (Math.abs(c - y) < Math.abs(a - y) ? c : a), stops[0])
        if (Math.abs(near - y) > 12) animateTo(near)
      }, 220)
    }

    measure()
    // gallery images settle after mount and change card heights, so the stop
    // list has to follow the layout instead of trusting the first measurement
    const ro = new ResizeObserver(() => measure())
    ro.observe(document.body)
    window.addEventListener('load', measure)
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.clearTimeout(settle)
      ro.disconnect()
      window.removeEventListener('load', measure)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])
}
