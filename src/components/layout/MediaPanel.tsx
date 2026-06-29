import * as React from "react";
import { cn } from "@/lib/utils";

interface MediaPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function MediaPanel({ children, className, ...props }: MediaPanelProps) {
  return (
    <div 
      className={cn(
        "relative w-full h-full overflow-hidden bg-black",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
