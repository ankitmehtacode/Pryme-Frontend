import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none touch-manipulation",
  {
    variants: {
      variant: {
        // Primary CTA - Solid green, high contrast, Paisabazaar-inspired prominence
        default: "bg-primary text-primary-foreground shadow-md hover:shadow-xl hover:brightness-110 hover:scale-[1.03] active:scale-[0.97] active:shadow-sm",
        // Secondary - White/card bg with green text, green border hover
        secondary: "bg-card text-foreground border-2 border-border hover:border-primary hover:text-primary hover:shadow-md active:scale-[0.97]",
        // Outline variant - clean bordered, green fill on hover
        outline: "border-2 border-primary/40 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg active:scale-[0.97]",
        // Ghost - minimal, for navigation
        ghost: "text-muted-foreground hover:text-primary hover:bg-primary/5",
        // Link style
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
        // Destructive actions
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.97]",
        // Gold/Rewards variant
        reward: "bg-trust text-trust-foreground shadow-md hover:brightness-110 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97]",
        // Success state
        success: "bg-success text-success-foreground shadow-sm hover:bg-success/90 active:scale-[0.97]",
        // NEW: High-impact hero CTA with glow
        primary: "bg-primary text-primary-foreground shadow-lg hover:shadow-[0_0_30px_hsla(148,62%,42%,0.4)] hover:scale-[1.04] active:scale-[0.96]",
        // NEW: Soft pill style (Paisabazaar "Compare" style)
        soft: "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-[0.97]",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg min-w-[180px]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
