# Hari Finds

**Handpicked Amazon finds, worth your money.**

A small, fast, hand-curated Amazon affiliate product discovery site for shoppers in
India. Every product gets its own page here, and every page links straight to
Amazon.in.

Built with [Astro](https://astro.build), plain CSS and a tiny bit of vanilla
JavaScript for the search box. No database, no backend, no paid services, no paid
fonts. It builds to plain HTML and deploys free on Cloudflare Pages.

---

## Table of contents

1. [What this project is](#1-what-this-project-is)
2. [Run it on your computer](#2-run-it-on-your-computer)
3. [How to add a new product](#3-how-to-add-a-new-product)
4. [How to import many products at once](#4-how-to-import-many-products-at-once)
5. [How to write a new guide](#5-how-to-write-a-new-guide)
6. [Changing site settings](#6-changing-site-settings-srcconfigts)
7. [Free deployment with Cloudflare Pages](#7-free-deployment-with-cloudflare-pages)
8. [Free SEO checklist](#8-free-seo-checklist)
9. [Amazon Associates reminder](#9-amazon-associates-reminder)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. What this project is

A **static website**. When it builds, it becomes a folder of `.html` files. There
is no server, no login and nothing that can "go down" — which is why it can run
entirely on free tiers.

### Folder structure

```
HariFinds/
├─ data/
│  └─ import.csv                 # Sample CSV for bulk imports (see section 3c)
├─ public/                       # Files copied to the site exactly as they are
│  ├─ favicon.svg
│  ├─ robots.txt                 # Tells search engines where the sitemap is
│  └─ images/
│     ├─ og-default.jpg          # Default social share image
│     └─ products/               # ← YOUR PRODUCT IMAGES GO HERE
│        ├─ stainless-steel-veg-chopper.jpg
│        └─ ...
├─ scripts/                      # The helper commands (npm run add, etc.)
│  ├─ lib.mjs                    # Shared helpers used by all scripts
│  ├─ validate-products.mjs      # Runs before every build; fails on bad data
│  ├─ add-product.mjs            # `npm run add`
│  ├─ add-bulk.mjs               # `npm run add-bulk`
│  ├─ optimize-images.mjs        # `npm run optimize-images`
│  └─ generate-placeholders.mjs  # `npm run placeholders`
├─ src/
│  ├─ config.ts                  # ← ALL SITE SETTINGS LIVE HERE
│  ├─ content.config.ts          # Defines the "guides" content collection
│  ├─ content/
│  │  └─ guides/                 # ← YOUR GUIDES (Markdown) GO HERE
│  │     └─ kitchen-upgrades-worth-it.md
│  ├─ data/
│  │  └─ products.json           # ← ALL PRODUCTS LIVE IN THIS ONE FILE
│  ├─ components/                # Reusable pieces (header, footer, cards…)
│  ├─ layouts/
│  │  └─ BaseLayout.astro        # The HTML shell: <head>, SEO tags, header, footer
│  ├─ lib/
│  │  └─ products.ts             # Helpers for reading products.json
│  ├─ pages/                     # Every file here becomes a page on the site
│  │  ├─ index.astro             # /
│  │  ├─ products.astro          # /products/
│  │  ├─ category/[slug].astro   # /category/home-kitchen/ (auto-generated)
│  │  ├─ product/[id].astro      # /product/veg-chopper/ (auto-generated)
│  │  ├─ guides/index.astro      # /guides/
│  │  ├─ guides/[slug].astro     # /guides/my-guide/ (auto-generated)
│  │  ├─ about.astro             # /about
│  │  ├─ privacy.astro           # /privacy
│  │  ├─ disclosure.astro        # /disclosure
│  │  └─ 404.astro               # Custom "page not found"
│  └─ styles/
│     └─ global.css              # The whole design system (colours, cards, dark mode)
├─ astro.config.mjs              # Astro settings (site URL, sitemap)
├─ tsconfig.json
└─ package.json                  # The npm commands
```

**The two files you will touch most often:**

| Want to change… | Edit this |
| --- | --- |
| Products | `src/data/products.json` |
| Site name, URL, Associates tag | `src/config.ts` |

### What is on the site

| Page | What it does |
| --- | --- |
| `/` | Hero + search, featured finds, category chips, latest finds, about blurb |
| `/products/` | Every product, with instant search, category filter and sorting |
| `/category/<slug>/` | One page per category, generated automatically |
| `/product/<id>/` | Big image, description, pros, "View on Amazon" button, related finds |
| `/guides/` | Index of your Markdown guides |
| `/guides/<slug>/` | A guide article with product cards inside it |
| `/about`, `/privacy`, `/disclosure` | The boring-but-required pages |
| `/404` | Friendly "not found" page with a search box |

---

## 2. Run it on your computer

**You need:** [Node.js](https://nodejs.org) version 20 or newer (22 recommended).
Check with `node --version`.

```bash
# 1. Install the free tools this project needs (one time only)
npm install

# 2. Start a local preview server
npm run dev
```

Now open <http://localhost:4321> in your browser. The page reloads automatically
whenever you save a file. Press `Ctrl + C` in the terminal to stop it.

### Other commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local preview with live reload |
| `npm run build` | Checks your data, then builds the final site into `dist/` |
| `npm run preview` | Serves the built `dist/` folder, so you can test the real thing |
| `npm run validate` | Only checks `products.json` (fast, no full build) |
| `npm run check` | Type-checks all the `.astro` and `.ts` files |
| `npm run add` | Interactive: add one product |
| `npm run add-bulk` | Add many products from `data/import.csv` |
| `npm run optimize-images` | Convert your images to WebP and shrink them |
| `npm run placeholders` | Regenerate the placeholder images (safe to delete later) |

> **The site currently ships with 6 placeholder products and generated placeholder
> images.** Delete them once you add your own. See section 3d.

---

## 3. How to add a new product

Every product is one object inside **`src/data/products.json`**. Here is what
each field means:

```jsonc
{
  "id": "stainless-steel-veg-chopper",   // REQUIRED. The URL: /product/<id>/
  "title": "Stainless Steel Vegetable Chopper",  // REQUIRED
  "description": "2-3 honest sentences about why it is useful.", // REQUIRED
  "image": "/images/products/stainless-steel-veg-chopper.jpg",   // REQUIRED
  "affiliateLink": "https://amzn.to/xxxxxxx",  // REQUIRED. Your Associates link
  "category": "Home & Kitchen",          // REQUIRED. New categories are fine
  "tags": ["kitchen", "under-500"],      // optional. Used by search + tag links
  "pros": ["Short point", "Short point"],// optional. Shown as a tick list
  "priceNote": "Under ₹500",             // optional. A RANGE only, never a live price
  "dateAdded": "2026-10-05",             // REQUIRED. YYYY-MM-DD
  "featured": false                      // optional. true = show on the homepage
}
```

> ⚠️ **Never put a live or exact price here.** Amazon Associates India rules (and
> Amazon's API terms) mean prices shown on your site can quickly become wrong.
> Use a rough range like `"Under ₹500"` or `"₹500 – ₹800"`.

### a) The easy way — `npm run add`

```bash
# 1. Save your product image first
#    (copy it into public/images/products/, e.g. my-new-find.jpg)

# 2. Run the helper
npm run add
```

It asks you a few questions:

```
Product title: Magnetic Cable Organizer Clips (6 pack)
Description (2-3 honest sentences, why is it useful?):
> Small magnetic clips that keep charging cables exactly where you need them.
Affiliate link (https://amzn.to/... or amazon.in): https://amzn.to/4hAriF02

Category — pick a number or type a new category name:
  1. Beauty & Personal Care
  2. Electronics
  3. Fitness
  4. Home & Kitchen
Category: 2
Tags (comma separated, optional, e.g. gift, under-500): desk,under-500,gift
Pros (semicolon separated, optional): No tools needed;Strong adhesive;Works with USB-C
Price note (optional, a RANGE only, e.g. "Under ₹500"): Under ₹300
Image filename in public/images/products/ (e.g. my-product.jpg): my-new-find.jpg
Feature this product on the homepage? [y/N]: y
```

The script will:

- generate the `id` from the title (`my-new-find`),
- set `dateAdded` to today,
- refuse to save if a required field is empty or the link is not a URL,
- make the id unique if you already have a product with the same title
  (`my-new-find-2`),
- warn you if the image file is not in `public/images/products/` yet,
- append the product to `products.json` for you.

### b) The manual way — edit `products.json`

Open `src/data/products.json`, scroll to the end, add a comma after the last `}`
and paste this template:

```json
  {
    "id": "my-new-find",
    "title": "My New Find",
    "description": "Two or three honest sentences about why this is useful and worth the money.",
    "image": "/images/products/my-new-find.jpg",
    "affiliateLink": "https://amzn.to/xxxxxxxx",
    "category": "Home & Kitchen",
    "tags": ["gift", "under-500"],
    "pros": ["Point one", "Point two"],
    "priceNote": "Under ₹500",
    "dateAdded": "2026-10-05",
    "featured": false
  }
```

Rules to remember:

- The file is **JSON**: every `"key"` and `"string"` needs double quotes.
- Every product is separated by a comma, but **no comma after the very last one**.
- `image` must start with `/images/products/` and the file must exist in
  `public/images/products/`.
- `id` must be unique, lowercase and use hyphens (it becomes the URL).

Check your work with:

```bash
npm run validate
```

### c) The bulk way — CSV import

Useful when importing a lot of products at once.

1. Copy all your images into `public/images/products/`.
2. Open **`data/import.csv`** (there are two example rows in it).
3. One row per product, using this header:

   ```csv
   title,description,affiliateLink,category,tags,imageFile,pros,priceNote,featured
   ```

   - `tags` and `pros` are separated with **semicolons** inside the cell
     (`gift;under-500`).
   - `imageFile` is just the file name (`chopper.jpg`).
   - **Wrap any cell containing a comma in double quotes.**
4. Run:

   ```bash
   npm run add-bulk
   ```

The import is **all-or-nothing**: if one row is wrong, nothing is saved and every
problem is listed, like this:

```
✖ Import stopped — 2 row(s) need fixing. Nothing was saved:

   • row 2 ("Bad Row One"): image not found -> public/images/products/does-not-exist.jpg
      available: bamboo-hair-comb.jpg, silicone-spatula-set.jpg, ...
   • row 3: missing title
```

Fix the CSV and run it again. You can also point it at a different file:

```bash
npm run add-bulk -- path/to/other.csv
```

> The sample `data/import.csv` ships with 2 demo rows that become real products
> when you run `npm run add-bulk`. It is a safe way to try the command, but you
> probably want to clear those rows out before doing a real import.

### d) Removing the placeholder products

Delete the 6 objects from `src/data/products.json`, then delete these files from
`public/images/products/`:

```
stainless-steel-veg-chopper.jpg   magnetic-cable-organizer.jpg
silicone-spatula-set.jpg          dimmable-led-desk-lamp.jpg
insulated-water-bottle-1l.jpg     bamboo-hair-comb.jpg
sample-ceramic-planter.jpg        sample-desk-organizer.jpg
```

You can also delete `scripts/generate-placeholders.mjs` and the
`"placeholders"` line in `package.json` — or leave them, they do no harm.

### e) The complete workflow, start to finish

This is the loop you will repeat for every new find:

```bash
# 1. Save the product image
#    Copy it into public/images/products/ and give it a short name, e.g.
#    public/images/products/veg-chopper.jpg

# 2. Add the product
npm run add

# 3. Optional but recommended: shrink the images (converts them to WebP)
npm run optimize-images

# 4. Preview it locally
npm run dev
#    Open http://localhost:4321 and click around. Check:
#      - the image shows up
#      - the "View on Amazon" button opens your link in a new tab
#      - the product appears on /products/ and its category page

# 5. Save your work to GitHub
git add .
git commit -m "Add vegetable chopper"
git push

# 6. Cloudflare Pages notices the push and rebuilds the site.
#    Your new find is live in about a minute.
```

> **Tip:** `npm run optimize-images` converts every JPEG/PNG in
> `public/images/products/` to WebP (max 1000px wide) and rewrites the paths in
> `products.json` automatically. Smaller images = a faster site, which matters
> because most of your visitors arrive on a phone.
> Use `npm run optimize-images --keep` if you want to keep the originals too.

---

## 4. How to import many products at once

If you have a batch of products ready — say a shelf of things you have just
photographed — importing them in one go is much faster than running
`npm run add` again and again:

1. **Collect the product photos.**
   Save each photo into `public/images/products/` with a simple name like
   `cable-clips.jpg`.

2. **Make your Amazon links.**
   In the [Amazon Associates](https://affiliate-program.amazon.in) site, use
   **Product Linking → Short links** (or the SiteStripe bar) to create a link for
   each product. These look like `https://amzn.to/xxxxxxx`. Paste those into the
   CSV — never shorten them through a different service.

3. **Fill in the CSV.**
   Open `data/import.csv` and add one row per product:

   ```csv
   title,description,affiliateLink,category,tags,imageFile,pros,priceNote,featured
   Cable Organizer Clips,Keeps charging cables exactly where you need them and off the floor.,https://amzn.to/4hAriF02,Electronics,desk;under-500;gift,cable-clips.jpg,No tools needed;Strong adhesive,Under ₹300,false
   ```

   Write the description in your own words — see section 9.

4. **Import them.**

   ```bash
   npm run add-bulk
   npm run optimize-images
   npm run dev
   ```

5. **Check the pages.**
   Open `/products/` and confirm each one appears with the right photo, category
   and Amazon link. Every product also gets its own page at
   `https://harifinds.pages.dev/product/<id>/` — that is the link to share
   anywhere you post about it.

---

## 5. How to write a new guide

Guides are Markdown files in **`src/content/guides/`**. A guide can list product
ids in its frontmatter, and those products are rendered as cards inside the
article.

1. Create a file, for example `src/content/guides/desk-setup-under-1000.md`.
2. Start it with this block:

   ```markdown
   ---
   title: 'A tidy desk setup under ₹1,000'
   description: 'Four small upgrades that make a desk feel calmer — all under ₹1,000.'
   date: 2026-10-06
   # updated: 2026-11-01        # optional
   # cover: /images/og-default.jpg   # optional social share image
   products:
     - magnetic-cable-organizer
     - dimmable-led-desk-lamp
   ---

   Opening paragraph in your own words.

   ## First section

   Normal **Markdown** works here: headings, lists, links, quotes, images.

   > A blockquote looks like this.

   ## Another section

   - Bullet one
   - Bullet two
   ```

3. Save the file. The guide appears automatically at
   `/guides/desk-setup-under-1000/` and on `/guides/`.

**Rules:**

- `title`, `description` and `date` are required.
- `products` must contain the exact `id` values from `products.json`. If you
  mistype one, it is silently skipped (so a typo can never break the build) — so
  do check the page.
- The file name becomes the URL. `desk-setup-under-1000.md` →
  `/guides/desk-setup-under-1000/`.
- The affiliate disclosure is added to every guide automatically. You do not need
  to write it yourself.
- Every guide gets `Article` structured data and a breadcrumb trail for Google.

---

## 6. Changing site settings (`src/config.ts`)

Open **`src/config.ts`**. Everything you might want to personalise is in one
object:

```ts
export const SITE = {
  url: 'https://harifinds.pages.dev',   // your live address (no trailing slash)
  name: 'Hari Finds',
  tagline: 'Handpicked Amazon finds, worth your money',
  description: 'A longer sentence used as the default meta description.',
  email: 'hello@harifinds.pages.dev',
  amazonAssociatesTag: 'harifinds-21',
  defaultOgImage: '/images/og-default.jpg',
  verification: {
    google: '',      // paste the content="" value from Google Search Console
    bing: '',        // paste the content="" value from Bing Webmaster Tools
  },
};
```

| I want to change… | Do this |
| --- | --- |
| The site name | Change `name`. It updates the header, footer, titles, structured data. |
| My Associates tag | Change `amazonAssociatesTag`. |
| My domain | Change `url` **and** `site` in `astro.config.mjs` **and** the `Sitemap:` line in `public/robots.txt`. |

Older `amazon.in` links that are missing a `tag=` parameter get your Associates
tag added automatically. `amzn.to` short links already contain it and are left
exactly as you pasted them.

---

## 7. Free deployment with Cloudflare Pages

Everything below is free forever for a site this size.

### Step 1 — Put the code on GitHub

```bash
# Inside the HariFinds folder
git init
git add .
git commit -m "First commit: Hari Finds"
git branch -M main
```

Then create an **empty** repository on <https://github.com/new> (do not add a
README) and connect it:

```bash
git remote add origin https://github.com/YOUR-USERNAME/harifinds.git
git push -u origin main
```

### Step 2 — Connect Cloudflare Pages

1. Sign up free at <https://dash.cloudflare.com> (no card needed).
2. In the sidebar go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Authorise GitHub and pick your `harifinds` repository.
4. Use these build settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | **Astro** |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | *(leave empty)* |

5. Click **Save and Deploy**. The first build takes a minute or two.

You now have a free address like **`https://harifinds.pages.dev`**. Every time you
`git push`, Cloudflare rebuilds and the change is live in about a minute.

> If your `src/config.ts` URL does not match the address Cloudflare gave you,
> change it and push again — canonical links, the sitemap and social previews all
> use it.

### Step 3 — (Optional, later) a custom domain

You do **not** need one to start. When you are ready:

1. Buy a domain (Cloudflare Registrar sells them at cost).
2. In Cloudflare Pages → your project → **Custom domains → Set up a custom
   domain** and follow the prompts.
3. Update the URL in **all three** places: `src/config.ts` (`url`),
   `astro.config.mjs` (`site`) and `public/robots.txt` (the `Sitemap:` line).
4. Commit and push. Add the new domain in Google Search Console and Bing.

---

## 8. Free SEO checklist

Do these once. They cost nothing and they matter far more than any SEO plugin.

### Google Search Console

1. Go to <https://search.google.com/search-console> and add a **URL prefix**
   property: `https://harifinds.pages.dev`.
2. Choose the **HTML tag** verification method and copy only the `content="…"`
   value, e.g. `ABC123xyz`.
3. Paste it into `SITE.verification.google` in `src/config.ts`, then commit and
   push. Cloudflare redeploys, and you can click **Verify**.
4. In Search Console open **Sitemaps** and submit:
   `https://harifinds.pages.dev/sitemap-index.xml`
5. Use **URL Inspection** on your homepage and click **Request indexing**.

### Bing Webmaster Tools

1. Go to <https://www.bing.com/webmasters> and sign in. You can import your site
   directly from Google Search Console (easiest), or verify with the meta tag:
   copy the `content="…"` value into `SITE.verification.bing`.
2. Submit the same sitemap URL.

### Check your structured data

1. Run <https://search.google.com/test/rich-results> on a product page and a guide.
2. You will see `Product`, `BreadcrumbList`, `Article`, `Organization` and
   `WebSite` data. Because this site deliberately shows no prices and no copied
   ratings (see section 9), Google may report that a Product is "missing
   `offers`" — that is expected and intentional, not an error to fix.

### Other quick wins

- Write a unique `title` and `description` for every guide (the pages do this for
  you automatically).
- Use descriptive image alt text — this is generated from the product title for
  you.
- Link between pages: product → category → related products → guides. All of this
  is already wired up.
- Keep the sitemap fresh: nothing to do, it is regenerated on every build.

---

## 9. Amazon Associates reminder

The rules below are already built into the site. Keep them in mind when you add
content.

1. **Register the website.** In Amazon Associates India go to
   **Account Settings → Manage your websites** and add
   `harifinds.pages.dev`. You must do this or your links will not track.
2. **The disclosure must be visible.** The sentence
   *"As an Amazon Associate I earn from qualifying purchases."* appears in the
   footer of every page, on every product page and on every guide, and there is a
   full `/disclosure` page. Do not remove it.
3. **Never show live or exact prices.** Only your manual `priceNote` ranges.
   Prices on Amazon change constantly and stale prices break the programme
   agreement.
4. **Never copy star ratings or review counts** from Amazon. This site shows none.
5. **No Amazon logos.** Buttons say "Amazon" as plain text only.
6. **Never cloak or redirect links.** Affiliate links point straight at
   `amzn.to` / `amazon.in`. Every affiliate link carries
   `rel="sponsored nofollow noopener"` and opens in a new tab.
7. **Write your own descriptions.** Do not copy Amazon's bullet points or
   description text.
8. **Keep earning.** You need qualifying sales within a set window or your
   account is closed — so add products regularly and update the site often.

---

## 10. Troubleshooting

### `npm run build` fails with "✖ Found N problems"

The build deliberately refuses to ship broken data. The message tells you exactly
which entry is wrong, for example:

```
✖ Found 3 problems:

   • products[0] "Stainless Steel Vegetable Chopper": image not found -> public/images/products/ghost.jpg
   • products[1] "Magnetic Cable Organizer Clips (6 pack)": missing required field "description"
   • products[3] "Dimmable LED Desk Lamp with USB Port": duplicate id "dimmable-led-desk-lamp" (also used by products[2])
```

Run `npm run validate` at any time to check without a full build.

### "This file is not valid JSON"

`products.json` has a typo — usually a missing comma, an extra comma after the last
item, or a missing double quote. Paste the file into
<https://jsonlint.com> to find the exact line. Or check with:

```bash
npm run validate
```

### My image does not show up

- The file must be inside **`public/images/products/`**.
- The `"image"` value must start with a slash: `"/images/products/name.jpg"`.
- File names are case-sensitive: `Chopper.jpg` ≠ `chopper.jpg`.
- Run `npm run validate` — it tells you if the file is missing.

### The site in `dist/` is missing my new product

You changed the data but did not rebuild. Run `npm run build` (or use
`npm run dev` while you work).

### Cloudflare Pages build fails

- Check the build command is `npm run build` and the output directory is `dist`.
- Open the failing build → **View build log** and read the last few lines. If it
  is the product validation message above, fix your data and push again.
- Make sure `node_modules/` and `dist/` are **not** committed (`.gitignore` already
  handles this).

### The search box finds nothing

Search matches the title, description, category and tags. Check the word you are
typing appears in one of those. Filters are reset with the **Clear filters**
button.

### Images are huge and the site feels slow

```bash
npm run optimize-images
```

This shrinks every image to at most 1000px wide and converts it to WebP. Run
`npm run validate` afterwards.

### I cannot see the placeholder images / they look wrong

```bash
npm run placeholders
```

regenerates them.

### `npm run add` stops halfway

Nothing was saved. Re-run `npm run add` and answer the questions again — the script
only writes to `products.json` once, at the very end.

### I want to start over from the placeholders

The placeholder products are listed in `src/data/products.json` and use images in
`public/images/products/`. Delete the objects you do not want; delete the matching
image files too.

---

## Licence and credits

Built for personal use. Amazon and the Amazon logo are trademarks of Amazon.com,
Inc. or its affiliates — this site is not endorsed by Amazon beyond the Associates
programme.
