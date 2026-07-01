/**
 * generate-icons.mjs
 * Run with: node scripts/generate-icons.mjs
 *
 * 1. Removes white/near-white background from the source PNG
 * 2. Generates all required PWA icon sizes into public/icons/
 * No splash screens (removed per user request).
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// The user-supplied logo (most recent upload)
const SOURCE = 'C:/Users/UTKARSH/.gemini/antigravity/brain/406e0d7d-7904-4de4-b673-79a0a2ab2b5a/media__1782401603049.png';

const OUT_DIR = join(ROOT, 'public', 'icons');
mkdirSync(OUT_DIR, { recursive: true });

/* ──────────────────────────────────────────────────────────
   Step 1: Remove white background
   Strategy: get raw RGBA pixels, mark near-white pixels
   (R>230 & G>230 & B>230) as fully transparent.
   ────────────────────────────────────────────────────────── */

const { data, info } = await sharp(SOURCE)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info; // channels === 4 (RGBA)
const pixels = new Uint8Array(data);

for (let i = 0; i < pixels.length; i += 4) {
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];

  // Near-white threshold — adjust if needed
  if (r > 230 && g > 230 && b > 230) {
    pixels[i + 3] = 0; // fully transparent
  }
}

// Rebuild as transparent PNG
const transparentPng = await sharp(Buffer.from(pixels), {
  raw: { width, height, channels },
})
  .png()
  .toBuffer();

console.log('✅  White background removed');

/* ──────────────────────────────────────────────────────────
   Step 2: Generate icon sizes
   All icons use a dark navy (#07122d) background so they
   look great on both light and dark OS home screens,
   and also a transparent version for any maskable usage.
   ────────────────────────────────────────────────────────── */

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of SIZES) {
  // Padding: icon fills ~80% of the frame, 10% padding each side
  const padding = Math.round(size * 0.1);
  const iconSize = size - padding * 2;

  const resizedIcon = await sharp(transparentPng)
    .resize(iconSize, iconSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  // Version with navy background (for non-maskable usage)
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 7, g: 18, b: 45, alpha: 1 },
    },
  })
    .composite([{ input: resizedIcon, left: padding, top: padding }])
    .png()
    .toFile(join(OUT_DIR, `icon-${size}x${size}.png`));

  console.log(`✅  icon-${size}x${size}.png`);
}

// Also save the transparent version for favicon usage (no background)
const transparentResized = await sharp(transparentPng)
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

// Save as a dedicated transparent icon for favicon
await sharp(transparentResized)
  .resize(32, 32)
  .toFile(join(OUT_DIR, 'favicon-32x32.png'));

await sharp(transparentResized)
  .resize(16, 16)
  .toFile(join(OUT_DIR, 'favicon-16x16.png'));

// Also copy transparent 512 for the apple-touch-icon (will show on light OS)
await sharp(transparentPng)
  .resize(180, 180, { fit: 'contain', background: { r: 7, g: 18, b: 45, alpha: 1 } })
  .png()
  .toFile(join(OUT_DIR, 'apple-touch-icon.png'));

console.log('✅  favicon-32x32.png');
console.log('✅  favicon-16x16.png');
console.log('✅  apple-touch-icon.png');

// Screenshots placeholders (required by manifest)
const screenshotDir = join(ROOT, 'public', 'screenshots');
mkdirSync(screenshotDir, { recursive: true });

for (const { name, w, h } of [
  { name: 'desktop.png', w: 1280, h: 800 },
  { name: 'mobile.png',  w: 390,  h: 844 },
]) {
  const iconSize = Math.round(Math.min(w, h) * 0.25);
  const left = Math.round((w - iconSize) / 2);
  const top  = Math.round((h - iconSize) / 2);

  const icon = await sharp(transparentPng)
    .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: { width: w, height: h, channels: 4, background: { r: 7, g: 18, b: 45, alpha: 1 } },
  })
    .composite([{ input: icon, left, top }])
    .png()
    .toFile(join(screenshotDir, name));
  console.log(`✅  screenshots/${name}`);
}

console.log('\n🎉  All PWA assets generated in public/icons/ and public/screenshots/');
