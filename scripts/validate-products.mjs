#!/usr/bin/env node
/**
 * Validates src/data/products.json.
 * Runs as part of `npm run build`, so a broken product stops the build with a
 * readable message instead of quietly shipping a broken page.
 *
 * Checks:
 *   - every required field is present
 *   - ids are unique
 *   - affiliate links look like real URLs
 *   - dateAdded is YYYY-MM-DD
 *   - the image file actually exists inside /public
 */
import path from 'node:path';
import {
  ROOT,
  PRODUCTS_PATH,
  readProducts,
  validateProducts,
  printValidationErrors,
} from './lib.mjs';

const products = readProducts();
const { errors } = validateProducts(products);

if (errors.length > 0) {
  console.error(`✖ Product check failed for ${path.relative(ROOT, PRODUCTS_PATH)}\n`);
  printValidationErrors(errors);
  console.error('Fix the entries above, then run "npm run validate" to check again.\n');
  process.exit(1);
}

console.log(`✔ Validated ${products.length} product${products.length === 1 ? '' : 's'} — no problems found.`);
