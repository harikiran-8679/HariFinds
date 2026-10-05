/**
 * Small helper library around src/data/products.json.
 * All pages import from here instead of reading the JSON directly, so the
 * logic for categories, sorting and related products lives in ONE place.
 */
import rawProducts from '../data/products.json';

export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  affiliateLink: string;
  category: string;
  tags?: string[];
  pros?: string[];
  priceNote?: string;
  dateAdded: string;
  featured?: boolean;
}

/** All products, always kept in the order they appear in products.json. */
export const products: Product[] = rawProducts as Product[];

/** Newest first - the default order used across the site. */
export function sortByNewest(list: Product[]): Product[] {
  return [...list].sort((a, b) => {
    const diff = new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    // Fall back to the title so the order is stable when dates are equal.
    return diff !== 0 ? diff : a.title.localeCompare(b.title);
  });
}

/** "Home & Kitchen" -> "home-kitchen" (used for /category/[slug]/ URLs). */
export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface CategoryInfo {
  name: string;
  slug: string;
  count: number;
}

/** Every unique category with its slug and product count, sorted A-Z. */
export function getCategories(): CategoryInfo[] {
  const map = new Map<string, number>();
  for (const product of products) {
    map.set(product.category, (map.get(product.category) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, slug: categorySlug(name), count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return sortByNewest(products.filter((p) => p.category === category));
}

export function getFeaturedProducts(): Product[] {
  return sortByNewest(products.filter((p) => p.featured));
}

/**
 * Products from the same category, excluding the current one.
 * Falls back to other recent finds so the section is never empty.
 */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameCategory = sortByNewest(
    products.filter((p) => p.category === product.category && p.id !== product.id),
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const fillers = sortByNewest(
    products.filter((p) => p.category !== product.category && p.id !== product.id),
  );
  return [...sameCategory, ...fillers].slice(0, limit);
}

/** "2026-10-05" -> "5 October 2026" */
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Amazon links are pasted in full into products.json. If an amazon.in link is
 * missing its Associates tag we add it automatically; amzn.to short links
 * already contain the tag and are left untouched.
 */
export function withAssociatesTag(link: string, tag: string): string {
  try {
    const url = new URL(link);
    const isShort = url.hostname.includes('amzn.to') || url.hostname.includes('amzn.in');
    if (isShort) return link;
    if (url.hostname.includes('amazon.') && !url.searchParams.has('tag')) {
      url.searchParams.set('tag', tag);
      return url.toString();
    }
    return link;
  } catch {
    // Not a valid URL - return exactly what the author wrote.
    return link;
  }
}

/** Attributes every affiliate link must carry (Amazon Associates requirement). */
export const AFFILIATE_LINK_ATTRS = {
  target: '_blank',
  rel: 'sponsored nofollow noopener',
} as const;

/** Absolute URL helper used for canonical links, OG images and JSON-LD. */
export function absoluteUrl(path: string, siteUrl: string): string {
  return new URL(path, siteUrl).toString();
}
