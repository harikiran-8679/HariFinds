#!/usr/bin/env node
/**
 * `npm run add` — interactive helper that appends ONE product.
 *
 * It asks for each field, generates the URL slug automatically, stamps today's
 * date, refuses duplicate ids and checks that the image file exists.
 */
import readline from 'node:readline';
import { stdin, stdout } from 'node:process';
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

// Simple line queue on top of readline. Unlike rl.question() it also works
// when the answers arrive faster than the next prompt is drawn (piped input),
// and it stops cleanly when the input runs out.
const rl = readline.createInterface({ input: stdin });
const lineQueue = [];
const lineWaiters = [];
let inputClosed = false;

rl.on('line', (line) => {
  const waiter = lineWaiters.shift();
  if (waiter) waiter(line);
  else lineQueue.push(line);
});
rl.on('close', () => {
  inputClosed = true;
  while (lineWaiters.length > 0) lineWaiters.shift()(null);
});

/** Print a prompt and return the next line of input (null at end of input). */
function readLine(prompt) {
  stdout.write(prompt);
  if (lineQueue.length > 0) return Promise.resolve(lineQueue.shift());
  if (inputClosed) return Promise.resolve(null);
  return new Promise((resolve) => lineWaiters.push(resolve));
}

const ask = async (question) => {
  const line = await readLine(question);
  if (line === null) {
    console.log('\n✖ Input ended before every question was answered — nothing was saved.');
    process.exit(1);
  }
  return line.trim();
};

const askRequired = async (question) => {
  for (;;) {
    const answer = await ask(question);
    if (answer) return answer;
    console.log('   ↳ This one is required, please type something.\n');
  }
};
const askYesNo = async (question, defaultYes = false) => {
  for (;;) {
    const answer = (await ask(question)).toLowerCase();
    if (!answer) return defaultYes;
    if (['y', 'yes'].includes(answer)) return true;
    if (['n', 'no'].includes(answer)) return false;
    console.log('   ↳ Please answer y or n.\n');
  }
};
const splitList = (value, separator = ',') =>
  value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);

async function main() {
  const products = readProducts();
  const existingIds = new Set(products.map((product) => product.id));
  const existingCategories = [...new Set(products.map((product) => product.category))].sort();

  console.log('\n──────────────────────────────────────────────');
  console.log('  Hari Finds — add a new product');
  console.log('──────────────────────────────────────────────\n');
  console.log('Tip: put your image in public/images/products/ FIRST, then run this.\n');

  // --- Required fields -----------------------------------------------------
  const title = await askRequired('Product title: ');
  const description = await askRequired(
    'Description (2-3 honest sentences, why is it useful?):\n> ',
  );
  const affiliateLink = await askRequired('Affiliate link (https://amzn.to/... or amazon.in): ');
  if (!/^https?:\/\//i.test(affiliateLink)) {
    console.error('\n✖ The affiliate link must start with http:// or https://');
    process.exit(1);
  }

  // --- Category (pick an existing one or type a new one) -------------------
  console.log('\nCategory — pick a number or type a new category name:');
  existingCategories.forEach((category, index) => {
    console.log(`  ${index + 1}. ${category}`);
  });
  let category = await askRequired('Category: ');
  const chosenIndex = Number.parseInt(category, 10);
  if (
    String(chosenIndex) === category &&
    chosenIndex >= 1 &&
    chosenIndex <= existingCategories.length
  ) {
    category = existingCategories[chosenIndex - 1];
  }
  console.log(`   ↳ Using category: ${category}`);

  // --- Optional fields -----------------------------------------------------
  const tags = splitList(await ask('Tags (comma separated, optional, e.g. gift, under-500): '));
  const pros = splitList(await ask('Pros (semicolon separated, optional): '), ';');
  const priceNote = await ask('Price note (optional, a RANGE only, e.g. "Under ₹500"): ');

  // --- Image ---------------------------------------------------------------
  let image = '';
  const available = listAvailableImages();
  for (;;) {
    const imageAnswer = await askRequired(
      'Image filename in public/images/products/ (e.g. my-product.jpg): ',
    );
    const filename = path.basename(imageAnswer);
    const candidate = `/images/products/${filename}`;
    if (fileExists(imagePublicPath(candidate))) {
      image = candidate;
      break;
    }
    console.log(`\n   ⚠ public/images/products/${filename} does not exist yet.`);
    if (available.length > 0) {
      console.log(`   Available files: ${available.join(', ')}\n`);
    } else {
      console.log('   The folder is empty — add your image file there first.\n');
    }
    if (!(await askYesNo('   Add the product anyway? (the build will fail until the image exists) [y/N]: '))) {
      continue;
    }
    image = candidate;
    break;
  }

  const featured = await askYesNo('\nFeature this product on the homepage? [y/N]: ');

  // --- Assemble and save ---------------------------------------------------
  const baseSlug = slugify(title);
  const id = uniqueId(baseSlug, existingIds);
  if (id !== baseSlug) {
    console.log(`   ↳ "${baseSlug}" already exists, using "${id}" instead.`);
  }

  const product = {
    id,
    title,
    description,
    image,
    affiliateLink,
    category,
    ...(tags.length > 0 ? { tags } : {}),
    ...(pros.length > 0 ? { pros } : {}),
    ...(priceNote ? { priceNote } : {}),
    dateAdded: todayISO(),
    featured,
  };

  // Never write something the build would reject.
  const { errors } = validateProducts([product], { checkImages: false });
  if (errors.length > 0) {
    console.error('\n✖ The entry is incomplete, nothing was saved:\n');
    printValidationErrors(errors);
    process.exit(1);
  }

  products.push(product);
  writeProducts(products);

  console.log('\n✔ Added:');
  console.log(`   id      ${product.id}`);
  console.log(`   title   ${product.title}`);
  console.log(`   image   ${product.image}`);
  console.log(`   saved   ${path.relative(ROOT, 'src/data/products.json')}`);
  console.log('\nNext: run "npm run dev" and open the product page to check it.\n');
}

try {
  await main();
} catch (error) {
  console.error('\n✖ Something went wrong:', error.message);
  process.exitCode = 1;
} finally {
  rl.close();
}
