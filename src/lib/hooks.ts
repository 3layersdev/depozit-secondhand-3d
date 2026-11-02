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
      // the page's own smooth scrolling would re-animate every frame we set,
      // so the tween switches it off for its duration
      document.documentElement.classList.add('is-snapping')
      cancelAnimationFrame(raf)
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / dur)
        const e = k < 0.5 ? 16 * k ** 5 : 1 - Math.pow(-2 * k + 2, 5) / 2
        window.scrollTo(0, Math.round(from + dist * e))
        if (k < 1) raf = requestAnimationFrame(step)
        else {
          window.scrollTo(0, Math.round(to))
          animating = false
          releasedAt = performance.now()
          document.documentElement.classList.remove('is-snapping')
        }
      }
      raf = requestAnimationFrame(step)
    }

    // a stop sitting just under the current position (a card centred on its own
    // chapter) is not a destination: a notch has to cross to the next chapter
    const reach = () => Math.min(280, Math.round(window.innerHeight * 0.26))

    const next = (dir: number) => {
      measure()
      const y = window.scrollY
      const edge = reach()
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

    // touch: the finger decides the direction, the page decides the distance.
    // Momentum is allowed to run natively, then we glide to the chapter that
    // sits one notch from where the swipe STARTED — so a flick always advances
    // exactly one chapter instead of bouncing back to the nearest card.
    let settle = 0
    let fingerDy = 0
    let touchStartY = 0
    let touchStartX = 0
    let touchStartScroll = 0
    const onTouchStart = (e: TouchEvent) => {
      if (blocked(e.target)) return
      const t = e.touches[0]
      if (!t) return
      touchStartY = t.clientY
      touchStartX = t.clientX
      touchStartScroll = window.scrollY
      // the finger's own travel is the reliable signal: the browser applies
      // native momentum asynchronously, so scrollY can still read zero at
      // touchend even after a clear swipe
      fingerDy = 0
      window.clearTimeout(settle)
    }
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      const dy = touchStartY - t.clientY
      if (Math.abs(dy) > Math.abs(fingerDy)) fingerDy = dy
    }
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0]
      const dy = t ? touchStartY - t.clientY : 0
      const dx = t ? touchStartX - t.clientX : 0
      window.clearTimeout(settle)
      settle = window.setTimeout(() => {
        if (animating) return
        // the finger's own travel is decisive the moment it is big enough;
        // a short drag has to wait for the browser to actually move the page,
        // otherwise the page snaps back to the chapter it started from
        if (Math.abs(fingerDy) >= 22) decide(fingerDy, dx)
        else glide(0)
      }, 120)
    }

    /** waits for the native scroll to settle before judging a small drag */
    const glide = (samples: number) => {
      const before = window.scrollY
      window.setTimeout(() => {
        if (animating) return
        const moved = window.scrollY - touchStartScroll
        if (Math.abs(moved) > 40) return decide(moved, 0)
        if (samples < 8 && Math.abs(window.scrollY - before) > 1) return glide(samples + 1)
        decide(moved, 0)
      }, 90)
    }

    const decide = (verticalDelta: number, horizontalDelta: number) => {
      measure()
      const travelled = window.scrollY - touchStartScroll
      const vertical =
        Math.abs(verticalDelta) > Math.abs(horizontalDelta) && Math.abs(verticalDelta) >= 22
      const anchor = vertical ? touchStartScroll : window.scrollY
      if (!vertical) {
        const near = stops.reduce((a, c) => (Math.abs(c - anchor) < Math.abs(a - anchor) ? c : a), stops[0])
        if (Math.abs(near - anchor) > 12) animateTo(near)
        return
      }
      const edge = reach()
      const forward = verticalDelta !== 0 ? verticalDelta > 0 : travelled > 0
      const target =
        forward
          ? stops.find((s) => s > anchor + edge) ?? stops[stops.length - 1]
          : [...stops].reverse().find((s) => s < anchor - edge) ?? 0
      if (Math.abs(target - window.scrollY) > 12) animateTo(target)
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
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    return () => {
      document.documentElement.classList.remove('is-snapping')
      window.clearTimeout(settle)
      ro.disconnect()
      window.removeEventListener('load', measure)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [])
}
