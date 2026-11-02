import * as THREE from 'three'

/** Canvas helper */
function make(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  return { c, ctx }
}

function toTexture(c: HTMLCanvasElement, repeat?: [number, number]) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeat[0], repeat[1])
  }
  t.needsUpdate = true
  return t
}

function noise(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, alpha = 0.06) {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
  ctx.globalAlpha = alpha
  ctx.globalAlpha = 1
}

function blotches(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  count: number,
  colors: string[],
  maxR = 120,
) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 20 + Math.random() * maxR
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const col = colors[Math.floor(Math.random() * colors.length)]
    g.addColorStop(0, col)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** Polished warehouse concrete */
export function concreteTexture() {
  const { c, ctx } = make(512, 512)
  ctx.fillStyle = '#6d6f72'
  ctx.fillRect(0, 0, 512, 512)
  blotches(ctx, 512, 512, 26, ['rgba(255,255,255,0.05)', 'rgba(0,0,0,0.10)'], 160)
  noise(ctx, 512, 512, 26)
  // expansion joints
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, 256)
  ctx.lineTo(512, 256)
  ctx.moveTo(256, 0)
  ctx.lineTo(256, 512)
  ctx.stroke()
  const t = toTexture(c, [8, 8])
  return t
}

/** Asphalt yard */
export function asphaltTexture() {
  const { c, ctx } = make(512, 512)
  ctx.fillStyle = '#2b2d31'
  ctx.fillRect(0, 0, 512, 512)
  blotches(ctx, 512, 512, 30, ['rgba(255,255,255,0.045)', 'rgba(0,0,0,0.22)'], 150)
  noise(ctx, 512, 512, 34)
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.07})`
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.6, 1.6)
  }
  return toTexture(c, [14, 14])
}

/** Corrugated metal facade */
export function corrugatedTexture() {
  const { c, ctx } = make(256, 256)
  ctx.fillStyle = '#8f9296'
  ctx.fillRect(0, 0, 256, 256)
  for (let x = 0; x < 256; x += 16) {
    const g = ctx.createLinearGradient(x, 0, x + 16, 0)
    g.addColorStop(0, 'rgba(0,0,0,0.30)')
    g.addColorStop(0.42, 'rgba(255,255,255,0.16)')
    g.addColorStop(0.75, 'rgba(0,0,0,0.14)')
    g.addColorStop(1, 'rgba(0,0,0,0.30)')
    ctx.fillStyle = g
    ctx.fillRect(x, 0, 16, 256)
  }
  blotches(ctx, 256, 256, 12, ['rgba(0,0,0,0.10)', 'rgba(120,90,60,0.10)'], 90)
  noise(ctx, 256, 256, 14)
  return toTexture(c, [6, 2])
}

/** Roll-up shutter slats */
export function shutterTexture() {
  const { c, ctx } = make(64, 256)
  for (let y = 0; y < 256; y += 8) {
    const g = ctx.createLinearGradient(0, y, 0, y + 8)
    g.addColorStop(0, '#c9ccd1')
    g.addColorStop(0.5, '#8b8f95')
    g.addColorStop(1, '#5d6167')
    ctx.fillStyle = g
    ctx.fillRect(0, y, 64, 8)
  }
  return toTexture(c, [4, 1])
}

/** Sealed clothing bale plastic wrap */
export function baleWrapTexture() {
  const { c, ctx } = make(256, 256)
  ctx.fillStyle = '#d9dde2'
  ctx.fillRect(0, 0, 256, 256)
  // wrinkles
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  for (let i = 0; i < 60; i++) {
    ctx.lineWidth = Math.random() * 2
    ctx.beginPath()
    const x = Math.random() * 256
    ctx.moveTo(x, 0)
    ctx.bezierCurveTo(x + 30, 80, x - 30, 170, x + 12, 256)
    ctx.stroke()
  }
  blotches(ctx, 256, 256, 18, ['rgba(90,110,130,0.10)', 'rgba(255,255,255,0.20)'], 80)
  noise(ctx, 256, 256, 12)
  return toTexture(c, [1, 1])
}

/** Bale label: grade + weight */
export function baleLabelTexture(label = 'GRADE 1', sub = 'UK · 48 kg') {
  const { c, ctx } = make(256, 160)
  ctx.fillStyle = '#f4f1e9'
  ctx.fillRect(0, 0, 256, 160)
  ctx.fillStyle = '#0e0f11'
  ctx.fillRect(0, 0, 256, 34)
  ctx.fillStyle = '#f4f1e9'
  ctx.font = 'bold 20px Helvetica, Arial, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 14, 18)
  ctx.fillStyle = '#0e0f11'
  ctx.font = 'bold 46px Helvetica, Arial, sans-serif'
  ctx.fillText('SHR', 14, 78)
  ctx.font = '600 18px Helvetica, Arial, sans-serif'
  ctx.fillStyle = '#4a4d52'
  ctx.fillText(sub, 14, 122)
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, 252, 156)
  return toTexture(c)
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 6,
) {
  const words = text.split(' ')
  let line = ''
  let lines = 0
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i]
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + lines * lineHeight)
      lines++
      line = words[i]
      if (lines >= maxLines) return y + lines * lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line, x, y + lines * lineHeight)
  return y + lines * lineHeight
}

export type PanelSpec = {
  index?: string
  kicker?: string
  title: string
  body?: string
  bullets?: string[]
  accent?: string
  width?: number
  height?: number
}

/** Editorial service panel rendered to a texture */
export function panelTexture(spec: PanelSpec) {
  const w = spec.width ?? 1024
  const h = spec.height ?? 640
  const { c, ctx } = make(w, h)
  const accent = spec.accent ?? '#e8722c'

  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, '#14161a')
  bg.addColorStop(1, '#0b0c0e')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  // subtle grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth = 1
  for (let x = 0; x < w; x += 64) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }

  // accent bar
  ctx.fillStyle = accent
  ctx.fillRect(0, 0, w, 8)

  // big index watermark
  if (spec.index) {
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.font = `800 ${Math.round(h * 0.62)}px Helvetica, Arial, sans-serif`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(spec.index, w - 48, h - 40)
    ctx.textAlign = 'left'
  }

  const pad = Math.round(w * 0.075)
  let y = pad + 56

  if (spec.kicker) {
    ctx.fillStyle = accent
    ctx.font = '600 22px Helvetica, Arial, sans-serif'
    ctx.letterSpacing = '4px'
    ctx.fillText(spec.kicker.toUpperCase(), pad, y)
    ctx.letterSpacing = '0px'
    y += 64
  }

  ctx.fillStyle = '#f6f4ef'
  ctx.font = 'bold 62px Helvetica, Arial, sans-serif'
  y = wrapText(ctx, spec.title, pad, y, w - pad * 2, 68, 2) + 46

  if (spec.body) {
    ctx.fillStyle = 'rgba(246,244,239,0.66)'
    ctx.font = '400 26px Helvetica, Arial, sans-serif'
    y = wrapText(ctx, spec.body, pad, y, w - pad * 2, 38, 3) + 40
  }

  if (spec.bullets?.length) {
    for (const b of spec.bullets) {
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.arc(pad + 7, y - 8, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(246,244,239,0.86)'
      ctx.font = '500 24px Helvetica, Arial, sans-serif'
      ctx.fillText(b, pad + 30, y)
      y += 44
    }
  }

  return toTexture(c)
}

/** Big facade sign with brand mark */
export function signTexture(line1 = 'DEPOZIT', line2 = 'SECOND-HAND', sub = 'IMPORT · ANGLIA') {
  const { c, ctx } = make(2048, 512)
  ctx.fillStyle = '#0d0e10'
  ctx.fillRect(0, 0, 2048, 512)
  ctx.fillStyle = '#e8722c'
  ctx.fillRect(0, 0, 2048, 12)

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#f7f5f0'
  ctx.font = '800 190px Helvetica, Arial, sans-serif'
  ctx.fillText(line1, 96, 235)
  ctx.fillStyle = '#e8722c'
  ctx.font = '800 190px Helvetica, Arial, sans-serif'
  ctx.fillText(line2, 96, 415)

  ctx.fillStyle = 'rgba(247,245,240,0.55)'
  ctx.font = '600 34px Helvetica, Arial, sans-serif'
  ctx.letterSpacing = '10px'
  ctx.textAlign = 'right'
  ctx.fillText(sub, 1952, 140)
  ctx.letterSpacing = '0px'
  ctx.textAlign = 'left'
  return toTexture(c)
}

/** Section header painted on the interior wall */
export function wallTitleTexture(title: string, kicker: string) {
  const { c, ctx } = make(1536, 384)
  ctx.clearRect(0, 0, 1536, 384)
  ctx.fillStyle = '#e8722c'
  ctx.font = '600 40px Helvetica, Arial, sans-serif'
  ctx.letterSpacing = '8px'
  ctx.fillText(kicker.toUpperCase(), 8, 60)
  ctx.letterSpacing = '0px'
  ctx.fillStyle = '#f7f5f0'
  ctx.font = 'bold 128px Helvetica, Arial, sans-serif'
  wrapText(ctx, title, 6, 190, 1400, 132, 2)
  return toTexture(c)
}

/** Equirectangular sky used to build the environment map */
export function skyEquirect() {
  const { c, ctx } = make(1024, 512)
  // golden hour: warm peach horizon over a soft dusty sky
  const g = ctx.createLinearGradient(0, 0, 0, 512)
  g.addColorStop(0, '#8fa9bd')
  g.addColorStop(0.34, '#c9b8b0')
  g.addColorStop(0.48, '#f0c39a')
  g.addColorStop(0.55, '#ffd8a8')
  g.addColorStop(0.63, '#c98a5c')
  g.addColorStop(1, '#6b4530')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 1024, 512)
  // sun glow
  const sun = ctx.createRadialGradient(720, 210, 0, 720, 210, 320)
  sun.addColorStop(0, 'rgba(255,242,214,0.95)')
  sun.addColorStop(0.45, 'rgba(255,205,150,0.34)')
  sun.addColorStop(1, 'rgba(255,205,150,0)')
  ctx.fillStyle = sun
  ctx.fillRect(0, 0, 1024, 512)
  // warm haze band at the horizon
  const haze = ctx.createLinearGradient(0, 240, 0, 340)
  haze.addColorStop(0, 'rgba(255,226,186,0)')
  haze.addColorStop(0.5, 'rgba(255,226,186,0.5)')
  haze.addColorStop(1, 'rgba(255,226,186,0)')
  ctx.fillStyle = haze
  ctx.fillRect(0, 240, 1024, 100)
  const t = toTexture(c)
  t.mapping = THREE.EquirectangularReflectionMapping
  return t
}

/** Soft radial glow sprite */
export function glowTexture(color = '#ffd9a8') {
  const { c, ctx } = make(256, 256)
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, color)
  g.addColorStop(0.35, 'rgba(255,209,160,0.35)')
  g.addColorStop(1, 'rgba(255,209,160,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Garment gradient used on instanced hangers to fake fabric variety */
export function garmentPalette() {
  return [
    '#2f3f57', '#7c3b2e', '#c2a878', '#3d4a3a', '#8b8f95', '#5f3f55',
    '#b5b9bd', '#1f242b', '#a8552f', '#d9cbb2', '#41586e', '#6b2f3a',
  ]
}
