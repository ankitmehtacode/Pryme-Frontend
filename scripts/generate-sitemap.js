import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SITE_URL, STATIC_ROUTES, loadBlogSlugs } from './public-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.resolve(__dirname, '../public/sitemap.xml');

function buildSitemap(slugs) {
  const urls = [
    ...STATIC_ROUTES.map(
      (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    ),
    ...slugs.map(
      (slug) => `  <url>
    <loc>${SITE_URL}/blogs/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    ),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

try {
  const slugs = loadBlogSlugs();
  fs.writeFileSync(OUTPUT_PATH, buildSitemap(slugs));
  console.log(`sitemap.xml generated with ${STATIC_ROUTES.length + slugs.length} URLs`);
} catch (err) {
  // A stale/missing sitemap is a minor SEO regression, not a reason to fail
  // the whole app build -- warn loudly and let the build continue.
  console.warn('generate-sitemap.js failed, skipping sitemap generation:', err.message);
}
