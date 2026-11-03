/**
 * Tot conținutul editorial al site-ului, într-un singur loc.
 *
 * Datele de business sunt reale, luate din:

 *  - pagina de Facebook facebook.com/depozitsecondhandromania
 *    (3.5K urmăritori, 96% recomandări, „Apparel Distributor”, București)
 *  - arhiva site-ului depozitnoubucuresti.com (Wayback Machine: 2011–2024)
 *
 * Fapte confirmate acolo și folosite aici: import direct, exclusiv Anglia,
 * peste 20 de ani pe piață, depozit propriu în București, neplătitor de TVA,
 * saci transparenți de 20–25 kg care pot fi deschiși la vizionare, cinci
 * calități (extra cremă, cremă, calitatea I, calitatea II, solduri), factură
 * fiscală + acte de proveniență + certificat de dezinsectare/dezinfecție,
 * transport național și internațional la cerere.
 *
 * Orice cifră care nu apare în surse (program exact, adresă cu stradă,
 * număr de clienți) este ținută intenționat vagă sau marcată ca TODO.
 */

import { asset } from './lib/asset'

export const brand = {
  name: 'Depozit Second-Hand',
  suffix: 'București',
  mark: 'DSH',
  kicker: 'Depozit · București',
  tagline:
    'Haine second-hand originale din UK, în saci de 20–25 kg, sortate pe calități. Import direct, depozit propriu în București, peste 20 de ani pe piață.',
  phone: '0744 239 757',
  phoneHref: 'tel:+40744239757',
  phone2: '0726 253 453',
  phone2Href: 'tel:+40726253453',
  whatsapp: 'https://wa.me/40744239757',
  whatsappLabel: 'Scrie pe WhatsApp',
  email: 'contact@depozitnoubucuresti.com',
  city: 'București, România',
  hours: 'Vizionări cu programare telefonică',
  facebook: 'https://www.facebook.com/depozitsecondhandromania/',
}

export const hero = {
  eyebrow: 'Import direct · exclusiv Anglia',
  title: ['Deschide', 'ușa', 'depozitului.'],
  text: 'Haine second-hand originale din Anglia, pentru magazine second-hand, vânzători online și distribuitori. Se vând la sac de 20–25 kg, sortate pe cinci calități. Prețul se comunică la cerere, cu pozele stocului disponibil.',
  stats: [
    { value: '3,5K', label: 'urmași pe Facebook' },
    { value: '20–25 kg', label: 'sacul standard' },
    { value: '5', label: 'calități sortate' },
  ],
}

export const chapters = [
  {
    id: 'intro',
    label: 'Intro',
    title: 'Camionul trage la rampă',
    text: 'Marfa vine originală din Anglia, pe palet, cu acte. Treci pe lângă el până la ușa halei, acolo unde sacii se descarcă și se sortează.',
  },
  {
    id: 'door',
    label: 'Depozit',
    title: 'Ridicăm oblonul depozitului',
    text: 'Se deschide hala: saci transparenți de 20–25 kg, etichetați pe calitate și categorie. Îi poți deschide în depozit, înainte să cumperi.',
  },
  {
    id: 'services',
    label: 'Servicii',
    title: 'Ce găsești înăuntru',
    text: 'Import direct din UK, sortare pe calități, vizionare la fața locului și livrare în toată țara — la sac, nu la balot.',
  },
  {
    id: 'quality',
    label: 'Calitate',
    title: 'Cinci calități, zero surprize',
    text: 'Extra cremă, cremă, calitatea I, calitatea II și solduri. Alegi nivelul, noi îl respectăm sac cu sac.',
  },
  {
    id: 'gallery',
    label: 'Galerie',
    title: 'Depozitul, în imagini',
    text: 'Poze reale din hala noastră și de pe pagina de Facebook: saci pe palet, masa de sortare, încărcarea la rampă.',
  },
  {
    id: 'contact',
    label: 'Contact',
    title: 'Hai să vezi marfa',
    text: 'Spune-ne ce categorie te interesează și îți trimitem pozele stocului disponibil.',
  },
] as const

export const services = [
  {
    id: 'bales',
    index: '01',
    title: 'Import direct din UK',
    text: 'Suntem importator direct: marfa vine originală, exclusiv din Anglia, pe palet, cu documente. Fără intermediari între depozit și magazinul tău.',
    points: ['Original, exclusiv UK', 'Depozit propriu în București', 'Neplătitor de TVA'],
  },
  {
    id: 'sorting',
    index: '02',
    title: 'Sortat pe calități',
    text: 'Extra cremă, cremă, calitatea I, calitatea II și solduri. Sortare pe categorii, ca marfa să ajungă direct pe raft.',
    points: ['5 calități', 'Sortare pe articole', 'Solduri la cerere'],
  },
  {
    id: 'check',
    index: '03',
    title: 'Vizionare în depozit',
    text: 'Vindem doar la sac de 20–25 kg, niciodată la balot. Sacii sunt transparenți și pot fi deschiși la fața locului, ca să vezi exact ce cumperi.',
    points: ['Numai la sac de 20–25 kg', 'Deschiși la vizionare', 'Factură și acte de proveniență'],
  },
  {
    id: 'delivery',
    index: '04',
    title: 'Livrare în toată țara',
    text: 'Transport național și internațional la cerere, până la adresa ta. Aprovizionăm săptămânal parteneri din toată România.',
    points: ['Transport la cerere', 'Aprovizionare săptămânală', 'Certificat de dezinsectare'],
  },
]

export const categories = [
  'Damă',
  'Bărbați',
  'Adolescenți',
  'Copii',
  'Încălțăminte',
  'Genți & marochinărie',
  'Articole din piele',
  'Lenjerie & intime',
  'Articole de casă',
  'Jucării',
  'Articole sport',
  'Blănuri & cojoace',
]

export const grades = [
  {
    id: 'extra',
    name: 'Extra cremă',
    tag: 'Top',
    text: 'Selecția maximă: mărci cunoscute, stare excelentă, piese bune de vitrină.',
    metric: 1,
  },
  {
    id: 'crema',
    name: 'Cremă',
    tag: 'Selecție',
    text: 'Branduri premium, articole moderne, ponderate pe sezon.',
    metric: 0.88,
  },
  {
    id: 'g1',
    name: 'Calitatea I',
    tag: 'Standard',
    text: 'Fără defecte vizibile, gata de pus pe raft fără reparații.',
    metric: 0.72,
  },
  {
    id: 'g2',
    name: 'Calitatea II',
    tag: 'Volum',
    text: 'Marfă pentru prețuri mici și vânzare rapidă, tot la sac de 20–25 kg.',
    metric: 0.55,
  },
]

export type GalleryItem = {
  id: string
  src: string
  tiny: string
  title: string
  meta: string
  kind: 'photo' | 'reel'
  size?: 'lg' | 'tall' | 'sm'
}

export const facebook = {
  page: 'https://www.facebook.com/depozitsecondhandromania/',
  label: 'Depozit haine second-hand in Bucuresti',
  followers: '3,5K',
  recommend: '96%',
  reviews: 18,
  reels: 'https://www.facebook.com/depozitsecondhandromania/reels/',
}

/**
 * Pozele sunt luate din pagina noastră de Facebook (descărcate din
 * facebook.com/depozitsecondhandromania). Facebook servește public
 * variante reduse, așa că tile-urile mici stau la dimensiunea lor reală.
 */
export const gallery: GalleryItem[] = [
  {
    id: 'brands',
    src: asset('media/fb/fb-01.jpg'),
    tiny: asset('media/fb/fb-01.jpg'),
    title: 'Branduri din UK',
    meta: 'Colaj de pe pagina noastră: mărcile care intră în saci',
    kind: 'photo',
    size: 'lg',
  },
  {
    id: 'crema-anglia',
    src: asset('media/fb/lb-01.jpg'),
    tiny: asset('media/fb/lb-01.jpg'),
    title: 'Cremă Anglia',
    meta: 'Calitatea cremă, așa cum o postăm pe Facebook',
    kind: 'photo',
    size: 'tall',
  },
  {
    id: 'bags',
    src: asset('media/fb/fb-02.jpg'),
    tiny: asset('media/fb/fb-02.jpg'),
    title: 'Genți și poșete',
    meta: 'Marochinărie, la sac',
    kind: 'photo',
    size: 'sm',
  },
  {
    id: 'bags2',
    src: asset('media/fb/fb-05.jpg'),
    tiny: asset('media/fb/fb-05.jpg'),
    title: 'Marochinărie',
    meta: 'Sortată pe loturi',
    kind: 'photo',
    size: 'sm',
  },
  {
    id: 'denim',
    src: asset('media/fb/fb-06.jpg'),
    tiny: asset('media/fb/fb-06.jpg'),
    title: 'Blugi',
    meta: 'Pachete de blugi, gata de sac',
    kind: 'photo',
    size: 'sm',
  },
  {
    id: 'folded',
    src: asset('media/fb/fb-03.jpg'),
    tiny: asset('media/fb/fb-03.jpg'),
    title: 'Haine pliate',
    meta: 'Sortare pe categorii',
    kind: 'photo',
    size: 'sm',
  },
  {
    id: 'tagged',
    src: asset('media/fb/fb-04.jpg'),
    tiny: asset('media/fb/fb-04.jpg'),
    title: 'Articole cu etichetă',
    meta: 'Piese noi, cu etichetă',
    kind: 'photo',
    size: 'sm',
  },
  {
    id: 'mixed',
    src: asset('media/fb/fb-08.jpg'),
    tiny: asset('media/fb/fb-08.jpg'),
    title: 'Amestec mixt',
    meta: 'Cremă și calitatea 1',
    kind: 'photo',
    size: 'sm',
  },
]

export const steps = [
  { n: '01', title: 'Cerere', text: 'Ne spui categoriile și cantitatea.' },
  { n: '02', title: 'Ofertă', text: 'Primești prețul și pozele stocului.' },
  { n: '03', title: 'Vizionare', text: 'Deschizi sacii în depozit, la fața locului.' },
  { n: '04', title: 'Livrare', text: 'Pleacă cu factură și acte de proveniență.' },
]

export const relevant = [
  'Magazine second-hand',
  'Lanțuri de magazine',
  'Vânzători online',
  'Export & distribuitori',
]

export const contact = {
  title: 'Vezi stocul pe viu',
  text: 'Trimite un mesaj cu ce te interesează. Îți răspundem cu disponibilitatea, prețul pe calitate și pozele sacilor din depozit.',
  cta: 'Cere oferta pe WhatsApp',
  secondary: 'Vezi pagina de Facebook',
}


/** Formatele comerciale reale: se vinde la sac, niciodată la balot. */
export const formats = [
  {
    id: 'sac',
    title: 'Sac de 20–25 kg',
    text: 'Unitatea minimă de vânzare. Sac transparent, etichetat pe calitate și categorie.',
  },
  {
    id: 'palet',
    title: 'Palet de saci',
    text: 'Cantități mai mari pentru magazine, pregătite pe palet, cu documentele aferente.',
  },
  {
    id: 'transport',
    title: 'Transport la cerere',
    text: 'Livrare în toată țara și internațional, la cerere, până la adresa ta.',
  },
]

/** Prețul nu se publică în site: se comunică la cerere, pe categorie și calitate. */
export const priceNote =
  'Prețul se comunică la cerere, în funcție de calitate și categorie. Nu publicăm prețuri fixe pentru că marfa se schimbă la fiecare transport.'

export const faq = [
  {
    q: 'Care este cantitatea minimă?',
    a: 'Un sac de 20–25 kg. Nu vindem la bucată și nici la balot nedeschis.',
  },
  {
    q: 'Cât costă un sac?',
    a: 'Prețul depinde de calitate (extra cremă, cremă, calitatea I, calitatea II, solduri) și de categorie. Îl comunicăm la cerere, cu pozele stocului disponibil în acel moment.',
  },
  {
    q: 'Pot vedea marfa înainte să cumpăr?',
    a: 'Da. Sacii sunt transparenți și pot fi deschiși în depozit, la vizionare. Vizionările se fac cu programare telefonică.',
  },
  {
    q: 'De unde vine marfa?',
    a: 'Exclusiv din Anglia, import direct pe palet, cu acte de proveniență. Suntem importator, nu intermediar.',
  },
  {
    q: 'Ce documente primesc?',
    a: 'Factură fiscală, acte de proveniență și certificat de dezinsectare și dezinfecție. Suntem neplătitor de TVA.',
  },
  {
    q: 'Cum se face livrarea?',
    a: 'Transport național și internațional la cerere. Aprovizionăm săptămânal parteneri din toată România.',
  },
  {
    q: 'Pentru cine este marfa?',
    a: 'Pentru magazine second-hand, lanțuri de magazine, vânzători online și distribuitori sau exportatori.',
  },
]

export const offer = {
  title: 'Cere o ofertă',
  text: 'Completează ce te interesează. Cererea se trimite pe WhatsApp, cu datele tale deja completate; răspundem cu disponibilitatea și prețul.',
  note: 'Nu avem comenzi online: cererea ajunge direct la depozit, pe WhatsApp sau email.',
}
