import React from "react";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gap?: string;
}

export function Stack({ children, gap = "var(--space-4)", className = "", style, ...props }: StackProps) {
  return (
    <div
      className={`flex flex-col ${className}`}
      style={{
        gap,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
