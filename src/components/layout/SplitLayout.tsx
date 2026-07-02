import * as React from "react";
import { cn } from "@/lib/utils";

const SplitLayoutContext = React.createContext<{ isGrid: boolean }>({ isGrid: false });

interface SplitLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function SplitLayout({ children, className, ...props }: SplitLayoutProps) {
  const isGrid = className?.includes("grid") || false;
  return (
    <SplitLayoutContext.Provider value={{ isGrid }}>
      <div
        className={cn(
          isGrid ? "grid w-full h-full" : "flex flex-col lg:flex-row w-full h-full",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SplitLayoutContext.Provider>
  );
}

function Media({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isGrid } = React.useContext(SplitLayoutContext);
  return (
    <div
      className={cn(
        isGrid 
          ? "hidden lg:block relative" 
          : "hidden lg:flex w-full lg:w-[48%] relative border-r border-slate-100", 
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function Content({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isGrid } = React.useContext(SplitLayoutContext);
  return (
    <div
      className={cn(
        isGrid 
          ? "w-full flex flex-col relative" 
          : "w-full lg:w-[52%] flex flex-col relative", 
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
