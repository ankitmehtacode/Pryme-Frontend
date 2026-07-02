import { test, expect, Page } from '@playwright/test';

/**
 * REGRESSION TEST: Layout System and Visual Rhythm
 * 
 * Verifies that:
 * 1. Every [data-surface] element reaches the viewport edges (x=0 to viewport width).
 * 2. Every [data-container] element starts at the same left x-coordinate and ends at the same right x-coordinate.
 * 3. Every heading (h2) inside a [data-container] aligns to the same left alignment.
 * 4. PageShell, Surface, and Section elements do not own horizontal padding.
 * 5. No horizontal scroll overflow exists.
 * 6. Nested surfaces do not break layout rules or bleed past viewport bounds.
 */

const DESKTOP_BREAKPOINTS = [1024, 1280, 1366, 1440, 1536, 1728, 1920, 2560, 3440];
const VIEWPORT_HEIGHT = 900;
const TOLERANCE = 1; // sub-pixel tolerance in px

interface ElementMetric {
  index: number;
  left: number;
  right: number;
  width: number;
}

interface SurfaceMetric extends ElementMetric {
  bgColor: string;
  isDark: boolean;
  isNested: boolean;
  paddingLeft: number;
  paddingRight: number;
}

interface SectionMetric extends ElementMetric {
  paddingLeft: number;
  paddingRight: number;
}

interface HeadingMetric {
  index: number;
  left: number;
  tag: string;
  text: string;
}

interface LayoutAudit {
  viewport: { innerWidth: number };
  document: { clientWidth: number; scrollWidth: number };
  body: { clientWidth: number; scrollWidth: number };
  surfaces: SurfaceMetric[];
  sections: SectionMetric[];
  containers: ElementMetric[];
  headings: HeadingMetric[];
  pageShell: { left: number; right: number; width: number; paddingLeft: string; paddingRight: string; overflowX: string } | null;
}

async function auditLayout(page: Page): Promise<LayoutAudit> {
  await page.waitForSelector('[data-surface]', { timeout: 10000 });
  await page.waitForTimeout(1500); // Allow settle

  return page.evaluate(() => {
    const vw = window.innerWidth;
    const doc = document.documentElement;
    const body = document.body;

    let pageShell: LayoutAudit['pageShell'] = null;
    const root = document.getElementById('root');
    if (root) {
      let el: Element | null = root;
      for (let i = 0; i < 10; i++) {
        el = el?.firstElementChild ?? null;
        if (!el) break;
        const cs = getComputedStyle(el);
        if (cs.flexDirection === 'column' && cs.minHeight.includes('100vh')) {
          const rect = el.getBoundingClientRect();
          pageShell = {
            left: rect.left,
            right: rect.right,
            width: rect.width,
            paddingLeft: cs.paddingLeft,
            paddingRight: cs.paddingRight,
            overflowX: cs.overflowX,
          };
          break;
        }
      }
    }

    const surfaceEls = document.querySelectorAll('[data-surface]');
    const surfaces: SurfaceMetric[] = [];
    surfaceEls.forEach((surface, i) => {
      const rect = surface.getBoundingClientRect();
      const cs = getComputedStyle(surface);
      const match = cs.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      const isDark = match ? (parseInt(match[1]) * 299 + parseInt(match[2]) * 587 + parseInt(match[3]) * 114) / 1000 < 128 : false;
      
      surfaces.push({
        index: i,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        bgColor: cs.backgroundColor,
        isDark,
        isNested: surface.parentElement?.closest('[data-surface]') !== null,
        paddingLeft: parseFloat(cs.paddingLeft) || 0,
        paddingRight: parseFloat(cs.paddingRight) || 0,
      });
    });

    const sectionEls = document.querySelectorAll('[data-section]');
    const sections: SectionMetric[] = [];
    sectionEls.forEach((section, i) => {
      const rect = section.getBoundingClientRect();
      const cs = getComputedStyle(section);
      sections.push({
        index: i,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        paddingLeft: parseFloat(cs.paddingLeft) || 0,
        paddingRight: parseFloat(cs.paddingRight) || 0,
      });
    });

    const containerEls = document.querySelectorAll('[data-container]');
    const containers: ElementMetric[] = [];
    containerEls.forEach((container, i) => {
      // Only measure containers that are intended to be page-content constrained (width > 500px)
      const rect = container.getBoundingClientRect();
      if (rect.width > 500) {
        containers.push({
          index: i,
          left: rect.left,
          right: rect.right,
          width: rect.width,
        });
      }
    });

    // Select all section headings (h2) nested under containers to verify alignment
    const headingEls = document.querySelectorAll('[data-container] h2');
    const headings: HeadingMetric[] = [];
    headingEls.forEach((heading, i) => {
      const cs = getComputedStyle(heading);
      const parentCs = getComputedStyle(heading.parentElement!);
      
      // Exclude headings nested inside cards, footers, or those that are center-aligned
      const isInsideCardOrFooter = heading.closest('.bg-white, .bg-card, .rounded-2xl, .rounded-\\[2\\.5rem\\], .rounded-3xl, footer');
      const isCentered = cs.textAlign === 'center' || parentCs.textAlign === 'center';
      
      if (!isInsideCardOrFooter && !isCentered) {
        const rect = heading.getBoundingClientRect();
        headings.push({
          index: i,
          left: rect.left,
          tag: heading.tagName,
          text: heading.textContent || "",
        });
      }
    });

    return {
      viewport: { innerWidth: vw },
      document: { clientWidth: doc.clientWidth, scrollWidth: doc.scrollWidth },
      body: { clientWidth: body.clientWidth, scrollWidth: body.scrollWidth },
      surfaces,
      sections,
      containers,
      headings,
      pageShell,
    };
  });
}

for (const width of DESKTOP_BREAKPOINTS) {
  test.describe(`Desktop ${width}px`, () => {
    
    test(`no horizontal scroll overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const audit = await auditLayout(page);
      
      expect(
        audit.document.scrollWidth,
        `scrollWidth should not exceed clientWidth`
      ).toBeLessThanOrEqual(audit.document.clientWidth + TOLERANCE);
    });

    test(`enforce 0 horizontal padding on PageShell, Surface, and Section`, async ({ page }) => {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const audit = await auditLayout(page);

      if (audit.pageShell) {
        expect(parseFloat(audit.pageShell.paddingLeft)).toBeLessThanOrEqual(TOLERANCE);
        expect(parseFloat(audit.pageShell.paddingRight)).toBeLessThanOrEqual(TOLERANCE);
      }

      for (const surface of audit.surfaces) {
        // Skip checking nested surfaces which are styled as cards
        if (!surface.isNested) {
          expect(
            surface.paddingLeft,
            `Surface[${surface.index}] must not have horizontal padding`
          ).toBeLessThanOrEqual(TOLERANCE);
          expect(
            surface.paddingRight,
            `Surface[${surface.index}] must not have horizontal padding`
          ).toBeLessThanOrEqual(TOLERANCE);
        }
      }

      for (const section of audit.sections) {
        expect(
          section.paddingLeft,
          `Section[${section.index}] must not have horizontal padding`
        ).toBeLessThanOrEqual(TOLERANCE);
        expect(
          section.paddingRight,
          `Section[${section.index}] must not have horizontal padding`
        ).toBeLessThanOrEqual(TOLERANCE);
      }
    });

    test(`all top-level Surfaces span full viewport width`, async ({ page }) => {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const audit = await auditLayout(page);

      const topLevelSurfaces = audit.surfaces.filter(s => !s.isNested);
      expect(topLevelSurfaces.length).toBeGreaterThan(0);

      for (const surface of topLevelSurfaces) {
        expect(Math.abs(surface.left)).toBeLessThanOrEqual(TOLERANCE);
        expect(Math.abs(surface.right - width)).toBeLessThanOrEqual(TOLERANCE);
      }
    });

    test(`nested Surfaces do not break container alignment or bleed out`, async ({ page }) => {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const audit = await auditLayout(page);

      const nestedSurfaces = audit.surfaces.filter(s => s.isNested);
      for (const surface of nestedSurfaces) {
        expect(
          surface.left,
          `Nested Surface[${surface.index}] left=${surface.left} should be >= 0`
        ).toBeGreaterThanOrEqual(0 - TOLERANCE);
        expect(
          surface.right,
          `Nested Surface[${surface.index}] right=${surface.right} should be <= ${width}`
        ).toBeLessThanOrEqual(width + TOLERANCE);
      }
    });

    test(`Containers perfectly align horizontally (left and right edges)`, async ({ page }) => {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const audit = await auditLayout(page);
      
      expect(audit.containers.length).toBeGreaterThan(0);
      
      // All primary page containers should start and end at the exact same coordinates
      const baselineLeft = audit.containers[0].left;
      const baselineRight = audit.containers[0].right;
      
      for (const container of audit.containers) {
        expect(
          Math.abs(container.left - baselineLeft),
          `Container[${container.index}] left alignment mismatch (expected: ${baselineLeft}, got: ${container.left})`
        ).toBeLessThanOrEqual(TOLERANCE);

        expect(
          Math.abs(container.right - baselineRight),
          `Container[${container.index}] right alignment mismatch (expected: ${baselineRight}, got: ${container.right})`
        ).toBeLessThanOrEqual(TOLERANCE);
      }
    });

    test(`Section headings (h2) align horizontally`, async ({ page }) => {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const audit = await auditLayout(page);
      
      // Exclude center-aligned headers from the strict left-alignment check
      // Centered text has differing left offsets based on characters.
      // We check left-aligned headers (which should match baselineLeft + container's gutter/padding)
      const primaryContainerLeft = audit.containers[0].left;
      
      // We expect left-aligned text to align to start of container content box
      // Since padding-inline is md (which is clamp(24px, 3vw, 48px)),
      // left-aligned headings inside containers should align to the same left value.
      // But we can check that all headings that aren't centered share the exact same left coordinate.
      const leftAlignedHeadings = audit.headings;

      if (leftAlignedHeadings.length > 1) {
        const firstHeadingLeft = leftAlignedHeadings[0].left;
        for (const heading of leftAlignedHeadings) {
          expect(
            Math.abs(heading.left - firstHeadingLeft),
            `Heading "${heading.text}" alignment mismatch`
          ).toBeLessThanOrEqual(TOLERANCE);
        }
      }
    });

  });
}
