#!/usr/bin/env node
/**
 * `npm run add-bulk` — imports many products from data/import.csv.
 *
 * CSV columns (header row required):
 *   title,description,affiliateLink,category,tags,imageFile
 *
 * - tags are separated with a semicolon inside the cell, e.g. "gift;under-500"
 * - imageFile can be just the file name ("chopper.jpg") or a full path
 *   ("/images/products/chopper.jpg"). Files are looked up in
 *   public/images/products/.
 *
 * The import is atomic: if ANY row has a problem, nothing is written and every
 * problem is listed so you can fix the CSV and run it again.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  ROOT,
  readProducts,
  writeProducts,
  slugify,
  uniqueId,
  todayISO,
  imagePublicPath,
  fileExists,
  listAvailableImages,
  validateProducts,
  printValidationErrors,
} from './lib.mjs';

const csvPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'data', 'import.csv');

/** Minimal CSV parser that understands quoted fields, commas and "" escapes. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Drop completely empty lines.
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ''));
}

/** "chopper.jpg" or "/images/products/chopper.jpg" -> "/images/products/chopper.jpg" */
function normaliseImagePath(value) {
  const clean = value.trim();
  if (clean.startsWith('/images/products/')) return clean;
  return `/images/products/${path.basename(clean)}`;
}

function main() {
  let csv;
  try {
    csv = readFileSync(csvPath, 'utf8');
  } catch {
    console.error(`✖ Could not read ${path.relative(ROOT, csvPath)}`);
    console.error('  Create the file (a sample lives in data/import.csv) and try again.');
    process.exit(1);
  }

  const rows = parseCsv(csv);
  if (rows.length < 2) {
    console.error('✖ The CSV needs a header row plus at least one product row.');
    process.exit(1);
  }

  const [header, ...dataRows] = rows;
  const columns = header.map((name) => name.trim());
  for (const required of ['title', 'description', 'affiliateLink', 'category', 'imageFile']) {
    if (!columns.includes(required)) {
      console.error(`✖ The CSV header is missing the "${required}" column.`);
      console.error(`  Found: ${columns.join(', ')}`);
      process.exit(1);
    }
  }

  const products = readProducts();
  const existingIds = new Set(products.map((product) => product.id));
  const problems = [];
  const created = [];

  dataRows.forEach((cells, index) => {
    const rowNumber = index + 2; // +1 for header, +1 because rows start at 1
    const record = {};
    columns.forEach((column, columnIndex) => {
      record[column] = (cells[columnIndex] ?? '').trim();
    });

    const missing = ['title', 'description', 'affiliateLink', 'category', 'imageFile'].filter(
      (field) => !record[field],
    );
    if (missing.length > 0) {
      problems.push(`row ${rowNumber}: missing ${missing.join(', ')}`);
      return;
    }

    if (!/^https?:\/\//i.test(record.affiliateLink)) {
      problems.push(`row ${rowNumber} ("${record.title}"): affiliateLink must start with http(s)://`);
      return;
    }

    const image = normaliseImagePath(record.imageFile);
    if (!fileExists(imagePublicPath(image))) {
      problems.push(
        `row ${rowNumber} ("${record.title}"): image not found -> public${image}` +
          (listAvailableImages().length
            ? `\n      available: ${listAvailableImages().join(', ')}`
            : '\n      public/images/products/ is empty — add your images first'),
      );
      return;
    }

    const baseSlug = slugify(record.title);
    if (!baseSlug) {
      problems.push(`row ${rowNumber}: the title does not produce a usable URL slug`);
      return;
    }

    const id = uniqueId(baseSlug, existingIds);
    existingIds.add(id);

    const tags = (record.tags ?? '')
      .split(/[;|]/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    const pros = (record.pros ?? '')
      .split(/[;|]/)
      .map((point) => point.trim())
      .filter(Boolean);

    created.push({
      id,
      title: record.title,
      description: record.description,
      image,
      affiliateLink: record.affiliateLink,
      category: record.category,
      ...(tags.length > 0 ? { tags } : {}),
      ...(pros.length > 0 ? { pros } : {}),
      ...(record.priceNote ? { priceNote: record.priceNote } : {}),
      dateAdded: record.dateAdded || todayISO(),
      featured: /^(true|yes|1)$/i.test(record.featured ?? ''),
    });
  });

  if (problems.length > 0) {
    console.error(`\n✖ Import stopped — ${problems.length} row(s) need fixing. Nothing was saved:\n`);
    problems.forEach((problem) => console.error(`   • ${problem}`));
    console.error('\nFix data/import.csv and run "npm run add-bulk" again.\n');
    process.exit(1);
  }

  const merged = [...products, ...created];

  // Final safety net: the merged file must pass the same checks as the build.
  const { errors } = validateProducts(merged);
  if (errors.length > 0) {
    console.error('\n✖ Import stopped — the merged file would be invalid:\n');
    printValidationErrors(errors);
    process.exit(1);
  }

  writeProducts(merged);

  console.log(`\n✔ Imported ${created.length} product(s):`);
  for (const product of created) {
    console.log(`   • ${product.id}  (${product.title})`);
  }
  console.log(`\nTotal products now: ${merged.length}`);
  console.log('Next: run "npm run dev" to preview.\n');
}

main();
