#!/usr/bin/env node
/**
 * Drop-in image optimizer for dijital_alem Ana Sayfa.
 *
 * Usage:
 *   1. Drop a full-res upload as: assets/<slot>/<name>-src.png
 *   2. npm run optimize:images
 *   3. Runtime uses only *-1x.webp, *.webp (2×), *.jpg|*.png — never *-src.*
 *
 *   npm run optimize:images:watch   # re-run when *-src.* changes
 *   node scripts/optimize-images.mjs --only=kesfet/tarihi-mekanlar
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import sharp from 'sharp';
import { SLOTS, WEBP_QUALITY, JPG_QUALITY } from './image-slots.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');

const args = process.argv.slice(2);
const WATCH = args.includes('--watch');
const ONLY = args.find((a) => a.startsWith('--only='))?.slice('--only='.length);
const FROM_DERIV = args.includes('--from-derivatives');

const SRC_RE = /-src\.(png|jpe?g|webp)$/i;

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function slotKeyFromSrc(absPath) {
  const rel = path.relative(ASSETS, absPath).replace(/\\/g, '/');
  return rel.replace(SRC_RE, '');
}

function findSrcForSlot(slotKey) {
  const base = path.join(ASSETS, slotKey);
  const dir = path.dirname(base);
  const stem = path.basename(base);
  if (!fs.existsSync(dir)) return null;
  const candidates = [`${stem}-src.png`, `${stem}-src.jpg`, `${stem}-src.jpeg`, `${stem}-src.webp`];
  for (const name of candidates) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function findDerivativeSource(slotKey) {
  const base = path.join(ASSETS, slotKey);
  for (const ext of ['.webp', '.jpg', '.jpeg', '.png']) {
    const p = base + ext;
    if (fs.existsSync(p) && !p.includes('-1x')) return p;
  }
  const oneX = `${base}-1x.webp`;
  if (fs.existsSync(oneX)) return oneX;
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Replace dest with tmp using PowerShell (more reliable than node fs on locked Windows files). */
function promoteWithPowerShell(tmp, dest) {
  const script = `
    $dest = '${dest.replace(/'/g, "''")}'
    $tmp = '${tmp.replace(/'/g, "''")}'
    if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Force -ErrorAction Stop }
    Move-Item -LiteralPath $tmp -Destination $dest -Force -ErrorAction Stop
  `;
  const r = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-Command', script],
    { encoding: 'utf8' },
  );
  if (r.status !== 0) {
    throw new Error((r.stderr || r.stdout || `powershell exit ${r.status}`).trim());
  }
}

/** Write buffer to dest via temp file + retries (Windows file locks / preview servers). */
async function writeFileAtomic(dest, buffer) {
  const tmp = `${dest}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, buffer);
  let lastErr;
  for (let i = 0; i < 10; i++) {
    try {
      if (process.platform === 'win32') {
        promoteWithPowerShell(tmp, dest);
      } else {
        try {
          fs.unlinkSync(dest);
        } catch {
          /* missing ok */
        }
        fs.renameSync(tmp, dest);
      }
      return;
    } catch (err) {
      lastErr = err;
      await sleep(200 + i * 125);
    }
  }
  const alt = `${dest}.optimized`;
  try {
    fs.renameSync(tmp, alt);
  } catch {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
  throw new Error(
    `Could not replace ${dest}: ${lastErr?.message || lastErr}. Sidecar ${alt} may exist — re-run after closing preview.`,
  );
}

async function exportSlot(slotKey, srcPath, slot) {
  const fit = slot.fit ?? 'cover';
  const position = slot.position ?? 'centre';
  const fallback = slot.fallback ?? 'jpg';
  const outBase = path.join(ASSETS, slotKey);
  const outDir = path.dirname(outBase);
  fs.mkdirSync(outDir, { recursive: true });

  const w1 = slot.w;
  const h1 = slot.h;
  const scale2x = slot.scale2x !== false;
  const w2 = scale2x ? slot.w * 2 : slot.w;
  const h2 = scale2x ? slot.h * 2 : slot.h;

  // Copy source to OS temp first so Windows/OneDrive does not keep the asset path locked
  const tmpSrc = path.join(
    os.tmpdir(),
    `dijital-alem-${path.basename(srcPath)}-${process.pid}-${Date.now()}`,
  );
  fs.copyFileSync(srcPath, tmpSrc);
  let input;
  try {
    input = await sharp(tmpSrc, { failOn: 'none' }).rotate().toBuffer();
  } finally {
    try {
      fs.unlinkSync(tmpSrc);
    } catch {
      /* ignore */
    }
  }
  const pipeline = () => sharp(input);

  const oneXPath = `${outBase}-1x.webp`;
  const twoXWebp = `${outBase}.webp`;
  const fallbackPath = fallback === 'png' ? `${outBase}.png` : `${outBase}.jpg`;

  const twoXWebpBuf = await pipeline()
    .resize(w2, h2, { fit, position, withoutEnlargement: false })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();

  let fallbackBuf;
  if (fallback === 'png') {
    fallbackBuf = await pipeline()
      .resize(w2, h2, { fit, position, withoutEnlargement: false })
      .png({ compressionLevel: 9 })
      .toBuffer();
  } else {
    fallbackBuf = await pipeline()
      .resize(w2, h2, { fit, position, withoutEnlargement: false })
      .jpeg({ quality: JPG_QUALITY, mozjpeg: true })
      .toBuffer();
  }

  const written = [];
  if (scale2x) {
    const oneXBuf = await pipeline()
      .resize(w1, h1, { fit, position, withoutEnlargement: false })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer();
    await writeFileAtomic(oneXPath, oneXBuf);
    written.push(oneXPath);
  }
  await writeFileAtomic(twoXWebp, twoXWebpBuf);
  await writeFileAtomic(fallbackPath, fallbackBuf);
  written.push(twoXWebp, fallbackPath);

  const sizes = written.map((p) => ({
    file: path.relative(ROOT, p).replace(/\\/g, '/'),
    bytes: fs.statSync(p).size,
  }));

  return { slotKey, src: path.relative(ROOT, srcPath).replace(/\\/g, '/'), sizes, dims: { w1, h1, w2, h2 } };
}

async function optimizeAll() {
  const results = [];
  const missing = [];
  const unknownSrc = [];

  let keys = ONLY ? [ONLY] : Object.keys(SLOTS);
  // Process slots that have *-src first (highest value), then derivative re-encodes
  if (!ONLY) {
    keys = [...keys].sort((a, b) => {
      const as = findSrcForSlot(a) ? 0 : 1;
      const bs = findSrcForSlot(b) ? 0 : 1;
      return as - bs || a.localeCompare(b);
    });
  }

  const failed = [];

  for (const key of keys) {
    const slot = SLOTS[key];
    if (!slot) {
      console.error(`Unknown slot: ${key}`);
      process.exitCode = 1;
      continue;
    }

    // Prefer *-src upload; fall back to existing derivative so a first slim pass works
    let src = findSrcForSlot(key);
    let usedDerivative = false;
    if (!src) {
      src = findDerivativeSource(key);
      usedDerivative = !!src;
    }

    if (!src) {
      missing.push(key);
      continue;
    }

    try {
      const result = await exportSlot(key, src, slot);
      result.usedDerivative = usedDerivative;
      results.push(result);
    } catch (err) {
      failed.push({ key, err: err.message || String(err) });
      console.error(`  FAIL ${key}: ${err.message || err}`);
      process.exitCode = 1;
    }
  }

  // Warn about *-src files that are not in the map
  for (const file of walk(ASSETS)) {
    if (!SRC_RE.test(file)) continue;
    const key = slotKeyFromSrc(file);
    if (!SLOTS[key]) unknownSrc.push(path.relative(ROOT, file).replace(/\\/g, '/'));
  }

  console.log('\nOptimized slots:');
  let outBytes = 0;
  for (const r of results) {
    const total = r.sizes.reduce((s, x) => s + x.bytes, 0);
    outBytes += total;
    const via = r.usedDerivative ? ' (from derivative)' : '';
    console.log(
      `  ${r.slotKey}  ${r.dims.w1}×${r.dims.h1} / ${r.dims.w2}×${r.dims.h2}${via}`,
    );
    for (const s of r.sizes) {
      console.log(`    ${s.file}  ${fmtBytes(s.bytes)}`);
    }
  }

  if (failed.length) {
    console.log('\nFailed slots:');
    for (const f of failed) console.log(`  ${f.key}: ${f.err}`);
  }
  if (missing.length) {
    console.log('\nSkipped (no *-src and no derivative):');
    for (const m of missing) console.log(`  ${m}`);
  }
  if (unknownSrc.length) {
    console.log('\nUnmapped *-src files (add to scripts/image-slots.mjs):');
    for (const u of unknownSrc) console.log(`  ${u}`);
  }

  const allAssets = walk(ASSETS);
  const runtime = allAssets.filter((f) => !SRC_RE.test(f));
  const srcFiles = allAssets.filter((f) => SRC_RE.test(f));
  const runtimeBytes = runtime.reduce((s, f) => s + fs.statSync(f).size, 0);
  const srcBytes = srcFiles.reduce((s, f) => s + fs.statSync(f).size, 0);

  console.log(`\nRuntime assets (excl. *-src): ${runtime.length} files, ${fmtBytes(runtimeBytes)}`);
  console.log(`Source uploads (*-src): ${srcFiles.length} files, ${fmtBytes(srcBytes)} (gitignored; not shipped)`);
  console.log(`This run wrote ${results.length} slots, ${fmtBytes(outBytes)} of derivatives.`);

  return results;
}

async function main() {
  console.log(`Assets root: ${ASSETS}`);
  console.log(`WebP quality: ${WEBP_QUALITY}, JPG quality: ${JPG_QUALITY}`);
  await optimizeAll();

  if (!WATCH) return;

  console.log('\nWatching assets/**/*-src.* …');
  let timer = null;
  const kick = (reason) => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      console.log(`\nChange detected (${reason}), re-optimizing…`);
      try {
        await optimizeAll();
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };

  fs.watch(ASSETS, { recursive: true }, (event, filename) => {
    if (!filename) return;
    if (SRC_RE.test(filename) || /[/\\].*-src\./i.test(filename)) {
      kick(filename);
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
