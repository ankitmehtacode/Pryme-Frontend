import * as React from "react";
import { cn } from "@/lib/utils";

interface SplitLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SplitLayout({ children, className, ...props }: SplitLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row w-full h-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function Media({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "hidden lg:flex w-full lg:w-[48%] relative border-r border-slate-100", 
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function Content({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full lg:w-[52%] flex flex-col relative", 
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

SplitLayout.Media = Media;
SplitLayout.Content = Content;
