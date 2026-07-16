import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { preview } from 'vite';
import { chromium } from 'playwright';
import { STATIC_ROUTES, loadBlogSlugs } from './public-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const PREVIEW_PORT = 4174; // distinct from the port devs use for manual `npm run preview`

function outputPathFor(routePath) {
  if (routePath === '/') return path.join(DIST_DIR, 'index.html');
  return path.join(DIST_DIR, routePath.replace(/^\//, ''), 'index.html');
}

async function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.warn('prerender.js: dist/ not found, skipping (run after `vite build`)');
    return;
  }

  const routes = [
    ...STATIC_ROUTES.map((r) => r.path),
    ...loadBlogSlugs().map((slug) => `/blogs/${slug}`),
  ];

  const server = await preview({ preview: { port: PREVIEW_PORT }, logLevel: 'silent' });
  const baseUrl = server.resolvedUrls.local[0].replace(/\/$/, '');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  let ok = 0;
  for (const routePath of routes) {
    try {
      await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle', timeout: 15000 });
      // Small settle buffer for any final post-networkidle React render pass
      // (Helmet tag commits, last state update after data arrives).
      await page.waitForTimeout(200);
      const html = await page.content();

      const outPath = outputPathFor(routePath);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html);
      ok++;
    } catch (err) {
      console.warn(`prerender.js: failed to prerender ${routePath}:`, err.message);
    }
  }

  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));

  console.log(`prerender.js: prerendered ${ok}/${routes.length} routes`);
}

main().catch((err) => {
  // Prerendering is an SEO/crawler-experience enhancement, not something
  // real users depend on (the SPA still works without it) -- never fail
  // the build over it.
  console.warn('prerender.js failed, skipping prerender step:', err.message);
});
