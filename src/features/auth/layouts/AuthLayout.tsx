import * as React from "react";
import { Surface } from "@/components/layout/Surface";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="w-full max-w-[1600px] z-10"
    >
      <Surface className="min-h-[600px] lg:h-[clamp(600px,85vh,1000px)] border border-slate-900/5">
        <SplitLayout>
          {children}
        </SplitLayout>
      </Surface>
    </motion.div>
  );
}

AuthLayout.Media = SplitLayout.Media;
AuthLayout.Content = function AuthLayoutContent({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <SplitLayout.Content className={cn("items-center justify-center p-6 sm:p-12 lg:p-[clamp(32px,5vw,96px)] overflow-y-auto", className)}>
      {children}
    </SplitLayout.Content>
  );
};
