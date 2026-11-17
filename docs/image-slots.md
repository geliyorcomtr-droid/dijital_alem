# Image slots (display size map)

All runtime images are exported at **1× display px** + **2×**, WebP quality ~82, with JPG (or PNG for logo) fallback. Full-res uploads live as `*-src.*` and are **gitignored** — never referenced from HTML.

## How to add / replace an image

1. Save the upload as `assets/<folder>/<name>-src.png` (same stem as the slot).
2. Run:

```bash
npm install
npm run optimize:images
```

Optional watch mode (re-exports when any `*-src.*` changes):

```bash
npm run optimize:images:watch
```

Single slot:

```bash
node scripts/optimize-images.mjs --only=kesfet/tarihi-mekanlar
```

Outputs per slot (example `kesfet/tarihi-mekanlar`, 115×130):

| File | Size |
|------|------|
| `*-1x.webp` | 115×130 |
| `*.webp` | 230×260 (2×) |
| `*.jpg` | 230×260 (fallback) |

Config source of truth: `scripts/image-slots.mjs`.

## Size map (from `styles.css` / `index.html`)

| Slot key | Section | 1× (px) | 2× (px) | Notes |
|----------|---------|---------|---------|-------|
| `banner-akilli-oneri` | Hero carousel | 361×132 | 722×264 | `.hero` |
| `banner-cilingir` | Hero carousel | 361×132 | 722×264 | |
| `banner-temizlik` | Hero carousel | 361×132 | 722×264 | |
| `banner-ev-yasam` | Hero carousel | 361×132 | 722×264 | |
| `hizli-erisim/*` | Hizmetler | 76×100 | 152×200 | 5 tiles; aspect 76/100 |
| `yakin-hizmetler/*` | Etkinlikler | 85×110 | 170×220 | 4 tiles; aspect 85/110 |
| `sehrimden/sehrimden-haberler` | Şehrimden | 361×82 | 722×164 | full-width banner |
| `firsat/*` | Fırsat | 115×82 | 230×164 | 3 tiles; aspect 115/82 |
| `yeme-icme/yeme-icme` | Yeme & İçme | 361×82 | 722×164 | full-width banner |
| `kesfet/*` | Keşfet | 115×130 | 230×260 | 3 tiles; height 130 |
| `ilanlar/*` | İlanlar | 175×82 | 350×164 | 2 tiles; aspect 175/82 |
| `sosyal-dayanisma/sosyal-dayanisma` | Sosyal & Dayanışma | 361×82 | 722×164 | full-width banner (above Acil Destek) |
| `acil-destek/*` | Acil Destek | 115×82 | 230×164 | 3 tiles; aspect 115/82 |
| `11-logo` | Header brand | 288×96 | 576×192 | contain; PNG fallback |

Content width reference: `--content: 361px` (phone canvas 393 with 16px side padding).
