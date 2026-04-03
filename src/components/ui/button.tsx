import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none touch-manipulation",
  {
    variants: {
      variant: {
        // Primary CTA
        default: "bg-primary text-primary-foreground shadow-md hover:shadow-xl hover:brightness-110 hover:scale-[1.03] active:scale-[0.97] active:brightness-95 active:shadow-sm",
        secondary: "bg-card text-foreground border-2 border-border hover:border-primary hover:text-primary hover:shadow-md active:scale-[0.97] active:bg-secondary",
        outline: "border-2 border-primary/40 bg-transparent text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg active:scale-[0.97] active:bg-primary/90",
        ghost: "text-muted-foreground hover:text-primary hover:bg-primary/5 active:scale-[0.97] active:bg-primary/10",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.97] active:bg-destructive/80",
        reward: "bg-trust text-trust-foreground shadow-md hover:brightness-110 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97] active:brightness-95",
        success: "bg-success text-success-foreground shadow-sm hover:bg-success/90 active:scale-[0.97] active:bg-success/80",
        primary: "bg-primary text-primary-foreground shadow-lg hover:shadow-[0_0_30px_hsla(148,62%,42%,0.4)] hover:scale-[1.04] active:scale-[0.96] active:shadow-sm",
        soft: "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-[0.97] active:bg-primary/90",
      },
      size: {
        // h-12 = 48px — minimum WCAG 2.5.5 / Apple HIG touch target
        default: "h-12 px-6 py-2 text-sm",
        sm:      "h-11 px-4 text-xs",
        lg:      "h-12 px-8 text-base",
        xl:      "h-14 px-10 text-lg min-w-[180px]",
        icon:    "h-12 w-12 p-0",
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
