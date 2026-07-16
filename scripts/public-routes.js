import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SITE_URL = 'https://www.gopryme.tech';
const BLOGS_DATA_PATH = path.resolve(__dirname, '../src/data/blogs.ts');

// Only genuinely public, indexable marketing pages -- anything personalized,
// auth-gated, or state-dependent (offers, apply, dashboard, admin, etc.) is
// deliberately excluded and carries a noindex tag instead (see AppRoutes.tsx
// and each page's Helmet block). Shared by generate-sitemap.js and
// prerender.js so the two never drift out of sync.
export const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/services', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'monthly' },
  { path: '/blogs', priority: '0.8', changefreq: 'weekly' },
  { path: '/emi-calculator', priority: '0.7', changefreq: 'monthly' },
  { path: '/prepayment-calculator', priority: '0.7', changefreq: 'monthly' },
  { path: '/rewards-calculator', priority: '0.7', changefreq: 'monthly' },
  { path: '/faq', priority: '0.6', changefreq: 'monthly' },
  { path: '/careers', priority: '0.5', changefreq: 'monthly' },
  { path: '/grievance-redressal', priority: '0.3', changefreq: 'yearly' },
];

export function loadBlogSlugs() {
  // blogs.ts is plain data (no TypeScript-only syntax), so it can be
  // evaluated directly without pulling in a TS-execution dependency just
  // for these build steps.
  const src = fs.readFileSync(BLOGS_DATA_PATH, 'utf-8');
  const match = src.match(/export const blogs\s*=\s*(\[[\s\S]*\]);?\s*$/);
  if (!match) {
    throw new Error('Could not locate `export const blogs = [...]` in blogs.ts');
  }
  const blogs = new Function(`return ${match[1]}`)();
  return blogs.map((b) => b.slug);
}
