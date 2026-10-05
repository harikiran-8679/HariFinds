#!/usr/bin/env node
/**
 * `npm run placeholders`
 *
 * Creates simple, good-looking local placeholder images so the site works
 * immediately, before you add your own photos. Everything is generated with
 * sharp (free) — no stock photos, no external downloads.
 *
 * Run it again at any time; existing placeholder files are simply overwritten.
 * Once you use your own images you can delete this script and the files.
 */
import { mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT, IMAGES_DIR, PUBLIC_DIR } from './lib.mjs';

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error('✖ The "sharp" package is not installed. Run "npm install" first.');
  process.exit(1);
}

const WIDTH = 900;
const HEIGHT = 1200;
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const PLACEHOLDERS = [
  { file: 'stainless-steel-veg-chopper.jpg', label: 'Vegetable Chopper', note: 'Home & Kitchen', from: '#e5726b', to: '#b3392e' },
  { file: 'magnetic-cable-organizer.jpg', label: 'Cable Organizer Clips', note: 'Electronics', from: '#6fa8dc', to: '#2c5f8a' },
  { file: 'silicone-spatula-set.jpg', label: 'Silicone Spatula Set', note: 'Home & Kitchen', from: '#f0b357', to: '#c47a1b' },
  { file: 'dimmable-led-desk-lamp.jpg', label: 'LED Desk Lamp', note: 'Electronics', from: '#8e7cc3', to: '#4d3f7a' },
  { file: 'insulated-water-bottle-1l.jpg', label: 'Insulated Bottle 1 L', note: 'Fitness', from: '#63c9a8', to: '#23836b' },
  { file: 'bamboo-hair-comb.jpg', label: 'Bamboo Hair Comb', note: 'Beauty & Personal Care', from: '#d4a373', to: '#8a5a2b' },
  // Used by the sample data/import.csv so `npm run add-bulk` works out of the box.
  { file: 'sample-ceramic-planter.jpg', label: 'Ceramic Planter', note: 'Sample CSV import', from: '#7fb069', to: '#3f6b33' },
  { file: 'sample-desk-organizer.jpg', label: 'Desk Organizer', note: 'Sample CSV import', from: '#f78ca0', to: '#b03e55' },
];

/** Escape characters that would break the SVG ("Home & Kitchen" contains &). */
function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Break a label into short lines so the text fits on the image. */
function wrap(text, maxChars = 16) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines.slice(0, 3);
}

function productSvg({ label, note, from, to }) {
  const lines = wrap(label);
  const totalHeight = lines.length * 74;
  const startY = HEIGHT / 2 - totalHeight / 2 + 40;

  const textLines = lines
    .map(
      (line, index) =>
        `<text x="${WIDTH / 2}" y="${startY + index * 74}" text-anchor="middle" ` +
        `font-family="Helvetica, Arial, sans-serif" font-size="62" font-weight="700" fill="#ffffff">${escapeXml(line)}</text>`,
    )
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
    <circle cx="${WIDTH / 2}" cy="${startY - 110}" r="70" fill="#ffffff" opacity="0.18"/>
    <circle cx="${WIDTH / 2}" cy="${startY - 110}" r="34" fill="#ffffff" opacity="0.45"/>
    ${textLines}
    <text x="${WIDTH / 2}" y="${startY + lines.length * 74 + 24}" text-anchor="middle"
      font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="500"
      fill="#ffffff" opacity="0.9">${escapeXml(note)}</text>
    <text x="${WIDTH / 2}" y="${HEIGHT - 70}" text-anchor="middle"
      font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#ffffff"
      opacity="0.7">Placeholder image — replace with your own photo</text>
  </svg>`;
}

function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
    <defs>
      <linearGradient id="ogbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c0392b"/>
        <stop offset="100%" stop-color="#7c1f14"/>
      </linearGradient>
    </defs>
    <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#ogbg)"/>
    <text x="80" y="270" font-family="Helvetica, Arial, sans-serif" font-size="82"
      font-weight="700" fill="#ffffff">Hari Finds</text>
    <text x="80" y="350" font-family="Helvetica, Arial, sans-serif" font-size="40"
      fill="#ffffff" opacity="0.92">Handpicked Amazon finds, worth your money</text>
    <text x="80" y="470" font-family="Helvetica, Arial, sans-serif" font-size="30"
      fill="#ffffff" opacity="0.75">harifinds.pages.dev</text>
  </svg>`;
}

if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });

console.log('\nGenerating placeholder images…\n');

for (const placeholder of PLACEHOLDERS) {
  const output = path.join(IMAGES_DIR, placeholder.file);
  await sharp(Buffer.from(productSvg(placeholder))).jpeg({ quality: 88 }).toFile(output);
  console.log(`   ✔ public/images/products/${placeholder.file}`);
}

const ogOutput = path.join(PUBLIC_DIR, 'images', 'og-default.jpg');
await sharp(Buffer.from(ogSvg())).jpeg({ quality: 88 }).toFile(ogOutput);
console.log('   ✔ public/images/og-default.jpg');

console.log(`\n✔ Created ${PLACEHOLDERS.length + 1} placeholder images in ${path.relative(ROOT, PUBLIC_DIR)}/images/`);
console.log('  Delete this script and swap in your own photos whenever you are ready.\n');
