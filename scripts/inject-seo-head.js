/**
 * Writes the SEO-critical head tags into the built HTML, without a browser.
 *
 * WHY THIS EXISTS
 *
 * prerender.js produces perfect per-route HTML, but it runs in the npm postbuild
 * hook, and hooks only fire when the host's build command is `npm run build`.
 * Cloudflare Pages was running `vite build` directly, so neither prebuild nor
 * postbuild ever ran. The failure was silent and expensive: builds went green,
 * every local build looked perfect, and production served the raw shell with the
 * placeholder title, no canonical and no structured data.
 *
 * That is why this is wired into vite.config.ts as a plugin as well as being a
 * CLI script — a plugin runs whenever Vite runs, which is the one thing that is
 * certain regardless of how the host is configured.
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

/**
 * Business details, read out of src/lib/seo.ts rather than copied.
 *
 * This file is plain ESM run by node before any bundle exists, so it cannot
 * import the TypeScript module -- but hand-copying the address is exactly how
 * the site ended up publishing two different ones. Parsing the single source
 * keeps them in step, and throws loudly if the shape ever changes rather than
 * silently shipping a stale address.
 */
function businessFromSource() {
  const src = fs.readFileSync(path.resolve(__dirname, '../src/lib/seo.ts'), 'utf-8');
  const field = (name) => {
    const m = src.match(new RegExp(`${name}:\\s*"([^"]*)"`));
    if (!m) throw new Error(`inject-seo-head: could not read BUSINESS.${name} from src/lib/seo.ts`);
    return m[1];
  };
  return {
    legalName: field('legalName'),
    phone: field('phone'),
    email: field('email'),
    street: field('street'),
    locality: field('locality'),
    region: field('region'),
    postalCode: field('postalCode'),
  };
}
const B = businessFromSource();

/** Site-wide identity. Mirrors organisationSchema() in src/lib/seo.ts. */
const organisationSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FinancialService',
      '@id': `${SITE_URL}/#organization`,
      name: 'PRYME',
      legalName: B.legalName,
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      image: `${SITE_URL}/icon-512.png`,
      telephone: B.phone,
      email: B.email,
      priceRange: '₹₹',
      address: {
        '@type': 'PostalAddress',
        streetAddress:
          '204, Ranjeet Hanuman Main Road, Near BATA Showroom, Mhow Naka',
        addressLocality: B.locality,
        addressRegion: B.region,
        postalCode: B.postalCode,
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

export function injectSeoHead() {
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

// CLI entry: `node scripts/inject-seo-head.js`. Also invoked directly from
// vite.config.ts so the tags land even when the host's build command skips the
// npm postbuild hook -- which is exactly what was happening on Cloudflare Pages.
if (process.argv[1] && process.argv[1].endsWith('inject-seo-head.js')) {
  injectSeoHead();
}
