import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm touch-manipulation active:bg-secondary/80 transition-colors duration-150",
          className,
        )}
        ref={ref}
        onWheel={(e) => {
          if (type === "number") {
            e.currentTarget.blur();
          }
          if (props.onWheel) props.onWheel(e);
        }}
        onFocus={(e) => {
          if (type === "number" && (e.currentTarget.value === "0" || e.currentTarget.value === "0.00")) {
            e.currentTarget.select();
          }
          if (props.onFocus) props.onFocus(e);
        }}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
