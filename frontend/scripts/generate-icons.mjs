/**
 * generate-icons.mjs
 * Run with: node scripts/generate-icons.mjs
 *
 * Generates light version favicons and PWA app icons:
 * 1. Extracts logo emblem cleanly with alpha transparency
 * 2. Generates transparent favicons (favicon.png, favicon-32x32, favicon-16x16)
 * 3. Generates crisp white-background PWA icons (icon-72x72 through icon-512x512, apple-touch-icon)
 * 4. Generates light-themed app screenshots
 */

import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'icons');
mkdirSync(OUT_DIR, { recursive: true });

// Determine source image
let sourcePath = join(ROOT, 'public', 'icons', 'icon-512x512.png');
if (!existsSync(sourcePath)) {
  sourcePath = join(ROOT, 'public', 'logo.png');
}

console.log(`🔍 Using source icon: ${sourcePath}`);

// Extract emblem and handle transparency
const { data, info } = await sharp(sourcePath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const pixels = new Uint8Array(data);
const bgR = 7, bgG = 18, bgB = 45; // Dark navy background (#07122d)

let isDarkBgSource = false;
// Sample corners to check if source has dark background
const corners = [0, (info.width - 1) * 4, ((info.height - 1) * info.width) * 4, ((info.height - 1) * info.width + info.width - 1) * 4];
for (const idx of corners) {
  if (Math.abs(pixels[idx] - bgR) < 15 && Math.abs(pixels[idx + 1] - bgG) < 15 && Math.abs(pixels[idx + 2] - bgB) < 15) {
    isDarkBgSource = true;
    break;
  }
}

if (isDarkBgSource) {
  console.log('🧹 Removing dark navy background (#07122d)...');
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

    if (dist <= 5) {
      pixels[i + 3] = 0;
    } else if (dist < 35) {
      const alphaFactor = (dist - 5) / 30;
      pixels[i + 3] = Math.round(pixels[i + 3] * alphaFactor);
    }
  }
}

// Trim whitespace/transparent borders to center emblem tightly
const emblemBuffer = await sharp(Buffer.from(pixels), {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim()
  .png()
  .toBuffer();

const emblemMeta = await sharp(emblemBuffer).metadata();
console.log(`✅ Emblem extracted (${emblemMeta.width}x${emblemMeta.height}px)`);

// 1. Save transparent favicons
const favicon32 = await sharp(emblemBuffer)
  .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp(favicon32).toFile(join(OUT_DIR, 'favicon-32x32.png'));
await sharp(favicon32).toFile(join(ROOT, 'public', 'favicon.png'));

const favicon16 = await sharp(emblemBuffer)
  .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp(favicon16).toFile(join(OUT_DIR, 'favicon-16x16.png'));

console.log('✅ Generated light transparent favicons (favicon.png, favicon-32x32.png, favicon-16x16.png)');

// 2. Generate PWA Icons (Light version: clean pure white #ffffff background)
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of SIZES) {
  const padding = Math.round(size * 0.12);
  const iconSize = size - padding * 2;

  const resizedEmblem = await sharp(emblemBuffer)
    .resize(iconSize, iconSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  // White background for light theme
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: resizedEmblem, left: padding, top: padding }])
    .png()
    .toFile(join(OUT_DIR, `icon-${size}x${size}.png`));

  console.log(`✅ Generated icon-${size}x${size}.png (light)`);
}

// 3. Apple Touch Icon (180x180 with clean white background)
const appleSize = 180;
const applePad = Math.round(appleSize * 0.12);
const appleEmblem = await sharp(emblemBuffer)
  .resize(appleSize - applePad * 2, appleSize - applePad * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();

await sharp({
  create: { width: appleSize, height: appleSize, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
})
  .composite([{ input: appleEmblem, left: applePad, top: applePad }])
  .png()
  .toFile(join(OUT_DIR, 'apple-touch-icon.png'));

console.log('✅ Generated apple-touch-icon.png (light)');

// 4. Screenshots with light background
const screenshotDir = join(ROOT, 'public', 'screenshots');
mkdirSync(screenshotDir, { recursive: true });

for (const { name, w, h } of [
  { name: 'desktop.png', w: 1280, h: 800 },
  { name: 'mobile.png',  w: 390,  h: 844 },
]) {
  const iconSize = Math.round(Math.min(w, h) * 0.25);
  const left = Math.round((w - iconSize) / 2);
  const top  = Math.round((h - iconSize) / 2);

  const icon = await sharp(emblemBuffer)
    .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: { width: w, height: h, channels: 4, background: { r: 248, g: 250, b: 252, alpha: 1 } },
  })
    .composite([{ input: icon, left, top }])
    .png()
    .toFile(join(screenshotDir, name));
  console.log(`✅ Generated screenshots/${name} (light)`);
}

console.log('\n🎉 All light version PWA assets and favicons successfully generated!');
