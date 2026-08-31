import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════════════════════
// META PIXEL — ROUTE-CHANGE PAGEVIEW
// ═══════════════════════════════════════════════════════════════════════════════
// The Meta Pixel base code in index.html fires PageView exactly once, on initial
// document load. PRYME is a client-routed SPA (react-router), so without this
// component Meta attributes every visit to the first URL loaded and reports no
// funnel beyond it — the limitation called out in index.html's pixel comment.
//
// This fires PageView on each SUBSEQUENT location change. The first render is
// deliberately skipped: index.html already counted the landing URL, and firing
// again here would double-count every session's entry page.
//
// `search` is part of the dependency list because campaign landings carry
// meaningful query strings (e.g. /apply?type=personal from the product grid).
// That is safe only because nothing in the app mutates query params during a
// flow — useSearchParams is read-only in ComingSoonCallback, its one consumer.
// If a screen ever starts writing filter state into the URL, drop `search` from
// the deps or those writes will each bill as a PageView.
//
// Renders nothing. Must stay inside <BrowserRouter> — useLocation throws
// outside a router context.
// ═══════════════════════════════════════════════════════════════════════════════

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const MetaPixelRouteTracker = (): null => {
  const { pathname, search } = useLocation();

  // index.html already fired PageView for the URL that loaded the document.
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    // fbq is undefined whenever the script did not load — ad blocker, a CSP
    // regression, or offline. Tracking is best-effort and must never break
    // navigation, so this stays optional-chained rather than asserted.
    window.fbq?.("track", "PageView");
  }, [pathname, search]);

  return null;
};
