export function initGlobalZoomFix() {
  if (typeof window === "undefined") return;

  const observer = new MutationObserver((mutations) => {
    const html = document.documentElement;
    const zoomStr = getComputedStyle(html).zoom;
    const zoom = parseFloat(zoomStr);
    
    // If no zoom or zoom is 1, do nothing.
    if (!zoom || zoom === 1 || isNaN(zoom)) return;

    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'style') {
        const el = mutation.target as HTMLElement;
        
        // Target Radix UI popper wrappers
        if (!el.hasAttribute('data-radix-popper-content-wrapper')) return;

        const transform = el.style.transform;
        
        // If already corrected, skip
        if (!transform || transform.includes('var(--corrected)')) return;

        // Floating UI sets: transform: translate3d(x, y, 0)
        const match = transform.match(/translate3d\(([^p]+)px,\s*([^p]+)px/);
        if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          
          if (!isNaN(x) && !isNaN(y)) {
            // Chrome's CSS zoom causes Floating UI's math to be off because 
            // getBoundingClientRect returns scaled coords, but then the browser
            // applies zoom AGAIN to the positioned element.
            // By dividing the coordinates by the zoom factor, we cancel out 
            // the browser's implicit multiplication.
            const correctedX = x / zoom;
            const correctedY = y / zoom;
            
            el.style.setProperty('transform', `translate3d(${correctedX}px, ${correctedY}px, 0)`);
            // Add a flag so we don't infinite loop
            el.style.setProperty('--corrected', '1');
          }
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style']
  });
}
