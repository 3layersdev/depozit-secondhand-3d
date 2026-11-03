import { useId, useMemo, useState } from 'react'
import { brand, categories, formats, grades, offer, priceNote, faq } from '../content'

/* ---------------------------------------------------------------- */
/* Blocuri comerciale: ce se vinde, în ce format, cât costă          */
/* (prețul se cere), cum se comandă. Fără stoc sau preț inventat.    */
/* ---------------------------------------------------------------- */

function SectionHead({ index, label, title }: { index: string; label: string; title: string }) {
  return (
    <>
      <div className="chapter__meta">
        <span className="chapter__num">{index}</span>
        <span>{label}</span>
      </div>
      <h2 className="chapter__title">{title}</h2>
    </>
  )
}

export function CategoriesSection() {
  return (
    <section className="panel panel--right" id="categorii">
      <div className="reveal card">
        <SectionHead index="06" label="Produse" title="Ce găsești în depozit" />
        <p className="lede">
          Marfă second-hand din Anglia, sortată pe categorii și pe cinci calități. Se vinde la sac de 20–25 kg,
          niciodată la bucată.
        </p>

        <ul className="catgrid">
          {categories.map((c) => (
            <li key={c} className="catgrid__item">
              {c}
            </li>
          ))}
        </ul>

        <div className="formats">
          {formats.map((f) => (
            <div className="formats__row" key={f.id}>
              <span className="formats__title">{f.title}</span>
              <span className="formats__text">{f.text}</span>
            </div>
          ))}
        </div>

        <p className="fineprint">{priceNote}</p>

        <div className="actions">
          <a className="btn btn--primary" href="#oferta">
            Cere ofertă pentru categoriile tale
          </a>
          <a className="btn btn--ghost" href={brand.phoneHref}>
            Sună: {brand.phone}
          </a>
        </div>
      </div>
    </section>
  )
}

export function FaqSection() {
  return (
    <section className="panel panel--right" id="intrebari">
      <div className="reveal card">
        <SectionHead index="07" label="Întrebări" title="Ce ne întreabă cumpărătorii" />
        <div className="faq">
          {faq.map((item) => (
            <details className="faq__item" key={item.q}>
              <summary className="faq__q">{item.q}</summary>
              <p className="faq__a">{item.a}</p>
            </details>
          ))}
        </div>
        <div className="actions">
          <a className="btn btn--ghost" href="#oferta">
            Am altă întrebare, cer o ofertă
          </a>
        </div>
      </div>
    </section>
  )
}

type Errors = Partial<Record<'nume' | 'telefon' | 'email' | 'categorie', string>>

export function OfferSection() {
  const uid = useId()
  const [nume, setNume] = useState('')
  const [telefon, setTelefon] = useState('')
  const [email, setEmail] = useState('')
  const [categorie, setCategorie] = useState('')
  const [calitate, setCalitate] = useState('')
  const [cantitate, setCantitate] = useState('')
  const [mesaj, setMesaj] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sent' | 'invalid'>('idle')

  const composed = useMemo(() => {
    const lines = [
      `Cerere de ofertă — ${brand.name} ${brand.suffix}`,
      `Nume: ${nume}`,
      `Telefon: ${telefon}`,
      email ? `Email: ${email}` : '',
      `Categorie: ${categorie || 'nespecificată'}`,
      calitate ? `Calitate: ${calitate}` : '',
      cantitate ? `Cantitate: ${cantitate} saci` : '',
      mesaj ? `Detalii: ${mesaj}` : '',
    ].filter(Boolean)
    return lines.join('\n')
  }, [nume, telefon, email, categorie, calitate, cantitate, mesaj])

  const waHref = `${brand.whatsapp}?text=${encodeURIComponent(composed)}`
  const mailHref = `mailto:${brand.email}?subject=${encodeURIComponent('Cerere de ofertă')}&body=${encodeURIComponent(composed)}`

  const validate = (): Errors => {
    const e: Errors = {}
    if (nume.trim().length < 2) e.nume = 'Scrie numele tău.'
    const digits = telefon.replace(/[^0-9]/g, '')
    if (digits.length < 9) e.telefon = 'Scrie un număr de telefon valid, cu cifre.'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = 'Adresa de email nu pare validă.'
    if (!categorie) e.categorie = 'Alege o categorie.'
    return e
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      setStatus('invalid')
      return
    }
    setStatus('sent')
    // cererea pleacă pe canalul real al depozitului: WhatsApp, cu mesajul completat
    window.open(waHref, '_blank', 'noopener,noreferrer')
  }

  const err = (field: keyof Errors) =>
    errors[field] ? (
      <span className="field__error" id={`${uid}-${field}-err`} role="alert">
        {errors[field]}
      </span>
    ) : null

  return (
    <section className="panel panel--right" id="oferta">
      <div className="reveal card">
        <SectionHead index="08" label="Ofertă" title={offer.title} />
        <p className="lede">{offer.text}</p>

        <form className="offerform" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor={`${uid}-nume`}>
              Nume și prenume
            </label>
            <input
              id={`${uid}-nume`}
              className="field__input"
              value={nume}
              onChange={(ev) => setNume(ev.target.value)}
              autoComplete="name"
              aria-invalid={!!errors.nume}
              aria-describedby={errors.nume ? `${uid}-nume-err` : undefined}
            />
            {err('nume')}
          </div>

          <div className="field">
            <label className="field__label" htmlFor={`${uid}-telefon`}>
              Telefon
            </label>
            <input
              id={`${uid}-telefon`}
              className="field__input"
              value={telefon}
              onChange={(ev) => setTelefon(ev.target.value)}
              inputMode="tel"
              autoComplete="tel"
              placeholder="07xx xxx xxx"
              aria-invalid={!!errors.telefon}
              aria-describedby={errors.telefon ? `${uid}-telefon-err` : undefined}
            />
            {err('telefon')}
          </div>

          <div className="field">
            <label className="field__label" htmlFor={`${uid}-email`}>
              Email <span className="field__opt">(opțional)</span>
            </label>
            <input
              id={`${uid}-email`}
              className="field__input"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              inputMode="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${uid}-email-err` : undefined}
            />
            {err('email')}
          </div>

          <div className="field">
            <label className="field__label" htmlFor={`${uid}-categorie`}>
              Categorie
            </label>
            <select
              id={`${uid}-categorie`}
              className="field__input"
              value={categorie}
              onChange={(ev) => setCategorie(ev.target.value)}
              aria-invalid={!!errors.categorie}
              aria-describedby={errors.categorie ? `${uid}-categorie-err` : undefined}
            >
              <option value="">Alege categoria</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="Mixt">Mixt</option>
            </select>
            {err('categorie')}
          </div>

          <div className="field">
            <label className="field__label" htmlFor={`${uid}-calitate`}>
              Calitate <span className="field__opt">(opțional)</span>
            </label>
            <select
              id={`${uid}-calitate`}
              className="field__input"
              value={calitate}
              onChange={(ev) => setCalitate(ev.target.value)}
            >
              <option value="">Orice calitate disponibilă</option>
              {grades.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor={`${uid}-cantitate`}>
              Cantitate (saci) <span className="field__opt">(opțional)</span>
            </label>
            <input
              id={`${uid}-cantitate`}
              className="field__input"
              value={cantitate}
              onChange={(ev) => setCantitate(ev.target.value.replace(/[^0-9]/g, ''))}
              inputMode="numeric"
            />
          </div>

          <div className="field field--wide">
            <label className="field__label" htmlFor={`${uid}-mesaj`}>
              Ce cauți <span className="field__opt">(opțional)</span>
            </label>
            <textarea
              id={`${uid}-mesaj`}
              className="field__input field__input--area"
              value={mesaj}
              onChange={(ev) => setMesaj(ev.target.value)}
              rows={3}
            />
          </div>

          <div className="offerform__submit">
            <button className="btn btn--primary" type="submit">
              Trimite cererea pe WhatsApp
            </button>
            <a className="btn btn--ghost" href={mailHref}>
              Trimite pe email
            </a>
          </div>

          <p className="fineprint">{offer.note}</p>

          <p className="offerform__status" role="status" aria-live="polite">
            {status === 'invalid' && 'Verifică datele marcate mai sus.'}
            {status === 'sent' && (
              <>
                Am deschis WhatsApp cu cererea completată. Dacă fereastra nu s-a deschis,{' '}
                <a href={waHref} target="_blank" rel="noreferrer">
                  deschide-o aici
                </a>{' '}
                sau{' '}
                <a href={mailHref}>trimite cererea pe email</a>.
              </>
            )}
          </p>
        </form>
      </div>
    </section>
  )
}
