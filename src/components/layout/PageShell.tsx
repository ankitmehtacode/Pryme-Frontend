import React from "react";

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageShell({ children, className = "", style, ...props }: PageShellProps) {
  return (
    <div
      className={`w-full mx-auto ${className}`}
      style={{
        maxWidth: "var(--container-max)",
        paddingInline: "var(--layout-page-inline)",
        paddingBlock: "var(--layout-page-block)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
