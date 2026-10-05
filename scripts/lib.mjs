/**
 * Shared helpers for the Hari Finds maintenance scripts.
 * These scripts run in plain Node (no build step) so they stay approachable.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** Project root (one level above /scripts). */
export const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
export const PRODUCTS_PATH = path.join(ROOT, 'src', 'data', 'products.json');
export const PUBLIC_DIR = path.join(ROOT, 'public');
export const IMAGES_DIR = path.join(PUBLIC_DIR, 'images', 'products');

/** Fields that every product MUST have. */
export const REQUIRED_FIELDS = [
  'id',
  'title',
  'description',
  'image',
  'affiliateLink',
  'category',
  'dateAdded',
];

/** Human-friendly names for the required fields. */
export const FIELD_LABELS = {
  id: 'id (URL slug)',
  title: 'title',
  description: 'description',
  image: 'image (path inside /public)',
  affiliateLink: 'affiliateLink',
  category: 'category',
  dateAdded: 'dateAdded',
};

export function readProducts() {
  if (!existsSync(PRODUCTS_PATH)) {
    console.error(`✖ Could not find ${path.relative(ROOT, PRODUCTS_PATH)}`);
    process.exit(1);
  }
  const raw = readFileSync(PRODUCTS_PATH, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('top level value must be an array');
    return parsed;
  } catch (error) {
    console.error(`✖ ${path.relative(ROOT, PRODUCTS_PATH)} is not valid JSON: ${error.message}`);
    process.exit(1);
  }
}

export function writeProducts(list) {
  writeFileSync(PRODUCTS_PATH, `${JSON.stringify(list, null, 2)}\n`, 'utf8');
}

/** "Stainless Steel Chopper!" -> "stainless-steel-chopper" */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** A slug that is guaranteed not to collide with existing ids. */
export function uniqueId(baseSlug, existingIds) {
  let slug = baseSlug || 'find';
  let counter = 2;
  while (existingIds.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return slug;
}

/** Today's date as YYYY-MM-DD (local time). */
export function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Turn "/images/products/x.jpg" into an absolute path inside /public. */
export function imagePublicPath(image) {
  return path.join(PUBLIC_DIR, String(image).replace(/^\//, ''));
}

export function fileExists(filePath) {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/** List the image files currently available in public/images/products. */
export function listAvailableImages() {
  if (!existsSync(IMAGES_DIR)) return [];
  return readdirSync(IMAGES_DIR)
    .filter((file) => /\.(jpe?g|png|webp|avif)$/i.test(file))
    .sort();
}

/**
 * Validate a list of products.
 * Returns { errors: string[], warnings: string[] }.
 * @param {any[]} list
 * @param {{ checkImages?: boolean, offset?: number }} options
 */
export function validateProducts(list, options = {}) {
  const { checkImages = true } = options;
  const errors = [];
  const warnings = [];
  const seenIds = new Map();

  list.forEach((product, index) => {
    const label = product && product.title ? `"${product.title}"` : `item ${index + 1}`;

    if (!product || typeof product !== 'object' || Array.isArray(product)) {
      errors.push(`products[${index}]: must be an object`);
      return;
    }

    // Required fields ------------------------------------------------------
    for (const field of REQUIRED_FIELDS) {
      const value = product[field];
      if (value === undefined || value === null || String(value).trim() === '') {
        errors.push(`products[${index}] ${label}: missing required field "${FIELD_LABELS[field] || field}"`);
      }
    }

    // Types ----------------------------------------------------------------
    if (product.tags !== undefined && !Array.isArray(product.tags)) {
      errors.push(`products[${index}] ${label}: "tags" must be an array of words`);
    }
    if (product.pros !== undefined && !Array.isArray(product.pros)) {
      errors.push(`products[${index}] ${label}: "pros" must be an array of short points`);
    }
    if (product.featured !== undefined && typeof product.featured !== 'boolean') {
      errors.push(`products[${index}] ${label}: "featured" must be true or false`);
    }

    // Link ---------------------------------------------------------------
    if (typeof product.affiliateLink === 'string' && product.affiliateLink.trim() !== '') {
      if (!/^https?:\/\//i.test(product.affiliateLink)) {
        errors.push(`products[${index}] ${label}: "affiliateLink" must start with http:// or https://`);
      }
    }

    // Date ---------------------------------------------------------------
    if (typeof product.dateAdded === 'string' && product.dateAdded.trim() !== '') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(product.dateAdded)) {
        errors.push(`products[${index}] ${label}: "dateAdded" must look like 2026-10-05`);
      }
    }

    // Duplicate ids --------------------------------------------------------
    if (typeof product.id === 'string' && product.id.trim() !== '') {
      if (seenIds.has(product.id)) {
        errors.push(`products[${index}] ${label}: duplicate id "${product.id}" (also used by products[${seenIds.get(product.id)}])`);
      } else {
        seenIds.set(product.id, index);
      }
    }

    // Image file ----------------------------------------------------------
    if (checkImages && typeof product.image === 'string' && product.image.trim() !== '') {
      const absolute = imagePublicPath(product.image);
      if (!fileExists(absolute)) {
        errors.push(`products[${index}] ${label}: image not found -> public${product.image}`);
      }
    }
  });

  return { errors, warnings };
}

/** Nicely print validation problems and exit with status 1. */
export function printValidationErrors(errors) {
  console.error(`\n✖ Found ${errors.length} problem${errors.length === 1 ? '' : 's'}:\n`);
  for (const error of errors) console.error(`   • ${error}`);
  console.error('');
}
