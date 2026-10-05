#!/usr/bin/env node
/**
 * `npm run optimize-images`
 *
 * For every image in public/images/products/:
 *   - resizes it down to a maximum width of 1000px (never enlarges)
 *   - converts it to WebP (smaller files = faster mobile browsing)
 *   - deletes the original once the WebP exists
 *   - rewrites the matching "image" path in src/data/products.json to the .webp
 *
 * Pass --keep to leave the original files on disk.
 * Uses "sharp", a free open-source image library (no paid service).
 */
import { readdirSync, unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT, IMAGES_DIR, readProducts, writeProducts } from './lib.mjs';

const MAX_WIDTH = 1000;
const WEBP_QUALITY = 82;
const keepOriginals = process.argv.includes('--keep');

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error('✖ The "sharp" package is not installed.');
  console.error('  Run "npm install" first, then try again.');
  process.exit(1);
}

if (!existsSync(IMAGES_DIR)) {
  console.error(`✖ Folder not found: ${path.relative(ROOT, IMAGES_DIR)}`);
  process.exit(1);
}

const sourceFiles = readdirSync(IMAGES_DIR).filter((file) => /\.(jpe?g|png|tiff?|avif)$/i.test(file));

if (sourceFiles.length === 0) {
  console.log('Nothing to do — no JPEG/PNG images found in public/images/products/.');
  process.exit(0);
}

const products = readProducts();
/** image path -> new webp path, used to rewrite products.json */
const pathMap = new Map();
let converted = 0;
let skipped = 0;

for (const file of sourceFiles) {
  const inputPath = path.join(IMAGES_DIR, file);
  const outputName = `${file.replace(/\.[^.]+$/, '')}.webp`;
  const outputPath = path.join(IMAGES_DIR, outputName);

  try {
    const image = sharp(inputPath, { failOn: 'none' });
    const metadata = await image.metadata();
    const shouldResize = (metadata.width ?? 0) > MAX_WIDTH;

    await image
      .rotate() // apply EXIF orientation
      .resize({ width: shouldResize ? MAX_WIDTH : undefined, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath);

    if (!keepOriginals) unlinkSync(inputPath);

    pathMap.set(`/images/products/${file}`, `/images/products/${outputName}`);
    converted += 1;
    console.log(
      `   ✔ ${file} → ${outputName}${shouldResize ? ` (resized from ${metadata.width}px)` : ''}`,
    );
  } catch (error) {
    skipped += 1;
    console.warn(`   ⚠ Could not process ${file}: ${error.message}`);
  }
}

// Point products.json at the new WebP files.
let updated = 0;
for (const product of products) {
  const newPath = pathMap.get(product.image);
  if (newPath) {
    product.image = newPath;
    updated += 1;
  }
}
if (updated > 0) writeProducts(products);

console.log(`\n✔ Done. Converted ${converted} image(s), updated ${updated} product path(s).`);
if (skipped > 0) console.log(`   ${skipped} file(s) were skipped — see the warnings above.`);
console.log('Now run "npm run validate" to confirm every product still has its image.\n');
