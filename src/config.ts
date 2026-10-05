/**
 * ---------------------------------------------------------------------------
 *  HARI FINDS - SINGLE SITE CONFIGURATION
 * ---------------------------------------------------------------------------
 *  Everything you may want to personalise lives in this one file.
 *  Change a value here and it updates across the whole website.
 * ---------------------------------------------------------------------------
 */

export const SITE = {
  /** Your live website address. No trailing slash.
   *  Default is the free Cloudflare Pages address.
   *  If you add a custom domain later (e.g. https://harifinds.com),
   *  change it here AND in astro.config.mjs AND public/robots.txt. */
  url: 'https://harifinds.harikiran8679.workers.dev',

  /** The name shown in the header, page titles and structured data. */
  name: 'Hari Finds',

  /** Short tagline used in the hero and meta descriptions. */
  tagline: 'Handpicked Amazon finds, worth your money',

  /** Longer description used as the default meta description. */
  description:
    'Hari Finds is a hand-curated collection of useful Amazon finds for shoppers in India — kitchen gadgets, home upgrades, gadgets and everyday essentials worth your money.',

  /** Your public contact email (shown on the About page). */
  email: 'harikiran.b2007@gmail.com',

  /** Amazon Associates India tracking tag.
   *  It is included in links automatically only if a link is missing its tag.
   *  Always paste full amzn.to / amazon.in links into products.json. */
  amazonAssociatesTag: 'mrhari00-21',

  /** Default social share image (lives in /public/images/). */
  defaultOgImage: '/images/og-default.jpg',

  /** Accent colour is defined in src/styles/global.css (--accent). */

  /** -------------------------------------------------------------------
   *  SEARCH ENGINE VERIFICATION CODES
   *  Paste ONLY the content value of the meta tag, not the whole tag.
   *  Example: for
   *    <meta name="google-site-verification" content="ABC123" />
   *  put "ABC123" below.
   *  ------------------------------------------------------------------- */
  verification: {
    /** Google Search Console -> HTML tag method. */
    google: '6Fpjoe8DsRa767jOu2coHGFLmUhtbHlJuwTGkWofZjA',
    /** Bing Webmaster Tools -> <meta name="msvalidate.01" ...>. */
    bing: '',
  },
} as const;

/** Standard Amazon Associates India compliance sentence.
 *  It is rendered in the footer of every page and on product/guide pages. */
export const AFFILIATE_DISCLOSURE =
  'As an Amazon Associate I earn from qualifying purchases.';
