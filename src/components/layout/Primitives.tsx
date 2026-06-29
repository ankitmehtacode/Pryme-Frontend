import React from "react";

// ============================================================================
// PRYME ENTERPRISE LAYOUT PRIMITIVES (v1.0)
// Documented in docs/LAYOUT_MANIFEST.md
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// 1. SURFACE
// Responsibilities: Background color, theme, environment context, decorative layers.
// Never Does: Padding, max-width, typography.
// ─────────────────────────────────────────────────────────────────────────────
interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "muted" | "inverse" | "brand" | "transparent";
}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ children, variant = "default", className = "", style, ...props }, ref) => {
    // Map variants to specific tailwind classes for theme backgrounds
    let bgClass = "";
    if (variant === "default") bgClass = "bg-white dark:bg-[#050505]";
    if (variant === "muted") bgClass = "bg-slate-50 dark:bg-[#0a0a0a]";
    if (variant === "inverse") bgClass = "bg-slate-900 dark:bg-[#030303]";
    if (variant === "brand") bgClass = "bg-[#103783] dark:bg-[#081b40]";
    if (variant === "transparent") bgClass = "bg-transparent";

    return (
      <div
        ref={ref}
        className={`pryme-surface relative w-full ${bgClass} ${className}`.trim()}
        style={{ ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Surface.displayName = "Surface";

// ─────────────────────────────────────────────────────────────────────────────
// 2. SECTION
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
// 3. CONTAINER
// Responsibilities: Max inline size constraint, auto-centering.
// Never Does: Vertical spacing, background colors, flex/grid align.
// ─────────────────────────────────────────────────────────────────────────────
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "readable" | "content" | "wide" | "expanded" | "full";
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
// 4. COLUMNS
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
      gridTemplateColumns = "var(--hero-grid)"; 
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
// 5. AUTO GRID
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

// ─────────────────────────────────────────────────────────────────────────────
// 6. STACK
// Responsibilities: Flexbox composition for vertical or horizontal spacing.
// Never Does: Absolute positioning, width constraints.
// ─────────────────────────────────────────────────────────────────────────────
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "col";
  gap?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  align?: React.CSSProperties["alignItems"];
  justify?: React.CSSProperties["justifyContent"];
  wrap?: boolean;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ children, direction = "col", gap = "md", align = "stretch", justify = "flex-start", wrap = false, className = "", style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`pryme-stack ${className}`.trim()}
        style={{
          display: "flex",
          flexDirection: direction === "col" ? "column" : "row",
          gap: `var(--space-${gap})`,
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? "wrap" : "nowrap",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Stack.displayName = "Stack";
