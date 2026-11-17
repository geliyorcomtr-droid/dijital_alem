/**
 * Display-size map for Ana Sayfa image slots (1× CSS/HTML px).
 * 2× exports are width*2 × height*2.
 * Source: styles.css aspect-ratio / fixed heights + index.html width/height.
 */
export const WEBP_QUALITY = 82;
export const JPG_QUALITY = 82;

/** @typedef {{ w: number, h: number, fit?: 'cover'|'contain', fallback?: 'jpg'|'png', position?: string, scale2x?: boolean }} Slot */

/** @type {Record<string, Slot>} */
export const SLOTS = {
  // Hero carousel — CSS .hero 361×132
  'banner-akilli-oneri': { w: 361, h: 132, fit: 'cover' },
  'banner-cilingir': { w: 361, h: 132, fit: 'cover' },
  'banner-temizlik': { w: 361, h: 132, fit: 'cover' },
  'banner-ev-yasam': { w: 361, h: 132, fit: 'cover' },

  // Hizmetler — aspect 76/100
  'hizli-erisim/saglik': { w: 76, h: 100, fit: 'cover' },
  'hizli-erisim/ev-yasam': { w: 76, h: 100, fit: 'cover' },
  'hizli-erisim/egitim-kurslar': { w: 76, h: 100, fit: 'cover' },
  'hizli-erisim/cilingir': { w: 76, h: 100, fit: 'cover' },
  'hizli-erisim/temizlik': { w: 76, h: 100, fit: 'cover' },

  // Etkinlikler — aspect 85/110
  'yakin-hizmetler/tiyatro': { w: 85, h: 110, fit: 'cover' },
  'yakin-hizmetler/konser': { w: 85, h: 110, fit: 'cover' },
  'yakin-hizmetler/cocuk-etkinligi': { w: 85, h: 110, fit: 'cover' },
  'yakin-hizmetler/festival': { w: 85, h: 110, fit: 'cover' },

  // Full-width banners — aspect 361/82
  'sehrimden/sehrimden-haberler': { w: 361, h: 82, fit: 'cover' },
  'yeme-icme/yeme-icme': { w: 361, h: 82, fit: 'cover' },
  'sosyal-dayanisma/sosyal-dayanisma': { w: 361, h: 82, fit: 'cover' },

  // Fırsat — aspect 115/82
  'firsat/geliyor-tr': { w: 115, h: 82, fit: 'cover' },
  'firsat/egitim': { w: 115, h: 82, fit: 'cover' },
  'firsat/aksaray-kesfet': { w: 115, h: 82, fit: 'cover' },

  // Keşfet — 115×130 fixed
  'kesfet/sehrin-populer-noktalari': { w: 115, h: 130, fit: 'cover' },
  'kesfet/tarihi-mekanlar': { w: 115, h: 130, fit: 'cover' },
  'kesfet/gezilecek-yerler': { w: 115, h: 130, fit: 'cover' },

  // İlanlar — aspect 175/82
  'ilanlar/ilanlar': { w: 175, h: 82, fit: 'cover' },
  'ilanlar/is-kariyer': { w: 175, h: 82, fit: 'cover' },

  // Acil Destek — aspect 115/152
  'acil-destek/112': { w: 115, h: 152, fit: 'cover' },
  'acil-destek/nobetci-eczane': { w: 115, h: 152, fit: 'cover' },
  'acil-destek/acil-hizmetler': { w: 115, h: 152, fit: 'cover' },

  // Brand logo — HTML 288×96 (CSS height 48, contain); no 2× upscale (single webp+png in HTML)
  '11-logo': { w: 288, h: 96, fit: 'contain', fallback: 'png', scale2x: false },
};
