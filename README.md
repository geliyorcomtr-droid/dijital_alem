# dijital alem — Ana Sayfa prototipi

Bu depo, **dijital alem** Ana Sayfa arayüzünün statik prototipini içerir.

## Çalıştırma

```bash
npm run preview
```

`http://localhost:5173` — veya `index.html` dosyasını doğrudan açın.

## İçerik

- `index.html` — sayfa yapısı
- `styles.css` — stiller
- `app.js` — etkileşimler
- `assets/` — runtime görseller (WebP 1×/2× + JPG/PNG fallback)
- `scripts/optimize-images.mjs` — görsel optimizasyonu
- `docs/image-slots.md` — slot boyut haritası

## Görsel ekleme / güncelleme

1. Tam çözünürlüklü dosyayı `assets/.../<ad>-src.png` olarak koyun.
2. Çalıştırın: `npm run optimize:images`
3. HTML yalnızca `*-1x.webp`, `*.webp` (2×) ve `.jpg` / logo için `.png` kullanır — `*-src` runtime’da yok.

İzleme modu: `npm run optimize:images:watch`

Ayrıntılı boyut tablosu: [docs/image-slots.md](docs/image-slots.md).
