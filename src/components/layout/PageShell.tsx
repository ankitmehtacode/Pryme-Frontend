import React from "react";

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageShell({ children, className = "", style, ...props }: PageShellProps) {
  return (
    <div
      className={`w-full ${className}`}
      style={{
        paddingInline: "var(--space-md)",
        overflowX: "hidden", // Prevent horizontal scroll on mobile
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
