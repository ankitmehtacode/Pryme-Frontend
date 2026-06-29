import React from "react";

export interface ContentContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  width?: "readable" | "comfort" | "full";
}

export function ContentContainer({
  children,
  width = "readable",
  className = "",
  style,
  ...props
}: ContentContainerProps) {
  const maxWidth =
    width === "readable"
      ? "var(--content-readable)"
      : width === "comfort"
      ? "var(--content-comfort)"
      : "100%";

  return (
    <div
      className={`w-full ${className}`}
      style={{
        maxWidth,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
