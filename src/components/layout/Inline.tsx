import React from "react";

export interface InlineProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gap?: string;
  align?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
  justify?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
  wrap?: boolean;
}

export function Inline({
  children,
  gap = "var(--space-4)",
  align = "center",
  justify = "flex-start",
  wrap = true,
  className = "",
  style,
  ...props
}: InlineProps) {
  return (
    <div
      className={`flex ${className}`}
      style={{
        gap,
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
