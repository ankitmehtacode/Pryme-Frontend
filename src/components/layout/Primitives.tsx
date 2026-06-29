import React from "react";

// ============================================================================
// PRYME ENTERPRISE LAYOUT PRIMITIVES (v1.0)
// Documented in docs/LAYOUT_MANIFEST.md
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// 1. SECTION
// Responsibilities: Vertical rhythm (padding-block), container queries context.
// Never Does: Horizontal constraints.
// ─────────────────────────────────────────────────────────────────────────────
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  containerQuery?: boolean;
  bleed?: boolean;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ children, spacing = "xl", containerQuery = false, bleed = false, className = "", style, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={`pryme-section ${className}`.trim()}
        style={{
          "--section-spacing": `var(--space-${spacing})`,
          "--section-container-type": containerQuery ? "inline-size" : "normal",
          ...(bleed ? { overflow: "hidden", isolation: "isolate", position: "relative" } : {}),
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </section>
    );
  }
);
Section.displayName = "Section";

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONTAINER
// Responsibilities: Max inline size constraint, auto-centering.
// Never Does: Vertical spacing, background colors, flex/grid align.
// ─────────────────────────────────────────────────────────────────────────────
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "readable" | "content" | "wide" | "expanded" | "max" | "bleed" | "xs" | "sm" | "md" | "lg" | "xl";
  maxInlineSize?: string | number;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, size = "content", maxInlineSize, className = "", style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          "--container-size": maxInlineSize || `var(--container-${size})`,
          maxInlineSize: "var(--container-size)",
          marginInline: "auto",
          width: "100%",
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Container.displayName = "Container";

// ─────────────────────────────────────────────────────────────────────────────
// 3. COLUMNS
// Responsibilities: Explicit CSS Grid for side-by-side layouts. Overflow prevention.
// Never Does: Repeating items, vertical rhythm.
// ─────────────────────────────────────────────────────────────────────────────
interface ColumnsProps extends React.HTMLAttributes<HTMLDivElement> {
  left?: string;
  right?: string;
  preset?: "hero" | "split" | "equal";
  gap?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  align?: React.CSSProperties["alignItems"];
}

export const Columns = React.forwardRef<HTMLDivElement, ColumnsProps>(
  ({ children, left, right, preset, gap = "lg", align = "center", className = "", style, ...props }, ref) => {
    
    // Default mapped variants
    let gridTemplateColumns = "1fr 1fr"; // default
    if (left && right) {
      gridTemplateColumns = `${left} ${right}`;
    } else if (preset === "hero") {
      gridTemplateColumns = "var(--columns-hero-left, minmax(38ch, max-content)) var(--columns-hero-right, minmax(40rem, 1fr))"; 
    } else if (preset === "split") {
      gridTemplateColumns = "minmax(400px, 1fr) minmax(400px, 2fr)";
    } else if (preset === "equal") {
      gridTemplateColumns = "1fr 1fr";
    }

    return (
      <div
        ref={ref}
        className={`pryme-columns ${className}`.trim()}
        style={{
          display: "grid",
          gridTemplateColumns,
          gap: `var(--space-${gap})`,
          alignItems: align,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Columns.displayName = "Columns";

// ─────────────────────────────────────────────────────────────────────────────
// 4. AUTO GRID
// Responsibilities: Intrinsic repeating grid items.
// Never Does: Explicit column counts.
// ─────────────────────────────────────────────────────────────────────────────
interface AutoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  minItemWidth?: string;
  gap?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

export const AutoGrid = React.forwardRef<HTMLDivElement, AutoGridProps>(
  ({ children, minItemWidth = "clamp(220px, 18vw, 300px)", gap = "md", className = "", style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`pryme-autogrid ${className}`.trim()}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
          gap: `var(--space-${gap})`,
          alignContent: "start",
          alignItems: "start",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AutoGrid.displayName = "AutoGrid";
