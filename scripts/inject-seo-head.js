/**
 * Writes the SEO-critical head tags into the built HTML, without a browser.
 *
 * WHY THIS EXISTS
 *
 * prerender.js produces perfect per-route HTML, but it drives a real Chromium
 * through Playwright. Vercel's build image has the playwright npm package (it is
 * a devDependency) but not the browser binary, so chromium.launch() throws there
 * — and prerender.js deliberately swallows the failure rather than failing the
 * build. The result was silent and expensive: builds went green, and production
 * served the raw shell with the placeholder title, no canonical, and no
 * structured data, while every local build looked correct.
 *
 * Google does execute JavaScript, so the Helmet tags were eventually seen on a
 * second-pass render. But the canonical is what stops prymeloans.com and
 * gopryme.tech competing with prymeloans.in, and leaving that to a deferred
 * render is a bet with no upside. Bing and social scrapers largely do not render
 * JS at all.
 *
 * WHAT IT DOES
 *
 * For every public route: ensure dist/<route>/index.html exists, and guarantee
 * it carries a correct canonical. Idempotent by design — when prerender.js DID
 * run, Helmet has already emitted the right tags and this leaves them alone.
 * It only fills gaps.
 *
 * Deliberately narrow. Per-route titles and descriptions live in each page's
 * Helmet block, and duplicating them here would create a second source of truth
 * that silently drifts. Canonical is different: it is derived purely from the
 * route, so it can be computed here with no risk of disagreeing with the app.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SITE_URL, STATIC_ROUTES, loadBlogSlugs } from './public-routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');

const canonicalFor = (routePath) =>
  `${SITE_URL}${routePath === '/' ? '' : routePath}`;

/** Site-wide identity. Mirrors organisationSchema() in src/lib/seo.ts. */
const organisationSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FinancialService',
      '@id': `${SITE_URL}/#organization`,
      name: 'PRYME',
      legalName: 'Pryme Consulting India',
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      image: `${SITE_URL}/icon-512.png`,
      telephone: '+91 92432 94291',
      email: 'contact@gopryme.in',
      priceRange: '₹₹',
      address: {
        '@type': 'PostalAddress',
        streetAddress:
          '4th Floor, Above Mr. DIY Showroom, Ranjeet Hanuman Main Road, Mhow Naka Square',
        addressLocality: 'Indore',
        addressRegion: 'Madhya Pradesh',
        postalCode: '452009',
        addressCountry: 'IN',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 22.7196, longitude: 75.8577 },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '10:00',
          closes: '19:00',
        },
      ],
      areaServed: [
        { '@type': 'City', name: 'Indore' },
        { '@type': 'State', name: 'Madhya Pradesh' },
        { '@type': 'Country', name: 'India' },
      ],
      sameAs: [
        'https://www.linkedin.com/company/pryme-consultingindia/',
        'https://www.prymeloans.com',
        'https://www.gopryme.tech',
      ],
    },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: 'PRYME' },
  ],
};

function withCanonical(html, url) {
  // Already present (prerender.js ran and Helmet emitted it) — leave it be.
  if (/<link[^>]+rel="canonical"/i.test(html)) return html;
  return html.replace('</head>', `  <link rel="canonical" href="${url}" />\n  </head>`);
}

function withOrganisationSchema(html) {
  if (html.includes('"@type":"FinancialService"') || html.includes('"@type": "FinancialService"')) {
    return html;
  }
  const block = `  <script type="application/ld+json">${JSON.stringify(organisationSchema)}</script>\n`;
  return html.replace('</head>', `${block}  </head>`);
}

function main() {
  const shellPath = path.join(DIST, 'index.html');
  if (!fs.existsSync(shellPath)) {
    console.warn('inject-seo-head.js: dist/index.html not found, skipping');
    return;
  }
  const shell = fs.readFileSync(shellPath, 'utf-8');

  const routes = [
    ...STATIC_ROUTES.map((r) => r.path),
    ...loadBlogSlugs().map((slug) => `/blogs/${slug}`),
  ];

  let created = 0;
  let patched = 0;

  for (const routePath of routes) {
    const outPath =
      routePath === '/' ? shellPath : path.join(DIST, routePath.replace(/^\//, ''), 'index.html');

    let html;
    if (fs.existsSync(outPath)) {
      html = fs.readFileSync(outPath, 'utf-8');
    } else {
      // prerender.js did not run (no browser in this environment). Start from
      // the shell so the route at least serves a canonical of its own rather
      // than inheriting the homepage's via the SPA fallback.
      html = shell;
      created++;
    }

    const before = html;
    html = withCanonical(html, canonicalFor(routePath));
    if (routePath === '/') html = withOrganisationSchema(html);

    if (html !== before) patched++;
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
  }

  console.log(
    `inject-seo-head.js: ${routes.length} routes — ${created} created from shell, ${patched} needed head tags`
  );
}

main();
