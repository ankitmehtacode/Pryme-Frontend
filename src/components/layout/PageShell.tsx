import React from "react";

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageShell({ children, className = "", style, ...props }: PageShellProps) {
  return (
    <div
      className={`w-full ${className}`}
      style={{
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
