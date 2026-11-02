# Depozit Second-Hand București — site cinematic 3D

Site de prezentare pentru un depozit de haine second-hand din Anglia, vândute en gros
în București. Totul se derulează ca un film controlat de scroll: camionul intră în
curte, oblonul se ridică, camera intră în hala de sortare, trece prin zona de calități,
prin galerie și se oprește la peretele de contact.

## Ce conține

- **Scenă 3D generată procedural** (React Three Fiber + Three.js): curte, depozit cu
  fațadă de tablă, camion cu oblon rulant, interior cu rafturi, baloturi, mese de
  sortare, umerașe, panouri luminoase, praf în lumină.
- **Regie pe scroll**: fiecare secțiune HTML deține un segment din timeline
  (`src/lib/hooks.ts` → `BEATS`), iar camera urmează keyframe-uri cu easing
  (`src/three/sequence.ts`). Nu există decalaj între text și cadru, indiferent de
  înălțimea panourilor.
- **Trecere prin oblon**: la `SCENE_CUT` camera trece prin planul ușii, cu un flash
  scurt care maschează schimbarea de spațiu (exterior → interior).
- **UI editorial**: header fix, rail de progres, carduri de capitol, chips de
  categorii, tabel de contact, lightbox pentru galerie.
- **Fallback complet**: fără WebGL (sau dacă driverul refuză contextul) pagina
  rămâne utilizabilă, cu fundal fotografic și tot conținutul HTML.

## Conținut și surse

Textele și cifrele vin din surse reale, nu inventate:

- pagina de Facebook `facebook.com/depozitsecondhandromania` (pozele din galerie sunt
  descărcate de acolo; widgetul din secțiunea Galerie afișează postările reale)
- arhiva Wayback Machine a `depozitnoubucuresti.com` (2011–2024): paginile
  *Despre noi*, *Produse*, *Contact*

Fapte preluate: import direct exclusiv Anglia, peste 20 de ani pe piață, depozit
propriu în București, neplătitor de TVA, cinci calități de marfă, saci transparenți
de 20–25 kg deschiși la vizionare. Vindem exclusiv la sac, nu la balot, factură + acte de proveniență + certificat de
dezinsectare/dezinfecție, transport național și internațional la cerere.

## Dezvoltare

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
```

`VITE_BASE=/nume-repo/ npm run build` pentru GitHub Pages pe subcale.

## Verificare vizuală

`tools/beats.mjs` deschide site-ul în Chrome headless, caută binar offsetul de scroll
pentru fiecare beat al filmului (progresul e publicat în `<html data-p>` când URL-ul
conține `?qa=1`) și salvează câte un cadru pentru fiecare.

```bash
npx vite preview --port 4176 &
node tools/beats.mjs "http://127.0.0.1:4176/?qa=1" shots
```
