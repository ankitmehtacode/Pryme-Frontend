import { Helmet } from "react-helmet-async";

/**
 * Emits a JSON-LD block into <head>.
 *
 * Rendered through Helmet rather than a raw <script> in the component tree so it
 * lands in <head> where crawlers look, and so it is removed when the route
 * unmounts instead of accumulating across a client-side navigation.
 *
 * Google executes JavaScript when rendering, so Helmet-injected structured data
 * is read — but it is read on the second pass, after the initial crawl. The
 * routes that matter most are prerendered by scripts/prerender.js, which means
 * their schema is in the served HTML on the first pass too.
 */
export const JsonLd = ({ data }: { data: object }) => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  </Helmet>
);
