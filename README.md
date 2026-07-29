# EnergoIzbira MVP

Delujoč statični prototip slovenske lead-generation platforme za toplotne črpalke.

## Kaj vsebuje

- `index.html` — celotna pristajalna stran in štiristopenjski vprašalnik.
- `styles.css` — odziven vizualni sistem brez ogrodja.
- `app.js` — validacija, predhodna tehnična ocena, komercialni lead score in lokalni demo zapis.
- `provider-report-template.md` — poročilo, ki ga prejme izvajalec.
- `commercial-model.md` — pilotne cene, definicija kvalificiranega povpraševanja in KPI-ji.
- `provider-outreach.md` — prvi prodajni e-mail in telefonski uvod.
- `privacy-checklist.md` — seznam elementov, ki jih je treba urediti pred javnim zbiranjem podatkov.
- `provider-prospects.csv` — prazna baza za raziskavo prvih izvajalcev.

## Lokalni zagon

Odprite `index.html` neposredno v brskalniku ali v mapi zaženite:

```bash
python3 -m http.server 8000
```

Nato odprite `http://localhost:8000`.

## Kaj prototip že dela

- vodi uporabnika skozi štiri korake;
- zahteva obvezne odgovore;
- izračuna informativni tehnični rezultat 20–96;
- pripravi pozitivne dejavnike in opozorila;
- ločeno izračuna komercialno namero in lead razred A/B/C;
- pred zbiranjem kontakta zahteva dve potrditvi;
- demo povpraševanje shrani samo v `localStorage` uporabnikovega brskalnika.

## Kaj še ni produkcijsko

- ni strežniškega podatkovnega sistema;
- e-poštni naslov partnerjev je samo predlog;
- ni avtentikacije ali administratorskega dashboarda;
- ni končnih pravnih dokumentov;
- ocenjevalna pravila mora pred javno uporabo pregledati strokovnjak za ogrevalne sisteme;
- ni integracije z analitiko, CRM-jem, e-pošto ali plačili;
- ime in domena še nista pravno oziroma registrarsko potrjena.

## Priporočena produkcijska arhitektura

Za validacijsko fazo:

- frontend: statična stran na Cloudflare Pages ali Vercel;
- podatki in avtentikacija: Supabase;
- strežniška logika: Supabase Edge Functions;
- e-pošta: Resend ali Postmark;
- interna obdelava: Supabase tabela + preprost zaščiten dashboard;
- analitika: Plausible ali ustrezno konfiguriran GA4;
- obrazci: lastna API pot, ne nezaščiten javni e-poštni obrazec.

## Naslednji razvojni korak

1. strokovni pregled vprašalnika in uteži;
2. potrditev imena in domene;
3. izdelava podatkovnega modela in varne oddaje;
4. dashboard za sprejem/zavrnitev leadov;
5. avtomatsko generiranje poročila in e-poštno obveščanje;
6. pilot s petimi izvajalci v Posavju in Dolenjski.
