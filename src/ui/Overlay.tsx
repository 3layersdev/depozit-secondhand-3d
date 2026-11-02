import { useCallback, useEffect, useState } from 'react'
import { brand, categories, chapters, contact, facebook, gallery, grades, hero, relevant, services, steps } from '../content'

/* ------------------------------------------------------------------ */
/* Chrome                                                             */
/* ------------------------------------------------------------------ */

const NAV = [
  { href: '#depozit', label: 'Depozit' },
  { href: '#servicii', label: 'Servicii' },
  { href: '#calitate', label: 'Calitate' },
  { href: '#galerie', label: 'Galerie' },
  { href: '#contact', label: 'Contact' },
]

export function Header() {
  return (
    <header className="header">
      <a className="brand" href="#depozit" aria-label={brand.name}>
        <span className="brand__mark">{brand.mark}</span>
        <span className="brand__text">
          <span className="brand__name">{brand.name}</span>
          <span className="brand__sub">{brand.suffix} · Import Anglia</span>
        </span>
      </a>
      <nav className="header__nav" aria-label="Navigare principală">
        {NAV.map((n) => (
          <a key={n.href} href={n.href}>
            {n.label}
          </a>
        ))}
      </nav>
      <a className="header__cta" href={brand.whatsapp} target="_blank" rel="noreferrer">
        <WhatsAppIcon />
        Cere oferta
      </a>
    </header>
  )
}

const RAIL = [
  { id: 'depozit', label: 'Intro', at: 0 },
  { id: 'sosire', label: 'Sosire', at: 0.16 },
  { id: 'usa', label: 'Depozit', at: 0.32 },
  { id: 'servicii', label: 'Servicii', at: 0.484 },
  { id: 'calitate', label: 'Calitate', at: 0.64 },
  { id: 'galerie', label: 'Galerie', at: 0.77 },
  { id: 'contact', label: 'Contact', at: 0.9 },
]

export function Rail({ progress }: { progress: number }) {
  const active = RAIL.reduce((acc, r, i) => (progress >= r.at ? i : acc), 0)
  return (
    <nav className="rail" aria-label="Progres">
      {RAIL.map((r, i) => (
        <button
          key={r.id}
          className={`rail__item ${i === active ? 'is-active' : ''}`}
          onClick={() => document.getElementById(r.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          aria-label={r.label}
          aria-current={i === active}
        >
          <span className="rail__label">{r.label}</span>
          <span className="rail__dot" />
        </button>
      ))}
    </nav>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.4 1.3-1.94 1.35-.54.05-1.05.24-3.53-.72-2.98-1.17-4.87-4.25-5.02-4.45-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.58-.37.78-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.58.83 2.02.9 2.17.07.15.12.32.02.51-.1.2-.15.32-.29.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.75 1.24 1.61 2.01 1.11.99 2.05 1.3 2.34 1.45.29.15.46.12.63-.07.17-.2.73-.85.93-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.12.07.71-.17 1.39Z" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Sections                                                           */
/* ------------------------------------------------------------------ */

function Chapter({
  id,
  index,
  label,
  title,
  children,
  align = 'left',
}: {
  id: string
  index: string
  label: string
  title: string
  children?: React.ReactNode
  align?: 'left' | 'right'
}) {
  return (
    <section className={`panel ${align === 'right' ? 'panel--right' : ''}`} id={id}>
      <div className={`reveal ${align === 'right' ? 'card' : 'card'}`} style={align === 'right' ? { width: 'min(520px, 100%)' } : undefined}>
        <div className="chapter__meta">
          <span className="chapter__num">{index}</span>
          <span>{label}</span>
        </div>
        <h2 className="chapter__title">{title}</h2>
        {children}
      </div>
    </section>
  )
}

export function HeroSection() {
  return (
    <section className="panel panel--hero" id="depozit">
      <div className="reveal is-visible" style={{ width: 'min(760px, 100%)' }}>
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1 className="h1">
          {hero.title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <p className="hero__text">{hero.text}</p>
        <div className="actions">
          <a className="btn btn--primary" href={brand.whatsapp} target="_blank" rel="noreferrer">
            <WhatsAppIcon />
            {brand.whatsappLabel}
          </a>
          <a className="btn btn--ghost" href="#servicii">
            Vezi serviciile
          </a>
        </div>
        <div className="stats">
          {hero.stats.map((s) => (
            <div className="stat" key={s.label}>
              <div className="stat__value">{s.value}</div>
              <div className="stat__label">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="scrollhint">
          <span className="scrollhint__line" />
          Scroll pentru a intra în depozit
        </div>
      </div>
    </section>
  )
}

export function TruckSection() {
  return (
    <Chapter id="sosire" index="01" label="Sosirea" title="Camionul trage la rampă" align="right">
      <p className="lede">{chapters[0].text}</p>
      <div className="svc">
        <div className="svc__row" style={{ borderTop: 0 }}>
          <span className="svc__idx">UK</span>
          <span>
            <span className="svc__name">Import direct, exclusiv Anglia</span>
            <span className="svc__points">Marfă din Anglia, pe palet, cu acte de proveniență.</span>
          </span>
          <span className="svc__tag">20+ ani</span>
        </div>
        <div className="svc__row">
          <span className="svc__idx">20–25<span className="svc__unit">kg</span></span>
          <span>
            <span className="svc__name">Numai la sac de 20–25 kg, nu la balot</span>
            <span className="svc__points">Saci transparenți, deschiși la vizionare. Vezi exact ce cumperi.</span>
          </span>
          <span className="svc__tag">Factură + avize</span>
        </div>
      </div>
    </Chapter>
  )
}

export function DoorSection() {
  return (
    <Chapter id="usa" index="02" label="Depozit" title="Ridicăm oblonul depozitului" align="right">
      <p className="lede">{chapters[1].text}</p>
      <div className="steps">
        {steps.map((s) => (
          <div className="step" key={s.n}>
            <div className="step__n">{s.n}</div>
            <div className="step__t">{s.title}</div>
            <div className="step__d">{s.text}</div>
          </div>
        ))}
      </div>
    </Chapter>
  )
}

const TAGS: Record<string, string> = {
  bales: 'Import direct',
  sorting: '5 calități',
  check: '20–25 kg',
  delivery: 'Național',
}

export function ServicesSection() {
  return (
    <Chapter id="servicii" index="03" label="Servicii" title={chapters[2].title} align="right">
      <p className="lede">{chapters[2].text}</p>
      <div className="svc">
        {services.map((s) => (
          <div className="svc__row" key={s.id}>
            <span className="svc__idx">{s.index}</span>
            <span>
              <span className="svc__name">{s.title}</span>
              <span className="svc__points">{s.points.join(' · ')}</span>
            </span>
            <span className="svc__tag">{TAGS[s.id] ?? 'La cerere'}</span>
          </div>
        ))}
      </div>
      <div className="chips" aria-label="Categorii de marfă">
        {categories.map((c) => (
          <span className="chip" key={c}>
            {c}
          </span>
        ))}
      </div>
      <p className="fineprint">
        Vindem en gros: articole textile, încălțăminte, genți, lenjerie, articole de casă și jucării.
        Documente: factură fiscală, acte de proveniență, certificat de dezinsectare și dezinfecție.
      </p>
      <div className="audience">
        {relevant.map((r) => (
          <span key={r} className="audience__item">
            {r}
          </span>
        ))}
      </div>
    </Chapter>
  )
}

export function QualitySection() {
  return (
    <Chapter id="calitate" index="04" label="Calitate" title={chapters[3].title}>
      <p className="lede">{chapters[3].text}</p>
      <div className="grades">
        {grades.map((g) => (
          <div className="grade" key={g.id}>
            <div className="grade__top">
              <span className="grade__name">{g.name}</span>
              <span className="grade__tag">{g.tag}</span>
            </div>
            <div className="grade__bar">
              <div className="grade__fill" style={{ width: `${g.metric * 100}%` }} />
            </div>
            <p className="grade__text">{g.text}</p>
          </div>
        ))}
      </div>
    </Chapter>
  )
}

export function GallerySection({ onOpen }: { onOpen: (index: number) => void }) {
  return (
    <Chapter id="galerie" index="05" label="Galerie" title={chapters[4].title} align="right">
      <p className="lede">{chapters[4].text}</p>
      <div className="thumbs">
        {gallery.map((g, i) => (
          <button
            type="button"
            className={`thumb thumb--${g.size ?? 'sm'}`}
            key={g.id}
            onClick={() => onOpen(i)}
            aria-label={`Deschide ${g.title}`}
            style={{ backgroundImage: `url(${g.tiny})` }}
          >
            <img src={g.src} alt={g.title} loading="lazy" />
            <span className="thumb__tag">{g.kind === 'reel' ? 'Clip' : 'Foto'}</span>
          </button>
        ))}
      </div>

      <div className="fbblock">
        <div className="fbblock__side">
          <p className="eyebrow">Facebook</p>
          <h3 className="fbblock__title">Clipurile și pozele, pe viu</h3>
          <p className="fbblock__text">
            Postăm zilnic ce intră în depozit. {facebook.followers} urmăritori, {facebook.recommend} recomandări,
            poze și clipuri noi cu marfa din Anglia.
          </p>
          <a className="btn btn--ghost" href={facebook.page} target="_blank" rel="noreferrer">
            Deschide pagina de Facebook
          </a>
        </div>
        <div className="fbblock__grid">
          {gallery.slice(0, 4).map((g, i) => (
            <button
              type="button"
              className="fbblock__cell"
              key={g.id}
              onClick={() => onOpen(i)}
              aria-label={`Deschide ${g.title}`}
            >
              <img src={g.src} alt={g.title} loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </Chapter>
  )
}

export function ContactSection() {
  const rows = [
    { label: 'Telefon', value: brand.phone, href: brand.phoneHref },
    { label: 'Telefon 2', value: brand.phone2, href: brand.phone2Href },
    { label: 'WhatsApp', value: brand.whatsappLabel, href: brand.whatsapp },
    { label: 'Email', value: brand.email, href: `mailto:${brand.email}` },
    { label: 'Facebook', value: 'depozitsecondhandromania', href: brand.facebook },
    { label: 'Locație', value: brand.city, href: undefined },
    { label: 'Program', value: brand.hours, href: undefined },
  ]
  return (
    <section className="panel panel--end" id="contact">
      <div className="reveal contact">
        <div>
          <p className="eyebrow">Contact</p>
          <h2 className="contact__title">{contact.title}</h2>
          <p className="lede">{contact.text}</p>
          <div className="actions">
            <a className="btn btn--primary" href={brand.whatsapp} target="_blank" rel="noreferrer">
              <WhatsAppIcon />
              {contact.cta}
            </a>
            <a className="btn btn--ghost" href={brand.facebook} target="_blank" rel="noreferrer">
              {contact.secondary}
            </a>
          </div>
        </div>
        <div className="contact__list">
          {rows.map((r) =>
            r.href ? (
              <a className="contact__row" key={r.label} href={r.href} target={r.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                <span className="contact__label">{r.label}</span>
                <span className="contact__value">{r.value}</span>
              </a>
            ) : (
              <div className="contact__row" key={r.label}>
                <span className="contact__label">{r.label}</span>
                <span className="contact__value">{r.value}</span>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <span>
        © {new Date().getFullYear()} {brand.name} {brand.suffix} · Import direct haine second-hand din Anglia
      </span>
      <span style={{ display: 'flex', gap: 18 }}>
        <a href={brand.facebook} target="_blank" rel="noreferrer">
          Facebook
        </a>
        <a href={brand.whatsapp} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        <a href={`mailto:${brand.email}`}>Email</a>
      </span>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/* Lightbox                                                           */
/* ------------------------------------------------------------------ */

export function Lightbox({ index, onClose }: { index: number | null; onClose: () => void }) {
  const [current, setCurrent] = useState(index ?? 0)

  useEffect(() => {
    if (index !== null) setCurrent(index)
  }, [index])

  const next = useCallback(() => setCurrent((c) => (c + 1) % gallery.length), [])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + gallery.length) % gallery.length), [])

  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [index, onClose, next, prev])

  if (index === null) return null
  const item = gallery[current]

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={item.title} onClick={onClose}>
      <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
        <img className="lightbox__img" src={item.src} alt={item.title} />
        <div className="lightbox__bar">
          <div>
            <div className="lightbox__title">{item.title}</div>
            <div className="lightbox__meta">
              {item.meta} · {current + 1}/{gallery.length}
            </div>
          </div>
          <div className="lightbox__nav">
            <button className="iconbtn" onClick={prev} aria-label="Imaginea anterioară">
              ←
            </button>
            <button className="iconbtn" onClick={next} aria-label="Imaginea următoare">
              →
            </button>
            <button className="iconbtn" onClick={onClose} aria-label="Închide">
              ✕
            </button>
          </div>
        </div>
      </figure>
    </div>
  )
}
