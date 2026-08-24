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

/**
 * Remove third-party <script src> elements that the page injected into the DOM
 * at runtime, before the serialised HTML is written to disk.
 *
 * Aborting these at the network layer (see page.route below) stops them
 * LOADING but not being CREATED: the Meta Pixel's inline snippet builds a
 * <script src=".../fbevents.js"> element and appends it to the DOM regardless
 * of whether the request resolves, and page.content() then serialises that
 * element into the file we ship. The result was every prerendered page
 * carrying loader tags it should have created fresh in the visitor's browser.
 *
 * Only elements WITH a src on a third-party host are removed. The inline
 * snippet in index.html has no src and is untouched, so real visitors still
 * get the pixel exactly as authored -- this only discards the DOM residue of
 * having executed it during the build.
 */
function stripInjectedThirdPartyTags(html) {
  return html.replace(
    /[ \t]*<script\b[^>]*\bsrc=["'][^"']*\b(?:facebook\.net|facebook\.com)\/[^"']*["'][^>]*>\s*<\/script>\n?/gi,
    '',
  );
}

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

  // Never let third-party analytics run during prerendering. Two distinct
  // problems, both silent:
  //
  //   1. The build machine BECOMES traffic. Chromium executes the page for
  //      real, so the Meta Pixel fired a PageView for every route on every
  //      build -- 22 fake visits per build, reported to Meta with
  //      domain=localhost, polluting the very numbers the pixel exists to
  //      collect.
  //   2. page.content() serialises the DOM *after* those scripts have run, so
  //      the script tags fbevents.js injects into the live DOM get baked into
  //      the static HTML we ship: connect.facebook.net/signals/config/... with
  //      a pinned version and domain=localhost frozen into the query string.
  //      Every visitor then paid for those requests, and the pinned version
  //      would rot.
  //
  // Aborting at the network layer leaves the inline snippet in the shipped
  // HTML untouched -- it simply never resolves here, so nothing is recorded
  // and nothing is serialised. Real visitors still load it normally.
  await page.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname;
    if (host.endsWith('facebook.net') || host.endsWith('facebook.com')) {
      return route.abort();
    }
    return route.continue();
  });

  let ok = 0;
  for (const routePath of routes) {
    try {
      await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'networkidle', timeout: 15000 });
      // Small settle buffer for any final post-networkidle React render pass
      // (Helmet tag commits, last state update after data arrives).
      await page.waitForTimeout(200);
      const html = stripInjectedThirdPartyTags(await page.content());

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
