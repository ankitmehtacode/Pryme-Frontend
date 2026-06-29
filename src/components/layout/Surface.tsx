import React from "react";

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Surface({ children, className = "", style, ...props }: SurfaceProps) {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        backgroundColor: "hsl(var(--card))",
        color: "hsl(var(--card-foreground))",
        borderRadius: "var(--surface-radius)",
        boxShadow: "var(--surface-shadow)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
