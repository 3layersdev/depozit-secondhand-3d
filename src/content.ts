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
 * saci transparenți de 10–30 kg care pot fi deschiși la vizionare, cinci
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
    'Haine second-hand din Anglia, sortate pe calități. Import direct, depozit propriu, peste 20 de ani pe piață.',
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
  title: ['Deschide', 'ușa', 'camionului.'],
  text: 'Baloturi de haine second-hand aduse din Anglia, sortate pe calități și vândute en gros din depozitul nostru din București. Scroll pentru a intra în depozit.',
  stats: [
    { value: '20+', label: 'ani pe piață' },
    { value: '10–30 kg', label: 'sac transparent' },
    { value: '5', label: 'calități sortate' },
  ],
}

export const chapters = [
  {
    id: 'intro',
    label: 'Intro',
    title: 'Camionul intră în curte',
    text: 'Marfa vine din Anglia, pe palet, cu acte. Fiecare transport intră în depozit și se sortează pe calități.',
  },
  {
    id: 'door',
    label: 'Ușa',
    title: 'Ridicăm oblonul',
    text: 'Saci transparenți, etichetați pe calitate și categorie. Îi poți deschide în depozit, înainte să cumperi.',
  },
  {
    id: 'services',
    label: 'Servicii',
    title: 'Ce găsești înăuntru',
    text: 'Import direct, sortare pe calități, vizionare la fața locului și livrare în toată țara.',
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
    text: 'Poze din hală: baloturi pe palet, masa de sortare, încărcarea la rampă.',
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
    text: 'Suntem importator direct: marfa vine exclusiv din Anglia, pe palet, cu documente. Fără intermediari între depozit și magazinele tale.',
    points: ['Exclusiv Anglia', 'Depozit propriu în București', 'Neplătitor de TVA'],
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
    text: 'Sacii transparenți de 10–30 kg pot fi deschiși la fața locului. Vezi exact ce cumperi, înainte să pleci cu marfa.',
    points: ['Saci 10–30 kg', 'Deschiși la vizionare', 'Factură și acte de proveniență'],
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
    text: 'Marfă pentru prețuri mici și vânzare rapidă, la sac sau la kilogram.',
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
}

export const gallery: GalleryItem[] = [
  {
    id: 'warehouse',
    src: asset('media/01-warehouse.jpg'),
    tiny: asset('media/01-warehouse_tiny.jpg'),
    title: 'Hala de depozitare',
    meta: 'Baloturi pe palet, gata de livrare',
    kind: 'photo',
  },
  {
    id: 'sorting',
    src: asset('media/02-sorting.jpg'),
    tiny: asset('media/02-sorting_tiny.jpg'),
    title: 'Masa de sortare',
    meta: 'Damă, bărbați, copii, pe calități',
    kind: 'reel',
  },
  {
    id: 'denim',
    src: asset('media/03-denim-bales.jpg'),
    tiny: asset('media/03-denim-bales_tiny.jpg'),
    title: 'Baloturi de blugi',
    meta: 'Etichetate pe calitate și mărime',
    kind: 'photo',
  },
  {
    id: 'dock',
    src: asset('media/04-truck-dock.jpg'),
    tiny: asset('media/04-truck-dock_tiny.jpg'),
    title: 'Încărcare la rampă',
    meta: 'Plecare spre magazinele partenere',
    kind: 'reel',
  },
  {
    id: 'showroom',
    src: asset('media/05-showroom.jpg'),
    tiny: asset('media/05-showroom_tiny.jpg'),
    title: 'Marfa pe umeraș',
    meta: 'Cum arată un lot bun, sortat',
    kind: 'photo',
  },
  {
    id: 'open',
    src: asset('media/06-open-bale.jpg'),
    tiny: asset('media/06-open-bale_tiny.jpg'),
    title: 'Deschidem un sac',
    meta: 'Ce e înăuntru, la vedere',
    kind: 'photo',
  },
  {
    id: 'aerial',
    src: asset('media/07-aerial.jpg'),
    tiny: asset('media/07-aerial_tiny.jpg'),
    title: 'Depozitul de sus',
    meta: 'Stoc organizat pe categorii',
    kind: 'photo',
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
