/**
 * Layout Clipping Verification Script
 * 
 * Run in browser DevTools console at http://localhost:8082/
 * Asserts that all full-bleed Surface elements (especially dark ones)
 * span the full viewport width with left=0 and right=viewportWidth.
 */
(function verifyLayoutFix() {
  const vw = window.innerWidth;
  const TOLERANCE = 1; // sub-pixel tolerance

  console.log("═══════════════════════════════════════════════");
  console.log("LAYOUT CLIPPING VERIFICATION");
  console.log(`Viewport width: ${vw}px`);
  console.log("═══════════════════════════════════════════════");

  // 1. Document-level measurements
  const doc = document.documentElement;
  const body = document.body;
  const docMetrics = {
    "document.clientWidth": doc.clientWidth,
    "document.scrollWidth": doc.scrollWidth,
    "body.clientWidth": body.clientWidth,
    "body.scrollWidth": body.scrollWidth,
  };
  
  console.log("\n📐 Document Metrics:");
  console.table(docMetrics);
  
  const hasHorizontalScroll = doc.scrollWidth > doc.clientWidth + TOLERANCE;
  console.log(`Horizontal scroll: ${hasHorizontalScroll ? "❌ DETECTED" : "✅ None"}`);

  // 2. Ancestor chain audit
  console.log("\n📊 Ancestor Chain (html → main):");
  const ancestors = [];
  
  // Walk from #root down to main
  const root = document.getElementById("root");
  let el = root;
  const chain = [doc, body];
  
  if (root) {
    let depth = 0;
    let current = root;
    while (current && depth < 20) {
      chain.push(current);
      if (current.tagName === "MAIN") break;
      current = current.firstElementChild;
      depth++;
    }
  }

  chain.forEach((node) => {
    const rect = node.getBoundingClientRect();
    const cs = getComputedStyle(node);
    ancestors.push({
      element: `<${node.tagName.toLowerCase()}${node.id ? "#" + node.id : ""}${node.className && typeof node.className === "string" ? "." + node.className.split(" ").slice(0, 2).join(".") : ""}>`,
      left: Math.round(rect.left * 100) / 100,
      width: Math.round(rect.width * 100) / 100,
      right: Math.round(rect.right * 100) / 100,
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
      overflowX: cs.overflowX,
      paddingLeft: cs.paddingLeft,
      paddingRight: cs.paddingRight,
    });
  });
  console.table(ancestors);

  // 3. Surface verification (the critical test)
  console.log("\n🎯 Surface Element Verification:");
  const surfaces = document.querySelectorAll(".pryme-surface");
  const surfaceResults = [];
  let allPass = true;

  surfaces.forEach((surface, i) => {
    const rect = surface.getBoundingClientRect();
    const cs = getComputedStyle(surface);
    const bgColor = cs.backgroundColor;
    const isDark = (() => {
      const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return false;
      const luminance = (parseInt(match[1]) * 299 + parseInt(match[2]) * 587 + parseInt(match[3]) * 114) / 1000;
      return luminance < 128;
    })();

    const leftOk = Math.abs(rect.left) <= TOLERANCE;
    const rightOk = Math.abs(rect.right - vw) <= TOLERANCE;
    const pass = leftOk && rightOk;
    if (!pass) allPass = false;

    surfaceResults.push({
      index: i,
      variant: isDark ? "DARK" : "light",
      bgColor,
      left: Math.round(rect.left * 100) / 100,
      right: Math.round(rect.right * 100) / 100,
      width: Math.round(rect.width * 100) / 100,
      viewport: vw,
      leftOk: leftOk ? "✅" : "❌",
      rightOk: rightOk ? "✅" : "❌",
      verdict: pass ? "✅ PASS" : "❌ FAIL",
    });
  });

  console.table(surfaceResults);

  // 4. Final verdict
  console.log("\n" + "═".repeat(50));
  if (allPass && !hasHorizontalScroll) {
    console.log("✅ ALL SURFACES PASS — No clipping detected.");
    console.log("✅ No horizontal scroll overflow.");
    console.log("🏆 LAYOUT FIX VERIFIED SUCCESSFULLY.");
  } else {
    if (!allPass) console.log("❌ SOME SURFACES FAIL — Clipping still present.");
    if (hasHorizontalScroll) console.log("❌ Horizontal scroll overflow detected.");
  }
  console.log("═".repeat(50));

  return { pass: allPass && !hasHorizontalScroll, surfaces: surfaceResults, docMetrics };
})();
